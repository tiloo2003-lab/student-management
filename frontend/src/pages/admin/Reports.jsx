import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
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
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/reports/overview', { params: semesterId ? { semester_id: semesterId } : {} })
      .then((r) => setData(r.data))
      .catch((e) => toast(errMsg(e), 'bad'));
  }, [semesterId, toast]);

  if (!data) return <Loading />;
  const s = data.summary;
  const studentCols = [
    { key: 'student_code', label: 'MSSV' }, { key: 'name', label: 'Họ tên' }, { key: 'class', label: 'Lớp' },
    { key: 'gpa', label: 'ĐTB kỳ' }, { key: 'credits', label: 'TC' }, { key: 'credits_failed', label: 'TC chưa đạt' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Báo cáo học vụ</h1>
          <div className="sub">{data.semester?.name}</div>
        </div>
        <select style={{ width: 'auto', minWidth: 220 }} value={semesterId || data.semester?.id || ''} onChange={(e) => setSemesterId(e.target.value)}>
          {data.semesters.map((x) => <option key={x.id} value={x.id}>{x.name}{x.is_current ? ' (hiện tại)' : ''}</option>)}
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
