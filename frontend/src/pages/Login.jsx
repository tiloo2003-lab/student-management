import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { errMsg } from '../api';

const DEMO = [
  ['Admin', 'admin1@school.test'],
  ['Giáo viên', 'gv001@school.test'],
  ['Sinh viên', 'sv0001@school.test'],
];

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin1@school.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      nav('/admin');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-hero">
        <h1>Hệ thống<br />quản lý sinh viên</h1>
        <p>Quản lý khoa, lớp, môn học, điểm số và điểm danh trên một nền tảng thống nhất cho quản trị viên, giáo viên và sinh viên.</p>
        <ul>
          <li>Quản trị viên: quản lý toàn bộ dữ liệu đào tạo</li>
          <li>Giáo viên: nhập điểm, điểm danh lớp học phần</li>
          <li>Sinh viên: xem bảng điểm, lịch học, điểm danh</li>
        </ul>
      </section>
      <section className="login-box">
        <div className="login-card">
          <h2>Đăng nhập</h2>
          <p className="sub" style={{ marginBottom: 20 }}>Sử dụng tài khoản được cấp bởi nhà trường</p>
          {error && <div className="alert">{error}</div>}
          <form onSubmit={submit}>
            <label className="field"><span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            <label className="field"><span>Mật khẩu</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 11 }} disabled={busy}>
              {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="demo">
            <div className="sub">Tài khoản demo (mật khẩu: <b>password</b>)</div>
            <div className="row">
              {DEMO.map(([l, em]) => (
                <button key={em} type="button" className="btn sm" onClick={() => { setEmail(em); setPassword('password'); }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
