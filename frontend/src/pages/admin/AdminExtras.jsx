import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import CrudPage from '../../components/CrudPage';
import { Badge, Loading, Modal, Pager, useToast } from '../../components/ui';
import { confirmDelete, confirmDialog } from '../../notify';
import { fmtDate } from '../../utils';

export const CategoriesPage = () => (
  <CrudPage title="Danh mục bài viết" endpoint="manage/categories"
    columns={[
      { key: 'name', label: 'Tên danh mục' }, { key: 'slug', label: 'Đường dẫn' },
      { key: 'description', label: 'Mô tả' }, { key: 'posts_count', label: 'Số bài' },
    ]}
    fields={[
      { name: 'name', label: 'Tên danh mục', required: true, full: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', full: true },
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
      <input type="search" placeholder="Tìm kiếm..." value={s} onChange={(e) => setS(e.target.value)} />
      <button className="btn" type="submit">Tìm</button>
    </form>
  );
}

export function CommentsPage() {
  const { data, setPage, setQuery, reload, toast } = useList('/manage/comments');

  const remove = async (c) => {
    if (!(await confirmDelete('Bình luận sẽ bị xóa khỏi bài viết.'))) return;
    try {
      await api.delete(`/manage/comments/${c.id}`);
      toast('Đã xóa');
      reload();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Bình luận</h1><div className="sub">{data ? `${data.total} bình luận` : ''}</div></div></div>
      <div className="card">
        <SearchBar onSearch={(s) => { setPage(1); setQuery(s); }} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Người bình luận</th><th>Nội dung</th><th>Bài viết</th><th>Ngày</th><th /></tr></thead>
            <tbody>
              {!data ? <tr><td colSpan={5}><Loading /></td></tr>
                : data.data.length === 0 ? <tr><td colSpan={5} className="empty">Chưa có bình luận</td></tr>
                : data.data.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td style={{ maxWidth: 380, whiteSpace: 'normal' }}>{c.content}</td>
                    <td style={{ maxWidth: 260, whiteSpace: 'normal' }}><Link to={`/posts/${c.post_id}`}>{c.post?.title}</Link></td>
                    <td>{fmtDate(c.created_at)}</td>
                    <td className="actions"><button className="btn sm danger" onClick={() => remove(c)}>Xóa</button></td>
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
    if (!(await confirmDialog({ title: 'Đánh dấu đã đọc?', text: 'Tin nhắn sẽ chuyển sang trạng thái đã đọc.', confirmText: 'Đánh dấu' }))) return;
    try {
      await api.put(`/manage/messages/${m.id}/read`);
      toast('Đã đánh dấu đã đọc');
      setView({ ...m, is_read: true });
      reload();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  const remove = async (m) => {
    if (!(await confirmDelete('Tin nhắn liên hệ sẽ bị xóa.'))) return;
    try {
      await api.delete(`/manage/messages/${m.id}`);
      toast('Đã xóa');
      setView(null);
      reload();
    } catch (e) { toast(errMsg(e), 'bad'); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Tin nhắn liên hệ</h1><div className="sub">{data ? `${data.total} tin nhắn` : ''}</div></div></div>
      <div className="card">
        <SearchBar onSearch={(s) => { setPage(1); setQuery(s); }} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Người gửi</th><th>Email</th><th>Chủ đề</th><th>Ngày</th><th>Trạng thái</th><th /></tr></thead>
            <tbody>
              {!data ? <tr><td colSpan={6}><Loading /></td></tr>
                : data.data.length === 0 ? <tr><td colSpan={6} className="empty">Chưa có tin nhắn</td></tr>
                : data.data.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.subject}</td>
                    <td>{fmtDate(m.created_at)}</td>
                    <td><Badge color={m.is_read ? 'gray' : 'amber'}>{m.is_read ? 'Đã đọc' : 'Mới'}</Badge></td>
                    <td className="actions">
                      <button className="btn sm" onClick={() => setView(m)}>Xem</button>
                      <button className="btn sm danger" onClick={() => remove(m)}>Xóa</button>
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
            {!view.is_read && <button className="btn primary" onClick={() => markRead(view)}>Đánh dấu đã đọc</button>}
            <button className="btn" onClick={() => setView(null)}>Đóng</button>
          </>}>
          <p className="sub">Từ: <b>{view.name}</b> · {view.email}{view.phone ? ` · ${view.phone}` : ''} · {fmtDate(view.created_at)}</p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{view.message}</p>
        </Modal>
      )}
    </>
  );
}
