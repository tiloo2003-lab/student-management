export const get = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = String(d).slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
};

export const roleLabel = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Sinh viên' };
export const genderLabel = { male: 'Nam', female: 'Nữ', other: 'Khác' };
export const targetLabel = { all: 'Tất cả', teacher: 'Giáo viên', student: 'Sinh viên' };
export const attendanceLabel = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng', excused: 'Có phép' };

export const dayLabel = (d) => (d == null ? '—' : d === 8 ? 'Chủ nhật' : `Thứ ${d}`);
export const scheduleLabel = (c) =>
  c.day_of_week ? `${dayLabel(c.day_of_week)}, tiết ${c.start_period}-${c.end_period}` : '—';

export const letterColor = (l) =>
  ({ A: 'green', B: 'blue', C: 'amber', D: 'orange', F: 'red' })[l] || 'gray';
