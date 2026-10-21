import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, fieldErrors } from '../api';
import { get } from '../utils';
import { Modal, Pager, useToast, Loading } from './ui';

const optionCache = new Map();

const loadOptions = (endpoint) => {
  if (!optionCache.has(endpoint)) {
    const p = api.get(`/${endpoint}`, { params: { all: 1 } })
      .then((r) => r.data.data)
      .catch((e) => { optionCache.delete(endpoint); throw e; });
    optionCache.set(endpoint, p);
  }
  return optionCache.get(endpoint);
};

export default function CrudPage({ title, endpoint, columns, fields, filters = [], rowActions, defaults = {}, perPage = 10 }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filterVals, setFilterVals] = useState({});
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({});
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let alive = true;
    const eps = [...new Set([...fields, ...filters].filter((f) => f.optionsFrom).map((f) => f.optionsFrom.endpoint))];
    eps.forEach((ep) =>
      loadOptions(ep).then((list) => alive && setOptions((o) => ({ ...o, [ep]: list }))).catch(() => {})
    );
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    api.get(`/${endpoint}`, { params: { page, search: query, per_page: perPage, ...filterVals }, signal: ctrl.signal })
      .then((r) => { setRows(r.data.data); setMeta(r.data); setLoading(false); })
      .catch((e) => {
        if (e.code === 'ERR_CANCELED') return;
        toast(errMsg(e), 'bad');
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [endpoint, page, query, filterVals, perPage, toast, reloadKey]);

  const optsFor = (f) => {
    if (f.options) return f.options;
    const list = options[f.optionsFrom.endpoint] || [];
    return list.map((r) => ({ value: r.id, label: f.optionsFrom.label(r) }));
  };

  const openForm = (item) => {
    const init = {};
    fields.forEach((f) => {
      init[f.name] = item ? (f.type === 'password' ? '' : item[f.name] ?? '') : defaults[f.name] ?? (f.type === 'checkbox' ? false : '');
    });
    setForm(init);
    setErrors({});
    setModal({ item });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = { ...form };
    fields.forEach((f) => { if (payload[f.name] === '') payload[f.name] = null; });
    if (modal.item && payload.password === null) delete payload.password;
    try {
      if (modal.item) await api.put(`/${endpoint}/${modal.item.id}`, payload);
      else await api.post(`/${endpoint}`, payload);
      optionCache.delete(endpoint);
      toast(modal.item ? 'Đã cập nhật' : 'Đã thêm mới');
      setModal(null);
      reload();
    } catch (err) {
      setErrors(fieldErrors(err));
      if (!err.response?.data?.errors) toast(errMsg(err), 'bad');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
    try {
      await api.delete(`/${endpoint}/${row.id}`);
      optionCache.delete(endpoint);
      toast('Đã xóa');
      if (rows.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (err) {
      toast(errMsg(err), 'bad');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <div className="sub">{meta ? `${meta.total} bản ghi` : ''}</div>
        </div>
        <button className="btn primary" onClick={() => openForm(null)}>＋ Thêm mới</button>
      </div>

      <div className="card">
        <form className="toolbar" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search); }}>
          <input type="search" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {filters.map((f) => (
            <select key={f.name} value={filterVals[f.name] || ''}
              onChange={(e) => { setPage(1); setFilterVals({ ...filterVals, [f.name]: e.target.value }); }}>
              <option value="">{f.label}: tất cả</option>
              {optsFor(f).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <button className="btn" type="submit">Tìm</button>
        </form>

        <div className={`table-wrap ${loading && rows.length ? 'busy' : ''}`}>
          <table>
            <thead>
              <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={columns.length + 1}><Loading /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="empty">Không có dữ liệu</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : (get(row, c.key) ?? '—')}</td>
                  ))}
                  <td className="actions">
                    {rowActions?.(row)}
                    <button className="btn sm" onClick={() => openForm(row)}>Sửa</button>
                    <button className="btn sm danger" onClick={() => remove(row)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager meta={meta} onPage={setPage} />
      </div>

      {modal && (
        <Modal title={`${modal.item ? 'Chỉnh sửa' : 'Thêm mới'} — ${title}`} onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn primary" form="crud-form" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </>}>
          <form id="crud-form" onSubmit={save} className="form-grid">
            {fields.map((f) => {
              const val = form[f.name];
              const set = (v) => setForm({ ...form, [f.name]: v });
              const req = f.required && !(f.type === 'password' && modal.item);
              return (
                <label key={f.name} className={`field ${f.full ? 'full' : ''}`}>
                  <span>{f.label}{req && ' *'}</span>
                  {f.type === 'textarea' ? (
                    <textarea rows={3} value={val ?? ''} onChange={(e) => set(e.target.value)} />
                  ) : f.type === 'checkbox' ? (
                    <input type="checkbox" checked={!!val} onChange={(e) => set(e.target.checked)} />
                  ) : f.type === 'select' || f.options || f.optionsFrom ? (
                    <select value={val ?? ''} onChange={(e) => set(e.target.value)} required={req}>
                      <option value="">— Chọn —</option>
                      {optsFor(f).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input type={f.type || 'text'} value={val ?? ''} required={req}
                      placeholder={f.type === 'password' && modal.item ? 'Để trống nếu không đổi' : f.placeholder}
                      onChange={(e) => set(e.target.value)} />
                  )}
                  {errors[f.name] && <div className="err">{errors[f.name][0]}</div>}
                </label>
              );
            })}
          </form>
        </Modal>
      )}
    </>
  );
}
