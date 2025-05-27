// Importa la referencia a la base de datos desde el archivo de configuración Firebase
import { db } from "./firebase-config.js";

// Importa funciones necesarias de Firestore para manejo de colecciones y documentos
import {
  collection,  // Para referenciar una colección
  addDoc,      // Para agregar un documento
  getDocs,     // Para obtener documentos
  query,       // Para crear consultas
  orderBy      // Para ordenar resultados
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Referencia a la colección "cultivos" en Firestore
const cultivosCol = collection(db, "cultivos");

// Función asíncrona para agregar un nuevo cultivo a la colección
export async function agregarCultivo(cultivo) {
  try {
    // Agrega un documento con los datos de 'cultivo' a la colección
    const docRef = await addDoc(cultivosCol, cultivo);
    // Retorna el ID generado del nuevo documento
    return docRef.id;
  } catch (error) {
    // Si ocurre un error, lo muestra en consola
    console.error("Error agregando cultivo:", error);
    // Re-lanza el error para que pueda manejarse externamente
    throw error;
  }
}

// Función asíncrona para obtener todos los cultivos ordenados por fechaSiembra (más recientes primero)
export async function obtenerCultivos() {
  try {
    // Crea una consulta para obtener los cultivos ordenados por "fechaSiembra" en orden descendente
    const q = query(cultivosCol, orderBy("fechaSiembra", "desc"));
    // Ejecuta la consulta y obtiene los documentos
    const snapshot = await getDocs(q);
    // Arreglo donde se guardarán los cultivos obtenidos
    const cultivos = [];
    // Recorre cada documento obtenido
    snapshot.forEach((doc) => {
      // Agrega al arreglo el objeto con el id y los datos del documento
      cultivos.push({ id: doc.id, ...doc.data() });
    });
    // Retorna el arreglo con todos los cultivos
    return cultivos;
  } catch (error) {
    // Si ocurre un error, lo muestra en consola
    console.error("Error obteniendo cultivos:", error);
    // Retorna un arreglo vacío en caso de fallo
    return [];
  }
}

