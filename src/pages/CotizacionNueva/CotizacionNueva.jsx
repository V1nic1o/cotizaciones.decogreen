import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CotizacionNueva.css';

export default function CotizacionNueva() {
  const [cliente, setCliente] = useState({ nombre: '', nit: '' });
  const [observaciones, setObservaciones] = useState('');
  const [productos, setProductos] = useState([
    { descripcion: '', cantidad: '', precioUnitario: '', total: 0, tipo: 'bien' }
  ]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const calcularTotales = (index) => {
    const nuevos = [...productos];
    const p = nuevos[index];
    const cantidad = parseFloat(p.cantidad) || 0;
    const precio = parseFloat(p.precioUnitario) || 0;
    p.total = cantidad * precio;
    setProductos(nuevos);
  };

  const agregarFila = () => {
    setProductos([
      ...productos,
      { descripcion: '', cantidad: '', precioUnitario: '', total: 0, tipo: 'bien' }
    ]);
  };

  const eliminarFila = (index) => {
    const nuevos = [...productos];
    nuevos.splice(index, 1);
    setProductos(nuevos);
  };

  const totalGeneral = productos.reduce((acc, p) => acc + Number(p.total), 0).toFixed(2);

  const guardarCotizacion = async () => {
    if (!cliente.nombre || !cliente.nit) {
      setMensaje('Por favor completa los datos del cliente.');
      return;
    }

    if (
      productos.length === 0 ||
      productos.some(p => !p.descripcion || !p.cantidad || !p.precioUnitario)
    ) {
      setMensaje('Verifica que todos los productos estén completos.');
      return;
    }

    try {
      const resCliente = await api.post('/clientes', cliente);
      const clienteId = resCliente.data.id;

      const resCotizacion = await api.post('/cotizaciones', {
        clienteId,
        productos,
        total: totalGeneral,
        observaciones
      });

      const cotizacionId = resCotizacion.data.cotizacionId;
      setMensaje('✅ Cotización guardada correctamente');

      // ⏱ delay de seguridad por latencia de DB
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const response = await api.get(`/cotizaciones/pdf/${cotizacionId}`, {
          responseType: 'blob'
        });

        const blob = response.data;
        const nombreArchivo = `cotizacion-${cliente.nombre.replace(/\s+/g, '_')}.pdf`;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = nombreArchivo;
        link.click();
      } catch (pdfError) {
        console.error('❌ Error al descargar el PDF:', pdfError.message);
        setMensaje('⚠️ Cotización guardada, pero falló la descarga del PDF');
      }

      // Limpiar formulario
      setCliente({ nombre: '', nit: '' });
      setObservaciones('');
      setProductos([
        { descripcion: '', cantidad: '', precioUnitario: '', total: 0, tipo: 'bien' }
      ]);

      setTimeout(() => {
        navigate('/historial');
      }, 1000);
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al guardar la cotización');
    }
  };

  return (
    <div className="cotizacion-container">
      <h2>Nueva Cotización</h2>

      <div className="cliente-form">
        <label>Nombre del Cliente</label>
        <input
          type="text"
          placeholder="Ej. Municipalidad de Antigua"
          value={cliente.nombre}
          onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
        />

        <label>NIT</label>
        <input
          type="text"
          placeholder="Ej. 1234567"
          value={cliente.nit}
          onChange={e => setCliente({ ...cliente, nit: e.target.value })}
        />

        <label>Observaciones</label>
        <textarea
          placeholder="Observaciones sobre la cotización..."
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          rows={3}
        />
      </div>

      <div className="productos">
        <h3>Productos</h3>
        {productos.map((p, index) => (
          <div className="fila-producto" key={index}>
            <label>Tipo</label>
            <select
              value={p.tipo}
              onChange={e => {
                const nuevos = [...productos];
                nuevos[index].tipo = e.target.value;
                setProductos(nuevos);
              }}
            >
              <option value="bien">Bien</option>
              <option value="servicio">Servicio</option>
            </select>

            <label>Descripción</label>
            <input
              type="text"
              placeholder="Ej. Grama, Agapanto..."
              value={p.descripcion}
              onChange={e => {
                const nuevos = [...productos];
                nuevos[index].descripcion = e.target.value;
                setProductos(nuevos);
              }}
            />

            <label>Cantidad</label>
            <input
              type="number"
              min="1"
              placeholder="Cantidad"
              value={p.cantidad}
              onChange={e => {
                const nuevos = [...productos];
                nuevos[index].cantidad = e.target.value;
                calcularTotales(index);
              }}
            />

            <label>Precio Unitario (Q)</label>
            <input
              type="number"
              min="0"
              placeholder="Ej. 5.00"
              value={p.precioUnitario}
              onChange={e => {
                const nuevos = [...productos];
                nuevos[index].precioUnitario = e.target.value;
                calcularTotales(index);
              }}
            />

            <span className="total-parcial">Q{p.total.toFixed(2)}</span>
            <button onClick={() => eliminarFila(index)}>❌</button>
          </div>
        ))}
        <button onClick={agregarFila} className="agregar">➕ Agregar producto</button>
      </div>

      <div className="resumen">
        <h3>Total: Q{totalGeneral}</h3>
        <button onClick={guardarCotizacion} className="guardar-btn">💾 Guardar Cotización</button>
      </div>

      {mensaje && <div className="mensaje-alerta">{mensaje}</div>}

      <div className="boton-flotante">
        <button onClick={() => navigate('/')} title="Ir a Inicio">🏠</button>
      </div>
    </div>
  );
}