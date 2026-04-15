import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Importante: evita que la página se recargue
    
    if (!email || !password) {
      return toast.warn("Por favor, completa todos los campos 📝");
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8080/api/usuarios/login",
        { email, password }
      );

      // 🔑 ACLARACIÓN: Si tu backend devuelve el token dentro de un objeto
      // cámbialo a: response.data.token o response.data (según tu API)
      const token = typeof response.data === 'string' ? response.data : response.data.token;
      
      if (token) {
        localStorage.setItem("token", token);
        toast.success("Bienvenido al sistema 🔥");
        
        // Pequeño truco para que el Navbar se entere del cambio de token inmediatamente
        window.location.href = "/productos"; 
      }
    } catch (error) {
      console.error(error);
      toast.error("Credenciales incorrectas o error de servidor ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      {/* 🎬 Animación de entrada para la tarjeta */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card shadow-lg p-4 border-0" 
        style={{ width: "380px", borderRadius: "15px" }}
      >
        <div className="text-center mb-4">
          <div className="display-4 mb-2">🔐</div>
          <h3 className="fw-bold">Iniciar Sesión</h3>
          <p className="text-muted small">Ingresa tus credenciales de acceso</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Email</label>
            <input
              className="form-control form-control-lg border-0 bg-light shadow-none"
              type="email"
              placeholder="nombre@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Contraseña</label>
            <input
              className="form-control form-control-lg border-0 bg-light shadow-none"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              "Ingresar al Panel"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;