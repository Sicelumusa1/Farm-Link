import axios from 'axios';

//base axios configurations

const axiosInstance = axios.create({
  baseURL: import.meta.env.BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export default axiosInstance;
