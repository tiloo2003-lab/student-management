import { notify } from '../notify';

export const useToast = () => notify;

export const ToastProvider = ({ children }) => children;

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
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
      <span>Showing {meta.from}–{meta.to} of {meta.total} records</span>
      <div className="btns">
        <button className="btn sm" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>‹ Previous</button>
        <span>Page {meta.current_page}/{meta.last_page}</span>
        <button className="btn sm" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>Next ›</button>
      </div>
    </div>
  );
}

export const Badge = ({ color = 'gray', children }) => <span className={`badge ${color}`}>{children}</span>;

export const Loading = () => <div className="empty">Loading...</div>;
