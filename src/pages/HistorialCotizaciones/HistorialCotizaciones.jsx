import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './HistorialCotizaciones.css';

export default function HistorialCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filtros, setFiltros] = useState({
    clienteNombre: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const obtenerCotizaciones = async () => {
    try {
      const res = await api.get('/cotizaciones', { params: filtros });
      setCotizaciones(res.data);
      setMensaje('');
    } catch (err) {
      setMensaje('❌ Error al cargar cotizaciones');
    }
  };

  useEffect(() => {
    obtenerCotizaciones();
  }, []);

  const handleDescargarPDF = async (id, nombreCliente) => {
    try {
      const response = await api.get(`/cotizaciones/pdf/${id}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const nombreArchivo = `cotizacion-${nombreCliente.replace(/\s+/g, '_')}.pdf`;

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = nombreArchivo;
      link.click();
    } catch (error) {
      if (error.response?.status === 400) {
        setMensaje('⚠️ La cotización está incompleta. No se puede generar el PDF.');
      } else {
        console.error('Error al descargar el PDF:', error);
        setMensaje('❌ Error inesperado al generar el PDF.');
      }
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/cotizaciones/estado/${id}`, { estado: nuevoEstado });
      setMensaje('✅ Estado actualizado correctamente');
      obtenerCotizaciones();
    } catch (err) {
      setMensaje('❌ Error al actualizar el estado');
    }
  };

  const eliminarCotizacion = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cotización?')) return;

    try {
      await api.delete(`/cotizaciones/${id}`);
      setMensaje('🗑️ Cotización eliminada correctamente');
      obtenerCotizaciones();
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al eliminar la cotización');
    }
  };

  return (
    <div className="historial-container">
      <h2>Historial de Cotizaciones</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por cliente"
          value={filtros.clienteNombre}
          onChange={e => setFiltros({ ...filtros, clienteNombre: e.target.value })}
        />
        <select
          value={filtros.estado}
          onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="entregada">Entregada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <input
          type="date"
          value={filtros.fechaDesde}
          onChange={e => setFiltros({ ...filtros, fechaDesde: e.target.value })}
        />
        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={e => setFiltros({ ...filtros, fechaHasta: e.target.value })}
        />
        <button onClick={obtenerCotizaciones}>🔍 Filtrar</button>
      </div>

      {mensaje && <div className="mensaje-alerta">{mensaje}</div>}

      <div className="lista-cotizaciones">
        {cotizaciones.map(c => (
          <div className="card-cotizacion" key={c.id}>
            <p><strong>Cliente:</strong> {c.Cliente.nombre}</p>
            <p><strong>Fecha:</strong> {new Date(c.fecha).toLocaleDateString()}</p>
            <p><strong>Total:</strong> Q{c.total}</p>

            {c.observaciones && (
              <p><strong>Observaciones:</strong> {c.observaciones}</p>
            )}

            <p><strong>Estado:</strong></p>
            <select
              value={c.estado}
              onChange={e => actualizarEstado(c.id, e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="entregada">Entregada</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <div className="botones-cotizacion">
              <button onClick={() => handleDescargarPDF(c.id, c.Cliente.nombre)}>📄 Descargar PDF</button>
              <button onClick={() => navigate(`/editar/${c.id}`)}>✏️ Editar</button>
              <button onClick={() => eliminarCotizacion(c.id)} className="eliminar-btn">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="botones-flotantes">
        <button onClick={() => navigate('/')} title="Ir a inicio">🏠</button>
        <button onClick={() => navigate('/nueva')} title="Nueva cotización">➕</button>
      </div>
    </div>
  );
}