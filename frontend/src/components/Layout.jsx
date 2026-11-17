import AccountMenu from './AccountMenu';
import Icon from './Icon';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';


const MENUS = {
  admin: [
    { title: 'Overview', items: [['/workspace', 'Workspace'], ['/announcements', 'Your notifications']] },
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
      items: [['/workspace', 'Workspace'], ['/teacher/courses', 'My course sections'], ['/teacher/classes', 'My homeroom classes'], ['/announcements', 'Your notifications']],
    },
  ],
  student: [
    {
      title: 'Learning',
      items: [
        ['/workspace', 'Workspace'], ['/student/registration', 'Course registration'], ['/student/courses', 'My course sections'], ['/student/grades', 'Grades'],
        ['/student/attendance', 'Attendance'], ['/announcements', 'Your notifications'],
      ],
    },
  ],
};

export default function Layout() {
  const { user } = useAuth();

  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="app">
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><div className="logo"><Icon name="school" /></div> Student Management</div>
        <nav className="nav">
          {MENUS[user.role].map((g) => (
            <div key={g.title}>
              <div className="nav-title">{g.title}</div>
              {g.items.map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/workspace'} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="left">
            <NavLink to="/" className="btn news-link"><Icon name="news" /><span>News</span></NavLink>
            <button className="btn workspace-menu" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Icon name="menu" /></button>
            <span className="sub workspace-title">Student Management System</span>
          </div>
          <AccountMenu />
        </header>
        <main className="content">{user.is_demo && <div className="demo-banner">Demo account: try all features available to your role. Changes are saved.</div>}<Outlet /></main>
      </div>
    </div>
  );
}
