import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
import { attendanceLabel, letterColor, scheduleLabel } from '../../utils';

export function TeacherCourses() {
  const [courses, setCourses] = useState(null);
  useEffect(() => { api.get('/teacher/courses').then((r) => setCourses(r.data)); }, []);

  return (
    <>
      <div className="page-head"><h1>Lớp giảng dạy</h1></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mã LHP</th><th>Môn học</th><th>Học kỳ</th><th>Lịch học</th><th>Phòng</th><th>Sĩ số</th><th /></tr></thead>
            <tbody>
              {courses === null ? <tr><td colSpan={7}><Loading /></td></tr>
                : courses.length === 0 ? <tr><td colSpan={7} className="empty">Chưa có lớp được phân công</td></tr>
                : courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>{c.subject.name} <span className="sub">({c.subject.credits} TC)</span></td>
                    <td>{c.semester.name} {c.semester.is_current && <Badge color="green">Hiện tại</Badge>}</td>
                    <td>{scheduleLabel(c)}</td>
                    <td>{c.room || '—'}</td>
                    <td>{c.enrollments_count}/{c.max_students}</td>
                    <td className="actions"><Link className="btn sm primary" to={`/teacher/courses/${c.id}`}>Quản lý</Link></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

export function TeacherCourseDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [tab, setTab] = useState('grades');
  const [data, setData] = useState(null);
  const [edits, setEdits] = useState({});
  const [date, setDate] = useState(today());
  const [att, setAtt] = useState(null);

  const load = useCallback(() => {
    api.get(`/teacher/courses/${id}`).then((r) => { setData(r.data); setEdits({}); }).catch((e) => toast(errMsg(e), 'bad'));
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

  const saveGrade = async (e) => {
    const mid = cell(e, 'midterm');
    const fin = cell(e, 'final');
    try {
      const { data: g } = await api.put(`/teacher/enrollments/${e.id}/grade`, {
        midterm: mid === '' ? null : Number(mid), final: fin === '' ? null : Number(fin),
      });
      setData((d) => ({ ...d, students: d.students.map((s) => (s.id === e.id ? { ...s, grade: g } : s)) }));
      setEdits((x) => { const n = { ...x }; delete n[e.id]; return n; });
      toast('Đã lưu điểm');
    } catch (err) { toast(errMsg(err), 'bad'); }
  };

  const saveAttendance = async () => {
    try {
      await api.post(`/teacher/courses/${id}/attendance`, {
        date, records: att.map(({ student_id, status, note }) => ({ student_id, status, note })),
      });
      toast('Đã lưu điểm danh');
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
          <Link to="/teacher/courses" className="sub">← Quay lại danh sách lớp</Link>
          <h1>{course.code} · {course.subject.name}</h1>
          <div className="sub">{course.semester.name} · {scheduleLabel(course)} · Phòng {course.room || '—'} · {students.length} sinh viên</div>
        </div>
      </div>

      {locked && (
        <div className="alert">
          Học kỳ đã kết thúc quá {rules.grade_lock_days} ngày nên điểm và điểm danh đã bị khóa. Liên hệ quản trị viên nếu cần chỉnh sửa.
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'grades' ? 'active' : ''}`} onClick={() => setTab('grades')}>Nhập điểm</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Điểm danh</button>
      </div>

      {tab === 'grades' && (
        <div className="card">
          <div className="sub" style={{ marginBottom: 10 }}>
            Tổng kết = Giữa kỳ × 40% + Cuối kỳ × 60%. Phải có điểm giữa kỳ mới nhập được cuối kỳ.
            Sinh viên vắng quá {limit}% số buổi (từ {rules.min_sessions_for_ban} buổi) bị cấm thi.
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Chuyên cần</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>Tổng kết</th><th /></tr></thead>
              <tbody>
                {students.length === 0 ? <tr><td colSpan={8} className="empty">Lớp chưa có sinh viên</td></tr>
                  : students.map((e) => {
                    const a = e.attendance;
                    return (
                      <tr key={e.id}>
                        <td>{e.student.student_code}</td>
                        <td>{e.student.user.name}</td>
                        <td>{e.student.school_class?.code}</td>
                        <td>
                          {a.sessions === 0 ? <span className="sub">Chưa điểm danh</span> : (
                            <>
                              <span>Vắng {a.absent}/{a.sessions}</span>{' '}
                              {a.banned && <Badge color="red">Cấm thi</Badge>}
                            </>
                          )}
                        </td>
                        <td>
                          <input className="grade-input" type="number" min="0" max="10" step="0.1" disabled={locked}
                            value={cell(e, 'midterm')} onChange={(ev) => setCell(e, 'midterm', ev.target.value)} />
                        </td>
                        <td>
                          <input className="grade-input" type="number" min="0" max="10" step="0.1" disabled={locked || a.banned}
                            title={a.banned ? 'Sinh viên bị cấm thi' : ''}
                            value={cell(e, 'final')} onChange={(ev) => setCell(e, 'final', ev.target.value)} />
                        </td>
                        <td>{e.grade?.total != null ? <>{e.grade.total} <Badge color={letterColor(e.grade.letter)}>{e.grade.letter}</Badge></> : '—'}</td>
                        <td className="actions">
                          <button className="btn sm primary" disabled={locked || !edits[e.id]} onClick={() => saveGrade(e)}>Lưu</button>
                        </td>
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
            <button className="btn" disabled={locked} onClick={() => att && setAtt(att.map((a) => ({ ...a, status: 'present' })))}>Tất cả có mặt</button>
            <button className="btn primary" onClick={saveAttendance} disabled={locked || !att || att.length === 0}>Lưu điểm danh</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>MSSV</th><th>Họ tên</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
              <tbody>
                {att === null ? <tr><td colSpan={4}><Loading /></td></tr>
                  : att.length === 0 ? <tr><td colSpan={4} className="empty">Lớp chưa có sinh viên</td></tr>
                  : att.map((a) => (
                    <tr key={a.student_id}>
                      <td>{a.student_code}</td>
                      <td>{a.name}</td>
                      <td>
                        <select className="att-select" disabled={locked} value={a.status} onChange={(e) => setAttRow(a.student_id, { status: e.target.value })}>
                          {Object.entries(attendanceLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                      <td><input disabled={locked} value={a.note || ''} onChange={(e) => setAttRow(a.student_id, { note: e.target.value })} placeholder="Ghi chú" /></td>
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
