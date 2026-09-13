const API_URL = 'http://localhost:8080/api';
async function cargarCanchasDesdeAPI() {
  try {
    const respuesta = await fetch(API_URL + '/canchas', {
      credentials: 'include'
    });

    if (!respuesta.ok) {
      throw new Error('Error HTTP: ' + respuesta.status);
    }

    const canchas = await respuesta.json();

    console.log('Canchas cargadas desde MySQL:', canchas);

    return canchas;

  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    return [];
  }
}

async function crearReservaEnBackend(reserva) {
  try {
    const respuesta = await fetch(API_URL + '/reservas', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reserva)
    });

    if (!respuesta.ok) {
      throw new Error('Error HTTP: ' + respuesta.status);
    }

    const reservaCreada = await respuesta.json();

    console.log('Reserva guardada en MySQL:', reservaCreada);

    return reservaCreada;

  } catch (error) {
    console.error('Error al guardar la reserva en el backend:', error);
    return null;
  }
}
// =================================================
// ROLES: helpers compartidos por todas las páginas
// =================================================
function getRole() {
  return localStorage.getItem('sportcourt_role') || 'invitado';
}
function getUserName() {
  return localStorage.getItem('sportcourt_user_name') || 'Invitado';
}

function getCsrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

// ---------------------------------------------
// Login: asigna rol según el correo y redirige
// admin... -> Administrador | cualquier otro -> Usuario
// ---------------------------------------------
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const respuesta = await fetch(API_URL + '/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({ email: email, password: password })
      });

      const usuario = await respuesta.json();

      if (!respuesta.ok) {
        alert(usuario.mensaje || 'Correo o contraseña incorrectos');
        return;
      }

      console.log('Usuario autenticado desde MySQL:', usuario);

      localStorage.setItem('sportcourt_user', usuario.email);
      localStorage.setItem('sportcourt_user_id', usuario.id);
      localStorage.setItem('sportcourt_role', usuario.rol);
      localStorage.setItem('sportcourt_user_name', usuario.nombre);

      window.location.href =
        usuario.rol === 'admin' ? 'admin.html' : 'index.html';

    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      alert('No se pudo conectar con el servidor.');
    }
  });
}

// Continuar como invitado (Login)
const guestLink = document.getElementById('guest-link');
if (guestLink) {
  guestLink.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sportcourt_user');
    localStorage.setItem('sportcourt_role', 'invitado');
    localStorage.setItem('sportcourt_user_name', 'Invitado');
    window.location.href = 'index.html';
  });
}

// ---------------------------------------------
// Navbar: se adapta según el rol activo
// ---------------------------------------------
const navbar = document.querySelector('.navbar');
if (navbar) {
  const role = getRole();
  const userChip = navbar.querySelector('.user-chip');
  const adminLink = navbar.querySelector('.admin-link');
  const reservasLink = navbar.querySelector('a[href="reservas.html"]');
  const perfilLink = navbar.querySelector('a[href="perfil.html"]');

  if (adminLink) adminLink.style.display = role === 'admin' ? 'inline-block' : 'none';

  if (role === 'invitado') {
    if (userChip) {
      userChip.setAttribute('href', 'login.html');
      userChip.classList.add('guest-chip');
      userChip.innerHTML = 'Iniciar sesión';
    }
    // Mis Reservas y Perfil quedan bloqueados para invitados
    [reservasLink, perfilLink].forEach(function (link) {
      if (link) link.classList.add('locked-link');
    });
  } else {
    if (userChip) {
      const avatar = userChip.querySelector('.avatar');
      const nameSpan = userChip.querySelector('span:last-child');
      const name = getUserName();
      if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
      if (nameSpan) {
        nameSpan.textContent = name;
        if (role === 'admin') {
          nameSpan.innerHTML = name + '<span class="role-tag">Admin</span>';
        }
      }
    }
  }
}

// Enlaces bloqueados (Mis Reservas / Perfil para invitados) -> a login
document.querySelectorAll('.locked-link').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'login.html';
  });
});

// Páginas exclusivas de cuenta: si un invitado entra directo por URL, se le pide iniciar sesión
if (document.body.dataset.page === 'reservas' || document.body.dataset.page === 'perfil') {
  if (getRole() === 'invitado') window.location.href = 'login.html';
}

// Panel Admin: solo accesible para administradores
if (document.body.dataset.page === 'admin' && getRole() !== 'admin') {
  window.location.href = 'index.html';
}

// Protección real del panel Admin mediante Spring Security
if (document.body.dataset.page === 'admin') {
  fetch(API_URL + '/usuarios', {
    method: 'GET',
    credentials: 'include'
  })
    .then(function (respuesta) {
      if (respuesta.status === 403 || respuesta.status === 401) {
        window.location.href = 'index.html';
        return null;
      }

      if (!respuesta.ok) {
        throw new Error('No se pudo verificar el acceso de administrador');
      }

      return respuesta.json();
    })
    .catch(function (error) {
      console.error('Error verificando permisos de administrador:', error);
      window.location.href = 'index.html';
    });
}

// ---------------------------------------------
// Botones "Ver canchas" (Inicio) -> van a Canchas
// ---------------------------------------------
document.querySelectorAll('.cta-btn, .offer-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    window.location.href = 'canchas.html';
  });
});

// ---------------------------------------------
// Canchas: filtro por deporte + búsqueda por nombre
// ---------------------------------------------
let canchasAPI = null;

const courtsGrid = document.getElementById('courts-grid');
if (courtsGrid) {
  const filterPills = document.querySelectorAll('.filter-pill');
  const searchInput = document.getElementById('court-search');
  const resultsCount = document.getElementById('results-count');
  let activeFilter = 'todos';

  function renderPublicCourts() {
    const courts = canchasAPI || getCourts();
    courtsGrid.innerHTML = courts.map(function (c) {
      const available = c.status === 'disponible';
      return '<article class=\"court-card\" data-court-id=\"' + c.id + '\" data-sport=\"' + c.sport + '\" data-name=\"' + String(c.name).replace(/\"/g, '&quot;') + '\">' +
        '<div class=\"court-media' + (available ? '' : ' is-unavailable') + '\" style=\"background-image:url(\'' + (c.image || '') + '\')\">' +
        '<span class=\"court-tag\">' + (c.sport === 'fulbito' ? '⚽ Fulbito' : c.sport === 'futbol' ? '🏟️ Fútbol' : c.sport === 'tenis' ? '🎾 Tenis' : '🏊 Piscina') + '</span>' +
        '<span class=\"court-status ' + (available ? 'available' : 'unavailable') + '\">' + (available ? 'Disponible' : 'No disponible') + '</span>' +
        '</div>' +
        '<div class=\"court-body\">' +
        '<h3>' + c.name + '</h3>' +
        '<p>' + (c.desc || 'Cancha deportiva disponible para reservas.') + '</p>' +
        '<div class=\"court-footer\"><div class=\"court-price\">S/ ' + Number(c.price || 0) + ' <span>/ hora</span></div>' +
        '<div class=\"court-capacity\">👥 hasta ' + Number(c.capacity || 0) + '</div></div>' +
        (available ? '<button class=\"reserve-btn\" type=\"button\">Reservar cancha</button>' : '<button class=\"reserve-btn\" type=\"button\" disabled>No disponible</button>') +
        '</div></article>';
    }).join('');

    courtsGrid.querySelectorAll('.reserve-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const card = btn.closest('.court-card');
        if (card) openReservation(card.dataset.courtId);
      });
    });
  }

  cargarCanchasDesdeAPI().then(function (canchas) {

    if (Array.isArray(canchas) && canchas.length > 0) {

      canchasAPI = canchas.map(function (c) {
        return {
          id: String(c.id),
          sport: c.sport,
          name: c.name,
          desc: c.description || '',
          price: Number(c.price),
          capacity: Number(c.capacity),
          image: c.image || '',
          status: c.status
        };
      });

      console.log('Canchas adaptadas para el frontend:', canchasAPI);

      renderPublicCourts();
      applyFilters();

    } else {
      renderPublicCourts();
    }

  });

  function applyFilters() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const cards = document.querySelectorAll('.court-card');
    let visible = 0;

    cards.forEach(function (card) {
      const matchesSport = activeFilter === 'todos' || card.dataset.sport === activeFilter;
      const matchesQuery = card.dataset.name.toLowerCase().includes(query);
      const show = matchesSport && matchesQuery;
      card.hidden = !show;
      if (show) visible++;
    });

    if (resultsCount) resultsCount.textContent = visible;
  }

  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      filterPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
}

// ---------------------------------------------
// Reservas: calendario + horarios + persistencia local
// ---------------------------------------------
const reservationModal = document.getElementById('reservation-modal');
const reservationForm = document.getElementById('reservation-form');
const reservationDate = document.getElementById('reservation-date');
const reservationTime = document.getElementById('reservation-time');
const timeSlots = document.getElementById('time-slots');
const reservationFeedback = document.getElementById('reservation-feedback');
const reservationCourtName = document.getElementById('reservation-court-name');
const reservationPrice = document.getElementById('reservation-price');
const reservationClose = document.getElementById('reservation-close');

const DEFAULT_COURTS = [
  { id: 'c1', sport: 'fulbito', name: 'Cancha de Fulbito A', desc: 'Cancha de fulbito sintética de última generación con iluminación LED de alta intensidad.', price: 80, capacity: 10, image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&q=80', status: 'disponible' },
  { id: 'c2', sport: 'futbol', name: 'Cancha de Fútbol 11', desc: 'Campo reglamentario de fútbol 11 con pasto natural de bermuda.', price: 150, capacity: 22, image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80', status: 'disponible' },
  { id: 'c3', sport: 'tenis', name: 'Cancha de Tenis 1', desc: 'Cancha de tenis en arcilla roja homologada, con red reglamentaria.', price: 60, capacity: 4, image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&q=80', status: 'disponible' },
  { id: 'c4', sport: 'tenis', name: 'Cancha de Tenis 2', desc: 'Cancha de tenis en superficie dura con iluminación artificial.', price: 65, capacity: 4, image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80', status: 'no_disponible' },
  { id: 'c5', sport: 'piscina', name: 'Piscina Olímpica', desc: 'Piscina semiolímpica de 25 metros con 6 carriles y temperatura controlada.', price: 45, capacity: 12, image: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=400&q=80', status: 'disponible' },
  { id: 'c6', sport: 'fulbito', name: 'Cancha Fulbito B', desc: 'Segunda cancha de fulbito con césped sintético, techada.', price: 75, capacity: 10, image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&q=80', status: 'disponible' }
];
function getCourts() {
  return Array.isArray(canchasAPI) ? canchasAPI : [];
}
// =============================================
// API BACKEND - CANCHAS
// =============================================
async function cargarClasesDesdeAPI() {
  try {
    const respuesta = await fetch(API_URL + '/clases', {
      credentials: 'include'
    });

    if (!respuesta.ok) {
      throw new Error('Error HTTP clases: ' + respuesta.status);
    }

    const clases = await respuesta.json();

    console.log('Clases cargadas desde MySQL:', clases);

    return clases;

  } catch (error) {
    console.error('Error al conectar clases con el backend:', error);
    return [];
  }
}

let clasesDesdeAPI = [];
let inscripcionesDesdeAPI = [];

async function cargarInscripcionesDesdeAPI() {
  try {
    const respuesta = await fetch(API_URL + '/inscripciones', {
      credentials: 'include'
    });

    if (!respuesta.ok) {
      throw new Error('HTTP ' + respuesta.status);
    }

    inscripcionesDesdeAPI = await respuesta.json();
    console.log('Inscripciones cargadas desde MySQL:', inscripcionesDesdeAPI);
    const currentUserId = localStorage.getItem('sportcourt_user_id');
    document.querySelectorAll('.enroll-btn').forEach(function (btn) {
      const claseId = Number(btn.dataset.id);
      const yaInscrito = inscripcionesDesdeAPI.some(function (i) {
        return String(i.usuarioId) === String(currentUserId)
          && Number(i.claseId) === claseId
          && i.estado === 'inscrita';
      });

      if (yaInscrito) {
        btn.textContent = 'Inscrito ✓';
        btn.classList.add('enrolled');
        btn.disabled = true;
      }
    });

  } catch (error) {
    console.error('Error al cargar inscripciones:', error);
  }
}
cargarClasesDesdeAPI().then(function (clases) {
  clasesDesdeAPI = clases.map(function (c) {
    return {
      id: String(c.id),
      name: c.name || c.nombre || '',
      icon: c.icon || c.icono || '⚽',
      level: c.level || c.nivel || '',
      schedule: c.schedule || c.horario || '',
      professor: c.professor || c.profesor || '',
      price: Number(c.price ?? c.precio ?? 0),
      slots: Number(c.slots ?? c.cupos ?? 0)
    };
  });

  classes = clasesDesdeAPI;

  console.log('Clases adaptadas desde MySQL:', classes);

  if (typeof renderClasses === 'function') {
    renderClasses();
  }
});

function getCourt(courtId) {
  return getCourts().find(function (c) { return c.id === courtId; }) || null;
}
function ensureCourtsStorage() {
  if (!localStorage.getItem('sportcourt_courts')) {
    localStorage.setItem('sportcourt_courts', JSON.stringify(DEFAULT_COURTS));
  }
}
ensureCourtsStorage();

const HOURS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}
function displayDate(dateKey) {
  const parts = dateKey.split('-');
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}
let reservasAPI = [];

function getReservations() {
  return reservasAPI;
}
async function cargarReservasDesdeAPI() {
  try {
    // Obtener reservas desde el backend
    const respuestaReservas = await fetch(API_URL + '/reservas', {
      credentials: 'include'
    });
    if (!respuestaReservas.ok) {
      throw new Error('Error HTTP reservas: ' + respuestaReservas.status);
    }
    const reservas = await respuestaReservas.json();
    // Obtener canchas desde el backend
    const respuestaCanchas = await fetch(API_URL + '/canchas', {
      credentials: 'include'
    });
    if (!respuestaCanchas.ok) {
      throw new Error('Error HTTP canchas: ' + respuestaCanchas.status);
    }
    const canchas = await respuestaCanchas.json();
    // Adaptar las reservas al formato que usa el frontend
    reservasAPI = reservas.map(function (r) {
      const cancha = canchas.find(function (c) {
        return String(c.id) === String(r.canchaId);
      });
      console.log('BUSCANDO CANCHA:', r.canchaId, canchas);
      return {
        id: String(r.id),
        usuarioId: String(r.usuarioId),
        user: '',
        userName: '',
        courtId: String(r.canchaId),
        item: cancha ? cancha.name : 'Cancha',
        dateKey: r.fecha,
        date: r.fecha,
        time: String(r.horaInicio).slice(0, 5) +
          ' — ' +
          String(r.horaFin).slice(0, 5),
        price: cancha ? Number(cancha.price) : 0,
        status: r.estado,
        createdAt: ''
      };
    });
    console.log('Reservas cargadas desde MySQL:', reservas);
    console.log('Reservas adaptadas para el frontend:', reservasAPI);
    return reservasAPI;
  } catch (error) {
    console.error('Error al conectar reservas con el backend:', error);
    return [];
  }
}

function saveReservations(data) { localStorage.setItem('sportcourt_reservations', JSON.stringify(data)); }
function reservationDateKey(r) {
  if (r.dateKey) return r.dateKey;
  const match = String(r.date || '').match(/(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]+)\s+(\d{4})/i);
  if (!match) return '';
  const months = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
  const month = months[match[2].toLowerCase()];
  return month ? match[3] + '-' + String(month).padStart(2, '0') + '-' + String(match[1]).padStart(2, '0') : '';
}
function reservationHour(r) { return String(r.time || '').split(' ')[0].split('—')[0].trim(); }
function isOccupied(courtId, dateKey, hour) {
  return getReservations().some(function (r) {
    const court = getCourt(courtId);
    const sameCourt = (r.courtId === courtId) || (!r.courtId && court && r.item === court.name);
    const active = r.status !== 'cancelada';
    return sameCourt && active && reservationDateKey(r) === dateKey && reservationHour(r) === hour;
  });
}
function renderTimeSlots() {
  if (!timeSlots || !reservationDate || !reservationTime) return;
  const dateKey = reservationDate.value;
  const courtId = reservationForm.dataset.courtId;
  reservationTime.value = '';
  timeSlots.innerHTML = '';
  if (!dateKey || !courtId) return;
  HOURS.forEach(function (hour) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot' + (isOccupied(courtId, dateKey, hour) ? ' occupied' : '');
    btn.textContent = hour + ' — ' + String(Number(hour.slice(0, 2)) + 1).padStart(2, '0') + ':00';
    btn.dataset.time = hour;
    btn.disabled = isOccupied(courtId, dateKey, hour);
    btn.addEventListener('click', function () {
      timeSlots.querySelectorAll('.time-slot').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      reservationTime.value = hour;
      reservationFeedback.textContent = '';
    });
    timeSlots.appendChild(btn);
  });
}
function openReservation(courtId) {
  if (getRole() === 'invitado') { window.location.href = 'login.html'; return; }
  const court = getCourt(courtId);
  if (!court || court.status !== 'disponible') { alert('Esta cancha no está disponible.'); return; }
  reservationForm.dataset.courtId = courtId;
  reservationCourtName.textContent = court.name;
  reservationPrice.textContent = 'S/ ' + court.price;
  reservationFeedback.textContent = '';
  const today = new Date();
  reservationDate.min = localDateKey(today);
  if (!reservationDate.value || reservationDate.value < reservationDate.min) reservationDate.value = reservationDate.min;
  renderTimeSlots();
  reservationModal.classList.add('open');
  reservationModal.setAttribute('aria-hidden', 'false');
}
function closeReservation() {
  if (!reservationModal) return;
  reservationModal.classList.remove('open');
  reservationModal.setAttribute('aria-hidden', 'true');
}

if (reservationDate) reservationDate.addEventListener('change', renderTimeSlots);
if (reservationClose) reservationClose.addEventListener('click', closeReservation);
if (reservationModal) reservationModal.addEventListener('click', function (e) { if (e.target === reservationModal) closeReservation(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeReservation(); });
if (reservationForm) {
  reservationForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const courtId = reservationForm.dataset.courtId;
    const court = getCourt(courtId);
    const dateKey = reservationDate.value;
    const hour = reservationTime.value;
    if (!court || !dateKey || !hour) { reservationFeedback.textContent = 'Selecciona una fecha y un horario.'; return; }
    if (dateKey < reservationDate.min) { reservationFeedback.textContent = 'La fecha no puede ser anterior a hoy.'; return; }
    if (isOccupied(courtId, dateKey, hour)) { reservationFeedback.textContent = 'Ese horario acaba de ser ocupado. Elige otro.'; renderTimeSlots(); return; }
    const reservations = getReservations();
    reservations.push({
      id: 'r' + Date.now(), courtId: courtId, user: localStorage.getItem('sportcourt_user') || '',
      userName: getUserName(), item: court.name, dateKey: dateKey, date: displayDate(dateKey),
      time: hour + ' — ' + String(Number(hour.slice(0, 2)) + 1).padStart(2, '0') + ':00',
      price: court.price, status: 'confirmada', createdAt: new Date().toISOString()
    });
    fetch(API_URL + '/reservas', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuarioId: Number(localStorage.getItem('sportcourt_user_id')),
        canchaId: Number(courtId),
        fecha: dateKey,
        horaInicio: hour + ':00',
        horaFin: String(Number(hour.split(':')[0]) + 1).padStart(2, '0') + ':00',
        estado: 'confirmada'
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error HTTP: ' + response.status);
        }

        return response.json();
      })
      .then(reservaGuardada => {
        console.log('Reserva guardada en MySQL:', reservaGuardada);

        closeReservation();

        alert(
          'Reserva confirmada para ' +
          court.name +
          ' el ' +
          displayDate(dateKey) +
          ' a las ' +
          hour +
          '.'
        );
      })
      .catch(error => {
        console.error('Error al guardar la reserva en MySQL:', error);
        alert('No se pudo guardar la reserva en MySQL.');
      });
    closeReservation();
    alert('Reserva confirmada para ' + court.name + ' el ' + displayDate(dateKey) + ' a las ' + hour + '.');
  });
}

// ---------------------------------------------
// Mis Reservas: renderiza las reservas reales del usuario
// ---------------------------------------------
const reservasList = document.getElementById('reservas-list');
if (reservasList) {
  function renderUserReservations(filter) {
    const currentUserId = localStorage.getItem('sportcourt_user_id');

    const all = getReservations().filter(function (r) {
      return String(r.usuarioId) === String(currentUserId);
    });
    console.log('DATOS QUE VA A MOSTRAR LA PÁGINA:', all);
    const filtered = filter === 'todas' ? all : all.filter(function (r) { return r.status === filter; });
    reservasList.innerHTML = filtered.length ? filtered.map(function (r) {
      const statusLabel = r.status === 'confirmada' ? 'Confirmada' : r.status === 'pendiente' ? 'Pendiente' : 'Cancelada';
      const canCancel = r.status !== 'cancelada';
      return '<article class="reserva-card" data-status="' + r.status + '">' +
        '<div class="reserva-info">' +
        '<div class="reserva-tags"><span class="reserva-sport-tag">🏟️ Cancha</span><span class="reserva-status ' + r.status + '">' + statusLabel + '</span></div>' +
        '<h3>' + r.item + '</h3>' +
        '<div class="reserva-meta"><span>📅 ' + r.date + '</span><span>🕒 ' + r.time + '</span></div>' +
        '<div class="reserva-actions">' +
        '<button class="ver-btn" type="button">Ver cancha</button>' +
        (canCancel ? '<button class="cancel-btn" data-id="' + r.id + '" type="button">Cancelar</button>' : '') +
        '<button class="comprobante-btn" data-id="' + r.id + '" type="button">Descargar comprobante</button>' +
        '</div></div><div class="reserva-price"><div class="amount">S/ ' + r.price + '</div><div class="duration">1h</div></div></article>';
    }).join('') : '<div class="empty-state"><h3>No tienes reservas en este filtro.</h3><p>Ve a Canchas para seleccionar un día y horario disponible.</p></div>';
    const active = all.filter(function (r) { return r.status === 'confirmada' || r.status === 'pendiente'; }).length;
    const spent = all.filter(function (r) { return r.status !== 'cancelada'; }).reduce(function (sum, r) { return sum + Number(r.price || 0); }, 0);
    const ac = document.getElementById('activas-count'); if (ac) ac.textContent = active;
    const tg = document.getElementById('total-gastado'); if (tg) tg.textContent = 'S/ ' + spent;
  }
  let currentFilter = 'todas';
  const tabs = document.querySelectorAll('.reservas-tab');
  tabs.forEach(function (tab) { tab.addEventListener('click', function () { tabs.forEach(function (t) { t.classList.remove('active'); }); tab.classList.add('active'); currentFilter = tab.dataset.tab; renderUserReservations(currentFilter); }); });
  reservasList.addEventListener('click', function (e) {
    const cancel = e.target.closest('.cancel-btn');
    if (cancel) {
      const id = cancel.dataset.id;
      fetch(API_URL + '/reservas/' + id + '/cancelar', {
        method: 'PUT',
        credentials: 'include'
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Error HTTP: ' + response.status);
          }
          return response.json();
        })
        .then(function (reservaCancelada) {
          console.log('Reserva cancelada en MySQL:', reservaCancelada);
          reservasAPI = reservasAPI.map(function (r) {
            return String(r.id) === String(id)
              ? Object.assign({}, r, { status: 'cancelada' })
              : r;
          });
          renderUserReservations(currentFilter);
        })
        .catch(function (error) {
          console.error('Error al cancelar la reserva:', error);
          alert('No se pudo cancelar la reserva.');
        });
      return;
    }
    const receipt = e.target.closest('.comprobante-btn');
    if (receipt) { const r = getReservations().find(function (x) { return x.id === receipt.dataset.id; }); if (r) { const blob = new Blob(['SportCourt Perú\nComprobante de reserva\n\nUsuario: ' + r.user + '\nCancha: ' + r.item + '\nFecha: ' + r.date + '\nHorario: ' + r.time + '\nMonto: S/ ' + r.price + '\nEstado: ' + r.status], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'comprobante-' + r.id + '.txt'; a.click(); URL.revokeObjectURL(a.href); } }
  });
  cargarReservasDesdeAPI()
    .then(function () {
      renderUserReservations(currentFilter);
    })
    .catch(function (error) {
      console.error('Error al cargar datos de reservas:', error);
      renderUserReservations(currentFilter);
    });
}
// ---------------------------------------------
// Clases: inscripción y recuperación del estado
// ---------------------------------------------

async function cargarEstadoInscripciones() {
  const currentUserId = Number(localStorage.getItem('sportcourt_user_id'));

  if (!currentUserId || getRole() === 'invitado') {
    return;
  }

  try {
    const respuesta = await fetch(API_URL + '/inscripciones', {
      credentials: 'include'
    });

    if (!respuesta.ok) {
      throw new Error('Error HTTP inscripciones: ' + respuesta.status);
    }

    const inscripciones = await respuesta.json();

    console.log('Inscripciones cargadas desde MySQL:', inscripciones);

    const misInscripciones = inscripciones.filter(function (i) {
      return Number(i.usuarioId) === currentUserId &&
        i.estado === 'inscrita';
    });

    document.querySelectorAll('.enroll-btn').forEach(function (btn) {
      const claseId = Number(btn.dataset.id);

      const yaInscrito = misInscripciones.some(function (i) {
        return Number(i.claseId) === claseId;
      });

      if (yaInscrito) {
        btn.textContent = 'Inscrito ✓';
        btn.classList.add('enrolled');
        btn.disabled = true;
      }
    });

  } catch (error) {
    console.error('Error al cargar las inscripciones:', error);
  }
}

document.querySelectorAll('.enroll-btn').forEach(function (btn) {
  btn.addEventListener('click', async function () {

    if (getRole() === 'invitado') {
      window.location.href = 'login.html';
      return;
    }

    const claseId = Number(btn.dataset.id);

    const inscripcion = {
      usuarioId: Number(localStorage.getItem('sportcourt_user_id')),
      claseId: claseId,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'inscrita'
    };

    try {
      const respuesta = await fetch(API_URL + '/inscripciones', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inscripcion)
      });

      if (!respuesta.ok) {
        throw new Error('Error HTTP: ' + respuesta.status);
      }

      const resultado = await respuesta.json();

      console.log('Inscripción guardada en MySQL:', resultado);

      btn.textContent = 'Inscrito ✓';
      btn.classList.add('enrolled');
      btn.disabled = true;

      alert('¡Inscripción realizada correctamente!');

    } catch (error) {
      console.error('Error al guardar la inscripción:', error);
      alert('No se pudo guardar la inscripción.');
    }
  });
});

// Recuperar el estado guardado en MySQL al cargar la página
if (document.querySelectorAll('.enroll-btn').length > 0) {
  cargarEstadoInscripciones();
}
if (document.getElementById('inscripciones-list')) {
  cargarMisInscripciones();
}
// ---------------------------------------------
// Mis Inscripciones: muestra las inscripciones del usuario
// ---------------------------------------------
async function cargarMisInscripciones() {
  const lista = document.getElementById('inscripciones-list');

  if (!lista) {
    return;
  }

  const currentUserId = Number(localStorage.getItem('sportcourt_user_id'));

  if (!currentUserId) {
    lista.innerHTML = '<p class="text-gray-500">No hay un usuario identificado.</p>';
    return;
  }

  try {
    const respuesta = await fetch(API_URL + '/inscripciones', {
      credentials: 'include'
    });

    if (!respuesta.ok) {
      throw new Error('Error HTTP: ' + respuesta.status);
    }

    const inscripciones = await respuesta.json();

    const misInscripciones = inscripciones
      .filter(function (i) {
        return Number(i.usuarioId) === currentUserId &&
          i.estado === 'inscrita';
      })
      .filter(function (i, index, self) {
        return index === self.findIndex(function (j) {
          return Number(j.claseId) === Number(i.claseId);
        });
      });

    if (misInscripciones.length === 0) {
      lista.innerHTML = '<p class="text-gray-500">No tienes inscripciones.</p>';
      return;
    }

    lista.innerHTML = misInscripciones.map(function (i) {
      return '<div class="mb-3 p-4 bg-white rounded-lg border">' +
        '<p class="font-semibold">Clase #' + i.claseId + '</p>' +
        '<p class="text-sm text-gray-500">Fecha de inscripción: ' + i.fecha + '</p>' +
        '<p class="text-sm text-green-600">Inscrita</p>' +
        '</div>';
    }).join('');

    console.log('Mis inscripciones mostradas:', misInscripciones);

  } catch (error) {
    console.error('Error al cargar mis inscripciones:', error);
    lista.innerHTML = '<p class="text-red-500">No se pudieron cargar las inscripciones.</p>';
  }
}
// ---------------------------------------------
// Perfil: muestra los datos de la sesión actual
// ---------------------------------------------
if (document.body.dataset.page === 'perfil') {
  cargarReservasDesdeAPI().then(function () {
    const profileName = document.getElementById('perfil-name');
    const profileEmail = document.getElementById('perfil-email');
    const profileAvatar = document.getElementById('perfil-avatar');
    const profileReservations = document.getElementById('perfil-reservas-count');
    const profileSpent = document.getElementById('perfil-total-gastado');
    const currentEmail = localStorage.getItem('sportcourt_user') || '';
    const currentName = getUserName();
    if (profileName) profileName.textContent = currentName;
    if (profileEmail) profileEmail.textContent = currentEmail || 'Sin correo';
    if (profileAvatar) profileAvatar.textContent = (currentName || 'U').charAt(0).toUpperCase();
    const currentUserId = localStorage.getItem('sportcourt_user_id');

    const userReservations = getReservations().filter(function (r) {
      return String(r.usuarioId) === String(currentUserId);
    });

    const userInscripciones = [];
    const totalSpent = userReservations
      .filter(function (r) { return r.status !== 'cancelada'; })
      .reduce(function (sum, r) { return sum + Number(r.price || 0); }, 0);
    if (profileReservations) profileReservations.textContent = userReservations.length;
    if (profileSpent) profileSpent.textContent = 'S/ ' + totalSpent;
    const profileClasses = document.querySelector('#perfil-clases-count');

    fetch(API_URL + '/inscripciones', {
      credentials: 'include'
    })
      .then(function (respuesta) {
        if (!respuesta.ok) {
          throw new Error('Error HTTP: ' + respuesta.status);
        }
        return respuesta.json();
      })
      .then(function (inscripciones) {
        const misInscripciones = inscripciones.filter(function (i) {
          return String(i.usuarioId) === String(currentUserId)
            && i.estado === 'inscrita';
        });

        if (profileClasses) {
          profileClasses.textContent = misInscripciones.length;
        }

        console.log('Clases inscritas del usuario:', misInscripciones);
      })
      .catch(function (error) {
        console.error('Error al cargar las clases inscritas:', error);
      });
  });
}


// ---------------------------------------------
// Cerrar sesión -> vuelve a Login
// ---------------------------------------------
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sportcourt_user');
    localStorage.removeItem('sportcourt_user_id');
    localStorage.removeItem('sportcourt_role');
    localStorage.removeItem('sportcourt_user_name');
    window.location.replace('login.html');
  });
}

// Revalida las páginas protegidas al volver con el botón Atrás.
if (document.body.dataset.page === 'reservas' || document.body.dataset.page === 'perfil' || document.body.dataset.page === 'admin') {
  window.addEventListener('pageshow', function () {
    const role = getRole();
    const page = document.body.dataset.page;
    if ((page === 'admin' && role !== 'admin') || ((page === 'reservas' || page === 'perfil') && role === 'invitado')) {
      window.location.replace(page === 'admin' ? 'index.html' : 'login.html');
    }
  });
}

// =================================================
// PANEL ADMIN: datos + CRUD de canchas, clases y reservas
// =================================================
if (document.body.dataset.page === 'admin' && getRole() === 'admin') {

  // ---- Datos semilla (se guardan en localStorage la primera vez) ----
  const SEED_COURTS = [
    { id: 'c1', sport: 'fulbito', name: 'Cancha de Fulbito A', desc: 'Cancha de fulbito sintética de última generación con iluminación LED de alta intensidad.', price: 80, capacity: 10, image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&q=80', status: 'disponible' },
    { id: 'c2', sport: 'futbol', name: 'Cancha de Fútbol 11', desc: 'Campo reglamentario de fútbol 11 con pasto natural de bermuda.', price: 150, capacity: 22, image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80', status: 'disponible' },
    { id: 'c3', sport: 'tenis', name: 'Cancha de Tenis 1', desc: 'Cancha de tenis en arcilla roja homologada, con red reglamentaria.', price: 60, capacity: 4, image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&q=80', status: 'disponible' },
    { id: 'c4', sport: 'tenis', name: 'Cancha de Tenis 2', desc: 'Cancha de tenis en superficie dura con iluminación artificial.', price: 65, capacity: 4, image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80', status: 'no_disponible' },
    { id: 'c5', sport: 'piscina', name: 'Piscina Olímpica', desc: 'Piscina semiolímpica de 25 metros con 6 carriles y temperatura controlada.', price: 45, capacity: 12, image: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=400&q=80', status: 'disponible' },
    { id: 'c6', sport: 'fulbito', name: 'Cancha Fulbito B', desc: 'Segunda cancha de fulbito con césped sintético, techada.', price: 75, capacity: 10, image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&q=80', status: 'disponible' }
  ];

  const SEED_CLASSES = [
    { id: 'k1', icon: '⚽', name: 'Fútbol Infantil', level: '6–12 años', schedule: 'Lun / Mié / Vie · 4:00pm', professor: 'Marco Torres', price: 180, slots: 3 },
    { id: 'k2', icon: '🎾', name: 'Tenis Principiantes', level: 'Adultos', schedule: 'Mar / Jue · 7:00am', professor: 'Ana Quispe', price: 220, slots: 5 },
    { id: 'k3', icon: '🏊', name: 'Natación Libre', level: 'Todas las edades', schedule: 'Diario · 6:00am', professor: 'Luis Vera', price: 150, slots: 8 },
    { id: 'k4', icon: '🥋', name: 'Fútsal Avanzado', level: '18+ años', schedule: 'Sáb / Dom · 8:00am', professor: 'Roberto Díaz', price: 200, slots: 2 },
    { id: 'k5', icon: '🏓', name: 'Pádel Intermedio', level: 'Adultos', schedule: 'Mar / Vie · 6:00pm', professor: 'Sofía Medina', price: 240, slots: 4 },
    { id: 'k6', icon: '💧', name: 'Aqua Aeróbicos', level: 'Adultos mayores', schedule: 'Lun / Mié · 9:00am', professor: 'Carmen López', price: 130, slots: 6 }
  ];

  const SEED_RESERVATIONS = [
    { id: 'r1', user: 'carlos@email.com', item: 'Cancha de Fulbito A', date: '20 Agosto 2026', time: '19:00 — 20:00', price: 80, status: 'confirmada' },
    { id: 'r2', user: 'carlos@email.com', item: 'Cancha de Tenis 1', date: '22 Agosto 2026', time: '08:00 — 10:00', price: 120, status: 'confirmada' },
    { id: 'r3', user: 'carlos@email.com', item: 'Cancha de Fútbol 11', date: '01 Septiembre 2026', time: '16:00 — 17:00', price: 150, status: 'pendiente' },
    { id: 'r4', user: 'carlos@email.com', item: 'Piscina Olímpica', date: '15 Julio 2026', time: '07:00 — 8:00', price: 45, status: 'cancelada' },
    { id: 'r5', user: 'ana.quispe@email.com', item: 'Cancha de Tenis 2', date: '25 Agosto 2026', time: '18:00 — 19:00', price: 65, status: 'confirmada' },
    { id: 'r6', user: 'luis.vera@email.com', item: 'Piscina Olímpica', date: '28 Agosto 2026', time: '06:00 — 07:00', price: 45, status: 'pendiente' }
  ];

  function loadData(key, seed) {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  // =============================================
  // API BACKEND - CANCHAS
  // =============================================



  let courts = loadData('sportcourt_courts', SEED_COURTS);

  // Cargar canchas desde MySQL
  cargarCanchasDesdeAPI().then(function (canchas) {
    if (canchas.length > 0) {

      courts = canchas.map(function (c) {
        return {
          id: String(c.id),
          sport: c.sport,
          name: c.name,
          desc: c.description || '',
          price: Number(c.price),
          capacity: Number(c.capacity),
          image: c.image || '',
          status: c.status
        };
      });

      console.log('Panel Admin: canchas cargadas desde MySQL:', courts);

      renderCourts();
    }
  });
  let classes = [];
  let reservations = loadData('sportcourt_reservations', SEED_RESERVATIONS);

  const sportLabels = { fulbito: '⚽ Fulbito', futbol: '🏟️ Fútbol', tenis: '🎾 Tenis', piscina: '🏊 Piscina' };

  // ---- Tabs ----
  const adminTabs = document.querySelectorAll('.admin-tab');
  const adminPanels = document.querySelectorAll('.admin-panel');
  adminTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      adminTabs.forEach(function (t) { t.classList.remove('active'); });
      adminPanels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ---- Render: Canchas ----
  const courtsAdminGrid = document.getElementById('admin-courts-grid');
  function renderCourts() {
    courtsAdminGrid.innerHTML = courts.map(function (c) {
      return '<div class="admin-item-card" data-id="' + c.id + '">' +
        '<div class="admin-item-media" style="background-image:url(\'' + c.image + '\')">' +
        '<span class="item-tag">' + (sportLabels[c.sport] || c.sport) + '</span>' +
        '</div>' +
        '<div class="admin-item-body">' +
        '<h3>' + c.name + '</h3>' +
        '<p class="item-sub">' + c.status.replace('_', ' ') + ' · hasta ' + c.capacity + ' personas</p>' +
        '<div class="item-price">S/ ' + c.price + ' /hora</div>' +
        '<div class="admin-item-actions">' +
        '<button class="edit-item-btn" data-type="court" data-id="' + c.id + '">Editar</button>' +
        '<button class="delete-item-btn" data-type="court" data-id="' + c.id + '">Eliminar</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  // ---- Render: Clases ----
  const classesAdminGrid = document.getElementById('admin-classes-grid');
  function renderClasses() {
    classesAdminGrid.innerHTML = classes.map(function (k) {
      return '<div class="admin-item-card" data-id="' + k.id + '">' +
        '<div class="admin-item-icon">' + k.icon + '</div>' +
        '<div class="admin-item-body">' +
        '<h3>' + k.name + '</h3>' +
        '<p class="item-sub">' + k.level + ' · ' + k.schedule + ' · ' + k.slots + ' cupos</p>' +
        '<div class="item-price">S/ ' + k.price + ' /mes</div>' +
        '<div class="admin-item-actions">' +
        '<button class="edit-item-btn" data-type="class" data-id="' + k.id + '">Editar</button>' +
        '<button class="delete-item-btn" data-type="class" data-id="' + k.id + '">Eliminar</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  // ---- Render: Reservas ----
  const reservationsTableBody = document.getElementById('admin-reservations-body');
  function renderReservations() {
    reservationsTableBody.innerHTML = reservations.map(function (r) {
      return '<tr data-id="' + r.id + '">' +
        '<td>' + r.user + '</td>' +
        '<td>' + r.item + '</td>' +
        '<td>' + r.date + '<br><span style="color:var(--muted);font-size:0.8rem;">' + r.time + '</span></td>' +
        '<td>S/ ' + r.price + '</td>' +
        '<td>' +
        '<select class="status-select" data-id="' + r.id + '">' +
        '<option value="confirmada"' + (r.status === 'confirmada' ? ' selected' : '') + '>Confirmada</option>' +
        '<option value="pendiente"' + (r.status === 'pendiente' ? ' selected' : '') + '>Pendiente</option>' +
        '<option value="cancelada"' + (r.status === 'cancelada' ? ' selected' : '') + '>Cancelada</option>' +
        '</select>' +
        '</td>' +
        '<td><button class="delete-item-btn" data-type="reservation" data-id="' + r.id + '">Eliminar</button></td>' +
        '</tr>';
    }).join('');
  }

  function renderAll() {
    renderCourts();
    renderClasses();
    renderReservations();
  }
  renderAll();

  // ---- Formulario (agregar / editar) ----
  const formPanel = document.getElementById('form-panel');
  const formPanelInner = document.getElementById('form-panel-inner');

  function openCourtForm(existing) {
    const c = existing || { sport: 'fulbito', name: '', desc: '', price: '', capacity: '', image: '', status: 'disponible' };
    formPanelInner.innerHTML =
      '<h2>' + (existing ? 'Editar cancha' : 'Agregar cancha') + '</h2>' +
      '<form id="item-form">' +
      '<div class="field"><label>Nombre</label><input type="text" id="f-name" value="' + c.name + '" required></div>' +
      '<div class="field"><label>Deporte</label><select id="f-sport">' +
      ['fulbito', 'futbol', 'tenis', 'piscina'].map(function (s) {
        return '<option value="' + s + '"' + (c.sport === s ? ' selected' : '') + '>' + (sportLabels[s] || s) + '</option>';
      }).join('') +
      '</select></div>' +
      '<div class="field"><label>Descripción</label><input type="text" id="f-desc" value="' + (c.desc || '') + '"></div>' +
      '<div class="field"><label>Precio por hora (S/)</label><input type="number" id="f-price" value="' + c.price + '" required></div>' +
      '<div class="field"><label>Capacidad</label><input type="number" id="f-capacity" value="' + c.capacity + '" required></div>' +
      '<div class="field"><label>URL de imagen</label><input type="text" id="f-image" value="' + (c.image || '') + '"></div>' +
      '<div class="field"><label>Estado</label><select id="f-status">' +
      '<option value="disponible"' + (c.status === 'disponible' ? ' selected' : '') + '>Disponible</option>' +
      '<option value="no_disponible"' + (c.status === 'no_disponible' ? ' selected' : '') + '>No disponible</option>' +
      '</select></div>' +
      '<div class="form-panel-actions">' +
      '<button type="button" class="cancel-form-btn">Cancelar</button>' +
      '<button type="submit" class="save-btn">Guardar</button>' +
      '</div>' +
      '</form>';

    formPanel.classList.add('open');
    document.querySelector('.cancel-form-btn').addEventListener('click', closeForm);
    document.getElementById('item-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const data = {
        id: existing ? existing.id : 'c' + Date.now(),
        name: document.getElementById('f-name').value,
        sport: document.getElementById('f-sport').value,
        desc: document.getElementById('f-desc').value,
        price: Number(document.getElementById('f-price').value),
        capacity: Number(document.getElementById('f-capacity').value),
        image: document.getElementById('f-image').value || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&q=80',
        status: document.getElementById('f-status').value
      };
      try {
        const metodo = existing ? 'PUT' : 'POST';
        const url = existing
          ? API_URL + '/canchas/' + data.id
          : API_URL + '/canchas';

        const respuesta = await fetch(url, {
          method: metodo,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sport: data.sport,
            name: data.name,
            description: data.desc,
            price: data.price,
            capacity: data.capacity,
            image: data.image,
            status: data.status
          })
        });

        if (!respuesta.ok) {
          throw new Error('Error HTTP: ' + respuesta.status);
        }

        const canchaGuardada = await respuesta.json();

        console.log('Cancha guardada en MySQL:', canchaGuardada);

        const canchas = await cargarCanchasDesdeAPI();

        courts = canchas.map(function (c) {
          return {
            id: String(c.id),
            sport: c.sport,
            name: c.name,
            desc: c.description || '',
            price: Number(c.price),
            capacity: Number(c.capacity),
            image: c.image || '',
            status: c.status
          };
        });

        renderCourts();
        closeForm();

        alert(
          existing
            ? 'Cancha actualizada correctamente en MySQL.'
            : 'Cancha guardada correctamente en MySQL.'
        );

      } catch (error) {
        console.error('Error al guardar la cancha:', error);
        alert('No se pudo guardar la cancha en MySQL.');
      }
    });
  }

  function openClassForm(existing) {
    const k = existing || { icon: '⚽', name: '', level: '', schedule: '', professor: '', price: '', slots: '' };
    formPanelInner.innerHTML =
      '<h2>' + (existing ? 'Editar clase' : 'Agregar clase') + '</h2>' +
      '<form id="item-form">' +
      '<div class="field"><label>Nombre</label><input type="text" id="f-name" value="' + k.name + '" required></div>' +
      '<div class="field"><label>Emoji / ícono</label><input type="text" id="f-icon" value="' + k.icon + '"></div>' +
      '<div class="field"><label>Nivel / edades</label><input type="text" id="f-level" value="' + k.level + '"></div>' +
      '<div class="field"><label>Horario</label><input type="text" id="f-schedule" value="' + k.schedule + '"></div>' +
      '<div class="field"><label>Profesor</label><input type="text" id="f-professor" value="' + k.professor + '"></div>' +
      '<div class="field"><label>Precio mensual (S/)</label><input type="number" id="f-price" value="' + k.price + '" required></div>' +
      '<div class="field"><label>Cupos disponibles</label><input type="number" id="f-slots" value="' + k.slots + '" required></div>' +
      '<div class="form-panel-actions">' +
      '<button type="button" class="cancel-form-btn">Cancelar</button>' +
      '<button type="submit" class="save-btn">Guardar</button>' +
      '</div>' +
      '</form>';

    formPanel.classList.add('open');
    document.querySelector('.cancel-form-btn').addEventListener('click', closeForm);
    document.getElementById('item-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const data = {
        id: existing ? existing.id : 'k' + Date.now(),
        name: document.getElementById('f-name').value,
        icon: document.getElementById('f-icon').value || '⚽',
        level: document.getElementById('f-level').value,
        schedule: document.getElementById('f-schedule').value,
        professor: document.getElementById('f-professor').value,
        price: Number(document.getElementById('f-price').value),
        slots: Number(document.getElementById('f-slots').value)
      };
      try {
        const url = existing
          ? API_URL + '/clases/' + existing.id
          : API_URL + '/clases';

        const method = existing ? 'PUT' : 'POST';

        if (!existing) {
          delete data.id;
        }

        const respuesta = await fetch(url, {
          method: method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!respuesta.ok) {
          throw new Error('Error al guardar la clase');
        }

        const claseGuardada = await respuesta.json();

        console.log('Clase guardada en MySQL:', claseGuardada);

        const clasesActualizadas = await cargarClasesDesdeAPI();

        clasesDesdeAPI = clasesActualizadas.map(function (c) {
          return {
            id: Number(c.id),
            nombre: c.name,
            icon: c.icon || '⚽',
            nivel: c.level || '',
            schedule: c.schedule || '',
            professor: c.professor || '',
            price: Number(c.price),
            slots: Number(c.slots)
          };
        });

        classes = clasesDesdeAPI;

        renderClasses();
        closeForm();

        alert(existing
          ? 'Clase actualizada correctamente'
          : 'Clase agregada correctamente'
        );

      } catch (error) {
        console.error('Error al guardar clase:', error);
        alert('No se pudo guardar la clase en MySQL');
      }
    });
  }

  function closeForm() {
    formPanel.classList.remove('open');
    formPanelInner.innerHTML = '';
  }

  // Botón "Agregar" según la pestaña activa
  document.getElementById('add-court-btn').addEventListener('click', function () { openCourtForm(null); });
  document.getElementById('add-class-btn').addEventListener('click', function () { openClassForm(null); });

  // Delegación de eventos: editar / eliminar (se re-renderiza el DOM cada vez)
  document.addEventListener('click', async function (e) {
    const editBtn = e.target.closest('.edit-item-btn');
    const delBtn = e.target.closest('.delete-item-btn');

    if (editBtn) {
      const id = editBtn.dataset.id;
      if (editBtn.dataset.type === 'court') {
        openCourtForm(courts.find(function (c) { return c.id === id; }));
      } else if (editBtn.dataset.type === 'class') {
        const clase = clasesDesdeAPI.find(function (k) {
          return String(k.id) === String(id);
        });

        console.log('Clase seleccionada para editar:', clase);

        openClassForm(clase);
      }
    }

    if (delBtn) {
      const id = delBtn.dataset.id;

      // =========================
      // ELIMINAR CANCHA
      // =========================
      if (delBtn.dataset.type === 'court') {

        if (!confirm('¿Seguro que deseas eliminar esta cancha?')) {
          return;
        }

        try {
          const respuesta = await fetch(API_URL + '/canchas/' + id, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!respuesta.ok) {
            throw new Error('Error HTTP: ' + respuesta.status);
          }

          console.log('Cancha eliminada de MySQL:', id);

          courts = courts.filter(function (c) {
            return String(c.id) !== String(id);
          });

          saveData('sportcourt_courts', courts);
          renderCourts();

          alert('Cancha eliminada correctamente de MySQL.');

        } catch (error) {
          console.error('Error al eliminar la cancha:', error);
          alert('No se pudo eliminar la cancha de MySQL.');
        }

        // =========================
        // ELIMINAR CLASE
        // =========================
      } else if (delBtn.dataset.type === 'class') {

        if (!confirm('¿Seguro que deseas eliminar esta clase?')) {
          return;
        }

        try {
          const respuesta = await fetch(API_URL + '/clases/' + id, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!respuesta.ok) {
            throw new Error('Error HTTP: ' + respuesta.status);
          }

          console.log('Clase eliminada de MySQL:', id);

          const clasesActualizadas = await cargarClasesDesdeAPI();

          clasesDesdeAPI = clasesActualizadas.map(function (c) {
            return {
              id: Number(c.id),
              name: c.nombre,
              icon: c.icono || '⚽',
              level: c.nivel || '',
              schedule: c.horario || '',
              professor: c.profesor || '',
              price: Number(c.precio),
              slots: Number(c.cupos)
            };
          });

          classes = clasesDesdeAPI;

          renderClasses();

          alert('Clase eliminada correctamente de MySQL.');

        } catch (error) {
          console.error('Error al eliminar la clase:', error);
          alert('No se pudo eliminar la clase de MySQL.');
        }

        // =========================
        // ELIMINAR RESERVA
        // =========================
      } else if (delBtn.dataset.type === 'reservation') {

        reservations = reservations.filter(function (r) {
          return r.id !== id;
        });

        saveData('sportcourt_reservations', reservations);
        renderReservations();
      }
    }
  });

  // Cambiar estado de una reserva desde el <select>
  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('status-select')) {
      const id = e.target.dataset.id;
      reservations = reservations.map(function (r) {
        return r.id === id ? Object.assign({}, r, { status: e.target.value }) : r;
      });
      saveData('sportcourt_reservations', reservations);
    }
  });

  // Cerrar el formulario haciendo clic fuera de él
  formPanel.addEventListener('click', function (e) {
    if (e.target === formPanel) closeForm();
  });
}
