import { Link, useNavigate } from 'react-router-dom';
import { timeAgo } from './likes';

export function Thumb({ post, className = '' }) {
  return (
    <div className={`thumb-box ${className}`}>
      {post.likes_count >= 100 && <span className="tag-hot">Hot</span>}
      {post.image_url && <img src={post.image_url} alt={post.title} loading="lazy" />}
    </div>
  );
}

export function PostMeta({ post }) {
  return (
    <div className="meta-row">
      <span>{timeAgo(post.created_at)}</span>
      <span>👁 {post.views_count}</span>
      <span>♥ {post.likes_count}</span>
    </div>
  );
}

export default function PostCard({ post, liked, onLike }) {
  const nav = useNavigate();
  return (
    <article className="pcard" onClick={() => nav(`/posts/${post.id}`)}>
      <Thumb post={post} />
      <div className="pcard-body">
        {post.category && <Link className="chip" to={`/danh-muc/${post.category.slug}`} onClick={(e) => e.stopPropagation()}>{post.category.name}</Link>}
        <h3>{post.title}</h3>
        <p>{post.description}</p>
        <PostMeta post={post} />
        {onLike && (
          <button className={`pub-btn sm ${liked ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); onLike(post); }}>
            {liked ? '♥ Đã thích' : '♡ Thích'}
          </button>
        )}
      </div>
    </article>
  );
}

export function RankList({ posts, title }) {
  return (
    <div className="side-box">
      <h3 className="side-title">{title}</h3>
      <ol className="rank">
        {posts.map((p, i) => (
          <li key={p.id}>
            <span className="rank-n">{i + 1}</span>
            <Link to={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
