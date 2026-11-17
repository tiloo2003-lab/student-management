import { categoryLabel } from '../../categoryLabel';
import useResource from '../../useResource';
import LoadError from '../../components/LoadError';
import { usePortalData } from '../../PortalData';
import Icon from '../../components/Icon';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { fmtDate } from '../../utils';
import PostCard, { PostMeta, RankList, Thumb } from './PostCard';
import { fmtNumber, useLikes } from './likes';

function Hero({ slides }) {
  const { counts } = useLikes();
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
                <span className="hero-tag">{categoryLabel(p.category) || 'Featured'} · {counts[p.id] ?? p.likes_count} likes</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <button className="hero-btn" onClick={() => nav(`/posts/${p.id}`)}>Read more →</button>
              </div>
              <div className="hero-img" onClick={() => nav(`/posts/${p.id}`)}>
                {p.image_url && <img src={p.image_url} alt={p.title} />}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="hero-arrow left" onClick={() => go(i - 1)} aria-label="Previous">‹</button>
      <button className="hero-arrow right" onClick={() => go(i + 1)} aria-label="Next">›</button>
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

const STATS = [['students', 'Students', 'school'], ['teachers', 'Teachers', 'teacher'], ['departments', 'Departments', 'admin'], ['courses', 'Course sections', 'calendar'], ['posts', 'Posts', 'book']];

export default function Home() {
  const nav = useNavigate();
  const { liked, toggle } = useLikes();
  const { data, setData, error, loading, retry } = useResource('/home');
  const featured = useResource('/posts?sort=likes&per_page=5');
  const slides = featured.data?.data || [];
  const { categories } = usePortalData();
  const cats = categories.data || [];

  const onLike = async (p) => {
    const count = await toggle(p.id);
    if (count === null) return;
    const patch = (list) => list.map((x) => (x.id === p.id ? { ...x, likes_count: count } : x));
    setData((d) => ({
      ...d,
      latest: patch(d.latest),
      popular: patch(d.popular),
      sections: d.sections.map((s) => ({ ...s, posts: patch(s.posts) })),
    }));
  };

  if (error) return <main className="pub-main"><LoadError message={error} onRetry={retry} /></main>;
  if (loading || !data) return <><Hero slides={slides} /><div className="pub-empty">Loading...</div></>;

  const [lead, ...rest] = data.latest;

  return (
    <>
      {featured.error ? <LoadError message={featured.error} onRetry={featured.retry} /> : <Hero slides={slides} />}

      <section className="pub-stats">
        <div className="in">
          {STATS.map(([k, label, icon]) => (
            <div className="stat-item" key={k}>
              <span className="stat-ico"><Icon name={icon} width="26" height="26" /></span>
              <div><b><Counter value={data.stats[k]} /></b><small>{label}</small></div>
            </div>
          ))}
        </div>
      </section>

      <main className="pub-main">
        <div className="two-col">
          <div>
            <h2 className="sec-title"><span>Latest news</span><Link to="/news">View all →</Link></h2>
            {lead && (
              <article className="lead-card" onClick={() => nav(`/posts/${lead.id}`)}>
                <Thumb post={lead} />
                <div className="lead-body">
                  {lead.category && <span className="chip">{categoryLabel(lead.category)}</span>}
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
            <RankList title="Most read" posts={data.popular} />
            <div className="side-box">
              <h3 className="side-title">School notices</h3>
              <ul className="notice">
                {data.announcements.map((a) => (
                  <li key={a.id}>
                    <Link to="/announcements"><b>{a.title}</b></Link>
                    <small>{fmtDate(a.created_at)}</small>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {data.sections.map((s) => (
          <section key={s.category.id} className="cat-section">
            <h2 className="sec-title"><span>{categoryLabel(s.category)}</span><Link to={`/category/${s.category.slug}`}>See more →</Link></h2>
            <div className="grid-4">
              {s.posts.map((p) => <PostCard key={p.id} post={p} liked={liked.includes(p.id)} onLike={onLike} />)}
            </div>
          </section>
        ))}

        <section className="cat-section">
          <h2 className="sec-title"><span>Browse by category</span></h2>
          <div className="cat-cloud">
            {cats.map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`} className="cat-tile">
                <b>{categoryLabel(c)}</b>
                <small>{c.posts_count} posts</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="cta">
          <div>
            <h2>Need more information?</h2>
            <p>Send us your question and we will get back to you as soon as possible.</p>
          </div>
          <Link to="/contact" className="hero-btn">Contact us</Link>
        </section>
      </main>
    </>
  );
}
