import api from "./axios";

export const fileAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'text'
    });
  }
};