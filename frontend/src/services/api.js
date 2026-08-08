import axios from 'axios';

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL;
  if (url) {
    if (url.startsWith('hhttps://')) {
      url = url.replace(/^h+ttps:\/\//, 'https://');
    }
    return url;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
