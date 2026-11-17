import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { loginUrlFor } from './loginRedirect';
import { useAuth } from './auth';
import Layout from './components/Layout';
import { Loading } from './components/ui';
import Login from './pages/Login';
import PageTitle from './components/PageTitle';
import LoadError from './components/LoadError';
import NotFound from './pages/NotFound';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Profile = lazy(() => import('./pages/Profile'));
import {
  ClassesPage, CoursesPage, DepartmentsPage, SemestersPage, StudentsPage, SubjectsPage, TeachersPage,
} from './pages/admin/AdminPages';
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
import { CategoriesPage, CommentsPage, MessagesPage } from './pages/admin/AdminExtras';
const CourseStudents = lazy(() => import('./pages/admin/CourseStudents'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Registration = lazy(() => import('./pages/student/Registration'));
import PublicLayout from './pages/public/PublicLayout';
const Home = lazy(() => import('./pages/public/Home'));
const Listing = lazy(() => import('./pages/public/Listing'));
const PostDetail = lazy(() => import('./pages/public/PostDetail'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
import { TeacherClasses, TeacherCourseDetail, TeacherCourses } from './pages/teacher/TeacherPages';
import { StudentAttendance, StudentCourses, StudentGrades } from './pages/student/StudentPages';

function Protected({ children }) {
  const { user, loading, error, retrySession, logoutRequested } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (error) return <LoadError message={error} onRetry={retrySession} />;
  if (!user) return <Navigate to={loginUrlFor(location, logoutRequested)} replace />;
  return children || <Layout />;
}

function RoleOnly({ role }) {
  const { user } = useAuth();
  return user.role === role ? <Outlet /> : <Navigate to="/workspace" replace />;
}

export default function App() {
  return (
    <>
    <PageTitle />
    <Suspense fallback={<Loading />}><Routes>
      <Route element={<Protected><PublicLayout /></Protected>}>
        <Route index element={<Home />} />
        <Route path="news" element={<Listing />} />
        <Route path="category/:slug" element={<Listing />} />
        <Route path="search" element={<Listing />} />
        <Route path="posts" element={<Navigate to="/news" replace />} />
        <Route path="posts/:id" element={<PostDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="admin/login" element={<Navigate to="/login" replace />} />
      <Route element={<Protected />}>
        <Route path="workspace" element={<Dashboard />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />

        <Route path="admin">
          <Route index element={<Navigate to="/workspace" replace />} />
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
    </Routes></Suspense>
    </>
  );
}
