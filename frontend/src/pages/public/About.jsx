import Icon from '../../components/Icon';
import { Link } from 'react-router-dom';
import useResource from '../../useResource';
import LoadError from '../../components/LoadError';
import { fmtNumber } from './likes';

const VALUES = [
  ['🎯', 'Mission', 'Train high-quality professionals who meet the needs of society and employers.'],
  ['🔭', 'Vision', 'Become a modern institution that puts learners first and promotes innovation.'],
  ['🤝', 'Core values', 'Responsibility, respect, cooperation and lifelong learning.'],
];

export default function About() {
  const { data, error, retry } = useResource('/home');
  const stats = data?.stats;

  return (
    <main className="pub-main">
      <div className="crumbs"><Link to="/">Home</Link><span>›</span><b>About</b></div>
      <h1 className="page-title">About our school</h1>
      <p className="page-sub">
        The student management system connects administrators, teachers and students on a single platform:
        class management, grades, attendance and quick news updates.
      </p>

      <div className="values">
        {VALUES.map(([, t, d], i) => (
          <div className="value" key={t}>
            <span><Icon name={['school', 'eye', 'book'][i]} width="30" height="30" /></span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>

      {error && <LoadError message={error} onRetry={retry} />}
      {stats && (
        <section className="cat-section">
          <h2 className="sec-title"><span>Our school in numbers</span></h2>
          <div className="num-grid">
            {[['students', 'Students'], ['teachers', 'Teachers'], ['departments', 'Departments'], ['courses', 'Course sections']].map(([k, l]) => (
              <div key={k}><b>{fmtNumber(stats[k])}</b><small>{l}</small></div>
            ))}
          </div>
        </section>
      )}

      <section className="cta">
        <div>
          <h2>Want to know more?</h2>
          <p>Contact us for advice and support.</p>
        </div>
        <Link to="/contact" className="hero-btn">Contact</Link>
      </section>
    </main>
  );
}
