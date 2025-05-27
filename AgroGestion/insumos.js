import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const formInsumo = document.getElementById('formInsumo');
const tablaInsumos = document.getElementById('tablaInsumos');
const insumosCol = collection(db, 'insumos');

// Registrar nuevo insumo
formInsumo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = formInsumo.nombreInsumo.value.trim();
  const tipo = formInsumo.tipoInsumo.value;
  const cantidad = parseFloat(formInsumo.cantidadInsumo.value);
  const fecha = formInsumo.fechaInsumo.value;

  if (!nombre || !tipo || !cantidad || !fecha) {
    alert("⚠️ Por favor completa todos los campos.");
    return;
  }

  try {
    await addDoc(insumosCol, {
      nombre,
      tipo,
      cantidad,
      fecha,
      timestamp: new Date()
    });

    formInsumo.reset();
    cargarInsumos();
  } catch (error) {
    console.error("❌ Error al registrar insumo:", error);
  }
});

// Cargar insumos en la tabla
async function cargarInsumos() {
  tablaInsumos.innerHTML = '';

  try {
    const q = query(insumosCol, orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
      const data = doc.data();

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${data.nombre}</td>
        <td>${data.tipo}</td>
        <td>${data.cantidad}</td>
        <td>${data.fecha}</td>
      `;
      tablaInsumos.appendChild(fila);
    });
  } catch (error) {
    console.error("❌ Error al cargar insumos:", error);
  }
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', cargarInsumos);
