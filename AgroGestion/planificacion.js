import { db } from './firebase-config.js';  
// Importa la instancia configurada de la base de datos Firestore

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';  
// Importa funciones para manejar colecciones, agregar documentos, consultar documentos y ordenar resultados

import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';  
// Importa funciones para la autenticación y para detectar cambios en el estado de autenticación del usuario

const auth = getAuth();  
// Inicializa la autenticación Firebase para poder usarla en el código

const formulario = document.getElementById('formPlanificacion');  
// Obtiene el formulario HTML donde el usuario ingresará la planificación de actividades

const listaActividades = document.getElementById('listaActividades');  
// Obtiene el contenedor HTML donde se mostrarán las actividades planificadas en forma de lista

const planificacionesCol = collection(db, 'planificaciones');  
// Crea una referencia a la colección "planificaciones" en Firestore, donde se almacenan los datos

let emailUsuario = null;  
// Variable para almacenar el email del usuario autenticado actual; inicia en null (sin usuario)


// ✅ Detectar usuario autenticado
onAuthStateChanged(auth, (user) => {
  // Se ejecuta cada vez que cambia el estado de autenticación (login/logout)
  if (user) {
    emailUsuario = user.email;  
    // Si hay usuario autenticado, guarda su email en la variable

    console.log("Usuario autenticado:", emailUsuario);  
    // Muestra en consola el email del usuario autenticado
  } else {
    console.warn("Usuario no autenticado.");  
    // Si no hay usuario autenticado, muestra advertencia en consola
  }
});


// ✅ Enviar correo con EmailJS
async function enviarCorreoPlanificacion({ actividad, fecha, cultivo, para_email }) {
  // Función que envía un correo electrónico con los detalles de la planificación usando EmailJS
  try {
    await emailjs.send("service_ymu0gyo", "service_ymu0gyo", {
      actividad,
      fecha,
      cultivo,
      para_email
    });
    // Envía el correo con los datos proporcionados: actividad, fecha, cultivo y email destino

    console.log("Correo enviado a:", para_email);  
    // Muestra confirmación en consola al enviar el correo
  } catch (error) {
    console.error("Error al enviar el correo:", error);  
    // Si hay error al enviar el correo, lo muestra en consola
  }
}


// ✅ Guardar planificación y notificar por correo
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();  
  // Previene el comportamiento por defecto del formulario (recargar página)

  const cultivo = formulario.cultivo?.value?.trim() || "Zanahoria";  
  // Obtiene el valor del campo 'cultivo', eliminando espacios al inicio y final. Si está vacío, usa "Zanahoria" por defecto

  const fecha = formulario.fechaActividad.value;  
  // Obtiene el valor del campo fecha

  const actividad = formulario.actividad.value.trim();  
  // Obtiene el valor del campo actividad, eliminando espacios al inicio y final

  if (cultivo && fecha && actividad) {  
    // Verifica que los tres campos tengan valor válido (no vacíos)

    try {
      await addDoc(planificacionesCol, {
        cultivo,
        fecha,
        actividad,
        timestamp: new Date()
      });
      // Agrega un nuevo documento a la colección 'planificaciones' con los datos y una marca temporal

      if (emailUsuario) {
        await enviarCorreoPlanificacion({ actividad, fecha, cultivo, para_email: emailUsuario });  
        // Si el usuario está autenticado, envía un correo con la planificación al email del usuario
      } else {
        console.warn("No se envió correo: usuario no autenticado.");  
        // Si no hay usuario autenticado, muestra advertencia y no envía correo
      }

      formulario.reset();  
      // Limpia el formulario para dejarlo listo para un nuevo ingreso

      mostrarActividades();  
      // Actualiza la lista de actividades para mostrar la nueva planificación ingresada
    } catch (error) {
      console.error('Error al guardar planificación o enviar correo:', error);  
      // Si falla la escritura en Firestore o el envío de correo, muestra el error
    }
  } else {
    alert('Por favor completa todos los campos.');  
    // Si falta algún dato, muestra alerta al usuario
  }
});


// ✅ Mostrar actividades ordenadas
async function mostrarActividades() {
  listaActividades.innerHTML = '';  
  // Limpia la lista HTML para evitar duplicados al actualizar

  try {
    const q = query(planificacionesCol, orderBy('fecha', 'desc'));  
    // Crea una consulta que ordena las planificaciones por fecha descendente (de más reciente a más antigua)

    const snapshot = await getDocs(q);  
    // Obtiene los documentos que cumplen la consulta (de forma asincrónica)

    snapshot.forEach(doc => {
      const datos = doc.data();  
      // Obtiene los datos de cada documento (planificación)

      const item = document.createElement('li');  
      // Crea un nuevo elemento <li> para la lista

      item.textContent = `${datos.fecha} - ${datos.cultivo}: ${datos.actividad}`;  
      // Define el texto que mostrará la fecha, cultivo y actividad

      listaActividades.appendChild(item);  
      // Agrega el nuevo <li> a la lista en el DOM
    });
  } catch (error) {
    console.error('Error al obtener planificaciones:', error);  
    // Si ocurre un error al leer datos, lo muestra en consola
  }
}

// Ejecutar función para mostrar actividades al cargar la página
document.addEventListener('DOMContentLoaded', mostrarActividades);
