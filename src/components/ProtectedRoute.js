import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, rolRequerido }) => {
  const token = localStorage.getItem("token");

  // 1. Si no hay token, al login de una
  if (!token) {
    return <Navigate to="/" />;
  }

  // 2. Decodificar el token para ver el rol
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRol = payload.rol?.toUpperCase();

    // 3. Si la ruta pide ADMIN y el usuario es USER, lo mandamos fuera
    if (rolRequerido && userRol !== rolRequerido.toUpperCase()) {
      alert("No tienes permisos para acceder aquí 🚫");
      return <Navigate to="/productos" />;
    }
  } catch (error) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;