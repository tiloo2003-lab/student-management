import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import { Loading } from './components/ui';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import {
  ClassesPage, CoursesPage, DepartmentsPage, SemestersPage, StudentsPage, SubjectsPage, TeachersPage,
} from './pages/admin/AdminPages';
import AdminPosts from './pages/admin/AdminPosts';
import { CategoriesPage, CommentsPage, MessagesPage } from './pages/admin/AdminExtras';
import CourseStudents from './pages/admin/CourseStudents';
import Reports from './pages/admin/Reports';
import Registration from './pages/student/Registration';
import PublicLayout from './pages/public/PublicLayout';
import Home from './pages/public/Home';
import Listing from './pages/public/Listing';
import PostDetail from './pages/public/PostDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import { TeacherClasses, TeacherCourseDetail, TeacherCourses } from './pages/teacher/TeacherPages';
import { StudentAttendance, StudentCourses, StudentGrades } from './pages/student/StudentPages';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Layout />;
}

function RoleOnly({ role }) {
  const { user } = useAuth();
  return user.role === role ? <Outlet /> : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="news" element={<Listing />} />
        <Route path="category/:slug" element={<Listing />} />
        <Route path="search" element={<Listing />} />
        <Route path="posts" element={<Navigate to="/news" replace />} />
        <Route path="posts/:id" element={<PostDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="login" element={<Navigate to="/admin/login" replace />} />
      <Route path="admin/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />

        <Route path="admin">
          <Route index element={<Dashboard />} />
          <Route element={<RoleOnly role="admin" />}>
            <Route path="posts" element={<AdminPosts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="comments" element={<CommentsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="semesters" element={<SemestersPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id/students" element={<CourseStudents />} />
          </Route>
        </Route>

        <Route path="teacher" element={<RoleOnly role="teacher" />}>
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="courses/:id" element={<TeacherCourseDetail />} />
          <Route path="classes" element={<TeacherClasses />} />
        </Route>

        <Route path="student" element={<RoleOnly role="student" />}>
          <Route path="registration" element={<Registration />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="attendance" element={<StudentAttendance />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
