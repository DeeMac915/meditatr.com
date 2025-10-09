import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        // Get Firebase auth token dynamically
        const { auth } = await import("./firebase");
        const user = auth.currentUser;

        if (user) {
            try {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error("Failed to get Firebase token:", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to sign in
            window.location.href = "/auth/signin";
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    getProfile: () => api.get("/auth/profile"),
    updateProfile: (data) => api.put("/auth/profile", data),
    syncUser: () => api.post("/auth/sync"),
};

// Meditation API
export const meditationAPI = {
    generateScript: (data) => api.post("/meditation/generate-script", data),
    updateScript: (id, script) =>
        api.put(`/meditation/${id}/script`, { script }),
    rewriteScript: (id, data) => api.post(`/meditation/${id}/rewrite`, data),
    processMeditation: (id) => api.post(`/meditation/${id}/process`),
    getMeditations: (params) => api.get("/meditation", { params }),
    getMeditation: (id) => api.get(`/meditation/${id}`),
};

// Payment API
export const paymentAPI = {
    createStripeIntent: (meditationId) =>
        api.post("/payment/stripe/create-intent", { meditationId }),
    confirmStripePayment: (paymentIntentId) =>
        api.post("/payment/stripe/confirm", { paymentIntentId }),
    createPayPalPayment: (meditationId) =>
        api.post("/payment/paypal/create", { meditationId }),
    executePayPalPayment: (paymentId, payerId) =>
        api.post("/payment/paypal/execute", { paymentId, payerId }),
    getPaymentHistory: (params) => api.get("/payment/history", { params }),
    getPaymentStatus: (meditationId) =>
        api.get(`/payment/meditation/${meditationId}/status`),
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get("/admin/dashboard"),
    getUsers: (params) => api.get("/admin/users", { params }),
    getMeditations: (params) => api.get("/admin/meditations", { params }),
    getPayments: (params) => api.get("/admin/payments", { params }),
    getUserDetails: (id) => api.get(`/admin/users/${id}`),
    updateMeditationStatus: (id, status) =>
        api.put(`/admin/meditations/${id}/status`, { status }),
    getHealth: () => api.get("/admin/health"),
};

export default api;
