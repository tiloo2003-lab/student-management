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

  if (missing) return <main className="pub-main"><div className="pub-empty">Post not found</div></main>;
  if (!post) return <main className="pub-main"><div className="pub-empty">Loading...</div></main>;

  const isLiked = liked.includes(post.id);
  const url = window.location.href;
  const loginUrl = `/admin/login?redirect=${encodeURIComponent(`/posts/${post.id}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      notify('Could not copy the link', 'bad');
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!(await confirmDialog({ title: 'Post this comment?', text: 'The comment will be shown publicly under your name.', confirmText: 'Post comment' }))) return;
    setSending(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, { content });
      setComments((c) => [data, ...c]);
      setContent('');
      notify('Comment posted');
    } catch (err) {
      notify(errMsg(err), 'bad');
    } finally {
      setSending(false);
    }
  };

  const remove = async (comment) => {
    if (!(await confirmDelete('Your comment will be deleted.'))) return;
    try {
      await api.delete(`/posts/${post.id}/comments/${comment.id}`);
      setComments((c) => c.filter((x) => x.id !== comment.id));
      notify('Comment deleted');
    } catch (err) {
      notify(errMsg(err), 'bad');
    }
  };

  const canDelete = (c) => user && (user.role === 'admin' || c.user_id === user.id);

  return (
    <main className="pub-main">
      <div className="crumbs">
        <Link to="/">Home</Link><span>›</span>
        {post.category && <><Link to={`/danh-muc/${post.category.slug}`}>{post.category.name}</Link><span>›</span></>}
        <b>{post.title}</b>
      </div>

      <div className="list-layout">
        <article className="post-detail">
          {post.category && <Link to={`/danh-muc/${post.category.slug}`} className="chip">{post.category.name}</Link>}
          <h1>{post.title}</h1>
          <div className="meta">
            <span>Posted by: <b>{post.author?.name}</b></span>
            <span>{fmtDate(post.created_at)}</span>
            <span>👁 {fmtNumber(post.views_count)} views</span>
            <span>⏱ {readMinutes(post.content)} min read</span>
          </div>
          {post.image_url && <img className="cover" src={post.image_url} alt={post.title} />}
          <p className="lead">{post.description}</p>
          {post.content && <div className="body">{post.content}</div>}

          <div className="like-bar">
            <button className={`pub-btn ${isLiked ? 'liked' : ''}`}
              onClick={async () => { const c = await toggle(post.id); setPost((p) => ({ ...p, likes_count: c })); }}>
              {isLiked ? '♥ Liked' : '♡ Like this post'}
            </button>
            <span className="likes">{fmtNumber(post.likes_count)} likes</span>
            <div className="share">
              <a className="pub-btn" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Share on Facebook</a>
              <button className="pub-btn" onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
            </div>
          </div>

          <section className="comments">
            <h3 className="sec-title"><span>Comments ({comments.length})</span></h3>

            {user ? (
              <form onSubmit={send} className="cmt-form">
                <div className="cmt-as">Commenting as <b>{user.name}</b></div>
                <textarea rows={3} placeholder="Write a comment..." value={content} maxLength={1000} required onChange={(e) => setContent(e.target.value)} />
                <button className="pub-btn solid" disabled={sending || !content.trim()}>{sending ? 'Sending...' : 'Post comment'}</button>
              </form>
            ) : (
              <div className="cmt-login">
                You need to <Link to={loginUrl}>sign in</Link> to join the discussion.
              </div>
            )}

            {comments.length === 0 && <div className="sub-muted">No comments yet.</div>}
            {comments.map((c) => (
              <div className="cmt" key={c.id}>
                <span className="cmt-ava">{c.name.trim()[0]?.toUpperCase()}</span>
                <div className="cmt-main">
                  <b>{c.name}</b> <small>{timeAgo(c.created_at)}</small>
                  <p>{c.content}</p>
                </div>
                {canDelete(c) && <button className="cmt-del" onClick={() => remove(c)}>Delete</button>}
              </div>
            ))}
          </section>

          {post.related?.length > 0 && (
            <section className="cat-section">
              <h3 className="sec-title"><span>Related posts</span></h3>
              <div className="grid-2">{post.related.map((p) => <PostCard key={p.id} post={p} />)}</div>
            </section>
          )}
        </article>

        <aside>
          <RankList title="Most read" posts={popular} />
        </aside>
      </div>
    </main>
  );
}
