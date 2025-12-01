import axios from 'axios';

// Prefer environment configuration (Vite) and fall back to the local dev API port.
// When running services locally (npm run dev) the API gateway listens on port 3000.
// When running in Docker Compose the gateway may be exposed on host 8000 — override with VITE_API_URL.
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3000';

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
            (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }

        const tenantSlug = localStorage.getItem('tenantSlug');
        if (tenantSlug) {
            (config.headers as any)['x-tenant-slug'] = tenantSlug;
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
        if (!error.response) {
            try { localStorage.setItem('backendAvailable', 'false'); } catch (e) { /* ignore */ }
            console.error('API network error: backend may be offline', error);
        } else {
            try { localStorage.setItem('backendAvailable', 'true'); } catch (e) { /* ignore */ }
            console.error('API error response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });

            if (error.response.status === 401) {
                try { localStorage.removeItem('token'); localStorage.removeItem('tenantSlug'); } catch (e) { /* ignore */ }
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;

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
