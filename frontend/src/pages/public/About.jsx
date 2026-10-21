import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { fmtNumber } from './likes';

const VALUES = [
  ['🎯', 'Sứ mệnh', 'Đào tạo nguồn nhân lực chất lượng cao, đáp ứng nhu cầu của xã hội và doanh nghiệp.'],
  ['🔭', 'Tầm nhìn', 'Trở thành cơ sở giáo dục hiện đại, lấy người học làm trung tâm và đổi mới sáng tạo.'],
  ['🤝', 'Giá trị cốt lõi', 'Trách nhiệm, tôn trọng, hợp tác và không ngừng học hỏi.'],
];

export default function About() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/home').then((r) => setStats(r.data.stats)).catch(() => {}); }, []);

  return (
    <main className="pub-main">
      <div className="crumbs"><Link to="/">Trang chủ</Link><span>›</span><b>Giới thiệu</b></div>
      <h1 className="page-title">Giới thiệu về nhà trường</h1>
      <p className="page-sub">
        Hệ thống quản lý sinh viên giúp kết nối quản trị viên, giảng viên và sinh viên trên một nền tảng thống nhất:
        quản lý lớp học, điểm số, điểm danh và cập nhật tin tức nhanh chóng.
      </p>

      <div className="values">
        {VALUES.map(([icon, t, d]) => (
          <div className="value" key={t}>
            <span>{icon}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>

      {stats && (
        <section className="cat-section">
          <h2 className="sec-title"><span>Nhà trường trong những con số</span></h2>
          <div className="num-grid">
            {[['students', 'Sinh viên'], ['teachers', 'Giảng viên'], ['departments', 'Khoa đào tạo'], ['courses', 'Lớp học phần']].map(([k, l]) => (
              <div key={k}><b>{fmtNumber(stats[k])}</b><small>{l}</small></div>
            ))}
          </div>
        </section>
      )}

      <section className="cta">
        <div>
          <h2>Muốn biết thêm thông tin?</h2>
          <p>Liên hệ với chúng tôi để được tư vấn và hỗ trợ.</p>
        </div>
        <Link to="/lien-he" className="hero-btn">Liên hệ</Link>
      </section>
    </main>
  );
}
