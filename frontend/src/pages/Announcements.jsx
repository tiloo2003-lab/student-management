import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, fieldErrors } from '../api';
import { useAuth } from '../auth';
import { Badge, Loading, Modal, Pager, useToast } from '../components/ui';
import { confirmDelete, confirmSave } from '../notify';
import { fmtDate, targetLabel } from '../utils';

export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === 'admin';
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  const load = useCallback(() => {
    api.get('/announcements', { params: { page, per_page: 8 } }).then((r) => setData(r.data));
  }, [page]);
  useEffect(load, [load]);

  const open = (item) => {
    setForm(item ? { title: item.title, content: item.content, target_role: item.target_role } : { title: '', content: '', target_role: 'all' });
    setErrors({});
    setModal({ item });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!(await confirmSave(!!modal.item, 'announcement'))) return;
    try {
      if (modal.item) await api.put(`/announcements/${modal.item.id}`, form);
      else await api.post('/announcements', form);
      toast('Announcement saved');
      setModal(null);
      load();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(errMsg(err), 'bad');
    }
  };

  const remove = async (a) => {
    if (!(await confirmDelete('This announcement will be deleted.'))) return;
    await api.delete(`/announcements/${a.id}`);
    toast('Deleted successfully');
    load();
  };

  return (
    <>
      <div className="page-head">
        <h1>Announcements</h1>
        {isAdmin && <button className="btn primary" onClick={() => open(null)}>＋ New announcement</button>}
      </div>
      <div className="card">
        {!data ? <Loading /> : data.data.length === 0 ? <div className="empty">No announcements yet</div> : data.data.map((a) => (
          <div className="ann" key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <h4>{a.title}</h4>
              {isAdmin && (
                <div style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn sm" onClick={() => open(a)}>Edit</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(a)}>Delete</button>
                </div>
              )}
            </div>
            <div className="sub">{fmtDate(a.created_at)} · {a.author?.name} · <Badge color="purple">{targetLabel[a.target_role]}</Badge></div>
            <p>{a.content}</p>
          </div>
        ))}
        <Pager meta={data} onPage={setPage} />
      </div>

      {modal && (
        <Modal title={modal.item ? 'Edit announcement' : 'New announcement'} onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn primary" form="ann-form">Save</button>
          </>}>
          <form id="ann-form" onSubmit={save}>
            <label className="field"><span>Title *</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              {errors.title && <div className="err">{errors.title[0]}</div>}
            </label>
            <label className="field"><span>Audience</span>
              <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}>
                {Object.entries(targetLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="field"><span>Content *</span>
              <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
              {errors.content && <div className="err">{errors.content[0]}</div>}
            </label>
          </form>
        </Modal>
      )}
    </>
  );
}
