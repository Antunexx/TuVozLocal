import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDMSNLsiKPrAcTIQ5ctx05eE18Rd71ueSI",
  authDomain: "tu-voz-local.firebaseapp.com",
  projectId: "tu-voz-local",
  storageBucket: "tu-voz-local.appspot.com",
  messagingSenderId: "179369444666",
  appId: "1:179369444666:web:5dbe5d5b55c446a3323c03",
  measurementId: "G-48RY2KVVNP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Colores por estado
const colores = {
  "Reclamo ingresado": "dodgerblue",
  "Subido APP Ciudadana": "orange",
  "ART 111": "gold",
  "Solucionado": "limegreen",
  "Sin Solución": "red"
};

// Función para crear íconos con Font Awesome
function crearIcono(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<i class="fas fa-map-marker-alt" style="color:${color}; font-size: 28px;"></i>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

// Manejador del formulario
document.getElementById("reclamoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombreApellido = document.getElementById("nombre").value.trim();
  const numeroContacto = document.getElementById("contacto").value.trim();
  const tipo = document.getElementById("tipoReclamo").value;
  const coordInput = document.getElementById("coordenadas").value.trim();
  const estadoSelect = document.getElementById("estado");
  const descripcion = document.getElementById("descripcion").value.trim();

  const estado = estadoSelect.value; // Solo un valor, no array

  if (!nombreApellido || !numeroContacto || !tipo || !estado || !descripcion || !coordInput) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const [lat, lng] = coordInput.split(',').map(coord => parseFloat(coord.trim()));
  if (isNaN(lat) || isNaN(lng)) {
    alert("Coordenadas inválidas");
    return;
  }

  // Crear el marcador en el mapa con el color según estado
  const color = colores[estado] || "gray";
  const icono = crearIcono(color);

  const marker = L.marker([lat, lng], { icon: icono }).addTo(map);
  marker.bindPopup(`
    <div class="popup-modern">
      <strong>${tipo}</strong><br/>
      <small>${nombreApellido} (${numeroContacto})</small><br/>
      Estado: ${estado}<br/>
      ${descripcion ? `<em>${descripcion}</em>` : ""}
    </div>
  `);

  try {
    await addDoc(collection(db, "reclamos"), {
      nombreApellido,
      numeroContacto,
      tipo,
      estado,
      descripcion,
      lat,
      lng,
      fecha: serverTimestamp()
    });

    alert("Reclamo guardado correctamente");
    e.target.reset();

  } catch (error) {
    console.error("Error al guardar el reclamo:", error);
    alert("Error al guardar el reclamo, intente nuevamente.");
  }
});
