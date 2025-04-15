// src/lib/api.ts
import axios from "axios";

// Assuming your backend is running locally
const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

export default api;

