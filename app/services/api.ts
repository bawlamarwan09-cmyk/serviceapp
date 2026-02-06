import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ✅ YOUR BACKEND URL
// For development, use your computer's IP address, NOT localhost
const API_URL = 'http://192.168.100.97:3000/api'; // Replace with YOUR IP

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add token to all requests automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`❌ ${error.config?.url}:`, error.response?.data || error.message);
    
    // If token is invalid, logout
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Redirect to login screen if needed
    }
    
    return Promise.reject(error);
  }
);

export default api;