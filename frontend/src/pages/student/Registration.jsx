import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { Badge, Loading, useToast } from '../../components/ui';
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
        <div className="page-head"><h1>Đăng ký học phần</h1></div>
        <div className="card empty">Hiện chưa có học kỳ nào đang mở đăng ký.</div>
      </>
    );
  }

  const pct = Math.min(100, Math.round((data.credits / data.max_credits) * 100));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Đăng ký học phần</h1>
          <div className="sub">{data.semester.name}</div>
        </div>
      </div>

      <div className="card">
        <div className="meter-head">
          <span>Tín chỉ đã đăng ký</span>
          <b>{data.credits}/{data.max_credits}</b>
        </div>
        <div className="meter"><i className={pct >= 100 ? 'full' : ''} style={{ width: `${pct}%` }} /></div>
        <div className="sub" style={{ marginTop: 8 }}>
          Quy định: tối đa {data.max_credits} tín chỉ mỗi học kỳ, không trùng lịch, không đăng ký lại môn đã đạt.
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Mã LHP</th><th>Môn học</th><th>TC</th><th>Giáo viên</th><th>Lịch học</th><th>Phòng</th><th>Sĩ số</th><th>Trạng thái</th><th /></tr>
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
                      {r.registered ? <Badge color="green">Đã đăng ký</Badge>
                        : r.eligible ? <Badge color="blue">Có thể đăng ký</Badge>
                        : <ul className="reasons">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>}
                    </td>
                    <td className="actions">
                      {r.registered ? (
                        <button className="btn sm danger" disabled={!c.can_cancel || busy === c.id} onClick={() => act(c, 'delete')}
                          title={c.can_cancel ? '' : 'Lớp đã có điểm'}>Hủy</button>
                      ) : (
                        <button className="btn sm primary" disabled={!r.eligible || busy === c.id} onClick={() => act(c, 'post')}>Đăng ký</button>
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
