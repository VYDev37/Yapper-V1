import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 1337}/api/`),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // cookies
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (axios.isAxiosError(error)) {
            const customMessage = error.response?.data?.message || error.message || 'Something went wrong.';
            return Promise.reject(new Error(customMessage));
        }

        return Promise.reject(new Error('Unexpected error occurred.'));
    }
);


export default axiosInstance;