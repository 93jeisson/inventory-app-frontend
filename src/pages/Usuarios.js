import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../axiosConfig";

const CONFIG_ROLES = {
  "ADMIN": { nombre: "ADMIN", clase: "bg-danger text-white", icon: "🛡️" },
  "USER": { nombre: "USER", clase: "bg-light text-dark border", icon: "👤" }
};

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [miRol, setMiRol] = useState("");
  const navigate = useNavigate();

  // ESTADOS DEL FORMULARIO
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "USER" });
  const [editando, setEditando] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  // 1. OBTENER INFORMACIÓN DEL USUARIO (TOKEN)
  const obtenerInfoUsuario = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const rolRaw = payload.rol || payload.role || "";
        const rolTexto = typeof rolRaw === 'object' ? rolRaw.nombre : rolRaw;
        setMiRol(rolTexto.toString().toUpperCase().trim());
      } catch (e) {
        console.error("Error al decodificar token", e);
      }
    }
  }, []);

  // 2. CARGAR LISTA DE USUARIOS
  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch (error) {
      toast.error("Error al obtener usuarios 🚫");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    obtenerInfoUsuario();
    cargarUsuarios();
  }, [cargarUsuarios, obtenerInfoUsuario]);

  // 3. MANEJADORES DEL FORMULARIO
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ nombre: "", email: "", password: "", rol: "USER" });
    setEditando(false);
    setUsuarioId(null);
  };

  const prepararEdicion = (u) => {
    setEditando(true);
    setUsuarioId(u.id);
    const nombreRol = typeof u.rol === 'object' ? u.rol.nombre : u.rol;
    setForm({
      nombre: u.nombre,
      email: u.email,
      password: "", // Se deja vacío para no sobreescribir si no se desea cambiar
      rol: nombreRol || "USER"
    });
  };

  const eliminarUsuario = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast.success("Usuario eliminado 🗑️");
        cargarUsuarios();
      } catch (error) {
        toast.error("No se pudo eliminar el usuario");
      }
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Construimos el objeto EXACTO que pide tu UsuarioRequestDTO
  const usuarioParaEnviar = {
    nombre: form.nombre,
    email: form.email,
    password: form.password,
    // Enviamos 'rolId' como un número Long (1 o 2)
    rolId: form.rol === "ADMIN" ? 1 : 2 
  };

  console.log("Enviando al Backend:", usuarioParaEnviar);

  try {
    if (editando) {
      // Para el PUT, enviamos el ID en la URL y los datos en el cuerpo
      await api.put(`/usuarios/${usuarioId}`, usuarioParaEnviar);
      toast.success("Usuario actualizado ✨");
    } else {
      // Para el POST, enviamos el DTO limpio
      await api.post("/usuarios", usuarioParaEnviar);
      toast.success("Usuario creado con éxito 👤");
    }
    
    resetForm();
    cargarUsuarios();
  } catch (error) {
    // Si hay un error de validación (ej: email inválido), el backend lo dirá aquí
    console.error("DETALLE DEL ERROR:", error.response?.data);
    const mensajeError = error.response?.data?.mensaje || "Error 400: Revisa los datos";
    toast.error(mensajeError);
  }
};

  // 4. PROTECCIÓN DE RUTA
  if (miRol !== "" && miRol !== "ADMIN") {
    return (
      <div className="container mt-5 py-5 text-center">
        <h2 className="fw-bold">🔒 Acceso Denegado</h2>
        <p>Tu rol ({miRol}) no tiene permisos para esta sección.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/productos")}>Volver</button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm rounded mb-4 border">
        <h2 className="fw-bold m-0">👥 Gestión de Personal</h2>
        <div className="d-flex gap-2">
          <Link to="/productos" className="btn btn-outline-primary fw-bold">📦 Productos</Link>
          <button className="btn btn-outline-danger fw-bold" onClick={() => { localStorage.clear(); navigate("/"); }}>Salir</button>
        </div>
      </div>

      <div className="row g-4">
        {/* COLUMNA FORMULARIO */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className={`p-3 ${editando ? 'bg-primary' : 'bg-dark'} text-white rounded-top`}>
              <h5 className="mb-0 fw-bold">{editando ? "Editar Usuario" : "Nuevo Usuario"}</h5>
            </div>
            <form className="p-4 bg-white border rounded-bottom" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">NOMBRE</label>
                <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">EMAIL</label>
                <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">PASSWORD</label>
                <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required={!editando} placeholder={editando ? "Dejar en blanco para no cambiar" : ""} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">ROL</label>
                <select name="rol" className="form-select" value={form.rol} onChange={handleChange}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button type="submit" className="btn btn-dark w-100 fw-bold">{editando ? "Actualizar" : "Guardar"}</button>
              {editando && <button type="button" className="btn btn-link w-100 mt-2 text-decoration-none text-muted" onClick={resetForm}>Cancelar</button>}
            </form>
          </div>
        </div>

        {/* COLUMNA TABLA */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 bg-white border">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Usuario</th>
                  <th>Nivel</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="text-center">Cargando usuarios...</td></tr>
                ) : (
                  usuarios.map((u) => {
                    const nombreRol = typeof u.rol === 'object' ? u.rol.nombre : u.rol;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="fw-bold">{u.nombre}</div>
                          <small className="text-muted">{u.email}</small>
                        </td>
                        <td>
                          <span className={`badge px-3 ${CONFIG_ROLES[nombreRol]?.clase || "bg-secondary text-white"}`}>
                            {CONFIG_ROLES[nombreRol]?.icon} {nombreRol}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-light border me-1" onClick={() => prepararEdicion(u)}>✏️</button>
                          <button className="btn btn-sm btn-light border text-danger" onClick={() => eliminarUsuario(u.id)}>🗑️</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;