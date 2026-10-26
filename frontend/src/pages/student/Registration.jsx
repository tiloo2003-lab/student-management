import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
import { confirmDialog } from '../../notify';
import { scheduleLabel } from '../../utils';

export default function Registration() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    api.get('/student/registration').then((r) => setData(r.data)).catch((e) => toast(errMsg(e), 'bad'));
  }, [toast]);

  useEffect(load, [load]);

  const act = async (course, method) => {
    const cancelling = method === 'delete';
    const ok = await confirmDialog({
      title: cancelling ? 'Cancel course registration?' : 'Register for this course section?',
      text: `${course.code} - ${course.subject.name} (${course.subject.credits} credits)`,
      confirmText: cancelling ? 'Cancel registration' : 'Register',
      danger: cancelling,
    });
    if (!ok) return;
    setBusy(course.id);
    try {
      const { data: res } = await api({ method, url: `/student/registration/${course.id}` });
      toast(res.message);
      load();
    } catch (e) {
      toast(errMsg(e), 'bad');
    } finally {
      setBusy(null);
    }
  };

  if (!data) return <Loading />;
  if (!data.semester) {
    return (
      <>
        <div className="page-head"><h1>Course registration</h1></div>
        <div className="card empty">No semester is currently open for registration.</div>
      </>
    );
  }

  const pct = Math.min(100, Math.round((data.credits / data.max_credits) * 100));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Course registration</h1>
          <div className="sub">{data.semester.name}</div>
        </div>
      </div>

      <div className="card">
        <div className="meter-head">
          <span>Credits registered</span>
          <b>{data.credits}/{data.max_credits}</b>
        </div>
        <div className="meter"><i className={pct >= 100 ? 'full' : ''} style={{ width: `${pct}%` }} /></div>
        <div className="sub" style={{ marginTop: 8 }}>
          Rules: at most {data.max_credits} credits per semester, no schedule conflicts, and no retaking subjects you have already passed.
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Section</th><th>Subject</th><th>Cr.</th><th>Teacher</th><th>Schedule</th><th>Room</th><th>Enrolled</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {data.courses.map((c) => {
                const r = c.registration;
                return (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>{c.subject.name}</td>
                    <td>{c.subject.credits}</td>
                    <td>{c.teacher?.user?.name}</td>
                    <td>{scheduleLabel(c)}</td>
                    <td>{c.room || '—'}</td>
                    <td>{c.enrollments_count}/{c.max_students}</td>
                    <td style={{ whiteSpace: 'normal', minWidth: 220 }}>
                      {r.registered ? <Badge color="green">Registered</Badge>
                        : r.eligible ? <Badge color="blue">Available</Badge>
                        : <ul className="reasons">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>}
                    </td>
                    <td className="actions">
                      {r.registered ? (
                        <button className="btn sm danger" disabled={!c.can_cancel || busy === c.id} onClick={() => act(c, 'delete')}
                          title={c.can_cancel ? '' : 'This section already has grades'}>Cancel</button>
                      ) : (
                        <button className="btn sm primary" disabled={!r.eligible || busy === c.id} onClick={() => act(c, 'post')}>Register</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
