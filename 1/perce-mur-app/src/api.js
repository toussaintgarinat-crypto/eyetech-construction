import axios from 'axios';

const API_URL = 'http://localhost:8001/api/';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour définir le token JWT dans les en-têtes des requêtes
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Intercepteur requête — ajoute le token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// Variable pour éviter les boucles de refresh
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// Intercepteur réponse — refresh automatique sur 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const baseURL = api.defaults.baseURL
        const { data } = await axios.post(`${baseURL}token/refresh/`, {
          refresh: refreshToken
        })

        localStorage.setItem('access_token', data.access)
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh)

        api.defaults.headers.common.Authorization = `Bearer ${data.access}`
        originalRequest.headers.Authorization = `Bearer ${data.access}`

        processQueue(null, data.access)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Fonction logout sécurisée — blackliste le token côté backend
export async function logout() {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await api.post('token/blacklist/', { refresh: refreshToken })
    }
  } catch (e) {
    // Ignore les erreurs — déconnecte quand même
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }
}

// Fonctions d'authentification
export const login = (email, password) => api.post('token/', { email, password });
export const refreshToken = (refresh) => api.post("token/refresh/", { refresh });

// Fonctions pour les utilisateurs
export const registerUser = (userData) => api.post('users/', userData);
export const getUserProfile = (userId) => api.get(`users/${userId}/`);

// Fonctions pour les projets
export const getProjects = () => api.get('projects/');
export const createProject = (projectData) => api.post('projects/', projectData);
export const getProjectDetails = (projectId) => api.get(`projects/${projectId}/`);

// Fonctions pour les points de perçage
export const getDrillingPoints = (projectId) => api.get(`drilling-points/?project=${projectId}`);
export const createDrillingPoint = (drillingPointData) => api.post('drilling-points/', drillingPointData);

// Fonctions pour les mesures AR
export const getARMeasurements = (projectId) => api.get(`ar-measurements/?project=${projectId}`);
export const createARMeasurement = (arMeasurementData) => api.post('ar-measurements/', arMeasurementData);

// Fonctions pour les photos
export const uploadPhoto = (photoData) => {
  const formData = new FormData();
  for (const key in photoData) {
    formData.append(key, photoData[key]);
  }
  return api.post('photos/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Fonctions pour les plans d'impression
export const uploadPrintPlan = (printPlanData) => {
  const formData = new FormData();
  for (const key in printPlanData) {
    formData.append(key, printPlanData[key]);
  }
  return api.post('print-plans/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
