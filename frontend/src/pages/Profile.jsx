import { useState } from 'react';
import api, { errMsg, fieldErrors } from '../api';
import { useAuth } from '../auth';
import { useToast } from '../components/ui';
import { confirmDialog } from '../notify';
import { roleLabel } from '../utils';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [info, setInfo] = useState({ name: user.name, phone: user.phone || '' });
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwErr, setPwErr] = useState({});

  const saveInfo = async (e) => {
    e.preventDefault();
    if (!(await confirmDialog({ title: 'Update profile?', text: 'Your personal information will be changed.', confirmText: 'Update' }))) return;
    try {
      const { data } = await api.put('/profile', info);
      setUser(data);
      toast('Profile updated');
    } catch (err) { toast(errMsg(err), 'bad'); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    if (!(await confirmDialog({ title: 'Change password?', text: 'You will use the new password the next time you sign in.', confirmText: 'Change password' }))) return;
    setPwErr({});
    try {
      await api.put('/password', pw);
      setPw({ current_password: '', password: '', password_confirmation: '' });
      toast('Password changed successfully');
    } catch (err) { setPwErr(fieldErrors(err)); toast(errMsg(err), 'bad'); }
  };

  return (
    <>
      <div className="page-head"><h1>My account</h1></div>
      <div className="grid two">
        <form className="card" onSubmit={saveInfo}>
          <h3>Personal information</h3>
          <label className="field"><span>Email</span><input value={user.email} disabled /></label>
          <label className="field"><span>Role</span><input value={roleLabel[user.role]} disabled /></label>
          {user.student && <label className="field"><span>Student ID / Class</span><input disabled value={`${user.student.student_code} — ${user.student.school_class?.name || ''}`} /></label>}
          {user.teacher && <label className="field"><span>Teacher ID / Department</span><input disabled value={`${user.teacher.teacher_code} — ${user.teacher.department?.name || ''}`} /></label>}
          <label className="field"><span>Full name</span><input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} required /></label>
          <label className="field"><span>Phone number</span><input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} /></label>
          <button className="btn primary">Save changes</button>
        </form>

        <form className="card" onSubmit={savePw}>
          <h3>Change password</h3>
          <label className="field"><span>Current password</span>
            <input type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
            {pwErr.current_password && <div className="err">{pwErr.current_password[0]}</div>}
          </label>
          <label className="field"><span>New password</span>
            <input type="password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} required minLength={8} placeholder="At least 8 characters, letters and numbers" />
            {pwErr.password && <div className="err">{pwErr.password[0]}</div>}
          </label>
          <label className="field"><span>Confirm new password</span>
            <input type="password" value={pw.password_confirmation} onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })} required />
          </label>
          <button className="btn primary">Change password</button>
        </form>
      </div>
    </>
  );
}
