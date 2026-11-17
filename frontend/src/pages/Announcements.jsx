import LoadError from '../components/LoadError';
import { useUnsavedChanges } from '../UnsavedChanges';
import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, fieldErrors } from '../api';
import { useAuth } from '../auth';
import { Badge, Loading, Modal, Pager, useToast } from '../components/ui';
import { confirmDelete, confirmDialog } from '../notify';
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
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [originalForm, setOriginalForm] = useState('');
  const dirty = !!modal && JSON.stringify(form) !== originalForm;
  useUnsavedChanges(dirty);
  const closeForm = async () => { if (!saving && (!dirty || await confirmDialog({ title: 'Discard changes?', text: 'Your notification has not been saved.', confirmText: 'Discard', danger: true }))) setModal(null); };

  const load = useCallback(() => {
    setLoadError('');
    api.get('/announcements', { params: { page, per_page: 8 } }).then((r) => setData(r.data)).catch((e) => setLoadError(errMsg(e)));
  }, [page]);
  useEffect(load, [load]);

  const open = (item) => {
    setOriginalForm(JSON.stringify(item ? { title: item.title, content: item.content, target_role: item.target_role } : { title: '', content: '', target_role: 'all' }));
    setForm(item ? { title: item.title, content: item.content, target_role: item.target_role } : { title: '', content: '', target_role: 'all' });
    setErrors({});
    setModal({ item });
  };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (modal.item) await api.put(`/announcements/${modal.item.id}`, form);
      else await api.post('/announcements', form);
      toast('Announcement saved');
      setModal(null);
      load();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(errMsg(err), 'bad');
    } finally { setSaving(false); }
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
        <h1>Your notifications</h1>
        {isAdmin && <button className="btn primary" onClick={() => open(null)}>＋ New notification</button>}
      </div>
      <div className="card">
        {loadError ? <LoadError message={loadError} onRetry={load} /> : !data ? <Loading /> : data.data.length === 0 ? <div className="empty">No notifications yet</div> : data.data.map((a) => (
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
        <Modal title={modal.item ? 'Edit notification' : 'New notification'} onClose={closeForm}
          footer={<>
            <button className="btn" onClick={closeForm}>Cancel</button>
            <button className="btn primary" disabled={saving} form="ann-form">{saving ? 'Saving...' : 'Save'}</button>
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
