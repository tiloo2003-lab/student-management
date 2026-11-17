import { categoryLabel } from '../../categoryLabel';
import useResource from '../../useResource';
import LoadError from '../../components/LoadError';
import { usePortalData } from '../../PortalData';
import { useEffect, useState } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';

import PostCard from './PostCard';
import { useLikes } from './likes';
import { usePageTitle } from '../../components/PageTitle';

const TABS = [['latest', 'Latest'], ['likes', 'Hot'], ['views', 'Most read']];

export default function Listing() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { liked, toggle } = useLikes();
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const { categories } = usePortalData();
  const cats = categories.data || [];
  useEffect(() => { setPage(1); }, [slug, q, sort]);
  const request = new URLSearchParams({ sort, page, search: q, category: slug || '', per_page: 12 });
  const { data, setData, loading, error, retry } = useResource('/posts?' + request);

  const cat = cats.find((c) => c.slug === slug);
  const title = q ? `Search results: "${q}"` : slug ? (categoryLabel(cat) || 'Category') : 'All posts';
  usePageTitle(title);

  const onLike = async (p) => {
    const count = await toggle(p.id);
    if (count === null) return;
    setData((d) => ({ ...d, data: d.data.map((x) => (x.id === p.id ? { ...x, likes_count: count } : x)) }));
  };

  if (error) return <main className="pub-main"><LoadError message={error} onRetry={retry} /></main>;
  return (
    <main className="pub-main">
      <div className="crumbs">
        <Link to="/">Home</Link><span>›</span>
        {slug ? <><Link to="/news">News</Link><span>›</span><b>{categoryLabel(cat)}</b></> : <b>{q ? 'Search' : 'News'}</b>}
      </div>

      <h1 className="page-title">{title}</h1>
      {cat?.description && <p className="page-sub">{cat.description}</p>}

      <div className="list-bar">
        <div className="tabs-pub">
          {TABS.map(([v, l]) => (
            <button key={v} className={sort === v ? 'active' : ''} onClick={() => setSort(v)}>{l}</button>
          ))}
        </div>
        <span className="count">{data ? data.total : 0} posts</span>
      </div>

      <div className="list-layout">
        <div>
          {loading || !data ? <div className="pub-empty">Loading...</div> : data.data.length === 0 ? (
            <div className="pub-empty">No posts found</div>
          ) : (
            <div className="grid-3">
              {data.data.map((p) => <PostCard key={p.id} post={p} liked={liked.includes(p.id)} onLike={onLike} />)}
            </div>
          )}

          {data && data.last_page > 1 && (
            <div className="pub-pager">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: data.last_page }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === page ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button disabled={page >= data.last_page} onClick={() => setPage(page + 1)}>›</button>
            </div>
          )}
        </div>

        <aside>
          <div className="side-box">
            <h3 className="side-title">Categories</h3>
            <ul className="cat-list">
              <li><NavLink to="/news" end>All</NavLink></li>
              {cats.map((c) => (
                <li key={c.id}><NavLink to={`/category/${c.slug}`}>{categoryLabel(c)}<small>{c.posts_count}</small></NavLink></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
