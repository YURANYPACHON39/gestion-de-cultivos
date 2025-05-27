// Importa la función para inicializar la app de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// Importa la función para obtener acceso a Firestore (base de datos)
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Importa la función para obtener el servicio de autenticación
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Configuración con las credenciales del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC73gcGmm-5hwtcvG_dK5iS328d1fwop6w", // Clave API del proyecto
  authDomain: "agrogestion-c680d.firebaseapp.com", // Dominio de autenticación
  projectId: "agrogestion-c680d", // ID del proyecto
  storageBucket: "agrogestion-c680d.appspot.com", // Almacenamiento en la nube
  messagingSenderId: "390044440190", // ID remitente para mensajes push
  appId: "1:390044440190:web:2f26d3b787b4c100452a2f", // ID de la app Firebase
  measurementId: "G-PTKEY0TMSH" // ID para analíticas (opcional)
};

// Inicializa la aplicación Firebase con la configuración especificada
const app = initializeApp(firebaseConfig);
// Obtiene la instancia de Firestore para manipular la base de datos
const db = getFirestore(app);
// Obtiene la instancia del servicio de autenticación para gestionar usuarios
const auth = getAuth(app);

// Exporta las referencias para usarlas en otros módulos
export { app, db, auth };
