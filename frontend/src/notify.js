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

export const confirmDialog = async ({ title = 'Confirm', text = '', confirmText = 'Confirm', danger = false } = {}) => {
  const result = await Swal.fire({
    icon: danger ? 'warning' : 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    confirmButtonColor: danger ? DANGER : PRIMARY,
    cancelButtonColor: '#9aa5b5',
    reverseButtons: true,
    focusCancel: danger,
  });
  return result.isConfirmed;
};

export const confirmDelete = (text = 'This will be permanently deleted and cannot be restored.') =>
  confirmDialog({ title: 'Are you sure you want to delete?', text, confirmText: 'Delete', danger: true });

export const confirmSave = (editing, what = 'this record') => confirmDialog({
  title: editing ? `Save changes to ${what}?` : `Add new ${what}?`,
  text: editing ? 'The existing information will be updated.' : 'The new record will be saved to the system.',
  confirmText: editing ? 'Save changes' : 'Add',
});

export const selectDialog = async ({ title, text = '', options, confirmText = 'Export PDF' }) => {
  const result = await Swal.fire({
    title,
    text,
    input: 'select',
    inputOptions: options,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    confirmButtonColor: PRIMARY,
    cancelButtonColor: '#9aa5b5',
    reverseButtons: true,
  });
  return result.isConfirmed ? result.value : null;
};

export const infoDialog = ({ title, html, icon = 'info' }) =>
  Swal.fire({ icon, title, html, confirmButtonText: 'Got it', confirmButtonColor: PRIMARY });
