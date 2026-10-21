import { notify } from '../notify';

export const useToast = () => notify;

export const ToastProvider = ({ children }) => children;

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="Đóng">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Pager({ meta, onPage }) {
  if (!meta || meta.total === 0) return null;
  return (
    <div className="pager">
      <span>Hiển thị {meta.from}–{meta.to} / {meta.total} bản ghi</span>
      <div className="btns">
        <button className="btn sm" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>‹ Trước</button>
        <span>Trang {meta.current_page}/{meta.last_page}</span>
        <button className="btn sm" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>Sau ›</button>
      </div>
    </div>
  );
}

export const Badge = ({ color = 'gray', children }) => <span className={`badge ${color}`}>{children}</span>;

export const Loading = () => <div className="empty">Đang tải...</div>;
