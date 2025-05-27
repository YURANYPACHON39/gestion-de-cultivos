// reportes.js
import { db } from './firebase-config.js';  
// Importa la instancia de la base de datos Firebase configurada para usar en este archivo

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";  
// Importa funciones específicas de Firestore para manejar colecciones y obtener documentos

// Elementos del DOM
const graficaCanvas = document.getElementById('graficoCultivos')?.getContext('2d');  
// Busca en el documento el elemento con id 'graficoCultivos', si existe, obtiene el contexto 2D para dibujar gráficos

const reporteCultivos = document.getElementById('reporteCultivos');  
// Busca el elemento donde se mostrará la lista de cultivos (generalmente un <ul> o <div>)

const filtroForm = document.getElementById('formReporteFiltro');  
// Obtiene el formulario que permite filtrar los cultivos por tipo

const botonExportarPDF = document.getElementById("btnExportarPDF");  
// Obtiene el botón que al hacer clic permitirá exportar el gráfico en formato PDF

const canvas = document.getElementById("graficoCultivos");  
// Obtiene el elemento canvas para manipularlo visualmente (mostrar/ocultar, exportar imagen)

const mensaje = document.getElementById("mensajeSinDatos");  
// Obtiene el elemento donde se mostrará un mensaje si no hay datos para mostrar

let datosCultivo = {};  
// Variable que guardará los datos agrupados de cultivos (tipo y cantidad)

let chart = null;  
// Variable para almacenar la instancia del gráfico creado, para poder destruirlo si se actualiza

// Función para obtener y agrupar cultivos por tipo desde Firestore
async function obtenerDatosCultivos() {
  datosCultivo = {};  
  // Reinicia el objeto para no acumular datos antiguos

  try {
    const cultivosCol = collection(db, "cultivos");  
    // Crea una referencia a la colección "cultivos" en la base de datos Firestore

    const snapshot = await getDocs(cultivosCol);  
    // Solicita todos los documentos de esa colección, espera a que se obtengan (asincrónico)

    snapshot.forEach(doc => {  
      // Recorre cada documento recibido en la consulta

      const cultivo = doc.data().tipoPlanta || "Desconocido";  
      // Extrae el campo "tipoPlanta" del documento; si no existe, usa "Desconocido"

      datosCultivo[cultivo] = (datosCultivo[cultivo] || 0) + 1;  
      // Suma 1 al contador del tipo de cultivo, si no existe, inicia en 0 y luego suma 1
    });

    mostrarListaCultivos(datosCultivo);  
    // Llama a la función que mostrará la lista de cultivos agrupados en el HTML

    generarGrafico(datosCultivo);  
    // Llama a la función que creará el gráfico de barras con los datos obtenidos
  } catch (error) {
    console.error("Error al obtener cultivos:", error);  
    // En caso de error al acceder a Firestore, lo imprime en la consola para debug
  }
}

// Función para mostrar la lista simple de cultivos debajo del gráfico
function mostrarListaCultivos(datos) {
  if (!reporteCultivos) return;  
  // Verifica que el elemento exista en el DOM; si no, no hace nada

  reporteCultivos.innerHTML = '';  
  // Limpia cualquier contenido previo dentro del contenedor para mostrar lista nueva

  for (const tipo in datos) {  
    // Recorre cada tipo de cultivo en el objeto datos

    const li = document.createElement('li');  
    // Crea un nuevo elemento de lista <li>

    li.textContent = `${tipo}: ${datos[tipo]}`;  
    // Asigna el texto del tipo y la cantidad correspondiente

    reporteCultivos.appendChild(li);  
    // Añade el elemento <li> creado al contenedor en el DOM
  }
}

// Función para generar un gráfico de barras usando Chart.js con los datos de cultivos
function generarGrafico(datos) {
  if (!graficaCanvas) return;  
  // Verifica que exista el contexto del canvas para dibujar; si no, sale

  const etiquetas = Object.keys(datos);  
  // Obtiene un arreglo con los nombres de los tipos de cultivos (etiquetas)

  const valores = Object.values(datos);  
  // Obtiene un arreglo con las cantidades correspondientes a cada tipo

  if (chart) chart.destroy();  
  // Si ya hay un gráfico creado, lo destruye para evitar superposición

  if (etiquetas.length === 0) {  
    // Si no hay datos (arreglo vacío)

    canvas.style.display = "none";  
    // Oculta el canvas para que no se muestre un gráfico vacío

    mensaje.style.display = "block";  
    // Muestra el mensaje que indica que no hay datos disponibles

    botonExportarPDF.disabled = true;  
    // Deshabilita el botón de exportar porque no hay gráfico para exportar

    return;  
    // Termina la ejecución de la función
  }

  canvas.style.display = "block";  
  // Muestra el canvas donde se dibujará el gráfico

  mensaje.style.display = "none";  
  // Oculta el mensaje de "sin datos" porque ya hay datos

  botonExportarPDF.disabled = false;  
  // Habilita el botón de exportar a PDF

  chart = new Chart(graficaCanvas, {
    type: 'bar',  
    // Define que el gráfico será de barras

    data: {
      labels: etiquetas,  
      // Asigna las etiquetas de cada barra con los tipos de cultivo

      datasets: [{
        label: 'Cantidad de Cultivos por Tipo',  
        // Etiqueta del conjunto de datos para mostrar en tooltip o leyenda (aunque está oculta)

        data: valores,  
        // Datos numéricos que representan la cantidad de cultivos por tipo

        backgroundColor: 'rgba(94, 42, 126, 0.6)'  
        // Color púrpura semi-transparente para las barras
      }]
    },

    options: {
      responsive: true,  
      // Hace que el gráfico se ajuste automáticamente al tamaño del contenedor

      plugins: {
        legend: { display: false },  
        // Oculta la leyenda del gráfico

        title: {
          display: true,  
          // Muestra el título del gráfico

          text: 'Distribución de Cultivos por Tipo'  
          // Texto que aparecerá como título
        }
      },

      scales: {
        y: {
          beginAtZero: true,  
          // El eje Y empieza desde 0 para mejor visualización

          ticks: { precision: 0 }  
          // Los números en el eje Y no mostrarán decimales (enteros)
        }
      }
    }
  });
}

// Evento para filtrar cultivos según el texto ingresado en el formulario
filtroForm?.addEventListener("submit", (e) => {
  e.preventDefault();  
  // Evita que el formulario haga reload o submit normal de la página

  const filtro = document.getElementById("filtroTipo").value.toLowerCase();  
  // Obtiene el texto del campo filtro, convertido a minúsculas para búsqueda insensible a mayúsculas

  const datosFiltrados = {};  
  // Objeto para almacenar cultivos que coincidan con el filtro

  for (const [tipo, cantidad] of Object.entries(datosCultivo)) {  
    // Recorre los cultivos obtenidos previamente

    if (tipo.toLowerCase().includes(filtro)) {  
      // Si el tipo de cultivo contiene el texto ingresado en el filtro

      datosFiltrados[tipo] = cantidad;  
      // Agrega ese tipo y su cantidad a los datos filtrados
    }
  }

  mostrarListaCultivos(datosFiltrados);  
  // Actualiza la lista en el DOM con los datos que coinciden con el filtro

  generarGrafico(datosFiltrados);  
  // Actualiza el gráfico con los datos filtrados
});

// Evento para exportar el gráfico actual a un archivo PDF
botonExportarPDF?.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;  
  // Obtiene el objeto jsPDF desde la librería cargada en el navegador

  if (!canvas) return;  
  // Si no existe el canvas, no se puede exportar, así que sale

  const imgData = canvas.toDataURL("image/png");  
  // Convierte el contenido del canvas en una imagen PNG en formato base64

  const pdf = new jsPDF("landscape");  
  // Crea un nuevo documento PDF en orientación horizontal (landscape)

  pdf.text("Reporte de Cultivos", 10, 10);  
  // Escribe un título en el PDF en la posición (x=10, y=10)

  pdf.addImage(imgData, "PNG", 10, 20, 260, 120);  
  // Añade la imagen del gráfico al PDF, ajustando posición y tamaño

  pdf.save("reporte_cultivos.pdf");  
  // Descarga el archivo PDF con el nombre indicado
});

// Cuando el documento HTML esté completamente cargado y listo
document.addEventListener("DOMContentLoaded", obtenerDatosCultivos);  
// Llama a la función para obtener datos y generar la visualización inicial
