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
    await exportPdf('/reports/export', { semester_id: data.semester?.id, class_id: classId }, 'academic-report.pdf');
    setExporting(false);
  };

  const studentCols = [
    { key: 'student_code', label: 'Student ID' }, { key: 'name', label: 'Full name' }, { key: 'class', label: 'Class' },
    { key: 'gpa', label: 'Semester avg.' }, { key: 'credits', label: 'Credits' }, { key: 'credits_failed', label: 'Failed credits' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Academic reports</h1>
          <div className="sub">{data.semester?.name}{classId ? ` · class ${data.class_options.find((c) => String(c.id) === String(classId))?.code}` : ''}</div>
        </div>
        <button className="btn primary" disabled={exporting || !data.semester} onClick={exportFile}>{exporting ? 'Exporting...' : 'Export PDF'}</button>
      </div>

      <div className="filter-row">
        <select value={activeYear} onChange={(e) => pickYear(e.target.value)}>
          {years.map((y) => <option key={y} value={y}>Academic year {y}</option>)}
        </select>
        <select value={data.semester?.id || ''} onChange={(e) => setSemesterId(e.target.value)}>
          {semesterOptions.map((x) => <option key={x.id} value={x.id}>{x.name}{x.is_current ? ' (current)' : ''}</option>)}
        </select>
        <select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">All classes</option>
          {data.class_options.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </select>
      </div>

      {!s ? <div className="card empty">No data yet</div> : (
        <>
          <div className="grid stats">
            <div className="card stat"><div className="ico">👥</div><div><div className="num">{s.students}</div><div className="lbl">Registered students</div></div></div>
            <div className="card stat"><div className="ico">🧾</div><div><div className="num">{s.enrollments}</div><div className="lbl">Enrollments ({s.graded} graded)</div></div></div>
            <div className="card stat"><div className="ico">📊</div><div><div className="num">{s.average ?? '—'}</div><div className="lbl">Average score</div></div></div>
            <div className="card stat"><div className="ico">✅</div><div><div className="num">{pct(s.pass_rate)}</div><div className="lbl">Pass rate</div></div></div>
          </div>

          <div className="card">
            <h3>Grade distribution</h3>
            {data.letters.length === 0 ? <div className="sub">No final scores yet</div> : data.letters.map((l) => (
              <div className="bar-row" key={l.label}>
                <div className="name"><Badge color={letterColor(l.label)}>{l.label}</Badge></div>
                <div className="bar"><i style={{ width: `${(l.total / s.graded) * 100}%` }} /></div>
                <div className="val">{l.total}</div>
              </div>
            ))}
          </div>

          <Table title="Results by course section" rows={data.courses} empty="No course sections"
            columns={[
              { key: 'code', label: 'Section' }, { key: 'subject', label: 'Subject' }, { key: 'teacher', label: 'Teacher' },
              { key: 'enrolled', label: 'Enrolled' }, { key: 'graded', label: 'Graded' }, { key: 'average', label: 'Average' },
              { key: 'pass_rate', label: 'Pass rate', render: (r) => pct(r.pass_rate) },
            ]} />

          <div className="grid two">
            <Table title="Average score by class" rows={data.classes} empty="No data yet"
              columns={[{ key: 'class', label: 'Class' }, { key: 'students', label: 'Students' }, { key: 'average_gpa', label: 'Average' }]} />
            <Table title="Top 10 students" rows={data.top_students} empty="No data yet" columns={studentCols} />
          </div>

          <div className="grid two">
            <Table title="Academic warnings (semester average below 4.0)" rows={data.warnings} empty="No students with warnings" columns={studentCols} />
            <Table title="Scholarship candidates" rows={data.scholarships} empty="No eligible students yet" columns={studentCols} />
          </div>
        </>
      )}
    </>
  );
}
