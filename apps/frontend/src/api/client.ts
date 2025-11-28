import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add tenant slug if available (usually from user context or selected tenant)
        // For now, we'll assume the user belongs to a tenant and we store it or derive it.
        // In our auth flow, the user login response should ideally return the tenant slug.
        // Let's assume we stored it in localStorage for now, or we need to fetch it.
        // For this hackathon, let's assume the user object has a tenantId or we store 'tenantSlug'.

        // Check if we have a stored tenant slug
        const tenantSlug = localStorage.getItem('tenantSlug');
        if (tenantSlug) {
            config.headers['x-tenant-slug'] = tenantSlug;
        } else if (user.tenantId) {
            // Fallback if we stored it in user object
            config.headers['x-tenant-slug'] = user.tenantId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
