import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
import { confirmDelete, confirmDialog } from '../../notify';
import { letterColor, scheduleLabel } from '../../utils';

export default function CourseStudents() {
  const { id } = useParams();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [rows, setRows] = useState(null);
  const [students, setStudents] = useState([]);
  const [pick, setPick] = useState('');

  const load = useCallback(() => {
    api.get(`/courses/${id}`).then((r) => setCourse(r.data));
    api.get(`/courses/${id}/students`).then((r) => setRows(r.data));
  }, [id]);

  useEffect(() => {
    load();
    api.get('/students', { params: { all: 1 } }).then((r) => setStudents(r.data.data));
  }, [load]);

  const add = async () => {
    if (!pick) return;
    const student = students.find((s) => String(s.id) === String(pick));
    const ok = await confirmDialog({ title: 'Add this student to the section?', text: student ? `${student.student_code} - ${student.name}` : '', confirmText: 'Add to section' });
    if (!ok) return;
    try {
      await api.post(`/courses/${id}/students`, { student_id: pick });
      toast('Student added');
      setPick('');
      load();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  const remove = async (enr) => {
    if (!(await confirmDelete('The student will be removed from this course section.'))) return;
    try {
      await api.delete(`/courses/${id}/students/${enr.id}`);
      toast('Deleted successfully');
      load();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  const enrolled = new Set((rows || []).map((r) => r.student_id));

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/admin/courses" className="sub">← Back to course sections</Link>
          <h1>{course ? `${course.code} · ${course.subject.name}` : 'Course section'}</h1>
          {course && <div className="sub">Teacher: {course.teacher?.user?.name} · {course.semester.name} · {scheduleLabel(course)} · Room {course.room || '—'}</div>}
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <select style={{ minWidth: 320 }} value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">— Select a student to add —</option>
            {students.filter((s) => !enrolled.has(s.id)).map((s) => (
              <option key={s.id} value={s.id}>{s.student_code} - {s.name}</option>
            ))}
          </select>
          <button className="btn primary" onClick={add} disabled={!pick}>＋ Add to section</button>
          <span className="sub">{rows ? `${rows.length}/${course?.max_students || '?'} students` : ''}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student ID</th><th>Full name</th><th>Class</th><th>Midterm</th><th>Final</th><th>Total</th><th /></tr></thead>
            <tbody>
              {rows === null ? <tr><td colSpan={7}><Loading /></td></tr>
                : rows.length === 0 ? <tr><td colSpan={7} className="empty">No students yet</td></tr>
                : rows.map((e) => (
                  <tr key={e.id}>
                    <td>{e.student.student_code}</td>
                    <td>{e.student.user.name}</td>
                    <td>{e.student.school_class?.code}</td>
                    <td>{e.grade?.midterm ?? '—'}</td>
                    <td>{e.grade?.final ?? '—'}</td>
                    <td>{e.grade?.total != null ? <>{e.grade.total} <Badge color={letterColor(e.grade.letter)}>{e.grade.letter}</Badge></> : '—'}</td>
                    <td className="actions"><button className="btn sm danger" onClick={() => remove(e)}>Delete</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
