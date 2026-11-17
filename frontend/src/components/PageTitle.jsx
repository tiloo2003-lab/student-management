import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const titles = {
  '/': 'Home',
  '/login': 'Sign in',
  '/admin/login': 'Sign in',
  '/about': 'About',
  '/contact': 'Contact',
  '/announcements': 'Your notifications',
  '/workspace': 'Workspace',
  '/profile': 'Account',
  '/admin': 'Dashboard',
  '/admin/posts': 'Manage posts',
  '/admin/reports': 'Academic reports',
  '/admin/categories': 'Manage categories',
  '/admin/comments': 'Manage comments',
  '/admin/messages': 'Contact messages',
  '/admin/departments': 'Departments',
  '/admin/teachers': 'Teachers',
  '/admin/students': 'Students',
  '/admin/classes': 'Classes',
  '/admin/subjects': 'Subjects',
  '/admin/semesters': 'Semesters',
  '/admin/courses': 'Course sections',
  '/admin/courses/:id/students': 'Course students',
  '/teacher/courses': 'My course sections',
  '/teacher/courses/:id': 'Teaching — Course details',
  '/teacher/classes': 'My homeroom classes',
  '/student/registration': 'Course registration',
  '/student/courses': 'My course sections',
  '/student/grades': 'Grades',
  '/student/attendance': 'Attendance',
};

export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} | Student Management`;
  }, [title]);
}

export default function PageTitle() {
  const { pathname } = useLocation();
  // These pages supply their own title once their content is available.
  const dynamic = ['/news', '/search', '/category/:slug', '/posts/:id']
    .some((path) => matchPath(path, pathname));
  const entry = Object.entries(titles).find(([path]) => matchPath(path, pathname));
  usePageTitle(dynamic ? null : entry?.[1] || 'Page not found');
  return null;
}
