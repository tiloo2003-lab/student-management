import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, fieldErrors } from '../../api';
import { confirmDialog } from '../../notify';

const empty = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!(await confirmDialog({ title: 'Gửi liên hệ?', text: 'Nội dung sẽ được gửi tới nhà trường.', confirmText: 'Gửi liên hệ' }))) return;
    setSending(true);
    setErrors({});
    setError('');
    try {
      const { data } = await api.post('/contact', form);
      setDone(data.message);
      setForm(empty);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errMsg(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="pub-main">
      <div className="crumbs"><Link to="/">Trang chủ</Link><span>›</span><b>Liên hệ</b></div>
      <h1 className="page-title">Liên hệ</h1>
      <p className="page-sub">Gửi câu hỏi hoặc góp ý cho nhà trường, chúng tôi sẽ phản hồi qua email.</p>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={submit}>
          {done && <div className="form-ok">{done}</div>}
          {error && !done && <div className="form-err">{error}</div>}
          <div className="row2">
            <label><span>Họ tên *</span><input value={form.name} onChange={set('name')} required maxLength={100} />{errors.name && <em>{errors.name[0]}</em>}</label>
            <label><span>Email *</span><input type="email" value={form.email} onChange={set('email')} required />{errors.email && <em>{errors.email[0]}</em>}</label>
          </div>
          <div className="row2">
            <label><span>Số điện thoại</span><input value={form.phone} onChange={set('phone')} maxLength={20} /></label>
            <label><span>Chủ đề *</span><input value={form.subject} onChange={set('subject')} required maxLength={200} /></label>
          </div>
          <label><span>Nội dung *</span><textarea rows={6} value={form.message} onChange={set('message')} required maxLength={3000} />{errors.message && <em>{errors.message[0]}</em>}</label>
          <button className="pub-btn solid" disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi liên hệ'}</button>
        </form>

        <aside className="contact-info">
          <div className="side-box">
            <h3 className="side-title">Thông tin liên hệ</h3>
            <p><b>Địa chỉ</b><br />123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
            <p><b>Điện thoại</b><br />0236 123 4567</p>
            <p><b>Email</b><br />lienhe@truong.edu.vn</p>
            <p><b>Giờ làm việc</b><br />Thứ 2 – Thứ 6: 7:30 – 17:00</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
