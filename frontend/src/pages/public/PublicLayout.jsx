import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';

const today = () => {
  const d = new Date();
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
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
    if (q.trim()) nav(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="pub">
      <div className="pub-top">
        <div className="in">
          <span>{today()}</span>
          <span className="pub-top-right">Hotline: 0236 123 4567 · lienhe@truong.edu.vn</span>
        </div>
      </div>

      <header className="pub-head">
        <div className="in">
          <Link to="/" className="pub-logo"><i>🎓</i><span>QL Sinh viên<small>Cổng thông tin nhà trường</small></span></Link>

          <nav className={`pub-nav ${menu ? 'open' : ''}`}>
            <NavLink to="/" end>Trang chủ</NavLink>
            <NavLink to="/tin-tuc">Tin tức</NavLink>
            <NavLink to="/danh-muc/thong-bao">Thông báo</NavLink>
            <NavLink to="/gioi-thieu">Giới thiệu</NavLink>
            <NavLink to="/lien-he">Liên hệ</NavLink>
          </nav>

          <form className="pub-search" onSubmit={search}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài viết..." aria-label="Tìm kiếm" />
            <button aria-label="Tìm">⌕</button>
          </form>
          <button className="pub-burger" onClick={() => setMenu((m) => !m)} aria-label="Menu">☰</button>
        </div>
        {cats.length > 0 && (
          <div className="pub-cats">
            <div className="in">
              {cats.slice(0, 12).map((c) => (
                <NavLink key={c.id} to={`/danh-muc/${c.slug}`}>{c.name}</NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <Outlet />

      <footer className="pub-foot">
        <div className="in grid">
          <div>
            <div className="pub-logo light"><i>🎓</i><span>QL Sinh viên</span></div>
            <p>Cổng thông tin chính thức: tin tức, thông báo, hoạt động và các dịch vụ hỗ trợ sinh viên, giảng viên.</p>
          </div>
          <div>
            <h4>Liên kết nhanh</h4>
            <Link to="/tin-tuc">Tất cả bài viết</Link>
            <Link to="/danh-muc/thong-bao">Thông báo</Link>
            <Link to="/gioi-thieu">Giới thiệu</Link>
            <Link to="/lien-he">Liên hệ</Link>
          </div>
          <div>
            <h4>Danh mục</h4>
            {cats.slice(0, 5).map((c) => <Link key={c.id} to={`/danh-muc/${c.slug}`}>{c.name}</Link>)}
          </div>
          <div>
            <h4>Liên hệ</h4>
            <span>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
            <span>Điện thoại: 0236 123 4567</span>
            <span>Email: lienhe@truong.edu.vn</span>
            <span>Thứ 2 – Thứ 6: 7:30 – 17:00</span>
          </div>
        </div>
        <div className="pub-copy">© {new Date().getFullYear()} QL Sinh viên. Đã đăng ký bản quyền.</div>
      </footer>

      {top && <button className="pub-totop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Lên đầu trang">↑</button>}
    </div>
  );
}
