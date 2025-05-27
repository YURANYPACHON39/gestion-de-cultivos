// Importa la referencia a la base de datos Firestore desde la configuración de Firebase
import { db } from "./firebase-config.js";
// Importa funciones necesarias para manejar colecciones y documentos en Firestore
import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Define la colección 'historial' en la base de datos
const historialCol = collection(db, "historial");

// Función para agregar un nuevo registro al historial en Firestore
export async function agregarRegistroHistorial(registro) {
  try {
    // Añade el objeto 'registro' como un nuevo documento en la colección 'historial'
    const docRef = await addDoc(historialCol, registro);
    // Devuelve el id generado para el nuevo documento
    return docRef.id;
  } catch (error) {
    // Si ocurre un error, lo muestra en consola y lanza el error para manejo externo
    console.error("Error agregando registro al historial:", error);
    throw error;
  }
}

// Función para obtener los registros del historial, ordenados por fecha de forma descendente
export async function obtenerHistorial() {
  try {
    // Crea una consulta que ordena los documentos por campo 'fecha' en orden descendente
    const q = query(historialCol, orderBy("fecha", "desc"));
    // Ejecuta la consulta para obtener los documentos
    const snapshot = await getDocs(q);
    const historial = [];
    // Itera sobre cada documento y agrega un objeto con id y datos al arreglo historial
    snapshot.forEach(doc => {
      historial.push({ id: doc.id, ...doc.data() });
    });
    // Devuelve el arreglo con todos los registros obtenidos
    return historial;
  } catch (error) {
    // Si ocurre un error al obtener datos, lo muestra en consola y devuelve arreglo vacío
    console.error("Error obteniendo historial:", error);
    return [];
  }
}
