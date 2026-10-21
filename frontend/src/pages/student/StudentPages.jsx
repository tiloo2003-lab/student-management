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
      <div className="page-head"><h1>Lớp học phần của tôi</h1></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mã LHP</th><th>Môn học</th><th>TC</th><th>Giáo viên</th><th>Học kỳ</th><th>Lịch học</th><th>Phòng</th></tr></thead>
            <tbody>
              {rows === null ? <tr><td colSpan={7}><Loading /></td></tr>
                : rows.length === 0 ? <tr><td colSpan={7} className="empty">Bạn chưa đăng ký lớp học phần nào</td></tr>
                : rows.map((e) => (
                  <tr key={e.id}>
                    <td>{e.course.code}</td>
                    <td>{e.course.subject.name}</td>
                    <td>{e.course.subject.credits}</td>
                    <td>{e.course.teacher?.user?.name}</td>
                    <td>{e.course.semester.name} {e.course.semester.is_current && <Badge color="green">Hiện tại</Badge>}</td>
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
    await exportPdf('/student/grades/export', filters, 'ket-qua-hoc-tap.pdf');
    setExporting(false);
  };

  return (
    <>
      <div className="page-head">
        <h1>Bảng điểm</h1>
        <button className="btn primary" disabled={exporting} onClick={exportFile}>{exporting ? 'Đang xuất...' : 'Xuất PDF'}</button>
      </div>

      <div className="filter-row">
        <select value={filters.academic_year} onChange={(e) => set('academic_year', e.target.value)}>
          <option value="">Tất cả năm học</option>
          {options.academic_years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filters.semester_id} onChange={(e) => set('semester_id', e.target.value)}>
          <option value="">Tất cả học kỳ</option>
          {semesterOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filters.subject_id} onChange={(e) => set('subject_id', e.target.value)}>
          <option value="">Tất cả môn học</option>
          {options.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {filtered && <button className="btn" onClick={() => setFilters({ academic_year: '', semester_id: '', subject_id: '' })}>Bỏ lọc</button>}
      </div>

      {data.standing?.warning && <div className="alert">{data.standing.warning}</div>}
      {data.standing?.scholarship && <div className="alert ok">{data.standing.scholarship}</div>}

      <div className="grid stats">
        <div className="card stat"><div className="ico">⭐</div><div><div className="num">{data.gpa ?? '—'}</div><div className="lbl">Điểm TB{filtered ? ' (theo bộ lọc)' : ' tích lũy'} · hệ 10</div></div></div>
        <div className="card stat"><div className="ico">🎯</div><div><div className="num">{data.gpa4 ?? '—'}</div><div className="lbl">Điểm TB hệ 4</div></div></div>
        <div className="card stat"><div className="ico">🏅</div><div><div className="num" style={{ fontSize: 26 }}>{data.classification ?? '—'}</div><div className="lbl">Xếp loại học lực</div></div></div>
        <div className="card stat"><div className="ico">✅</div><div><div className="num">{data.credits_earned}</div><div className="lbl">Tín chỉ đạt ({data.credits_failed} chưa đạt)</div></div></div>
      </div>

      {data.semesters.length === 0 && <div className="card empty">Không có dữ liệu phù hợp với bộ lọc</div>}

      {data.semesters.map((s) => (
        <div className="card" key={s.semester.id}>
          <div className="sem-head">
            <h3>{s.semester.name} {s.semester.is_current && <Badge color="green">Hiện tại</Badge>}</h3>
            <div className="sem-sum">
              <span>ĐTB: <b>{s.gpa ?? '—'}</b></span>
              <span>Hệ 4: <b>{s.gpa4 ?? '—'}</b></span>
              <span>Xếp loại: <b>{s.classification ?? '—'}</b></span>
              <span>TC đăng ký: <b>{s.registered_credits}</b></span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mã LHP</th><th>Môn học</th><th>TC</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>Tổng kết</th><th>Xếp loại</th><th>Kết quả</th></tr></thead>
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
                    <td>{c.passed === null ? '—' : c.passed ? <Badge color="green">Đạt</Badge> : <Badge color="red">Không đạt</Badge>}</td>
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
      <div className="page-head"><h1>Lịch sử điểm danh</h1></div>
      <div className="grid stats">
        {[['total', 'Tổng số buổi', '📅'], ['present', 'Có mặt', '✅'], ['late', 'Đi muộn', '⏰'], ['absent', 'Vắng', '❌'], ['excused', 'Có phép', '📝']].map(([k, l, i]) => (
          <div className="card stat" key={k}><div className="ico">{i}</div><div><div className="num">{s[k]}</div><div className="lbl">{l}</div></div></div>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ngày</th><th>Môn học</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
            <tbody>
              {data.items.length === 0 ? <tr><td colSpan={4} className="empty">Chưa có dữ liệu</td></tr>
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
