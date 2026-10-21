import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
import { exportPdf } from '../../download';
import { confirmDialog, infoDialog } from '../../notify';
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
    const ok = await confirmDialog({ title: 'Lưu điểm cả lớp?', text: `Sẽ cập nhật điểm của ${changed} sinh viên trong lớp này.`, confirmText: 'Lưu điểm' });
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
        toast(`Đã lưu điểm cho ${res.saved} sinh viên`);
      } else {
        await infoDialog({
          icon: res.saved ? 'warning' : 'error',
          title: res.saved ? `Đã lưu ${res.saved}, còn ${res.errors.length} dòng lỗi` : 'Không lưu được điểm',
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
    if (!(await confirmDialog({ title: 'Hủy các thay đổi?', text: `${changed} dòng chưa lưu sẽ bị bỏ.`, confirmText: 'Hủy thay đổi', danger: true }))) return;
    setEdits({});
    setRowErrors({});
  };

  const exportSheet = async () => {
    setExporting(true);
    await exportPdf(`/teacher/courses/${id}/export`, {}, 'bang-diem-lop.pdf');
    setExporting(false);
  };

  const saveAttendance = async () => {
    const ok = await confirmDialog({ title: 'Lưu điểm danh?', text: `Điểm danh ngày ${date} sẽ được ghi nhận cho cả lớp.`, confirmText: 'Lưu điểm danh' });
    if (!ok) return;
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
        <button className="btn" disabled={exporting} onClick={exportSheet}>{exporting ? 'Đang xuất...' : 'Xuất bảng điểm PDF'}</button>
      </div>

      {locked && (
        <div className="alert">
          Học kỳ đã kết thúc quá {rules.grade_lock_days} ngày nên điểm và điểm danh đã bị khóa. Liên hệ quản trị viên nếu cần chỉnh sửa.
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'grades' ? 'active' : ''}`} onClick={() => setTab('grades')}>Nhập điểm cả lớp</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Điểm danh</button>
      </div>

      {tab === 'grades' && (
        <div className="card">
          <div className="grade-bar">
            <div className="sub">
              Nhập điểm cho nhiều sinh viên rồi bấm lưu một lần. Tổng kết = Giữa kỳ × 40% + Cuối kỳ × 60%.
              Cần có giữa kỳ mới nhập được cuối kỳ; vắng quá {limit}% số buổi (từ {rules.min_sessions_for_ban} buổi) bị cấm thi.
            </div>
            <div className="grade-actions">
              {changed > 0 && <button className="btn" disabled={saving} onClick={discard}>Hủy thay đổi</button>}
              <button className="btn primary" disabled={locked || !changed || saving} onClick={saveAll}>
                {saving ? 'Đang lưu...' : changed ? `Lưu điểm cả lớp (${changed})` : 'Lưu điểm cả lớp'}
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Chuyên cần</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>Tổng kết</th></tr></thead>
              <tbody>
                {students.length === 0 ? <tr><td colSpan={7} className="empty">Lớp chưa có sinh viên</td></tr>
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
