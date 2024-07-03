import axios from 'axios';

//base axios configurations

const axiosInstance = axios.create({
  baseURL: 'https://farm-link.onrender.com/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export default axiosInstance;
