import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
import { exportPdf } from '../../download';
import { confirmDialog, infoDialog } from '../../notify';
import { attendanceLabel, fmtDate, genderLabel, letterColor, scheduleLabel } from '../../utils';

export function TeacherCourses() {
  const [courses, setCourses] = useState(null);
  useEffect(() => { api.get('/teacher/courses').then((r) => setCourses(r.data)); }, []);

  return (
    <>
      <div className="page-head"><h1>My course sections</h1></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Section</th><th>Subject</th><th>Semester</th><th>Schedule</th><th>Room</th><th>Enrolled</th><th /></tr></thead>
            <tbody>
              {courses === null ? <tr><td colSpan={7}><Loading /></td></tr>
                : courses.length === 0 ? <tr><td colSpan={7} className="empty">No course sections assigned</td></tr>
                : courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>{c.subject.name} <span className="sub">({c.subject.credits} TC)</span></td>
                    <td>{c.semester.name} {c.semester.is_current && <Badge color="green">Current</Badge>}</td>
                    <td>{scheduleLabel(c)}</td>
                    <td>{c.room || '—'}</td>
                    <td>{c.enrollments_count}/{c.max_students}</td>
                    <td className="actions"><Link className="btn sm primary" to={`/teacher/courses/${c.id}`}>Manage</Link></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function TeacherClasses() {
  const [classes, setClasses] = useState(null);
  useEffect(() => { api.get('/teacher/classes').then((r) => setClasses(r.data)); }, []);

  return (
    <>
      <div className="page-head"><h1>My homeroom classes</h1></div>
      {classes === null ? <div className="card"><Loading /></div>
        : classes.length === 0 ? <div className="card"><div className="empty">No homeroom classes assigned</div></div>
        : classes.map((c) => (
          <div className="card" key={c.id}>
            <h3>{c.code} - {c.name}</h3>
            <div className="sub">{c.department?.name} · Cohort {c.academic_year || '—'} · {c.students_count} students</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student ID</th><th>Full name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Date of birth</th><th>Status</th></tr></thead>
                <tbody>
                  {c.students.length === 0 ? <tr><td colSpan={7} className="empty">This class has no students yet</td></tr>
                    : c.students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.student_code}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.phone || '—'}</td>
                        <td>{genderLabel[s.gender]}</td>
                        <td>{fmtDate(s.date_of_birth)}</td>
                        <td><Badge color={s.status === 'active' ? 'green' : 'red'}>{s.status === 'active' ? 'Active' : 'Locked'}</Badge></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </>
  );
}

const today =() => new Date().toISOString().slice(0, 10);

const errorList = (errors) =>
  `<ul class="swal-errors">${errors.map((e) => `<li><b>${e.student_code || ''} ${e.name || ''}</b> ${e.message}</li>`).join('')}</ul>`;

export function TeacherCourseDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [tab, setTab] = useState('grades');
  const [data, setData] = useState(null);
  const [edits, setEdits] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [date, setDate] = useState(today());
  const [att, setAtt] = useState(null);

  const load = useCallback(() => {
    api.get(`/teacher/courses/${id}`).then((r) => { setData(r.data); setEdits({}); setRowErrors({}); }).catch((e) => toast(errMsg(e), 'bad'));
  }, [id, toast]);
  useEffect(load, [load]);

  const loadAtt = useCallback(() => {
    setAtt(null);
    api.get(`/teacher/courses/${id}/attendance`, { params: { date } })
      .then((r) => setAtt(r.data.map((x) => ({ ...x, status: x.status || 'present' }))));
  }, [id, date]);
  useEffect(() => { if (tab === 'attendance') loadAtt(); }, [tab, loadAtt]);

  const cell = (e, k) => edits[e.id]?.[k] ?? e.grade?.[k] ?? '';
  const setCell = (e, k, v) => setEdits({ ...edits, [e.id]: { ...edits[e.id], [k]: v } });
  const changed = useMemo(() => Object.keys(edits).length, [edits]);

  const saveAll = async () => {
    if (!changed) return;
    const ok = await confirmDialog({ title: 'Save grades for the whole class?', text: `Scores for ${changed} students in this section will be updated.`, confirmText: 'Save grades' });
    if (!ok) return;
    const grades = data.students
      .filter((e) => edits[e.id])
      .map((e) => {
        const mid = cell(e, 'midterm');
        const fin = cell(e, 'final');
        return { enrollment_id: e.id, midterm: mid === '' ? null : Number(mid), final: fin === '' ? null : Number(fin) };
      });

    setSaving(true);
    try {
      const { data: res } = await api.put(`/teacher/courses/${id}/grades`, { grades });
      const failed = Object.fromEntries(res.errors.map((x) => [x.enrollment_id, x.message]));
      const refreshed = await api.get(`/teacher/courses/${id}`);
      setData(refreshed.data);
      setEdits((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => failed[k])));
      setRowErrors(failed);

      if (res.errors.length === 0) {
        toast(`Saved grades for ${res.saved} students`);
      } else {
        await infoDialog({
          icon: res.saved ? 'warning' : 'error',
          title: res.saved ? `Saved ${res.saved}, ${res.errors.length} rows have errors` : 'Grades could not be saved',
          html: errorList(res.errors),
        });
      }
    } catch (err) {
      toast(errMsg(err), 'bad');
    } finally {
      setSaving(false);
    }
  };

  const discard = async () => {
    if (!(await confirmDialog({ title: 'Discard changes?', text: `${changed} unsaved rows will be discarded.`, confirmText: 'Discard changes', danger: true }))) return;
    setEdits({});
    setRowErrors({});
  };

  const exportSheet = async () => {
    setExporting(true);
    await exportPdf(`/teacher/courses/${id}/export`, {}, 'grade-sheet.pdf');
    setExporting(false);
  };

  const saveAttendance = async () => {
    const ok = await confirmDialog({ title: 'Save attendance?', text: `Attendance for ${date} will be recorded for the whole class.`, confirmText: 'Save attendance' });
    if (!ok) return;
    try {
      await api.post(`/teacher/courses/${id}/attendance`, {
        date, records: att.map(({ student_id, status, note }) => ({ student_id, status, note })),
      });
      toast('Attendance saved');
      load();
    } catch (err) { toast(errMsg(err), 'bad'); }
  };

  const setAttRow = (sid, patch) => setAtt(att.map((a) => (a.student_id === sid ? { ...a, ...patch } : a)));

  if (!data) return <Loading />;
  const { course, students, locked, rules } = data;
  const limit = Math.round(rules.absence_ratio_limit * 100);

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/teacher/courses" className="sub">← Back to my course sections</Link>
          <h1>{course.code} · {course.subject.name}</h1>
          <div className="sub">{course.semester.name} · {scheduleLabel(course)} · Room {course.room || '—'} · {students.length} students</div>
        </div>
        <button className="btn" disabled={exporting} onClick={exportSheet}>{exporting ? 'Exporting...' : 'Export grade sheet (PDF)'}</button>
      </div>

      {locked && (
        <div className="alert">
          The semester ended more than {rules.grade_lock_days} days ago, so grades and attendance are locked. Contact an administrator if changes are needed.
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'grades' ? 'active' : ''}`} onClick={() => setTab('grades')}>Grade the whole class</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

      {tab === 'grades' && (
        <div className="card">
          <div className="grade-bar">
            <div className="sub">
              Enter scores for several students, then save once. Total = Midterm × 40% + Final × 60%.
              A midterm score is required before a final score; students absent for more than {limit}% of sessions (from {rules.min_sessions_for_ban} sessions) are banned from the exam.
            </div>
            <div className="grade-actions">
              {changed > 0 && <button className="btn" disabled={saving} onClick={discard}>Discard changes</button>}
              <button className="btn primary" disabled={locked || !changed || saving} onClick={saveAll}>
                {saving ? 'Saving...' : changed ? `Save class grades (${changed})` : 'Save class grades'}
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student ID</th><th>Full name</th><th>Class</th><th>Attendance</th><th>Midterm</th><th>Final</th><th>Total</th></tr></thead>
              <tbody>
                {students.length === 0 ? <tr><td colSpan={7} className="empty">This section has no students yet</td></tr>
                  : students.map((e) => {
                    const a = e.attendance;
                    return (
                      <tr key={e.id} className={edits[e.id] ? 'row-dirty' : ''}>
                        <td>{e.student.student_code}</td>
                        <td>
                          {e.student.user.name}
                          {rowErrors[e.id] && <div className="row-err">{rowErrors[e.id]}</div>}
                        </td>
                        <td>{e.student.school_class?.code}</td>
                        <td>
                          {a.sessions === 0 ? <span className="sub">No attendance yet</span> : (
                            <>
                              <span>Absent {a.absent}/{a.sessions}</span>{' '}
                              {a.banned && <Badge color="red">Exam ban</Badge>}
                            </>
                          )}
                        </td>
                        <td>
                          <input className="grade-input" type="number" min="0" max="10" step="0.1" disabled={locked}
                            value={cell(e, 'midterm')} onChange={(ev) => setCell(e, 'midterm', ev.target.value)} />
                        </td>
                        <td>
                          <input className="grade-input" type="number" min="0" max="10" step="0.1" disabled={locked || a.banned}
                            title={a.banned ? 'Student is banned from the exam' : ''}
                            value={cell(e, 'final')} onChange={(ev) => setCell(e, 'final', ev.target.value)} />
                        </td>
                        <td>{e.grade?.total != null ? <>{e.grade.total} <Badge color={letterColor(e.grade.letter)}>{e.grade.letter}</Badge></> : '—'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card">
          <div className="toolbar">
            <input type="date" style={{ width: 'auto' }} value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
            <button className="btn" disabled={locked} onClick={() => att && setAtt(att.map((a) => ({ ...a, status: 'present' })))}>Mark all present</button>
            <button className="btn primary" onClick={saveAttendance} disabled={locked || !att || att.length === 0}>Save attendance</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student ID</th><th>Full name</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>
                {att === null ? <tr><td colSpan={4}><Loading /></td></tr>
                  : att.length === 0 ? <tr><td colSpan={4} className="empty">This section has no students yet</td></tr>
                  : att.map((a) => (
                    <tr key={a.student_id}>
                      <td>{a.student_code}</td>
                      <td>{a.name}</td>
                      <td>
                        <select className="att-select" disabled={locked} value={a.status} onChange={(e) => setAttRow(a.student_id, { status: e.target.value })}>
                          {Object.entries(attendanceLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                      <td><input disabled={locked} value={a.note || ''} onChange={(e) => setAttRow(a.student_id, { note: e.target.value })} placeholder="Note" /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
