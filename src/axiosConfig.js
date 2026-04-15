import axios from "axios";

const clienteAxios = axios.create({
  baseURL: "http://localhost:8080/api",
});

clienteAxios.interceptors.request.use(
  (config) => {
    // 1. Extraer el token
    const token = localStorage.getItem("token");

    if (token) {
      // 2. Limpiar comillas (importante si usas JSON.stringify al guardar)
      const tokenLimpio = token.replace(/['"]+/g, '');
      
      // 3. Asegurar el formato exacto: Bearer[espacio]Token
      config.headers.Authorization = `Bearer ${tokenLimpio}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta (para el 401)
clienteAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default clienteAxios;