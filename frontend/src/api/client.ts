import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthenticated - can trigger local auth state update if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
