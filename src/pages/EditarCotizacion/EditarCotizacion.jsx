import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './EditarCotizacion.css';

export default function EditarCotizacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({ nombre: '', nit: '' });
  const [clienteId, setClienteId] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await api.get('/cotizaciones');
        const cotizacion = res.data.find(c => c.id === parseInt(id));

        if (!cotizacion) {
          setMensaje('❌ Cotización no encontrada');
          return;
        }

        setCliente({
          nombre: cotizacion.Cliente.nombre,
          nit: cotizacion.Cliente.nit
        });
        setClienteId(cotizacion.Cliente.id);
        setObservaciones(cotizacion.observaciones || '');

        setProductos(
          cotizacion.DetalleCotizacions.map(p => ({
            descripcion: p.descripcion,
            cantidad: Number(p.cantidad),
            precioUnitario: Number(p.precioUnitario),
            total: Number(p.total),
            tipo: p.tipo || 'bien'
          }))
        );
      } catch (error) {
        console.error(error);
        setMensaje('❌ Error al cargar la cotización');
      }
    };

    cargarDatos();
  }, [id]);

  const handleChangeProducto = (index, campo, valor) => {
    const nuevos = [...productos];
    nuevos[index][campo] = campo === 'cantidad' || campo === 'precioUnitario'
      ? Number(valor)
      : valor;

    if (campo === 'cantidad' || campo === 'precioUnitario') {
      nuevos[index].total = nuevos[index].cantidad * nuevos[index].precioUnitario;
    }

    setProductos(nuevos);
  };

  const eliminarProducto = (index) => {
    const nuevos = [...productos];
    nuevos.splice(index, 1);
    setProductos(nuevos);
  };

  const agregarProducto = () => {
    setProductos([
      ...productos,
      {
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        total: 0,
        tipo: 'bien'
      }
    ]);
  };

  const guardarCambios = async () => {
    try {
      const total = productos.reduce((acc, p) => acc + p.total, 0).toFixed(2);

      await api.put(`/cotizaciones/${id}`, {
        clienteId,
        productos,
        total,
        observaciones
      });

      setMensaje('✅ Cotización actualizada correctamente');
      setTimeout(() => navigate('/historial'), 1500);
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al actualizar cotización');
    }
  };

  return (
    <div className="editar-container">
      <h2>Editar Cotización</h2>

      {mensaje && <div className="mensaje-alerta">{mensaje}</div>}

      <div className="cliente-form">
        <label>Nombre del Cliente</label>
        <input type="text" value={cliente.nombre} disabled />

        <label>NIT</label>
        <input type="text" value={cliente.nit} disabled />

        <label>Observaciones</label>
        <textarea
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          rows={3}
          placeholder="Editar observaciones..."
        />
      </div>

      <h3>Productos</h3>
      {productos.map((p, index) => (
        <div className="fila-producto" key={index}>
          <label>Descripción</label>
          <input
            type="text"
            value={p.descripcion}
            onChange={e => handleChangeProducto(index, 'descripcion', e.target.value)}
          />

          <label>Cantidad</label>
          <input
            type="number"
            value={p.cantidad}
            onChange={e => handleChangeProducto(index, 'cantidad', e.target.value)}
          />

          <label>Precio Unitario</label>
          <input
            type="number"
            value={p.precioUnitario}
            onChange={e => handleChangeProducto(index, 'precioUnitario', e.target.value)}
          />

          <label>Tipo</label>
          <select
            value={p.tipo}
            onChange={e => handleChangeProducto(index, 'tipo', e.target.value)}
          >
            <option value="bien">Bien</option>
            <option value="servicio">Servicio</option>
          </select>

          <p className="total-parcial">Total: Q{p.total.toFixed(2)}</p>

          <button
            style={{
              marginTop: '0.5rem',
              backgroundColor: '#d9534f',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px'
            }}
            onClick={() => eliminarProducto(index)}
          >
            ❌ Eliminar producto
          </button>
        </div>
      ))}

      <button
        className="agregar"
        style={{
          marginTop: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#2d6a4f',
          color: 'white',
          border: 'none',
          padding: '0.6rem',
          borderRadius: '6px',
          width: '100%'
        }}
        onClick={agregarProducto}
      >
        ➕ Agregar producto
      </button>

      <button className="guardar-btn" onClick={guardarCambios}>
        💾 Guardar Cambios
      </button>

      {/* ✅ Botón flotante para volver a historial */}
      <div className="boton-flotante">
        <button onClick={() => navigate('/historial')} title="Volver al historial">📋</button>
      </div>
    </div>
  );
}