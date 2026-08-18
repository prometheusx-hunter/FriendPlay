import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // HttpOnly JWT cookie পাঠাতে/গ্রহণ করতে এটা জরুরি
});

export default axiosClient;
