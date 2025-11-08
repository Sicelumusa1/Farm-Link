// import axios from 'axios';

// //base axios configurations

// const axiosInstance = axios.create({
//   baseURL: process.env.BASEURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true
// });

// export default axiosInstance;

import axios from 'axios';

// Base axios configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axiosInstance;