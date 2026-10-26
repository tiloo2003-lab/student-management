import { useEffect, useState } from 'react';
import api from '../../api';
import { Badge, Loading } from '../../components/ui';
import { exportPdf } from '../../download';
import { attendanceLabel, fmtDate, letterColor, scheduleLabel } from '../../utils';

export function StudentCourses() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.get('/student/courses').then((r) => setRows(r.data)); }, []);

  return (
    <>
      <div className="page-head"><h1>My course sections</h1></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Section</th><th>Subject</th><th>Cr.</th><th>Teacher</th><th>Semester</th><th>Schedule</th><th>Room</th></tr></thead>
            <tbody>
              {rows === null ? <tr><td colSpan={7}><Loading /></td></tr>
                : rows.length === 0 ? <tr><td colSpan={7} className="empty">You have not registered for any course sections</td></tr>
                : rows.map((e) => (
                  <tr key={e.id}>
                    <td>{e.course.code}</td>
                    <td>{e.course.subject.name}</td>
                    <td>{e.course.subject.credits}</td>
                    <td>{e.course.teacher?.user?.name}</td>
                    <td>{e.course.semester.name} {e.course.semester.is_current && <Badge color="green">Current</Badge>}</td>
                    <td>{scheduleLabel(e.course)}</td>
                    <td>{e.course.room || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function StudentGrades() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ academic_year: '', semester_id: '', subject_id: '' });
  const [options, setOptions] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api.get('/student/grades', { params }).then((r) => {
      setData(r.data);
      setOptions((prev) => prev || r.data.options);
    });
  }, [filters]);

  if (!data || !options) return <Loading />;

  const set = (key, value) => setFilters((f) => ({
    ...f,
    [key]: value,
    ...(key === 'academic_year' ? { semester_id: '' } : {}),
  }));
  const semesterOptions = options.semesters.filter((s) => !filters.academic_year || s.academic_year === filters.academic_year);
  const filtered = Object.values(filters).some((v) => v !== '');

  const exportFile = async () => {
    setExporting(true);
    await exportPdf('/student/grades/export', filters, 'transcript.pdf');
    setExporting(false);
  };

  return (
    <>
      <div className="page-head">
        <h1>Grades</h1>
        <button className="btn primary" disabled={exporting} onClick={exportFile}>{exporting ? 'Exporting...' : 'Export PDF'}</button>
      </div>

      <div className="filter-row">
        <select value={filters.academic_year} onChange={(e) => set('academic_year', e.target.value)}>
          <option value="">All academic years</option>
          {options.academic_years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filters.semester_id} onChange={(e) => set('semester_id', e.target.value)}>
          <option value="">All semesters</option>
          {semesterOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filters.subject_id} onChange={(e) => set('subject_id', e.target.value)}>
          <option value="">All subjects</option>
          {options.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {filtered && <button className="btn" onClick={() => setFilters({ academic_year: '', semester_id: '', subject_id: '' })}>Clear filters</button>}
      </div>

      {data.standing?.warning && <div className="alert">{data.standing.warning}</div>}
      {data.standing?.scholarship && <div className="alert ok">{data.standing.scholarship}</div>}

      <div className="grid stats">
        <div className="card stat"><div className="ico">⭐</div><div><div className="num">{data.gpa ?? '—'}</div><div className="lbl">Average score{filtered ? ' (filtered)' : ' (cumulative)'} · 10 scale</div></div></div>
        <div className="card stat"><div className="ico">🎯</div><div><div className="num">{data.gpa4 ?? '—'}</div><div className="lbl">Average score · 4.0 scale</div></div></div>
        <div className="card stat"><div className="ico">🏅</div><div><div className="num" style={{ fontSize: 26 }}>{data.classification ?? '—'}</div><div className="lbl">Academic classification</div></div></div>
        <div className="card stat"><div className="ico">✅</div><div><div className="num">{data.credits_earned}</div><div className="lbl">Credits passed ({data.credits_failed} failed)</div></div></div>
      </div>

      {data.semesters.length === 0 && <div className="card empty">No data matches the selected filters</div>}

      {data.semesters.map((s) => (
        <div className="card" key={s.semester.id}>
          <div className="sem-head">
            <h3>{s.semester.name} {s.semester.is_current && <Badge color="green">Current</Badge>}</h3>
            <div className="sem-sum">
              <span>Average: <b>{s.gpa ?? '—'}</b></span>
              <span>4.0 scale: <b>{s.gpa4 ?? '—'}</b></span>
              <span>Classification: <b>{s.classification ?? '—'}</b></span>
              <span>Credits registered: <b>{s.registered_credits}</b></span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Section</th><th>Subject</th><th>Cr.</th><th>Midterm</th><th>Final</th><th>Total</th><th>Grade</th><th>Result</th></tr></thead>
              <tbody>
                {s.courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>{c.name}</td>
                    <td>{c.credits}</td>
                    <td>{c.midterm ?? '—'}</td>
                    <td>{c.final ?? '—'}</td>
                    <td><b>{c.total ?? '—'}</b></td>
                    <td>{c.letter ? <Badge color={letterColor(c.letter)}>{c.letter}</Badge> : '—'}</td>
                    <td>{c.passed === null ? '—' : c.passed ? <Badge color="green">Passed</Badge> : <Badge color="red">Failed</Badge>}</td>
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
const attColor = { present: 'green', late: 'amber', absent: 'red', excused: 'blue' };

export function StudentAttendance() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/student/attendance').then((r) => setData(r.data)); }, []);
  if (!data) return <Loading />;
  const s = data.summary;

  return (
    <>
      <div className="page-head"><h1>Attendance history</h1></div>
      <div className="grid stats">
        {[['total', 'Total sessions', '📅'], ['present', 'Present', '✅'], ['late', 'Late', '⏰'], ['absent', 'Absent', '❌'], ['excused', 'Excused', '📝']].map(([k, l, i]) => (
          <div className="card stat" key={k}><div className="ico">{i}</div><div><div className="num">{s[k]}</div><div className="lbl">{l}</div></div></div>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Subject</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              {data.items.length === 0 ? <tr><td colSpan={4} className="empty">No data yet</td></tr>
                : data.items.map((a) => (
                  <tr key={a.id}>
                    <td>{fmtDate(a.date)}</td>
                    <td>{a.course?.subject?.name}</td>
                    <td><Badge color={attColor[a.status]}>{attendanceLabel[a.status]}</Badge></td>
                    <td>{a.note || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
