import { useState } from 'react';
import api, { errMsg, fieldErrors } from '../api';
import { useAuth } from '../auth';
import { useToast } from '../components/ui';
import { roleLabel } from '../utils';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [info, setInfo] = useState({ name: user.name, phone: user.phone || '' });
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwErr, setPwErr] = useState({});

  const saveInfo = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/profile', info);
      setUser(data);
      toast('Đã cập nhật hồ sơ');
    } catch (err) { toast(errMsg(err), 'bad'); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    setPwErr({});
    try {
      await api.put('/password', pw);
      setPw({ current_password: '', password: '', password_confirmation: '' });
      toast('Đổi mật khẩu thành công');
    } catch (err) { setPwErr(fieldErrors(err)); toast(errMsg(err), 'bad'); }
  };

  return (
    <>
      <div className="page-head"><h1>Tài khoản của tôi</h1></div>
      <div className="grid two">
        <form className="card" onSubmit={saveInfo}>
          <h3>Thông tin cá nhân</h3>
          <label className="field"><span>Email</span><input value={user.email} disabled /></label>
          <label className="field"><span>Vai trò</span><input value={roleLabel[user.role]} disabled /></label>
          {user.student && <label className="field"><span>Mã sinh viên / Lớp</span><input disabled value={`${user.student.student_code} — ${user.student.school_class?.name || ''}`} /></label>}
          {user.teacher && <label className="field"><span>Mã GV / Khoa</span><input disabled value={`${user.teacher.teacher_code} — ${user.teacher.department?.name || ''}`} /></label>}
          <label className="field"><span>Họ tên</span><input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} required /></label>
          <label className="field"><span>Số điện thoại</span><input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} /></label>
          <button className="btn primary">Lưu thay đổi</button>
        </form>

        <form className="card" onSubmit={savePw}>
          <h3>Đổi mật khẩu</h3>
          <label className="field"><span>Mật khẩu hiện tại</span>
            <input type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
            {pwErr.current_password && <div className="err">{pwErr.current_password[0]}</div>}
          </label>
          <label className="field"><span>Mật khẩu mới</span>
            <input type="password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} required minLength={8} placeholder="Tối thiểu 8 ký tự, gồm chữ và số" />
            {pwErr.password && <div className="err">{pwErr.password[0]}</div>}
          </label>
          <label className="field"><span>Nhập lại mật khẩu mới</span>
            <input type="password" value={pw.password_confirmation} onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })} required />
          </label>
          <button className="btn primary">Đổi mật khẩu</button>
        </form>
      </div>
    </>
  );
}
