import { useEffect, useState } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api';
import PostCard from './PostCard';
import { useLikes } from './likes';

const TABS = [['latest', 'Mới nhất'], ['likes', 'Hot'], ['views', 'Đọc nhiều']];

export default function Listing() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { liked, toggle } = useLikes();
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);

  useEffect(() => { setPage(1); }, [slug, q, sort]);

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setData(null);
    api.get('/posts', { params: { sort, page, search: q, category: slug, per_page: 12 }, signal: ctrl.signal })
      .then((r) => setData(r.data))
      .catch(() => {});
    return () => ctrl.abort();
  }, [sort, page, q, slug]);

  const cat = cats.find((c) => c.slug === slug);
  const title = q ? `Kết quả tìm kiếm: "${q}"` : slug ? (cat?.name || 'Danh mục') : 'Tất cả bài viết';

  const onLike = async (p) => {
    const count = await toggle(p.id);
    setData((d) => ({ ...d, data: d.data.map((x) => (x.id === p.id ? { ...x, likes_count: count } : x)) }));
  };

  return (
    <main className="pub-main">
      <div className="crumbs">
        <Link to="/">Trang chủ</Link><span>›</span>
        {slug ? <><Link to="/tin-tuc">Tin tức</Link><span>›</span><b>{cat?.name}</b></> : <b>{q ? 'Tìm kiếm' : 'Tin tức'}</b>}
      </div>

      <h1 className="page-title">{title}</h1>
      {cat?.description && <p className="page-sub">{cat.description}</p>}

      <div className="list-bar">
        <div className="tabs-pub">
          {TABS.map(([v, l]) => (
            <button key={v} className={sort === v ? 'active' : ''} onClick={() => setSort(v)}>{l}</button>
          ))}
        </div>
        <span className="count">{data ? data.total : 0} bài viết</span>
      </div>

      <div className="list-layout">
        <div>
          {!data ? <div className="pub-empty">Đang tải...</div> : data.data.length === 0 ? (
            <div className="pub-empty">Không tìm thấy bài viết nào</div>
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
            <h3 className="side-title">Danh mục</h3>
            <ul className="cat-list">
              <li><NavLink to="/tin-tuc" end>Tất cả</NavLink></li>
              {cats.map((c) => (
                <li key={c.id}><NavLink to={`/danh-muc/${c.slug}`}>{c.name}<small>{c.posts_count}</small></NavLink></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
