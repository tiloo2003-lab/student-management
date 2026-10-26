import api, { errMsg } from './api';
import { notify } from './notify';

const readError = async (error) => {
  const data = error.response?.data;
  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text());
      return json.message || 'Could not export the file';
    } catch {
      return 'Could not export the file';
    }
  }
  return errMsg(error);
};

export async function exportPdf(url, params = {}, fallbackName = 'document.pdf') {
  try {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    const res = await api.get(url, { params: clean, responseType: 'blob' });
    const match = /filename="?([^";]+)"?/i.exec(res.headers['content-disposition'] || '');
    const blobUrl = URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = match ? match[1] : fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    notify('PDF exported');
    return true;
  } catch (error) {
    notify(await readError(error), 'bad');
    return false;
  }
}
