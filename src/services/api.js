import axios from 'axios';

const api = axios.create({
  baseURL: 'https://back-deco-cotizaciones.onrender.com/api'
});

export default api;