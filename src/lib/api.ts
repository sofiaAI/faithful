// src/lib/api.ts
import axios from "axios";

// Assuming your backend is running locally
const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`  // Send the JWT in the header
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;


