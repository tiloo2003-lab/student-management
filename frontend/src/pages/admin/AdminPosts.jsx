import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, fieldErrors } from '../../api';
import { Loading, Modal, Pager, useToast } from '../../components/ui';
import { confirmDelete, confirmSave } from '../../notify';
import { fmtDate } from '../../utils';

const empty = { title: '', description: '', content: '', category_id: '' };

export default function AdminPosts() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [tick, setTick] = useState(0);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get('/manage/categories', { params: { all: 1 } }).then((r) => setCats(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    api.get('/manage/posts', { params: { page, search: query, per_page: 10 }, signal: ctrl.signal })
      .then((r) => setData(r.data))
      .catch((e) => e.code !== 'ERR_CANCELED' && toast(errMsg(e), 'bad'));
    return () => ctrl.abort();
  }, [page, query, tick, toast]);

  const open = useCallback(async (item) => {
    setErrors({});
    setFile(null);
    setRemoveImage(false);
    if (!item) {
      setForm(empty);
      setPreview(null);
      setModal({ item: null });
      return;
    }
    try {
      const { data: full } = await api.get(`/manage/posts/${item.id}`);
      setForm({ title: full.title, description: full.description, content: full.content || '', category_id: full.category_id || '' });
      setPreview(full.image_url);
      setModal({ item: full });
    } catch (e) { toast(errMsg(e), 'bad'); }
  }, [toast]);

  const pickFile = (f) => {
    setFile(f);
    setRemoveImage(false);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!(await confirmSave(!!modal.item, 'bài viết'))) return;
    setSaving(true);
    setErrors({});
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('content', form.content);
    if (form.category_id) fd.append('category_id', form.category_id);
    if (file) fd.append('image', file);
    if (removeImage) fd.append('remove_image', '1');
    try {
      if (modal.item) await api.post(`/manage/posts/${modal.item.id}`, fd);
      else await api.post('/manage/posts', fd);
      toast('Đã lưu bài viết');
      setModal(null);
      setTick((t) => t + 1);
    } catch (err) {
      setErrors(fieldErrors(err));
      if (!err.response?.data?.errors) toast(errMsg(err), 'bad');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!(await confirmDelete('Bài viết và ảnh bìa sẽ bị xóa.'))) return;
    try {
      await api.delete(`/manage/posts/${p.id}`);
      toast('Đã xóa');
      if (data.data.length === 1 && page > 1) setPage(page - 1); else setTick((t) => t + 1);
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Quản lý bài viết</h1>
          <div className="sub">{data ? `${data.total} bài viết` : ''}</div>
        </div>
        <button className="btn primary" onClick={() => open(null)}>＋ Đăng bài viết</button>
      </div>

      <div className="card">
        <form className="toolbar" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search); }}>
          <input type="search" placeholder="Tìm theo tiêu đề..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn" type="submit">Tìm</button>
        </form>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Danh mục</th><th>Người đăng</th><th>Thích</th><th>Xem</th><th>Ngày đăng</th><th /></tr></thead>
            <tbody>
              {!data ? <tr><td colSpan={6}><Loading /></td></tr>
                : data.data.length === 0 ? <tr><td colSpan={6} className="empty">Chưa có bài viết</td></tr>
                : data.data.map((p) => (
                  <tr key={p.id}>
                    <td>{p.image_url ? <img className="thumb" src={p.image_url} alt="" loading="lazy" /> : '—'}</td>
                    <td style={{ maxWidth: 360, whiteSpace: 'normal' }}><Link to={`/posts/${p.id}`}>{p.title}</Link></td>
                    <td>{p.category?.name || '—'}</td>
                    <td>{p.author?.name}</td>
                    <td><b>{p.likes_count}</b></td>
                    <td>{p.views_count}</td>
                    <td>{fmtDate(p.created_at)}</td>
                    <td className="actions">
                      <button className="btn sm" onClick={() => open(p)}>Sửa</button>
                      <button className="btn sm danger" onClick={() => remove(p)}>Xóa</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pager meta={data} onPage={setPage} />
      </div>

      {modal && (
        <Modal title={modal.item ? 'Sửa bài viết' : 'Đăng bài viết'} onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn primary" form="post-form" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </>}>
          <form id="post-form" onSubmit={save}>
            <label className="field"><span>Tiêu đề *</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              {errors.title && <div className="err">{errors.title[0]}</div>}
            </label>
            <label className="field"><span>Danh mục</span>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">— Không có —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <div className="err">{errors.category_id[0]}</div>}
            </label>
            <label className="field"><span>Mô tả ngắn *</span>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required maxLength={500} />
              {errors.description && <div className="err">{errors.description[0]}</div>}
            </label>
            <label className="field"><span>Nội dung</span>
              <textarea rows={7} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </label>
            <div className="field">
              <span>Ảnh bìa</span>
              {preview && !removeImage && <img className="img-preview" src={preview} alt="" />}
              <input type="file" accept="image/*" onChange={(e) => pickFile(e.target.files[0] || null)} />
              {errors.image && <div className="err">{errors.image[0]}</div>}
              {modal.item?.image && !file && (
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, fontWeight: 400 }}>
                  <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} /> Xóa ảnh hiện tại
                </label>
              )}
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
