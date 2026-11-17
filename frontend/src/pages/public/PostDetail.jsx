import { categoryLabel } from '../../categoryLabel';
import LoadError from '../../components/LoadError';
import { useUnsavedChanges } from '../../UnsavedChanges';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { useAuth } from '../../auth';
import { confirmDelete, notify } from '../../notify';
import PostCard, { RankList } from './PostCard';
import { fmtDate } from '../../utils';
import { fmtNumber, readMinutes, timeAgo, useLikes } from './likes';
import { usePageTitle } from '../../components/PageTitle';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { liked, toggle } = useLikes();
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [popular, setPopular] = useState([]);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  useUnsavedChanges(content.trim().length > 0);
  usePageTitle(missing ? 'Post not found' : post && String(post.id) === id ? post.title : 'Loading post');

  useEffect(() => {
    const ctrl = new AbortController();
    setPost(null);
    setMissing(false);
    setLoadError('');
    setCommentsError('');
    setContent('');
    setComments([]);
    api.get(`/posts/${id}`, { signal: ctrl.signal }).then((r) => setPost(r.data)).catch((e) => { if (ctrl.signal.aborted) return; if (e.response?.status === 404) setMissing(true); else setLoadError(errMsg(e)); });
    api.get(`/posts/${id}/comments`, { signal: ctrl.signal }).then((r) => setComments(r.data)).catch((e) => { if (!ctrl.signal.aborted) setCommentsError(errMsg(e)); });
    return () => ctrl.abort();
  }, [id, retry]);

  useEffect(() => {
    api.get('/posts', { params: { sort: 'views', per_page: 6 } }).then((r) => setPopular(r.data.data)).catch(() => {});
  }, []);

  if (loadError) return <main className="pub-main"><LoadError message={loadError} onRetry={() => setRetry((n) => n + 1)} /></main>;
  if (missing) return <main className="pub-main"><div className="pub-empty">Post not found</div></main>;
  if (!post) return <main className="pub-main"><div className="pub-empty">Loading...</div></main>;

  const isLiked = liked.includes(post.id);
  const url = window.location.href;
  const loginUrl = '/login';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify('Link copied. The recipient needs to sign in to read this post.');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      notify('Could not copy the link', 'bad');
    }
  };

  const send = async (e) => {
    e.preventDefault();
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
        {post.category && <><Link to={`/category/${post.category.slug}`}>{categoryLabel(post.category)}</Link><span>›</span></>}
        <b>{post.title}</b>
      </div>

      <div className="list-layout">
        <article className="post-detail">
          {post.category && <Link to={`/category/${post.category.slug}`} className="chip">{categoryLabel(post.category)}</Link>}
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
              onClick={async () => { const c = await toggle(post.id); if (c === null) return; setPost((p) => ({ ...p, likes_count: c })); }}>
              {isLiked ? '♥ Liked' : '♡ Like this post'}
            </button>
            <span className="likes">{fmtNumber(post.likes_count)} likes</span>
            <div className="share">
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

            {commentsError && <div role="alert">Comments could not be loaded. <button className="btn sm" onClick={async () => { try { const r = await api.get(`/posts/${id}/comments`); setComments(r.data); setCommentsError(''); } catch (e) { setCommentsError(errMsg(e)); } }}>Try again</button></div>}
            {!commentsError && comments.length === 0 && <div className="sub-muted">No comments yet.</div>}
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
