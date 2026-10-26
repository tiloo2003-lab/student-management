import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { roleLabel } from '../utils';

const MENUS = {
  admin: [
    { title: 'Overview', items: [['/admin', 'Dashboard'], ['/announcements', 'Announcements']] },
    { title: 'Content', items: [['/admin/posts', 'Posts'], ['/admin/categories', 'Categories'], ['/admin/comments', 'Comments'], ['/admin/messages', 'Contact messages']] },
    { title: 'Users', items: [['/admin/students', 'Students'], ['/admin/teachers', 'Teachers']] },
    {
      title: 'Academics',
      items: [
        ['/admin/departments', 'Departments'], ['/admin/classes', 'Classes'], ['/admin/subjects', 'Subjects'],
        ['/admin/semesters', 'Semesters'], ['/admin/courses', 'Course sections'], ['/admin/reports', 'Academic reports'],
      ],
    },
  ],
  teacher: [
    {
      title: 'Teaching',
      items: [['/admin', 'Dashboard'], ['/teacher/courses', 'My course sections'], ['/announcements', 'Announcements']],
    },
  ],
  student: [
    {
      title: 'Learning',
      items: [
        ['/admin', 'Dashboard'], ['/student/registration', 'Course registration'], ['/student/courses', 'My course sections'], ['/student/grades', 'Grades'],
        ['/student/attendance', 'Attendance'], ['/announcements', 'Announcements'],
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
        <div className="brand"><div className="logo">🎓</div> Student Management</div>
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
          <NavLink to="/profile" className="btn sm" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>Account</NavLink>
          <button className="btn sm" style={{ width: '100%', justifyContent: 'center' }}
            onClick={async () => { await logout(); nav('/admin/login'); }}>Log out</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="left">
            <button className="btn burger" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
            <span className="sub">Student Management System</span>
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
