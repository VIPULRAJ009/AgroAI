import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== "undefined") {
            console.log('Attaching token to request:', token.substring(0, 10) + '...');
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('No valid token found in localStorage');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
