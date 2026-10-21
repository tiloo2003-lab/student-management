import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { roleLabel } from '../utils';

const MENUS = {
  admin: [
    { title: 'Tổng quan', items: [['/admin', 'Dashboard'], ['/announcements', 'Thông báo']] },
    { title: 'Nội dung', items: [['/admin/posts', 'Bài viết'], ['/admin/categories', 'Danh mục'], ['/admin/comments', 'Bình luận'], ['/admin/messages', 'Tin nhắn liên hệ']] },
    { title: 'Người dùng', items: [['/admin/students', 'Sinh viên'], ['/admin/teachers', 'Giáo viên']] },
    {
      title: 'Đào tạo',
      items: [
        ['/admin/departments', 'Khoa'], ['/admin/classes', 'Lớp'], ['/admin/subjects', 'Môn học'],
        ['/admin/semesters', 'Học kỳ'], ['/admin/courses', 'Lớp học phần'], ['/admin/reports', 'Báo cáo học vụ'],
      ],
    },
  ],
  teacher: [
    {
      title: 'Giảng dạy',
      items: [['/admin', 'Dashboard'], ['/teacher/courses', 'Lớp giảng dạy'], ['/announcements', 'Thông báo']],
    },
  ],
  student: [
    {
      title: 'Học tập',
      items: [
        ['/admin', 'Dashboard'], ['/student/registration', 'Đăng ký học phần'], ['/student/courses', 'Lớp học phần'], ['/student/grades', 'Bảng điểm'],
        ['/student/attendance', 'Điểm danh'], ['/announcements', 'Thông báo'],
      ],
    },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const initial = user.name.trim().split(' ').pop()[0];

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="app">
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><div className="logo">🎓</div> QL Sinh viên</div>
        <nav className="nav">
          {MENUS[user.role].map((g) => (
            <div key={g.title}>
              <div className="nav-title">{g.title}</div>
              {g.items.map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <NavLink to="/profile" className="btn sm" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>Tài khoản</NavLink>
          <button className="btn sm" style={{ width: '100%', justifyContent: 'center' }}
            onClick={async () => { await logout(); nav('/admin/login'); }}>Đăng xuất</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="left">
            <button className="btn burger" onClick={() => setOpen(true)} aria-label="Mở menu">☰</button>
            <span className="sub">Hệ thống quản lý sinh viên</span>
          </div>
          <div className="who">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 500 }}>{user.name}</div>
              <div className="sub">{roleLabel[user.role]}</div>
            </div>
            <div className="avatar">{initial}</div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
