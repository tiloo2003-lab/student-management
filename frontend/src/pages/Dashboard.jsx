import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth';
import { Badge, Loading } from '../components/ui';
import { fmtDate, scheduleLabel, targetLabel } from '../utils';

const Stat = ({ icon, num, label, to }) => {
  const body = (
    <>
      <div className="ico">{icon}</div>
      <div><div className="num">{num ?? '—'}</div><div className="lbl">{label}</div></div>
    </>
  );
  return to
    ? <Link to={to} className="card stat">{body}</Link>
    : <div className="card stat">{body}</div>;
};

function Bars({ title, data, map = (x) => x }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div className="card">
      <h3>{title}</h3>
      {data.length === 0 && <div className="sub">No data yet</div>}
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <div className="name">{map(d.label)}</div>
          <div className="bar"><i style={{ width: `${(d.total / max) * 100}%` }} /></div>
          <div className="val">{d.total}</div>
        </div>
      ))}
    </div>
  );
}

const Announcements = ({ items }) => (
  <div className="card">
    <h3>Latest announcements <Link to="/announcements" style={{ float: 'right', fontSize: 15 }}>View all</Link></h3>
    {items.length === 0 && <div className="sub">No announcements</div>}
    {items.map((a) => (
      <div className="ann" key={a.id}>
        <h4>{a.title}</h4>
        <div className="sub">{fmtDate(a.created_at)} · {a.author?.name} · <Badge color="purple">{targetLabel[a.target_role]}</Badge></div>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/dashboard').then((r) => setD(r.data)); }, []);
  if (!d) return <Loading />;
  const c = d.counts;
  const genderMap = { male: 'Male', female: 'Female', other: 'Other' };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hello, {user.name} 👋</h1>
          <div className="sub">
            {d.role === 'admin' && d.current_semester ? `Current semester: ${d.current_semester.name}` : 'Your activity overview'}
          </div>
        </div>
      </div>

      {d.role === 'admin' && (
        <>
          <div className="grid stats">
            <Stat icon="🎓" num={c.students} label="Students" to="/admin/students" />
            <Stat icon="👩‍🏫" num={c.teachers} label="Teachers" to="/admin/teachers" />
            <Stat icon="🏫" num={c.classes} label="Classes" to="/admin/classes" />
            <Stat icon="🏛️" num={c.departments} label="Departments" to="/admin/departments" />
            <Stat icon="📚" num={c.subjects} label="Subjects" to="/admin/subjects" />
            <Stat icon="🧾" num={c.courses} label="Course sections" to="/admin/courses" />
            <Stat icon="📰" num={c.posts} label="Posts" to="/admin/posts" />
          </div>
          <div className="grid two">
            <Bars title="Students by department" data={d.students_by_department} />
            <Bars title="Grade distribution" data={d.grade_distribution} map={(l) => `Grade ${l}`} />
          </div>
          <div className="grid two">
            <Bars title="Students by gender" data={d.gender} map={(g) => genderMap[g]} />
            <Announcements items={d.announcements} />
          </div>
        </>
      )}

      {d.role === 'teacher' && (
        <>
          <div className="grid stats">
            <Stat icon="🧾" num={c.courses} label="Total course sections" to="/teacher/courses" />
            <Stat icon="📖" num={c.current_courses} label="Sections this semester" to="/teacher/courses" />
            <Stat icon="🎓" num={c.students} label="Students taught" to="/teacher/courses" />
            <Stat icon="🏫" num={c.homeroom_classes} label="Homeroom classes" to="/teacher/classes" />
          </div>
          <div className="grid two">
            <div className="card">
              <h3>Course sections this semester</h3>
              {d.current_courses.length === 0 && <div className="sub">No course sections</div>}
              {d.current_courses.map((x) => (
                <div className="ann" key={x.id}>
                  <h4><Link to={`/teacher/courses/${x.id}`}>{x.subject.name}</Link></h4>
                  <div className="sub">{x.code} · {scheduleLabel(x)} · {x.enrollments_count} students</div>
                </div>
              ))}
            </div>
            <Announcements items={d.announcements} />
          </div>
        </>
      )}

      {d.role === 'student' && (
        <>
          {d.standing?.warning && <div className="alert">{d.standing.warning}</div>}
          {d.standing?.scholarship && <div className="alert ok">{d.standing.scholarship}</div>}
          {d.school_class && (
            <div className="card">
              <h3>My class: {d.school_class.code} - {d.school_class.name}</h3>
              <div className="sub">{d.school_class.department} · Cohort {d.school_class.academic_year || '—'} · Homeroom teacher {d.school_class.homeroom_teacher || '—'}</div>
            </div>
          )}
          <div className="grid stats">
            <Stat icon="📚" num={c.courses} label="Course sections" to="/student/courses" />
            <Stat icon="🎯" num={c.credits} label="Credits earned" to="/student/grades" />
            <Stat icon="⭐" num={c.gpa} label="Average score" to="/student/grades" />
            <Stat icon="✅" num={c.attendance_rate != null ? `${c.attendance_rate}%` : null} label="Attendance" to="/student/attendance" />
          </div>
          <div className="grid two">
            <div className="card">
              <h3>Sections this semester</h3>
              {d.current_courses.length === 0 && <div className="sub">You have not registered for any sections this semester</div>}
              {d.current_courses.map((e) => (
                <div className="ann" key={e.id}>
                  <h4>{e.course.subject.name}</h4>
                  <div className="sub">{e.course.code} · {scheduleLabel(e.course)} · Room {e.course.room || '—'} · Teacher {e.course.teacher?.user?.name}</div>
                </div>
              ))}
            </div>
            <Announcements items={d.announcements} />
          </div>
        </>
      )}
    </>
  );
}
