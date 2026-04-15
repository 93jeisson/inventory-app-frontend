import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../axiosConfig";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", cantidad: "" });
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const [miRol, setMiRol] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const rolRaw = payload.rol || payload.role || payload.authorities?.[0] || "";
        const rolLimpio = rolRaw.toString().toUpperCase().replace("ROLE_", "").trim();
        setMiRol(rolLimpio);
      } catch (e) {
        console.error("Error al leer el token");
      }
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/productos");
      setProductos(data);
    } catch (error) {
      toast.error("Error al cargar la lista 📦");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio), 
      cantidad: parseInt(form.cantidad) 
    };

    try {
      if (editando) {
        await api.put(`/productos/${productoId}`, { id: productoId, ...payload });
        toast.success("Actualizado correctamente ✅");
      } else {
        await api.post("/productos", payload);
        toast.success("Registrado 🔥");
      }
      resetForm();
      cargarProductos();
    } catch (error) {
      toast.error("Error en la operación ❌");
    }
  };

  const editar = (p) => {
    setEditando(true);
    setProductoId(p.id);
    setForm({ 
      nombre: p.nombre, 
      descripcion: p.descripcion || "", 
      precio: p.precio, 
      cantidad: p.cantidad 
    });
  };

  const resetForm = () => {
    setForm({ nombre: "", descripcion: "", precio: "", cantidad: "" });
    setEditando(false);
    setProductoId(null);
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Confirmas la eliminación?")) return;
    try {
      await api.delete(`/productos/${id}`);
      toast.info("Eliminado 🗑️");
      cargarProductos();
    } catch (error) {
      toast.error("No se pudo eliminar ❌");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // 💡 Lógica visual: El formulario sale si eres ADMIN o si estás editando un producto
  const mostrarForm = miRol === "ADMIN" || editando;
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm rounded-3 mb-4 border">
        <div>
          <h2 className="fw-bold m-0 text-primary">📦 Inventario</h2>
          <small className="text-muted text-uppercase fw-bold">Rol: {miRol || "Cargando..."}</small>
        </div>
        <div className="d-flex gap-2">
          {miRol === "ADMIN" && <Link to="/usuarios" className="btn btn-dark fw-bold px-4">👥 Usuarios</Link>}
          <button className="btn btn-outline-danger fw-bold" onClick={logout}>Salir 🚪</button>
        </div>
      </div>

      <div className="row g-4">
        {/* 📝 FORMULARIO DINÁMICO */}
        {mostrarForm && (
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
              <div className={`p-3 ${editando ? 'bg-warning text-dark' : 'bg-success text-white'}`}>
                <h5 className="mb-0 fw-bold">
                  {miRol === "ADMIN" ? (editando ? "✏️ Editar Producto" : "➕ Nuevo Registro") : "📦 Ajustar Stock"}
                </h5>
              </div>
              <form onSubmit={handleSubmit} className="p-4 bg-white border">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Nombre</label>
                  <input name="nombre" className="form-control bg-light" value={form.nombre} onChange={handleChange} 
                    disabled={miRol !== "ADMIN"} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Descripción</label>
                  <textarea name="descripcion" className="form-control bg-light" value={form.descripcion} onChange={handleChange} 
                    disabled={miRol !== "ADMIN"} rows="2" />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Precio</label>
                    <input name="precio" type="number" step="0.01" className="form-control bg-light" value={form.precio} onChange={handleChange} 
                      disabled={miRol !== "ADMIN"} required />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold text-primary">Cantidad (Stock)</label>
                    <input name="cantidad" type="number" className="form-control border-primary fw-bold" value={form.cantidad} onChange={handleChange} required />
                  </div>
                </div>
                <button type="submit" className={`btn btn-lg w-100 fw-bold shadow-sm ${editando ? 'btn-warning' : 'btn-success'}`}>
                  {editando ? "Guardar Cambios" : "Agregar Producto"}
                </button>
                <button type="button" className="btn btn-link w-100 mt-2 text-muted" onClick={resetForm}>Cancelar</button>
              </form>
            </div>
          </div>
        )}

        {/* 📋 LISTADO */}
        <div className={mostrarForm ? "col-lg-8" : "col-lg-12"}>
          <div className="card shadow-sm border-0 rounded-3 p-4 bg-white border">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h5 className="fw-bold m-0 text-uppercase small text-muted">Existencias</h5>
              <input className="form-control bg-light border-0 w-25" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Stock</th>
                    <th className="text-end">Precio</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && filtrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="fw-bold">{p.nombre}</div>
                        <small className="text-muted">{p.descripcion}</small>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${p.cantidad < 5 ? 'bg-danger' : 'bg-light text-dark border'}`}>
                          {p.cantidad} uds
                        </span>
                      </td>
                      <td className="text-end fw-bold text-success">{formatMoney(p.precio)}</td>
                      <td className="text-center">
                        {/* El botón de editar ahora es visible para ADMIN y USER */}
                        <button className="btn btn-sm btn-light border-0 me-1" onClick={() => editar(p)}>
                          {miRol === "ADMIN" ? "✏️" : "📦 Stock"}
                        </button>
                        {miRol === "ADMIN" && (
                          <button className="btn btn-sm btn-light text-danger border-0" onClick={() => eliminar(p.id)}>🗑️</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productos;