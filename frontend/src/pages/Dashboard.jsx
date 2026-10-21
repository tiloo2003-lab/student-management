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
      {data.length === 0 && <div className="sub">Chưa có dữ liệu</div>}
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
    <h3>Thông báo mới <Link to="/announcements" style={{ float: 'right', fontSize: 15 }}>Xem tất cả</Link></h3>
    {items.length === 0 && <div className="sub">Chưa có thông báo</div>}
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
  const genderMap = { male: 'Nam', female: 'Nữ', other: 'Khác' };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Xin chào, {user.name} 👋</h1>
          <div className="sub">
            {d.role === 'admin' && d.current_semester ? `Học kỳ hiện tại: ${d.current_semester.name}` : 'Tổng quan hoạt động của bạn'}
          </div>
        </div>
      </div>

      {d.role === 'admin' && (
        <>
          <div className="grid stats">
            <Stat icon="🎓" num={c.students} label="Sinh viên" to="/admin/students" />
            <Stat icon="👩‍🏫" num={c.teachers} label="Giáo viên" to="/admin/teachers" />
            <Stat icon="🏫" num={c.classes} label="Lớp" to="/admin/classes" />
            <Stat icon="🏛️" num={c.departments} label="Khoa" to="/admin/departments" />
            <Stat icon="📚" num={c.subjects} label="Môn học" to="/admin/subjects" />
            <Stat icon="🧾" num={c.courses} label="Lớp học phần" to="/admin/courses" />
            <Stat icon="📰" num={c.posts} label="Bài viết" to="/admin/posts" />
          </div>
          <div className="grid two">
            <Bars title="Sinh viên theo khoa" data={d.students_by_department} />
            <Bars title="Phân bố xếp loại điểm" data={d.grade_distribution} map={(l) => `Loại ${l}`} />
          </div>
          <div className="grid two">
            <Bars title="Giới tính sinh viên" data={d.gender} map={(g) => genderMap[g]} />
            <Announcements items={d.announcements} />
          </div>
        </>
      )}

      {d.role === 'teacher' && (
        <>
          <div className="grid stats">
            <Stat icon="🧾" num={c.courses} label="Tổng lớp học phần" to="/teacher/courses" />
            <Stat icon="📖" num={c.current_courses} label="Lớp học kỳ này" to="/teacher/courses" />
            <Stat icon="🎓" num={c.students} label="Sinh viên phụ trách" to="/teacher/courses" />
            <Stat icon="🏫" num={c.homeroom_classes} label="Lớp chủ nhiệm" />
          </div>
          <div className="grid two">
            <div className="card">
              <h3>Lớp giảng dạy học kỳ này</h3>
              {d.current_courses.length === 0 && <div className="sub">Không có lớp nào</div>}
              {d.current_courses.map((x) => (
                <div className="ann" key={x.id}>
                  <h4><Link to={`/teacher/courses/${x.id}`}>{x.subject.name}</Link></h4>
                  <div className="sub">{x.code} · {scheduleLabel(x)} · {x.enrollments_count} sinh viên</div>
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
          <div className="grid stats">
            <Stat icon="📚" num={c.courses} label="Lớp học phần" to="/student/courses" />
            <Stat icon="🎯" num={c.credits} label="Tín chỉ tích lũy" to="/student/grades" />
            <Stat icon="⭐" num={c.gpa} label="Điểm trung bình" to="/student/grades" />
            <Stat icon="✅" num={c.attendance_rate != null ? `${c.attendance_rate}%` : null} label="Chuyên cần" to="/student/attendance" />
          </div>
          <div className="grid two">
            <div className="card">
              <h3>Lớp học kỳ này</h3>
              {d.current_courses.length === 0 && <div className="sub">Bạn chưa đăng ký lớp nào trong học kỳ hiện tại</div>}
              {d.current_courses.map((e) => (
                <div className="ann" key={e.id}>
                  <h4>{e.course.subject.name}</h4>
                  <div className="sub">{e.course.code} · {scheduleLabel(e.course)} · Phòng {e.course.room || '—'} · GV {e.course.teacher?.user?.name}</div>
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
