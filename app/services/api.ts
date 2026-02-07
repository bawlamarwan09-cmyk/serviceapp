import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://192.168.100.97:3000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add token to all requests automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");

      // ✅ make sure headers object exists
      config.headers = config.headers ?? {};

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(`📤 ${String(config.method || "GET").toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      // keep logic: still return config
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// ✅ Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config?.url}`);
    return response;
  },
  async (error) => {
    // ✅ prevent crash if config/response missing (network error / timeout)
    const url = error?.config?.url || "UNKNOWN_URL";
    const status = error?.response?.status;
    const data = error?.response?.data;

    console.error(`❌ ${url}:`, data || error.message);

    // ✅ keep same logic: logout on 401
    if (status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      // Redirect to login screen if needed
    }

    return Promise.reject(error);
  }
);

export default api;
