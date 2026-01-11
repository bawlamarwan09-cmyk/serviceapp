// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.100.216:5000/api", 
});

export default api;
