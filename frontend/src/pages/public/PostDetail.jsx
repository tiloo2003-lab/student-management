import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { useAuth } from '../../auth';
import { confirmDelete, confirmDialog, notify } from '../../notify';
import PostCard, { RankList } from './PostCard';
import { fmtDate } from '../../utils';
import { fmtNumber, readMinutes, timeAgo, useLikes } from './likes';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { liked, toggle } = useLikes();
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);
  const [popular, setPopular] = useState([]);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPost(null);
    setMissing(false);
    api.get(`/posts/${id}`).then((r) => setPost(r.data)).catch(() => setMissing(true));
    api.get(`/posts/${id}/comments`).then((r) => setComments(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    api.get('/posts', { params: { sort: 'views', per_page: 6 } }).then((r) => setPopular(r.data.data)).catch(() => {});
  }, []);

  if (missing) return <main className="pub-main"><div className="pub-empty">Không tìm thấy bài viết</div></main>;
  if (!post) return <main className="pub-main"><div className="pub-empty">Đang tải...</div></main>;

  const isLiked = liked.includes(post.id);
  const url = window.location.href;
  const loginUrl = `/admin/login?redirect=${encodeURIComponent(`/posts/${post.id}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      notify('Không thể sao chép liên kết', 'bad');
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!(await confirmDialog({ title: 'Gửi bình luận?', text: 'Bình luận sẽ hiển thị công khai dưới tên của bạn.', confirmText: 'Gửi bình luận' }))) return;
    setSending(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, { content });
      setComments((c) => [data, ...c]);
      setContent('');
      notify('Đã đăng bình luận');
    } catch (err) {
      notify(errMsg(err), 'bad');
    } finally {
      setSending(false);
    }
  };

  const remove = async (comment) => {
    if (!(await confirmDelete('Bình luận của bạn sẽ bị xóa.'))) return;
    try {
      await api.delete(`/posts/${post.id}/comments/${comment.id}`);
      setComments((c) => c.filter((x) => x.id !== comment.id));
      notify('Đã xóa bình luận');
    } catch (err) {
      notify(errMsg(err), 'bad');
    }
  };

  const canDelete = (c) => user && (user.role === 'admin' || c.user_id === user.id);

  return (
    <main className="pub-main">
      <div className="crumbs">
        <Link to="/">Trang chủ</Link><span>›</span>
        {post.category && <><Link to={`/danh-muc/${post.category.slug}`}>{post.category.name}</Link><span>›</span></>}
        <b>{post.title}</b>
      </div>

      <div className="list-layout">
        <article className="post-detail">
          {post.category && <Link to={`/danh-muc/${post.category.slug}`} className="chip">{post.category.name}</Link>}
          <h1>{post.title}</h1>
          <div className="meta">
            <span>Đăng bởi: <b>{post.author?.name}</b></span>
            <span>{fmtDate(post.created_at)}</span>
            <span>👁 {fmtNumber(post.views_count)} lượt xem</span>
            <span>⏱ {readMinutes(post.content)} phút đọc</span>
          </div>
          {post.image_url && <img className="cover" src={post.image_url} alt={post.title} />}
          <p className="lead">{post.description}</p>
          {post.content && <div className="body">{post.content}</div>}

          <div className="like-bar">
            <button className={`pub-btn ${isLiked ? 'liked' : ''}`}
              onClick={async () => { const c = await toggle(post.id); setPost((p) => ({ ...p, likes_count: c })); }}>
              {isLiked ? '♥ Đã thích' : '♡ Thích bài viết'}
            </button>
            <span className="likes">{fmtNumber(post.likes_count)} lượt thích</span>
            <div className="share">
              <a className="pub-btn" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Chia sẻ Facebook</a>
              <button className="pub-btn" onClick={copy}>{copied ? 'Đã sao chép' : 'Sao chép liên kết'}</button>
            </div>
          </div>

          <section className="comments">
            <h3 className="sec-title"><span>Bình luận ({comments.length})</span></h3>

            {user ? (
              <form onSubmit={send} className="cmt-form">
                <div className="cmt-as">Bình luận với tên <b>{user.name}</b></div>
                <textarea rows={3} placeholder="Viết bình luận..." value={content} maxLength={1000} required onChange={(e) => setContent(e.target.value)} />
                <button className="pub-btn solid" disabled={sending || !content.trim()}>{sending ? 'Đang gửi...' : 'Gửi bình luận'}</button>
              </form>
            ) : (
              <div className="cmt-login">
                Bạn cần <Link to={loginUrl}>đăng nhập</Link> để tham gia bình luận.
              </div>
            )}

            {comments.length === 0 && <div className="sub-muted">Chưa có bình luận nào.</div>}
            {comments.map((c) => (
              <div className="cmt" key={c.id}>
                <span className="cmt-ava">{c.name.trim()[0]?.toUpperCase()}</span>
                <div className="cmt-main">
                  <b>{c.name}</b> <small>{timeAgo(c.created_at)}</small>
                  <p>{c.content}</p>
                </div>
                {canDelete(c) && <button className="cmt-del" onClick={() => remove(c)}>Xóa</button>}
              </div>
            ))}
          </section>

          {post.related?.length > 0 && (
            <section className="cat-section">
              <h3 className="sec-title"><span>Bài viết liên quan</span></h3>
              <div className="grid-2">{post.related.map((p) => <PostCard key={p.id} post={p} />)}</div>
            </section>
          )}
        </article>

        <aside>
          <RankList title="Đọc nhiều" posts={popular} />
        </aside>
      </div>
    </main>
  );
}
