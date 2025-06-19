import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import CotizacionNueva from './pages/CotizacionNueva/CotizacionNueva';
import HistorialCotizaciones from './pages/HistorialCotizaciones/HistorialCotizaciones';
import EditarCotizacion from './pages/EditarCotizacion/EditarCotizacion';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nueva" element={<CotizacionNueva />} />
          <Route path="/historial" element={<HistorialCotizaciones />} />
          <Route path="/editar/:id" element={<EditarCotizacion />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;