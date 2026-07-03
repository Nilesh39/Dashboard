import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  const isVercel = window.location.hostname.includes('vercel.app') || window.location.port === '';
  if (isVercel) {
    API_BASE_URL = '/api';
  } else {
    const backendHost = window.location.hostname || 'localhost';
    API_BASE_URL = `http://${backendHost}:8000/api`;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const profileApi = {
  getProfile: () => apiClient.get('/profile/'),
  updateProfile: (data) => apiClient.put('/profile/', data),
  resetProfile: () => apiClient.post('/profile/reset'),
  generateDemoData: (tier) => apiClient.post('/profile/generate-demo', { tier }),
};

export const reelsApi = {
  getReels: () => apiClient.get('/reels/'),
  createReel: (data) => apiClient.post('/reels/', data),
  updateReel: (id, data) => apiClient.put(`/reels/${id}`, data),
  duplicateReel: (id) => apiClient.post(`/reels/${id}/duplicate`),
  deleteReel: (id) => apiClient.delete(`/reels/${id}`),
  bulkUpdateReels: (reelsList) => apiClient.put('/reels/bulk/update', { reels: reelsList }),
};

export const analyticsApi = {
  getHistory: () => apiClient.get('/analytics/history'),
  addHistoryRecord: (data) => apiClient.post('/analytics/history', data),
  deleteHistoryRecord: (id) => apiClient.delete(`/analytics/history/${id}`),
};

export const audienceApi = {
  getAudience: () => apiClient.get('/audience/'),
  updateAudience: (data) => apiClient.put('/audience/', data),
};

export const automationApi = {
  getSettings: () => apiClient.get('/automation/settings'),
  updateSettings: (data) => apiClient.put('/automation/settings', data),
  getLogs: () => apiClient.get('/automation/logs'),
  clearLogs: () => apiClient.post('/automation/logs/clear'),
  triggerSync: () => apiClient.post('/automation/trigger-sync'),
};

export default apiClient;
