import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Sistema de Cotizaciones</h1>
        <p className="subtitle">Decogreen</p>

        <div className="btn-group">
          <button onClick={() => navigate('/nueva')} className="btn-primary">
            ➕ Nueva Cotización
          </button>
          <button onClick={() => navigate('/historial')} className="btn-secondary">
            📄 Historial de Cotizaciones
          </button>
        </div>
      </div>
    </div>
  );
}