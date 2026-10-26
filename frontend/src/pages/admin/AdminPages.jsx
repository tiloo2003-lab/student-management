import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import CrudPage from '../../components/CrudPage';
import { Badge } from '../../components/ui';
import { exportPdf } from '../../download';
import { notify, selectDialog } from '../../notify';
import { fmtDate, genderLabel, scheduleLabel } from '../../utils';

const dept = { endpoint: 'departments', label: (d) => d.name };
const teacher = { endpoint: 'teachers', label: (t) => `${t.teacher_code} - ${t.name}` };
const klass = { endpoint: 'classes', label: (c) => `${c.code} - ${c.name}` };
const subject = { endpoint: 'subjects', label: (s) => `${s.code} - ${s.name}` };
const semester = { endpoint: 'semesters', label: (s) => s.name };
const classYear = { endpoint: 'classes', value: (c) => c.academic_year, label: (c) => c.academic_year, unique: true };
const semesterYear = { endpoint: 'semesters', value: (s) => s.academic_year, label: (s) => s.academic_year, unique: true };

const statusBadge = (r) => <Badge color={r.status === 'active' ? 'green' : 'red'}>{r.status === 'active' ? 'Active' : 'Locked'}</Badge>;
const statusOptions = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Locked' }];
const genderOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }];
const degreeOptions = ['Bachelor', 'Master', 'PhD', 'Associate Professor', 'Professor'].map((v) => ({ value: v, label: v }));

function TranscriptButton({ student }) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const { data } = await api.get('/semesters', { params: { all: 1 } });
      const options = new Map([['', 'Entire study history'], ...data.data.map((s) => [String(s.id), s.name])]);
      const chosen = await selectDialog({ title: `Transcript for ${student.name}`, text: 'Choose the semester to export', options });
      if (chosen === null) return;
      await exportPdf(`/export/students/${student.id}`, { semester_id: chosen }, `transcript-${student.student_code}.pdf`);
    } catch {
      notify('Could not load the semester list', 'bad');
    } finally {
      setBusy(false);
    }
  };

  return <button className="btn sm" disabled={busy} onClick={run}>PDF</button>;
}

export const DepartmentsPage = () => (
  <CrudPage title="Departments" entity="department" endpoint="departments"
    columns={[
      { key: 'code', label: 'Department code' }, { key: 'name', label: 'Department name' }, { key: 'description', label: 'Description' },
    ]}
    fields={[
      { name: 'code', label: 'Department code', required: true },
      { name: 'name', label: 'Department name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ]} />
);

export const SubjectsPage = () => (
  <CrudPage title="Subjects" entity="subject" endpoint="subjects"
    filters={[{ name: 'department_id', label: 'Department', optionsFrom: dept }]}
    columns={[
      { key: 'code', label: 'Subject code' }, { key: 'name', label: 'Subject name' },
      { key: 'credits', label: 'Credits' }, { key: 'department.name', label: 'Department' },
    ]}
    fields={[
      { name: 'code', label: 'Subject code', required: true },
      { name: 'name', label: 'Subject name', required: true },
      { name: 'credits', label: 'Credits', type: 'number', required: true },
      { name: 'department_id', label: 'Department', optionsFrom: dept, required: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ]}
    defaults={{ credits: 3 }} />
);

export const SemestersPage = () => (
  <CrudPage title="Semesters" entity="semester" endpoint="semesters"
    filters={[{ name: 'academic_year', label: 'Academic year', optionsFrom: semesterYear }]}
    columns={[
      { key: 'name', label: 'Semester name' }, { key: 'academic_year', label: 'Academic year' },
      { key: 'start_date', label: 'Start date', render: (r) => fmtDate(r.start_date) },
      { key: 'end_date', label: 'End date', render: (r) => fmtDate(r.end_date) },
      { key: 'is_current', label: 'Current', render: (r) => (r.is_current ? <Badge color="green">In progress</Badge> : '') },
    ]}
    fields={[
      { name: 'name', label: 'Semester name', required: true, placeholder: 'Semester 1 2026-2027' },
      { name: 'academic_year', label: 'Academic year', required: true, placeholder: '2026-2027' },
      { name: 'term', label: 'Term', type: 'number', required: true },
      { name: 'is_current', label: 'Is the current semester', type: 'checkbox' },
      { name: 'start_date', label: 'Start date', type: 'date', required: true },
      { name: 'end_date', label: 'End date', type: 'date', required: true },
    ]} />
);

export const ClassesPage = () => (
  <CrudPage title="Classes" entity="class" endpoint="classes"
    filters={[
      { name: 'department_id', label: 'Department', optionsFrom: dept },
      { name: 'academic_year', label: 'Cohort', optionsFrom: classYear },
    ]}
    columns={[
      { key: 'code', label: 'Class code' }, { key: 'name', label: 'Class name' },
      { key: 'department.name', label: 'Department' },
      { key: 'homeroom_teacher.user.name', label: 'Homeroom teacher' },
      { key: 'academic_year', label: 'Cohort' },
      { key: 'students_count', label: 'Students' },
    ]}
    fields={[
      { name: 'code', label: 'Class code', required: true },
      { name: 'name', label: 'Class name', required: true },
      { name: 'department_id', label: 'Department', optionsFrom: dept, required: true },
      { name: 'homeroom_teacher_id', label: 'Homeroom teacher', optionsFrom: teacher },
      { name: 'academic_year', label: 'Cohort', placeholder: '2022-2026' },
    ]} />
);

export const TeachersPage = () => (
  <CrudPage title="Teachers" entity="teacher" endpoint="teachers"
    filters={[
      { name: 'department_id', label: 'Department', optionsFrom: dept },
      { name: 'degree', label: 'Degree', options: degreeOptions },
    ]}
    columns={[
      { key: 'teacher_code', label: 'Teacher ID' }, { key: 'name', label: 'Full name' }, { key: 'email', label: 'Email' },
      { key: 'department.name', label: 'Department' }, { key: 'degree', label: 'Degree' },
      { key: 'status', label: 'Status', render: statusBadge },
    ]}
    fields={[
      { name: 'name', label: 'Full name', required: true },
      { name: 'teacher_code', label: 'Teacher ID', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone number' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Default: password' },
      { name: 'status', label: 'Status', options: statusOptions },
      { name: 'department_id', label: 'Department', optionsFrom: dept, required: true },
      { name: 'degree', label: 'Degree', options: degreeOptions },
      { name: 'specialization', label: 'Specialization', full: true },
      { name: 'hired_date', label: 'Hire date', type: 'date' },
    ]}
    defaults={{ status: 'active' }} />
);

export const StudentsPage = () => (
  <CrudPage title="Students" entity="student" endpoint="students"
    filters={[
      { name: 'academic_year', label: 'Cohort', optionsFrom: classYear },
      { name: 'department_id', label: 'Department', optionsFrom: dept },
      { name: 'class_id', label: 'Class', optionsFrom: klass },
      { name: 'gender', label: 'Gender', options: genderOptions },
      { name: 'status', label: 'Status', options: statusOptions },
    ]}
    columns={[
      { key: 'student_code', label: 'Student ID' }, { key: 'name', label: 'Full name' }, { key: 'email', label: 'Email' },
      { key: 'school_class.code', label: 'Class' },
      { key: 'gender', label: 'Gender', render: (r) => genderLabel[r.gender] },
      { key: 'date_of_birth', label: 'Date of birth', render: (r) => fmtDate(r.date_of_birth) },
      { key: 'status', label: 'Status', render: statusBadge },
    ]}
    fields={[
      { name: 'name', label: 'Full name', required: true },
      { name: 'student_code', label: 'Student ID', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone number' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Default: password' },
      { name: 'status', label: 'Status', options: statusOptions },
      { name: 'class_id', label: 'Class', optionsFrom: klass, required: true },
      { name: 'gender', label: 'Gender', required: true, options: genderOptions },
      { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
      { name: 'address', label: 'Address', full: true },
    ]}
    defaults={{ status: 'active', gender: 'male' }}
    rowActions={(row) => <TranscriptButton student={row} />} />
);

export const CoursesPage = () => (
  <CrudPage title="Course sections" entity="course section" endpoint="courses"
    filters={[
      { name: 'academic_year', label: 'Academic year', optionsFrom: semesterYear },
      { name: 'semester_id', label: 'Semester', optionsFrom: semester },
      { name: 'department_id', label: 'Department', optionsFrom: dept },
      { name: 'teacher_id', label: 'Teacher', optionsFrom: teacher },
    ]}
    columns={[
      { key: 'code', label: 'Section code' }, { key: 'subject.name', label: 'Subject' },
      { key: 'teacher.user.name', label: 'Teacher' }, { key: 'semester.name', label: 'Semester' },
      { key: 'schedule', label: 'Schedule', render: (r) => `${scheduleLabel(r)}${r.room ? ' · ' + r.room : ''}` },
      { key: 'enrollments_count', label: 'Enrollment', render: (r) => `${r.enrollments_count}/${r.max_students}` },
    ]}
    fields={[
      { name: 'code', label: 'Section code', required: true },
      { name: 'subject_id', label: 'Subject', optionsFrom: subject, required: true },
      { name: 'teacher_id', label: 'Teacher', optionsFrom: teacher, required: true },
      { name: 'semester_id', label: 'Semester', optionsFrom: semester, required: true },
      { name: 'room', label: 'Room' },
      { name: 'day_of_week', label: 'Day', options: [2, 3, 4, 5, 6, 7, 8].map((d) => ({ value: d, label: ['', '', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][d] })) },
      { name: 'start_period', label: 'Start period', type: 'number' },
      { name: 'end_period', label: 'End period', type: 'number' },
      { name: 'max_students', label: 'Max students', type: 'number', required: true },
    ]}
    defaults={{ max_students: 50 }}
    rowActions={(row) => <Link className="btn sm" to={`/admin/courses/${row.id}/students`}>Students</Link>} />
);
