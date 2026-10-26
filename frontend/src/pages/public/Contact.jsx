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
    if (!(await confirmDialog({ title: 'Send your message?', text: 'Your message will be sent to the school.', confirmText: 'Send message' }))) return;
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
      <div className="crumbs"><Link to="/">Home</Link><span>›</span><b>Contact</b></div>
      <h1 className="page-title">Contact</h1>
      <p className="page-sub">Send a question or feedback to the school and we will reply by email.</p>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={submit}>
          {done && <div className="form-ok">{done}</div>}
          {error && !done && <div className="form-err">{error}</div>}
          <div className="row2">
            <label><span>Full name *</span><input value={form.name} onChange={set('name')} required maxLength={100} />{errors.name && <em>{errors.name[0]}</em>}</label>
            <label><span>Email *</span><input type="email" value={form.email} onChange={set('email')} required />{errors.email && <em>{errors.email[0]}</em>}</label>
          </div>
          <div className="row2">
            <label><span>Phone number</span><input value={form.phone} onChange={set('phone')} maxLength={20} /></label>
            <label><span>Subject *</span><input value={form.subject} onChange={set('subject')} required maxLength={200} /></label>
          </div>
          <label><span>Message *</span><textarea rows={6} value={form.message} onChange={set('message')} required maxLength={3000} />{errors.message && <em>{errors.message[0]}</em>}</label>
          <button className="pub-btn solid" disabled={sending}>{sending ? 'Sending...' : 'Send message'}</button>
        </form>

        <aside className="contact-info">
          <div className="side-box">
            <h3 className="side-title">Contact information</h3>
            <p><b>Address</b><br />123 Le Loi Street, District 1, Ho Chi Minh City</p>
            <p><b>Phone</b><br />0236 123 4567</p>
            <p><b>Email</b><br />contact@school.edu</p>
            <p><b>Opening hours</b><br />Mon – Fri: 7:30 – 17:00</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
