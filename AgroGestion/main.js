// main.js
// Importa funciones para autenticación y manejo de cultivos desde otros módulos
import { login, logout, onUserChanged } from "./auth.js";
import { agregarCultivo, obtenerCultivos } from "./cultivos.js";

// Obtiene referencias a elementos del DOM para interacción con el usuario
const formLogin = document.getElementById("formLogin");
const loginSection = document.getElementById("login");
const menuLateral = document.getElementById("menuLateral");
const contenido = document.getElementById("contenido");
const btnLogout = document.getElementById("btnLogout");
const formCultivo = document.getElementById("formCultivo");
const listaCultivos = document.getElementById("listaCultivos");

// Evento para manejar el envío del formulario de inicio de sesión
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault(); // Previene que el formulario recargue la página
  const email = formLogin.email.value;       // Obtiene el correo ingresado
  const password = formLogin.password.value; // Obtiene la contraseña ingresada

  try {
    await login(email, password); // Intenta iniciar sesión con las credenciales
    formLogin.reset();            // Limpia el formulario después del login
  } catch (error) {
    alert("Error de inicio de sesión: " + error.message); // Muestra error si falla
  }
});

// Evento para manejar el cierre de sesión al hacer clic en el botón
btnLogout.addEventListener("click", async () => {
  try {
    await logout(); // Ejecuta la función de logout para cerrar sesión
  } catch (error) {
    alert("Error al cerrar sesión: " + error.message); // Muestra error si falla
  }
});

// Observador que detecta cambios en el estado del usuario (login/logout)
onUserChanged(async (user) => {
  if (user) {
    // Si hay usuario logueado, muestra el menú lateral y el contenido principal
    document.body.classList.add("logged-in");
    loginSection.classList.add("oculto");    // Oculta sección de login
    menuLateral.classList.remove("oculto");  // Muestra menú lateral
    contenido.classList.remove("oculto");    // Muestra contenido principal
    await cargarCultivos();                   // Carga cultivos registrados
  } else {
    // Si no hay usuario, oculta menú y contenido, muestra login
    document.body.classList.remove("logged-in");
    loginSection.classList.remove("oculto"); // Muestra login
    menuLateral.classList.add("oculto");     // Oculta menú lateral
    contenido.classList.add("oculto");       // Oculta contenido principal
  }
});

// Función global para mostrar el panel seleccionado del menú lateral
window.mostrarPanel = function (idPanel, event) {
  event.preventDefault(); // Previene comportamiento por defecto del enlace

  // Remueve la clase 'activo' de todos los enlaces del menú lateral
  document.querySelectorAll("#menuLateral a").forEach((a) =>
    a.classList.remove("activo")
  );
  // Añade la clase 'activo' al enlace clickeado
  event.currentTarget.classList.add("activo");

  // Muestra el panel correspondiente y oculta los demás
  document.querySelectorAll("main .panel").forEach((panel) => {
    panel.classList.toggle("activo", panel.id === idPanel);
  });
};

// Evento para manejar el formulario de registro de cultivos
formCultivo.addEventListener("submit", async (e) => {
  e.preventDefault(); // Previene recarga de página al enviar formulario

  // Crea un objeto cultivo con los datos del formulario
  const cultivo = {
    nombre: formCultivo.nombreCultivo.value,
    fechaSiembra: formCultivo.fechaSiembra.value,
    tipoPlanta: formCultivo.tipoPlanta.value,
    tratamientos: formCultivo.tratamientos.value,
    fechaCosecha: formCultivo.fechaCosecha.value,
  };

  try {
    await agregarCultivo(cultivo); // Guarda el cultivo usando función importada
    alert("Cultivo registrado correctamente."); // Confirma registro exitoso
    formCultivo.reset(); // Limpia formulario
    await cargarCultivos(); // Recarga la lista de cultivos mostrados
  } catch (error) {
    alert("Error al registrar cultivo: " + error.message); // Muestra error
  }
});

// Función para cargar y mostrar los cultivos registrados en el DOM
async function cargarCultivos() {
  try {
    const cultivos = await obtenerCultivos(); // Obtiene cultivos desde almacenamiento
    if (cultivos.length === 0) {
      // Si no hay cultivos, muestra mensaje
      listaCultivos.innerHTML = "<p>No hay cultivos registrados.</p>";
      return;
    }

    // Construye un listado HTML con los cultivos
    let html = "<ul>";
    cultivos.forEach((c) => {
      html += `<li><strong>${c.nombre}</strong> - Siembra: ${c.fechaSiembra} - Tipo: ${c.tipoPlanta}</li>`;
    });
    html += "</ul>";

    // Inserta el listado en el contenedor correspondiente
    listaCultivos.innerHTML = html;
  } catch (error) {
    // Muestra mensaje de error si falla la carga
    listaCultivos.innerHTML = "<p>Error al cargar cultivos.</p>";
  }
}
