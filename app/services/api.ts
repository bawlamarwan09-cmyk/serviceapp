// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.102:5000/api", 
});

export default api;
