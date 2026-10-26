export const get = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = String(d).slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
};

export const roleLabel = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' };
export const genderLabel = { male: 'Male', female: 'Female', other: 'Other' };
export const targetLabel = { all: 'Everyone', teacher: 'Teachers', student: 'Students' };
export const attendanceLabel = { present: 'Present', late: 'Late', absent: 'Absent', excused: 'Excused' };

export const dayLabel = (d) => (d == null ? '—' : ({ 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat', 8: 'Sun' })[d]);
export const scheduleLabel = (c) =>
  c.day_of_week ? `${dayLabel(c.day_of_week)}, periods ${c.start_period}-${c.end_period}` : '—';

export const letterColor = (l) =>
  ({ A: 'green', B: 'blue', C: 'amber', D: 'orange', F: 'red' })[l] || 'gray';
