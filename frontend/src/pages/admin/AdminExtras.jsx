import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import CrudPage from '../../components/CrudPage';
import { Badge, Loading, Modal, Pager, useToast } from '../../components/ui';
import { confirmDelete, confirmDialog } from '../../notify';
import { fmtDate } from '../../utils';

export const CategoriesPage = () => (
  <CrudPage title="Post categories" entity="category" endpoint="manage/categories"
    columns={[
      { key: 'name', label: 'Category name' }, { key: 'slug', label: 'Slug' },
      { key: 'description', label: 'Description' }, { key: 'posts_count', label: 'Posts' },
    ]}
    fields={[
      { name: 'name', label: 'Category name', required: true, full: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ]} />
);

function useList(endpoint) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    api.get(endpoint, { params: { page, search: query, per_page: 10 }, signal: ctrl.signal })
      .then((r) => setData(r.data))
      .catch((e) => e.code !== 'ERR_CANCELED' && toast(errMsg(e), 'bad'));
    return () => ctrl.abort();
  }, [endpoint, page, query, tick, toast]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, page, setPage, setQuery, reload, toast };
}

function SearchBar({ onSearch }) {
  const [s, setS] = useState('');
  return (
    <form className="toolbar" onSubmit={(e) => { e.preventDefault(); onSearch(s); }}>
      <input type="search" placeholder="Search..." value={s} onChange={(e) => setS(e.target.value)} />
      <button className="btn" type="submit">Search</button>
    </form>
  );
}

export function CommentsPage() {
  const { data, setPage, setQuery, reload, toast } = useList('/manage/comments');

  const remove = async (c) => {
    if (!(await confirmDelete('This comment will be removed from the post.'))) return;
    try {
      await api.delete(`/manage/comments/${c.id}`);
      toast('Deleted successfully');
      reload();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Comments</h1><div className="sub">{data ? `${data.total} comments` : ''}</div></div></div>
      <div className="card">
        <SearchBar onSearch={(s) => { setPage(1); setQuery(s); }} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Author</th><th>Content</th><th>Post</th><th>Date</th><th /></tr></thead>
            <tbody>
              {!data ? <tr><td colSpan={5}><Loading /></td></tr>
                : data.data.length === 0 ? <tr><td colSpan={5} className="empty">No comments yet</td></tr>
                : data.data.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td style={{ maxWidth: 380, whiteSpace: 'normal' }}>{c.content}</td>
                    <td style={{ maxWidth: 260, whiteSpace: 'normal' }}><Link to={`/posts/${c.post_id}`}>{c.post?.title}</Link></td>
                    <td>{fmtDate(c.created_at)}</td>
                    <td className="actions"><button className="btn sm danger" onClick={() => remove(c)}>Delete</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pager meta={data} onPage={setPage} />
      </div>
    </>
  );
}

export function MessagesPage() {
  const { data, setPage, setQuery, reload, toast } = useList('/manage/messages');
  const [view, setView] = useState(null);

  const markRead = async (m) => {
    if (!(await confirmDialog({ title: 'Mark as read?', text: 'The message will be marked as read.', confirmText: 'Mark as read' }))) return;
    try {
      await api.put(`/manage/messages/${m.id}/read`);
      toast('Marked as read');
      setView({ ...m, is_read: true });
      reload();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  const remove = async (m) => {
    if (!(await confirmDelete('This contact message will be deleted.'))) return;
    try {
      await api.delete(`/manage/messages/${m.id}`);
      toast('Deleted successfully');
      setView(null);
      reload();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Contact messages</h1><div className="sub">{data ? `${data.total} messages` : ''}</div></div></div>
      <div className="card">
        <SearchBar onSearch={(s) => { setPage(1); setQuery(s); }} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Sender</th><th>Email</th><th>Subject</th><th>Date</th><th>Status</th><th /></tr></thead>
            <tbody>
              {!data ? <tr><td colSpan={6}><Loading /></td></tr>
                : data.data.length === 0 ? <tr><td colSpan={6} className="empty">No messages yet</td></tr>
                : data.data.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.subject}</td>
                    <td>{fmtDate(m.created_at)}</td>
                    <td><Badge color={m.is_read ? 'gray' : 'amber'}>{m.is_read ? 'Read' : 'New'}</Badge></td>
                    <td className="actions">
                      <button className="btn sm" onClick={() => setView(m)}>View</button>
                      <button className="btn sm danger" onClick={() => remove(m)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pager meta={data} onPage={setPage} />
      </div>

      {view && (
        <Modal title={view.subject} onClose={() => setView(null)}
          footer={<>
            {!view.is_read && <button className="btn primary" onClick={() => markRead(view)}>Mark as read</button>}
            <button className="btn" onClick={() => setView(null)}>Close</button>
          </>}>
          <p className="sub">From: <b>{view.name}</b> · {view.email}{view.phone ? ` · ${view.phone}` : ''} · {fmtDate(view.created_at)}</p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{view.message}</p>
        </Modal>
      )}
    </>
  );
}
