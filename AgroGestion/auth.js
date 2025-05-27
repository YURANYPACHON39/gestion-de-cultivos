// Importa la instancia de autenticación desde la configuración de Firebase
import { auth } from "./firebase-config.js";

// Importa funciones para autenticación con email y contraseña, cerrar sesión y detectar cambios en el estado de autenticación
import { 
  signInWithEmailAndPassword,  // Para iniciar sesión con email y contraseña
  signOut,                     // Para cerrar sesión
  onAuthStateChanged           // Para escuchar cambios en el estado de autenticación
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Función asíncrona para iniciar sesión con email y contraseña
export async function login(email, password) {
  try {
    // Llama a Firebase para iniciar sesión con las credenciales proporcionadas
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    // Si ocurre un error, lanza un nuevo error con un mensaje personalizado
    throw new Error("Error al iniciar sesión: " + error.message);
  }
}

// Función asíncrona para cerrar la sesión del usuario actual
export async function logout() {
  // Llama a Firebase para cerrar sesión
  await signOut(auth);
}

// Función que recibe un callback para ejecutar cada vez que cambia el estado de autenticación (login/logout)
export function onUserChanged(callback) {
  // Firebase monitorea los cambios en el estado de autenticación y llama al callback con el usuario actual o null
  onAuthStateChanged(auth, callback);
}
