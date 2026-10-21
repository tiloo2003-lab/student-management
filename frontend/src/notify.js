import Swal from 'sweetalert2';

const PRIMARY = '#2f9bff';
const DANGER = '#dc2626';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  didOpen: (el) => {
    el.addEventListener('mouseenter', Swal.stopTimer);
    el.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const notify = (message, type = 'ok') =>
  Toast.fire({ icon: type === 'bad' ? 'error' : 'success', title: message });

export const confirmDialog = async ({ title = 'Xác nhận', text = '', confirmText = 'Đồng ý', danger = false } = {}) => {
  const result = await Swal.fire({
    icon: danger ? 'warning' : 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Hủy',
    confirmButtonColor: danger ? DANGER : PRIMARY,
    cancelButtonColor: '#9aa5b5',
    reverseButtons: true,
    focusCancel: danger,
  });
  return result.isConfirmed;
};

export const confirmDelete = (text = 'Dữ liệu sẽ bị xóa và không thể khôi phục.') =>
  confirmDialog({ title: 'Bạn có chắc muốn xóa?', text, confirmText: 'Xóa', danger: true });

export const confirmSave = (editing, what = 'dữ liệu') => confirmDialog({
  title: editing ? `Lưu thay đổi ${what}?` : `Thêm mới ${what}?`,
  text: editing ? 'Thông tin hiện tại sẽ được cập nhật.' : 'Dữ liệu mới sẽ được lưu vào hệ thống.',
  confirmText: editing ? 'Lưu thay đổi' : 'Thêm mới',
});

export const selectDialog = async ({ title, text = '', options, confirmText = 'Xuất PDF' }) => {
  const result = await Swal.fire({
    title,
    text,
    input: 'select',
    inputOptions: options,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Hủy',
    confirmButtonColor: PRIMARY,
    cancelButtonColor: '#9aa5b5',
    reverseButtons: true,
  });
  return result.isConfirmed ? result.value : null;
};

export const infoDialog = ({ title, html, icon = 'info' }) =>
  Swal.fire({ icon, title, html, confirmButtonText: 'Đã hiểu', confirmButtonColor: PRIMARY });
