import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { fmtDate } from '../../utils';
import PostCard, { PostMeta, RankList, Thumb } from './PostCard';
import { fmtNumber, useLikes } from './likes';

function Hero({ slides }) {
  const nav = useNavigate();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setTimeout(() => setI((x) => (x + 1) % slides.length), 4000);
    return () => clearTimeout(t);
  }, [i, slides.length]);

  if (slides.length === 0) return <div className="hero hero-empty" />;
  const go = (n) => setI((n + slides.length) % slides.length);

  return (
    <section className="hero">
      <div className="hero-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((p) => (
          <div className="hero-slide" key={p.id}>
            <div className="hero-in">
              <div className="hero-text">
                <span className="hero-tag">{p.category?.name || 'Nổi bật'} · {p.likes_count} lượt thích</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <button className="hero-btn" onClick={() => nav(`/posts/${p.id}`)}>Xem chi tiết →</button>
              </div>
              <div className="hero-img" onClick={() => nav(`/posts/${p.id}`)}>
                {p.image_url && <img src={p.image_url} alt={p.title} />}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="hero-arrow left" onClick={() => go(i - 1)} aria-label="Trước">‹</button>
      <button className="hero-arrow right" onClick={() => go(i + 1)} aria-label="Sau">›</button>
      <div className="hero-dots">
        {slides.map((p, n) => (
          <button key={p.id} className={n === i ? 'active' : ''} onClick={() => go(n)} aria-label={`Slide ${n + 1}`} />
        ))}
      </div>
    </section>
  );
}

function Counter({ value }) {
  const [n, setN] = useState(value);
  useEffect(() => {
    let step = 0;
    const steps = 24;
    setN(0);
    const t = setInterval(() => {
      step += 1;
      const p = Math.min(1, step / steps);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p >= 1) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, [value]);
  return <>{fmtNumber(n)}</>;
}

const STATS = [['students', 'Sinh viên', '🎓'], ['teachers', 'Giảng viên', '👩‍🏫'], ['departments', 'Khoa', '🏛️'], ['courses', 'Lớp học phần', '📚'], ['posts', 'Bài viết', '📰']];

export default function Home() {
  const nav = useNavigate();
  const { liked, toggle } = useLikes();
  const [data, setData] = useState(null);
  const [slides, setSlides] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get('/home').then((r) => setData(r.data)).catch(() => {});
    api.get('/posts', { params: { sort: 'likes', per_page: 5 } }).then((r) => setSlides(r.data.data)).catch(() => {});
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {});
  }, []);

  const onLike = async (p) => {
    const count = await toggle(p.id);
    const patch = (list) => list.map((x) => (x.id === p.id ? { ...x, likes_count: count } : x));
    setData((d) => ({
      ...d,
      latest: patch(d.latest),
      popular: patch(d.popular),
      sections: d.sections.map((s) => ({ ...s, posts: patch(s.posts) })),
    }));
  };

  if (!data) return <><Hero slides={slides} /><div className="pub-empty">Đang tải...</div></>;

  const [lead, ...rest] = data.latest;

  return (
    <>
      <Hero slides={slides} />

      <section className="pub-stats">
        <div className="in">
          {STATS.map(([k, label, icon]) => (
            <div className="stat-item" key={k}>
              <span className="stat-ico">{icon}</span>
              <div><b><Counter value={data.stats[k]} /></b><small>{label}</small></div>
            </div>
          ))}
        </div>
      </section>

      <main className="pub-main">
        <div className="two-col">
          <div>
            <h2 className="sec-title"><span>Tin mới nhất</span><Link to="/tin-tuc">Xem tất cả →</Link></h2>
            {lead && (
              <article className="lead-card" onClick={() => nav(`/posts/${lead.id}`)}>
                <Thumb post={lead} />
                <div className="lead-body">
                  {lead.category && <span className="chip">{lead.category.name}</span>}
                  <h3>{lead.title}</h3>
                  <p>{lead.description}</p>
                  <PostMeta post={lead} />
                </div>
              </article>
            )}
            <div className="grid-2">
              {rest.slice(0, 4).map((p) => (
                <PostCard key={p.id} post={p} liked={liked.includes(p.id)} onLike={onLike} />
              ))}
            </div>
          </div>

          <aside>
            <RankList title="Đọc nhiều" posts={data.popular} />
            <div className="side-box">
              <h3 className="side-title">Thông báo</h3>
              <ul className="notice">
                {data.announcements.map((a) => (
                  <li key={a.id}>
                    <b>{a.title}</b>
                    <small>{fmtDate(a.created_at)}</small>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {data.sections.map((s) => (
          <section key={s.category.id} className="cat-section">
            <h2 className="sec-title"><span>{s.category.name}</span><Link to={`/danh-muc/${s.category.slug}`}>Xem thêm →</Link></h2>
            <div className="grid-4">
              {s.posts.map((p) => <PostCard key={p.id} post={p} liked={liked.includes(p.id)} onLike={onLike} />)}
            </div>
          </section>
        ))}

        <section className="cat-section">
          <h2 className="sec-title"><span>Khám phá theo danh mục</span></h2>
          <div className="cat-cloud">
            {cats.map((c) => (
              <Link key={c.id} to={`/danh-muc/${c.slug}`} className="cat-tile">
                <b>{c.name}</b>
                <small>{c.posts_count} bài viết</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="cta">
          <div>
            <h2>Bạn cần hỗ trợ thông tin?</h2>
            <p>Gửi câu hỏi cho nhà trường, chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
          </div>
          <Link to="/lien-he" className="hero-btn">Liên hệ ngay</Link>
        </section>
      </main>
    </>
  );
}
