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

const statusBadge = (r) => <Badge color={r.status === 'active' ? 'green' : 'red'}>{r.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</Badge>;
const statusOptions = [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Đã khóa' }];
const genderOptions = [{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }, { value: 'other', label: 'Khác' }];
const degreeOptions = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Phó giáo sư', 'Giáo sư'].map((v) => ({ value: v, label: v }));

function TranscriptButton({ student }) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const { data } = await api.get('/semesters', { params: { all: 1 } });
      const options = new Map([['', 'Toàn bộ quá trình học tập'], ...data.data.map((s) => [String(s.id), s.name])]);
      const chosen = await selectDialog({ title: `Bảng điểm ${student.name}`, text: 'Chọn học kỳ cần xuất', options });
      if (chosen === null) return;
      await exportPdf(`/export/students/${student.id}`, { semester_id: chosen }, `ket-qua-${student.student_code}.pdf`);
    } catch {
      notify('Không tải được danh sách học kỳ', 'bad');
    } finally {
      setBusy(false);
    }
  };

  return <button className="btn sm" disabled={busy} onClick={run}>PDF</button>;
}

export const DepartmentsPage = () => (
  <CrudPage title="Khoa" endpoint="departments"
    columns={[
      { key: 'code', label: 'Mã khoa' }, { key: 'name', label: 'Tên khoa' }, { key: 'description', label: 'Mô tả' },
    ]}
    fields={[
      { name: 'code', label: 'Mã khoa', required: true },
      { name: 'name', label: 'Tên khoa', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', full: true },
    ]} />
);

export const SubjectsPage = () => (
  <CrudPage title="Môn học" endpoint="subjects"
    filters={[{ name: 'department_id', label: 'Khoa', optionsFrom: dept }]}
    columns={[
      { key: 'code', label: 'Mã môn' }, { key: 'name', label: 'Tên môn học' },
      { key: 'credits', label: 'Tín chỉ' }, { key: 'department.name', label: 'Khoa' },
    ]}
    fields={[
      { name: 'code', label: 'Mã môn', required: true },
      { name: 'name', label: 'Tên môn học', required: true },
      { name: 'credits', label: 'Số tín chỉ', type: 'number', required: true },
      { name: 'department_id', label: 'Khoa', optionsFrom: dept, required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', full: true },
    ]}
    defaults={{ credits: 3 }} />
);

export const SemestersPage = () => (
  <CrudPage title="Học kỳ" endpoint="semesters"
    filters={[{ name: 'academic_year', label: 'Năm học', optionsFrom: semesterYear }]}
    columns={[
      { key: 'name', label: 'Tên học kỳ' }, { key: 'academic_year', label: 'Năm học' },
      { key: 'start_date', label: 'Bắt đầu', render: (r) => fmtDate(r.start_date) },
      { key: 'end_date', label: 'Kết thúc', render: (r) => fmtDate(r.end_date) },
      { key: 'is_current', label: 'Hiện tại', render: (r) => (r.is_current ? <Badge color="green">Đang diễn ra</Badge> : '') },
    ]}
    fields={[
      { name: 'name', label: 'Tên học kỳ', required: true, placeholder: 'Học kỳ 1 2026-2027' },
      { name: 'academic_year', label: 'Năm học', required: true, placeholder: '2026-2027' },
      { name: 'term', label: 'Kỳ', type: 'number', required: true },
      { name: 'is_current', label: 'Là học kỳ hiện tại', type: 'checkbox' },
      { name: 'start_date', label: 'Ngày bắt đầu', type: 'date', required: true },
      { name: 'end_date', label: 'Ngày kết thúc', type: 'date', required: true },
    ]} />
);

export const ClassesPage = () => (
  <CrudPage title="Lớp" endpoint="classes"
    filters={[
      { name: 'department_id', label: 'Khoa', optionsFrom: dept },
      { name: 'academic_year', label: 'Niên khóa', optionsFrom: classYear },
    ]}
    columns={[
      { key: 'code', label: 'Mã lớp' }, { key: 'name', label: 'Tên lớp' },
      { key: 'department.name', label: 'Khoa' },
      { key: 'homeroom_teacher.user.name', label: 'GV chủ nhiệm' },
      { key: 'academic_year', label: 'Niên khóa' },
      { key: 'students_count', label: 'Sĩ số' },
    ]}
    fields={[
      { name: 'code', label: 'Mã lớp', required: true },
      { name: 'name', label: 'Tên lớp', required: true },
      { name: 'department_id', label: 'Khoa', optionsFrom: dept, required: true },
      { name: 'homeroom_teacher_id', label: 'GV chủ nhiệm', optionsFrom: teacher },
      { name: 'academic_year', label: 'Niên khóa', placeholder: '2022-2026' },
    ]} />
);

export const TeachersPage = () => (
  <CrudPage title="Giáo viên" endpoint="teachers"
    filters={[
      { name: 'department_id', label: 'Khoa', optionsFrom: dept },
      { name: 'degree', label: 'Học vị', options: degreeOptions },
    ]}
    columns={[
      { key: 'teacher_code', label: 'Mã GV' }, { key: 'name', label: 'Họ tên' }, { key: 'email', label: 'Email' },
      { key: 'department.name', label: 'Khoa' }, { key: 'degree', label: 'Học vị' },
      { key: 'status', label: 'Trạng thái', render: statusBadge },
    ]}
    fields={[
      { name: 'name', label: 'Họ tên', required: true },
      { name: 'teacher_code', label: 'Mã giáo viên', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Số điện thoại' },
      { name: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Mặc định: password' },
      { name: 'status', label: 'Trạng thái', options: statusOptions },
      { name: 'department_id', label: 'Khoa', optionsFrom: dept, required: true },
      { name: 'degree', label: 'Học vị', options: degreeOptions },
      { name: 'specialization', label: 'Chuyên ngành', full: true },
      { name: 'hired_date', label: 'Ngày vào làm', type: 'date' },
    ]}
    defaults={{ status: 'active' }} />
);

export const StudentsPage = () => (
  <CrudPage title="Sinh viên" endpoint="students"
    filters={[
      { name: 'academic_year', label: 'Niên khóa', optionsFrom: classYear },
      { name: 'department_id', label: 'Khoa', optionsFrom: dept },
      { name: 'class_id', label: 'Lớp', optionsFrom: klass },
      { name: 'gender', label: 'Giới tính', options: genderOptions },
      { name: 'status', label: 'Trạng thái', options: statusOptions },
    ]}
    columns={[
      { key: 'student_code', label: 'MSSV' }, { key: 'name', label: 'Họ tên' }, { key: 'email', label: 'Email' },
      { key: 'school_class.code', label: 'Lớp' },
      { key: 'gender', label: 'Giới tính', render: (r) => genderLabel[r.gender] },
      { key: 'date_of_birth', label: 'Ngày sinh', render: (r) => fmtDate(r.date_of_birth) },
      { key: 'status', label: 'Trạng thái', render: statusBadge },
    ]}
    fields={[
      { name: 'name', label: 'Họ tên', required: true },
      { name: 'student_code', label: 'Mã sinh viên', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Số điện thoại' },
      { name: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Mặc định: password' },
      { name: 'status', label: 'Trạng thái', options: statusOptions },
      { name: 'class_id', label: 'Lớp', optionsFrom: klass, required: true },
      { name: 'gender', label: 'Giới tính', required: true, options: genderOptions },
      { name: 'date_of_birth', label: 'Ngày sinh', type: 'date' },
      { name: 'address', label: 'Địa chỉ', full: true },
    ]}
    defaults={{ status: 'active', gender: 'male' }}
    rowActions={(row) => <TranscriptButton student={row} />} />
);

export const CoursesPage = () => (
  <CrudPage title="Lớp học phần" endpoint="courses"
    filters={[
      { name: 'academic_year', label: 'Năm học', optionsFrom: semesterYear },
      { name: 'semester_id', label: 'Học kỳ', optionsFrom: semester },
      { name: 'department_id', label: 'Khoa', optionsFrom: dept },
      { name: 'teacher_id', label: 'Giáo viên', optionsFrom: teacher },
    ]}
    columns={[
      { key: 'code', label: 'Mã LHP' }, { key: 'subject.name', label: 'Môn học' },
      { key: 'teacher.user.name', label: 'Giáo viên' }, { key: 'semester.name', label: 'Học kỳ' },
      { key: 'schedule', label: 'Lịch học', render: (r) => `${scheduleLabel(r)}${r.room ? ' · ' + r.room : ''}` },
      { key: 'enrollments_count', label: 'Sĩ số', render: (r) => `${r.enrollments_count}/${r.max_students}` },
    ]}
    fields={[
      { name: 'code', label: 'Mã lớp học phần', required: true },
      { name: 'subject_id', label: 'Môn học', optionsFrom: subject, required: true },
      { name: 'teacher_id', label: 'Giáo viên', optionsFrom: teacher, required: true },
      { name: 'semester_id', label: 'Học kỳ', optionsFrom: semester, required: true },
      { name: 'room', label: 'Phòng học' },
      { name: 'day_of_week', label: 'Thứ', options: [2, 3, 4, 5, 6, 7, 8].map((d) => ({ value: d, label: d === 8 ? 'Chủ nhật' : `Thứ ${d}` })) },
      { name: 'start_period', label: 'Tiết bắt đầu', type: 'number' },
      { name: 'end_period', label: 'Tiết kết thúc', type: 'number' },
      { name: 'max_students', label: 'Sĩ số tối đa', type: 'number', required: true },
    ]}
    defaults={{ max_students: 50 }}
    rowActions={(row) => <Link className="btn sm" to={`/admin/courses/${row.id}/students`}>Sinh viên</Link>} />
);
