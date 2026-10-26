import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';

const today = () => {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function PublicLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const [top, setTop] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="pub">
      <div className="pub-top">
        <div className="in">
          <span>{today()}</span>
          <span className="pub-top-right">Hotline: 0236 123 4567 · contact@school.edu</span>
        </div>
      </div>

      <header className="pub-head">
        <div className="in">
          <Link to="/" className="pub-logo"><i>🎓</i><span>Student Management<small>School information portal</small></span></Link>

          <nav className={`pub-nav ${menu ? 'open' : ''}`}>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/news">News</NavLink>
            <NavLink to="/category/announcements">Announcements</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <form className="pub-search" onSubmit={search}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts..." aria-label="Search" />
            <button aria-label="Search">⌕</button>
          </form>
          <button className="pub-burger" onClick={() => setMenu((m) => !m)} aria-label="Menu">☰</button>
        </div>
        {cats.length > 0 && (
          <div className="pub-cats">
            <div className="in">
              {cats.slice(0, 12).map((c) => (
                <NavLink key={c.id} to={`/category/${c.slug}`}>{c.name}</NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <Outlet />

      <footer className="pub-foot">
        <div className="in grid">
          <div>
            <div className="pub-logo light"><i>🎓</i><span>Student Management</span></div>
            <p>The official portal: news, announcements, activities and services for students and teachers.</p>
          </div>
          <div>
            <h4>Quick links</h4>
            <Link to="/news">All posts</Link>
            <Link to="/category/announcements">Announcements</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h4>Categories</h4>
            {cats.slice(0, 5).map((c) => <Link key={c.id} to={`/category/${c.slug}`}>{c.name}</Link>)}
          </div>
          <div>
            <h4>Contact</h4>
            <span>123 Le Loi Street, District 1, Ho Chi Minh City</span>
            <span>Phone: 0236 123 4567</span>
            <span>Email: contact@school.edu</span>
            <span>Mon – Fri: 7:30 – 17:00</span>
          </div>
        </div>
        <div className="pub-copy">© {new Date().getFullYear()} Student Management. All rights reserved.</div>
      </footer>

      {top && <button className="pub-totop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>}
    </div>
  );
}
