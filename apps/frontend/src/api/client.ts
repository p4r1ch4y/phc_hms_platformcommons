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
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Mark backend availability on responses
api.interceptors.response.use(
    (response) => {
        try { localStorage.setItem('backendAvailable', 'true'); } catch (e) { /* ignore */ }
        return response;
    },
    (error) => {
        // Network errors (no response) likely mean backend/gateway is down
        if (!error.response) {
            try { localStorage.setItem('backendAvailable', 'false'); } catch (e) { /* ignore */ }
            console.error('API network error: backend may be offline', error);
        }
        return Promise.reject(error);
    }
);

export default api;

// Health check helper - try /health and set a local flag
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const resp = await api.get('/health');
        if (resp.status === 200) {
            try { localStorage.setItem('backendAvailable', 'true'); } catch (e) { /* ignore */ }
            return true;
        }
    } catch (err) {
        try { localStorage.setItem('backendAvailable', 'false'); } catch (e) { /* ignore */ }
        return false;
    }
    try { localStorage.setItem('backendAvailable', 'false'); } catch (e) { /* ignore */ }
    return false;
};
