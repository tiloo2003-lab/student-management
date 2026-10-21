import { useEffect, useMemo, useState } from 'react';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
import { exportPdf } from '../../download';
import { letterColor } from '../../utils';

const pct = (v) => (v === null || v === undefined ? '—' : `${v}%`);

function Table({ title, rows, columns, empty }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={columns.length} className="empty">{empty}</td></tr>
              : rows.map((r, i) => (
                <tr key={i}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : (r[c.key] ?? '—')}</td>)}</tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Reports() {
  const toast = useToast();
  const [semesterId, setSemesterId] = useState('');
  const [classId, setClassId] = useState('');
  const [year, setYear] = useState('');
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const params = {};
    if (semesterId) params.semester_id = semesterId;
    if (classId) params.class_id = classId;
    api.get('/reports/overview', { params })
      .then((r) => setData(r.data))
      .catch((e) => toast(errMsg(e), 'bad'));
  }, [semesterId, classId, toast]);

  const years = useMemo(() => [...new Set((data?.semesters || []).map((s) => s.academic_year))], [data?.semesters]);

  if (!data) return <Loading />;

  const activeYear = year || data.semester?.academic_year || '';
  const semesterOptions = data.semesters.filter((s) => !activeYear || s.academic_year === activeYear);
  const s = data.summary;

  const pickYear = (value) => {
    setYear(value);
    const first = data.semesters.find((x) => x.academic_year === value);
    if (first) setSemesterId(String(first.id));
  };

  const exportFile = async () => {
    setExporting(true);
    await exportPdf('/reports/export', { semester_id: data.semester?.id, class_id: classId }, 'bao-cao-hoc-vu.pdf');
    setExporting(false);
  };

  const studentCols = [
    { key: 'student_code', label: 'MSSV' }, { key: 'name', label: 'Họ tên' }, { key: 'class', label: 'Lớp' },
    { key: 'gpa', label: 'ĐTB kỳ' }, { key: 'credits', label: 'TC' }, { key: 'credits_failed', label: 'TC chưa đạt' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Báo cáo học vụ</h1>
          <div className="sub">{data.semester?.name}{classId ? ` · lớp ${data.class_options.find((c) => String(c.id) === String(classId))?.code}` : ''}</div>
        </div>
        <button className="btn primary" disabled={exporting || !data.semester} onClick={exportFile}>{exporting ? 'Đang xuất...' : 'Xuất PDF'}</button>
      </div>

      <div className="filter-row">
        <select value={activeYear} onChange={(e) => pickYear(e.target.value)}>
          {years.map((y) => <option key={y} value={y}>Năm học {y}</option>)}
        </select>
        <select value={data.semester?.id || ''} onChange={(e) => setSemesterId(e.target.value)}>
          {semesterOptions.map((x) => <option key={x.id} value={x.id}>{x.name}{x.is_current ? ' (hiện tại)' : ''}</option>)}
        </select>
        <select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Tất cả các lớp</option>
          {data.class_options.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </select>
      </div>

      {!s ? <div className="card empty">Chưa có dữ liệu</div> : (
        <>
          <div className="grid stats">
            <div className="card stat"><div className="ico">👥</div><div><div className="num">{s.students}</div><div className="lbl">Sinh viên đăng ký</div></div></div>
            <div className="card stat"><div className="ico">🧾</div><div><div className="num">{s.enrollments}</div><div className="lbl">Lượt đăng ký ({s.graded} có điểm)</div></div></div>
            <div className="card stat"><div className="ico">📊</div><div><div className="num">{s.average ?? '—'}</div><div className="lbl">Điểm trung bình</div></div></div>
            <div className="card stat"><div className="ico">✅</div><div><div className="num">{pct(s.pass_rate)}</div><div className="lbl">Tỉ lệ đạt</div></div></div>
          </div>

          <div className="card">
            <h3>Phân bố xếp loại điểm</h3>
            {data.letters.length === 0 ? <div className="sub">Chưa có điểm tổng kết</div> : data.letters.map((l) => (
              <div className="bar-row" key={l.label}>
                <div className="name"><Badge color={letterColor(l.label)}>{l.label}</Badge></div>
                <div className="bar"><i style={{ width: `${(l.total / s.graded) * 100}%` }} /></div>
                <div className="val">{l.total}</div>
              </div>
            ))}
          </div>

          <Table title="Kết quả theo lớp học phần" rows={data.courses} empty="Chưa có lớp học phần"
            columns={[
              { key: 'code', label: 'Mã LHP' }, { key: 'subject', label: 'Môn học' }, { key: 'teacher', label: 'Giáo viên' },
              { key: 'enrolled', label: 'Sĩ số' }, { key: 'graded', label: 'Có điểm' }, { key: 'average', label: 'ĐTB' },
              { key: 'pass_rate', label: 'Tỉ lệ đạt', render: (r) => pct(r.pass_rate) },
            ]} />

          <div className="grid two">
            <Table title="Điểm trung bình theo lớp" rows={data.classes} empty="Chưa có dữ liệu"
              columns={[{ key: 'class', label: 'Lớp' }, { key: 'students', label: 'Sinh viên' }, { key: 'average_gpa', label: 'ĐTB' }]} />
            <Table title="Top 10 sinh viên xuất sắc" rows={data.top_students} empty="Chưa có dữ liệu" columns={studentCols} />
          </div>

          <div className="grid two">
            <Table title="Cảnh báo học vụ (ĐTB kỳ dưới 4.0)" rows={data.warnings} empty="Không có sinh viên bị cảnh báo" columns={studentCols} />
            <Table title="Đủ điều kiện xét học bổng" rows={data.scholarships} empty="Chưa có sinh viên đủ điều kiện" columns={studentCols} />
          </div>
        </>
      )}
    </>
  );
}
