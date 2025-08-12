// Arreglo global para guardar los IDs que ya han salido
const pokemonsMostrados = [];

// Variables para el rango de la región seleccionada
let regionMin = 1;
let regionMax = 1025;
let pokemonSelected = null;
let isMobile = window.innerWidth <= 600;

// Detectar si es dispositivo móvil
function checkMobile() {
    isMobile = window.innerWidth <= 600;
}

// Get aleatory pokémon sin repetir, ahora usando el rango de la región
const getPokemon = () => {
  // Limitar el rango máximo a 1025 (último de la lista, Paldea)
  const maxApiId = 1025;
  let actualRegionMax = regionMax > maxApiId ? maxApiId : regionMax;

  // Control de overflow de IDs por región
  if (pokemonsMostrados.length >= (actualRegionMax - regionMin + 1)) {
    showNotification("¡Ya han salido todos los Pokémon disponibles en esta región!", "info");
    return;
  }

  let randomId;
  let intentos = 0;
  do {
    randomId = Math.floor(Math.random() * (actualRegionMax - regionMin + 1)) + regionMin;
    intentos++;
    if (intentos > 2000) {
      showNotification("No se pudo encontrar un Pokémon válido en este rango.", "error");
      return;
    }
  } while (pokemonsMostrados.includes(randomId));
  pokemonsMostrados.push(randomId);

  // Mostrar loading
  const pokemonImage = document.getElementById("pokemon-image");
  pokemonImage.style.opacity = "0.5";
  pokemonImage.style.transform = "scale(0.95)";

  $.ajax({
    type: "GET",
    url: "https://pokeapi.co/api/v2/pokemon/" + randomId,
  }).done((res) => {
    const pokemon = {
      id: res.id,
      name: res.species.name,
      img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${res.id}.png`,
      sound: res.cries.latest
    };
    pokemonSelected = pokemon;
    console.log(pokemon);
    
    // Animar la imagen
    pokemonImage.src = pokemon.img;
    pokemonImage.title = pokemon.name;
    pokemonImage.setAttribute("data-pokemon-id", pokemon.id);
    
    // Ocultar la imagen (aplicar filtro de silueta)
    pokemonImage.style.filter = "brightness(0) invert(0)";
    
    // Restaurar opacidad con animación
    setTimeout(() => {
      pokemonImage.style.opacity = "1";
      pokemonImage.style.transform = "scale(1)";
    }, 100);
    
  }).fail(() => {
    showNotification("No existe información para este Pokémon en la API. Prueba otro.", "error");
    // Restaurar imagen en caso de error
    pokemonImage.style.opacity = "1";
    pokemonImage.style.transform = "scale(1)";
    pokemonImage.style.filter = "brightness(0) invert(0)";
  });
};

let timerInterval = null;
function startProgressBar() {
  let seconds = 5;
  const barText = document.getElementById("progress-bar-text");
  const barFill = document.getElementById("progress-bar-fill");
  if (timerInterval) clearInterval(timerInterval);
  barText.textContent = seconds;
  barFill.style.width = "100%";
  timerInterval = setInterval(() => {
    seconds--;
    barText.textContent = seconds;
    barFill.style.width = (seconds/5*100) + "%";
    if (seconds <= 0) {
      clearInterval(timerInterval);
      getPokemon();
    }
  }, 1000);
}

// Llama a startProgressBar cada vez que se muestra un nuevo Pokémon
function getPokemonWithTimer() {
  getPokemon();
  // startProgressBar();
}

// Función mejorada para mostrar notificaciones
function showNotification(message, type = "info") {
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Estilos para la notificación
  notification.style.cssText = `
    position: fixed;
    top: ${isMobile ? '80px' : '100px'};
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#3b4cca'};
    color: white;
    padding: ${isMobile ? '12px 20px' : '16px 32px'};
    border-radius: ${isMobile ? '20px' : '25px'};
    font-size: ${isMobile ? '1em' : '1.2em'};
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
    max-width: 90vw;
    text-align: center;
    backdrop-filter: blur(10px);
  `;
  
  document.body.appendChild(notification);
  
  // Mostrar notificación
  setTimeout(() => {
    notification.style.opacity = "1";
  }, 100);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Snackbar mejorado para mostrar el nombre del Pokémon
function showSnackbar(nombre) {
  let snackbar = document.getElementById("snackbar-pokemon");
  if (!snackbar) {
    snackbar = document.createElement("div");
    snackbar.id = "snackbar-pokemon";
    snackbar.style.position = "fixed";
    snackbar.style.bottom = isMobile ? "20px" : "40px";
    snackbar.style.left = "50%";
    snackbar.style.transform = "translateX(-50%)";
    snackbar.style.background = "linear-gradient(90deg, #3b4cca 0%, #ffcb05 100%)";
    snackbar.style.color = "#222";
    snackbar.style.padding = isMobile ? "16px 32px" : "18px 40px";
    snackbar.style.borderRadius = isMobile ? "25px" : "30px";
    snackbar.style.fontSize = isMobile ? "1.8em" : "2.2em";
    snackbar.style.fontWeight = "bold";
    snackbar.style.boxShadow = "0 4px 24px rgba(59,76,202,0.3)";
    snackbar.style.zIndex = "9999";
    snackbar.style.opacity = "0";
    snackbar.style.transition = "all 0.3s ease";
    snackbar.style.maxWidth = "90vw";
    snackbar.style.textAlign = "center";
    snackbar.style.backdropFilter = "blur(10px)";
    document.body.appendChild(snackbar);
  }
  snackbar.textContent = nombre;
  snackbar.style.opacity = "1";
  snackbar.style.transform = "translateX(-50%) scale(1)";
  
  setTimeout(() => {
    snackbar.style.opacity = "0";
    snackbar.style.transform = "translateX(-50%) scale(0.9)";
  }, 2000);
}

// Función para reproducir sonido con mejor manejo de errores
function playPokemonSound(soundId, fallbackSound) {
  const audio = new Audio(`sound/${soundId}.wav`);
  
  audio.play().catch(() => {
    // Fallback al sonido de la API
    if (fallbackSound) {
      const fallbackAudio = new Audio(fallbackSound);
      fallbackAudio.play().catch(() => {
        showNotification("No hay sonido disponible para este Pokémon.", "info");
      });
    } else {
      showNotification("No hay sonido disponible para este Pokémon.", "info");
    }
  });
}

// Función para vibrar en dispositivos móviles (si está disponible)
function vibrateDevice() {
  if (navigator.vibrate && isMobile) {
    navigator.vibrate(50);
  }
}

// Función para manejar el scroll de botones de regiones
function handleRegionScroll() {
  const regionContainer = document.querySelector('.botones-regiones-vertical');
  if (!regionContainer) return;
  
  // Ocultar indicador de scroll si no es necesario
  const hasOverflow = regionContainer.scrollWidth > regionContainer.clientWidth;
  regionContainer.style.setProperty('--show-scroll-indicator', hasOverflow ? '1' : '0');
  
  // Manejar indicadores de scroll izquierdo y derecho
  const isScrolledLeft = regionContainer.scrollLeft > 0;
  const isScrolledRight = regionContainer.scrollLeft < (regionContainer.scrollWidth - regionContainer.clientWidth);
  
  regionContainer.classList.toggle('scrolled', isScrolledLeft);
  
  // Scroll suave al botón activo
  const activeButton = regionContainer.querySelector('.region-btn.active');
  if (activeButton) {
    const containerRect = regionContainer.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    
    if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }
}

// Función para mejorar la experiencia táctil en scroll
function enhanceTouchScroll() {
  const regionContainer = document.querySelector('.botones-regiones-vertical');
  if (!regionContainer || !isMobile) return;
  
  let isScrolling = false;
  let startX = 0;
  let scrollLeft = 0;
  let startTime = 0;
  
  regionContainer.addEventListener('touchstart', (e) => {
    isScrolling = true;
    startX = e.touches[0].pageX - regionContainer.offsetLeft;
    scrollLeft = regionContainer.scrollLeft;
    startTime = Date.now();
  }, { passive: false });
  
  regionContainer.addEventListener('touchmove', (e) => {
    if (!isScrolling) return;
    e.preventDefault();
    const x = e.touches[0].pageX - regionContainer.offsetLeft;
    const walk = (x - startX) * 1.5;
    regionContainer.scrollLeft = scrollLeft - walk;
  }, { passive: false });
  
  regionContainer.addEventListener('touchend', (e) => {
    if (!isScrolling) return;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Si fue un toque rápido, podría ser un clic en un botón
    if (duration < 200) {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.classList.contains('region-btn')) {
        element.click();
      }
    }
    
    isScrolling = false;
  }, { passive: true });
  
  // Mejorar el scroll con rueda del mouse en desktop
  regionContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    regionContainer.scrollLeft += e.deltaY;
  }, { passive: false });
}

// Función para optimizar el layout móvil
function optimizeMobileLayout() {
  if (!isMobile) return;
  
  // Ajustar altura del viewport para móviles
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Asegurar que el contenedor principal tenga la altura correcta
  const layoutContainer = document.querySelector('.layout-container');
  if (layoutContainer) {
    layoutContainer.style.minHeight = '100vh';
    layoutContainer.style.minHeight = 'calc(var(--vh, 1vh) * 100)';
  }
}

// Navegación superior
function showSection(sectionId) {
  $(".section").removeClass("active");
  $(sectionId).addClass("active");
  if (sectionId !== "#section-quiz" && timerInterval) {
    clearInterval(timerInterval);
  }
}

// Event Listeners
$(document).ready(function () {
  // Verificar si es móvil al cargar
  checkMobile();
  
  // Verificar en resize
  $(window).on('resize', checkMobile);
  
  // Reproduce sonido al hacer clic en la imagen
  $("#pokemon-image").on("click touchstart", function (e) {
    e.preventDefault();
    const id = $(this).attr("data-pokemon-id");
    if (id) {
      vibrateDevice();
      
      // Revelar la imagen al hacer clic/toque
      $(this).css("filter", "none");
      
      if (pokemonSelected && pokemonSelected.name) {
        showSnackbar(pokemonSelected.name.charAt(0).toUpperCase() + pokemonSelected.name.slice(1));
      }
      
      const soundId = id.toString().padStart(3, "0");
      playPokemonSound(soundId, pokemonSelected.sound);
    }
  });

  // Botón Nuevo Pokémon (móvil)
  $("#nuevo-pokemon-btn").off("click touchstart").on("click touchstart", function(e) {
    e.preventDefault();
    vibrateDevice();
    
    const playPregunta = $("#check-sonido-pregunta").is(":checked");
    if (playPregunta) {
      const preguntaAudio = new Audio("sound/pregunta-pokemon.mp3");
      preguntaAudio.play().catch(() => {
        // Silenciar error si no se puede reproducir
      });
    }
    getPokemonWithTimer();
  });

  // Botón Nuevo Pokémon (desktop)
  $("#nuevo-pokemon-btn-desktop").off("click touchstart").on("click touchstart", function(e) {
    e.preventDefault();
    vibrateDevice();
    
    const playPregunta = $("#check-sonido-pregunta-desktop").is(":checked");
    if (playPregunta) {
      const preguntaAudio = new Audio("sound/pregunta-pokemon.mp3");
      preguntaAudio.play().catch(() => {
        // Silenciar error si no se puede reproducir
      });
    }
    getPokemonWithTimer();
  });

  // Select de regiones (móvil)
  $("#region-select").on("change", function(e) {
    e.preventDefault();
    vibrateDevice();
    
    const selectedValue = $(this).val();
    const [min, max] = selectedValue.split('-').map(Number);
    
    regionMin = min;
    regionMax = max;
    pokemonsMostrados.length = 0;
    
    // Actualizar botones de desktop si están visibles
    $(".region-btn").removeClass("active");
    $(`.region-btn[data-min="${min}"][data-max="${max}"]`).addClass("active");
    
    getPokemonWithTimer();
  });

  // Botones de región (desktop)
  $(".region-btn").on("click touchstart", function(e) {
    e.preventDefault();
    vibrateDevice();
    
    regionMin = parseInt($(this).attr("data-min"));
    regionMax = parseInt($(this).attr("data-max"));
    pokemonsMostrados.length = 0;
    $(".region-btn").removeClass("active");
    $(this).addClass("active");
    
    // Actualizar select de móvil si está visible
    const selectValue = `${regionMin}-${regionMax}`;
    $("#region-select").val(selectValue);
    
    getPokemonWithTimer();
  });

  // Sincronizar checkboxes
  $("#check-sonido-pregunta").on("change", function() {
    $("#check-sonido-pregunta-desktop").prop("checked", $(this).is(":checked"));
  });
  
  $("#check-sonido-pregunta-desktop").on("change", function() {
    $("#check-sonido-pregunta").prop("checked", $(this).is(":checked"));
  });

  // Marcar el botón 'Todos' como activo al cargar la página
  $(".region-btn").removeClass("active");
  $(".region-btn[data-min='1'][data-max='1025']").addClass("active");
  $("#region-select").val("1-1025");

  // Mostrar el primer Pokémon al cargar la página con el rango de 'Todos'
  regionMin = 1;
  regionMax = 1025;
  getPokemonWithTimer();
  
  // Inicializar funcionalidades de scroll (solo desktop)
  if (!isMobile) {
    handleRegionScroll();
    enhanceTouchScroll();
  }
  optimizeMobileLayout();
  
  // Manejar scroll en resize (solo desktop)
  if (!isMobile) {
    $(window).on('resize', handleRegionScroll);
    $('.botones-regiones-vertical').on('scroll', handleRegionScroll);
  }
  $(window).on('resize', optimizeMobileLayout);
  
  // Prevenir zoom en dispositivos móviles
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  });
  
  document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
  });
  
  document.addEventListener('gestureend', function(e) {
    e.preventDefault();
  });

  // Navegación superior
  $(".nav-link[data-nav='quiz']").on("click", function(e){
    e.preventDefault();
    showSection("#section-quiz");
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });

  $(".nav-link[data-nav='games']").on("click", function(e){
    e.preventDefault();
    showSection("#section-games");
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });

  $("[data-game='tictactoe']").on("click", function(e){
    e.preventDefault();
    showSection("#section-tictactoe");
    $(".nav-link").removeClass("active");
    $(".nav-link[data-nav='games']").addClass("active");
  });

  $("[data-game='memorize']").on("click", function(e){
    e.preventDefault();
    showSection("#section-memorize");
    $(".nav-link").removeClass("active");
    $(".nav-link[data-nav='games']").addClass("active");
  });

  $(document).on("click", ".back-to-games", function(e){
    e.preventDefault();
    showSection("#section-games");
    $(".nav-link").removeClass("active");
    $(".nav-link[data-nav='games']").addClass("active");
  });
});

// ===== Memorize (Juego de Memoria)
const memorizeState = {
  mode: 'random', // 'random' | 'search'
  size: 8, // número de cartas totales: 8, 12, 24
  selectedPokemons: [], // [{id, name, img}]
  deck: [], // cartas duplicadas y mezcladas
  lockBoard: false,
  firstCard: null,
  secondCard: null,
  matches: 0,
  allPokemons: [], // Lista completa de Pokémon para autocompletado
  autocompleteIndex: -1, // Índice del item seleccionado en autocompletado
};

function setMemorizeMode(mode) {
  memorizeState.mode = mode;
  const $tabs = $(".mode-tab");
  $tabs.removeClass("active");
  $tabs.filter(`[data-mode='${mode}']`).addClass("active");
  if (mode === 'random') {
    $(".search-panel").hide();
  } else {
    $(".search-panel").show();
  }
}

function setMemorizeSize(size) {
  memorizeState.size = Number(size);
  const pairs = memorizeState.size / 2;
  if (memorizeState.selectedPokemons.length > pairs) {
    memorizeState.selectedPokemons = memorizeState.selectedPokemons.slice(0, pairs);
    updateSelectedListUI();
    showNotification("Se ajustó la lista al nuevo tamaño de juego.", "info");
  }
}

async function fetchPokemonByIdOrName(identifier) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
    if (!res.ok) throw new Error('not ok');
    const data = await res.json();
    return {
      id: data.id,
      name: data.species.name,
      img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
      sound: data?.cries?.latest || null
    };
  } catch (e) {
    return null;
  }
}

async function buildRandomPokemonList(pairsNeeded) {
  // Usar el rango actual de regiones del quiz para coherencia
  const maxApiId = 1025;
  const minId = regionMin;
  const maxId = Math.min(regionMax, maxApiId);
  const chosen = new Set();
  const result = [];
  let guard = 0;
  while (result.length < pairsNeeded && guard < 5000) {
    const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    if (chosen.has(id)) { guard++; continue; }
    const poke = await fetchPokemonByIdOrName(id);
    if (poke) {
      chosen.add(id);
      result.push(poke);
    }
    guard++;
  }
  return result;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderMemoryBoard() {
  const size = memorizeState.size;
  const pairs = size / 2;
  const board = $("#memorize-board");
  board.empty();
  board.removeClass("size-8 size-12 size-24");
  board.addClass(`size-${size}`);

  // Crear mazo duplicando las selecciones y mezclando
  const duplicated = [];
  for (const p of memorizeState.selectedPokemons) {
    duplicated.push({ key: `${p.id}-a`, id: p.id, name: p.name, img: p.img, sound: p.sound });
    duplicated.push({ key: `${p.id}-b`, id: p.id, name: p.name, img: p.img, sound: p.sound });
  }
  memorizeState.deck = shuffleArray(duplicated);
  memorizeState.lockBoard = false;
  memorizeState.firstCard = null;
  memorizeState.secondCard = null;
  memorizeState.matches = 0;

  // Renderizar cartas
  for (const card of memorizeState.deck) {
    const $card = $(`
      <div class="memory-card" data-id="${card.id}" data-key="${card.key}" data-sound="${card.sound ? card.sound : ''}">
        <div class="card-face card-back">?</div>
        <div class="card-face card-front"><img src="${card.img}" alt="${card.name}" /></div>
      </div>
    `);
    board.append($card);
  }
}

async function startRandomMemorize() {
  const size = memorizeState.size;
  const pairs = size / 2;
  memorizeState.selectedPokemons = await buildRandomPokemonList(pairs);
  if (memorizeState.selectedPokemons.length !== pairs) {
    showNotification("No se pudo completar el mazo al azar.", "error");
    return;
  }
  renderMemoryBoard();
}

function updateSelectedListUI() {
  const container = $("#memorize-selected-list");
  container.empty();
  for (const p of memorizeState.selectedPokemons) {
    const $item = $(`
      <div class="selected-item" data-id="${p.id}">
        <img src="${p.img}" alt="${p.name}" />
        <span>${p.name}</span>
        <span class="remove" title="Quitar">×</span>
      </div>
    `);
    container.append($item);
  }
}

async function addPokemonByName(name) {
  const normalized = (name || '').trim().toLowerCase();
  if (!normalized) return;
  if (memorizeState.selectedPokemons.some(p => p.name === normalized)) {
    showNotification("Ese Pokémon ya está en la lista.", "info");
    return;
  }
  const poke = await fetchPokemonByIdOrName(normalized);
  if (!poke) {
    showNotification("Pokémon no encontrado.", "error");
    return;
  }
  memorizeState.selectedPokemons.push(poke);
  updateSelectedListUI();
}

function removeSelectedPokemon(id) {
  memorizeState.selectedPokemons = memorizeState.selectedPokemons.filter(p => p.id !== Number(id));
  updateSelectedListUI();
}

async function completeSelectionWithRandom() {
  const size = memorizeState.size;
  const neededPairs = size / 2;
  const missing = neededPairs - memorizeState.selectedPokemons.length;
  if (missing <= 0) return;

  const taken = new Set(memorizeState.selectedPokemons.map(p => p.id));
  const maxApiId = 1025;
  const minId = regionMin;
  const maxId = Math.min(regionMax, maxApiId);
  let guard = 0;
  while (memorizeState.selectedPokemons.length < neededPairs && guard < 5000) {
    const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    if (taken.has(id)) { guard++; continue; }
    const poke = await fetchPokemonByIdOrName(id);
    if (poke) {
      taken.add(id);
      memorizeState.selectedPokemons.push(poke);
    }
    guard++;
  }
  updateSelectedListUI();
}

function canStartMemorize() {
  return memorizeState.selectedPokemons.length === memorizeState.size / 2;
}

function onMemoryCardClick($card) {
  if (memorizeState.lockBoard) return;
  if ($card.hasClass('flipped')) return;

  $card.addClass('flipped');

  if (!memorizeState.firstCard) {
    memorizeState.firstCard = $card;
    return;
  }

  memorizeState.secondCard = $card;
  checkForMatch();
}

function checkForMatch() {
  const firstId = memorizeState.firstCard.data('id');
  const secondId = memorizeState.secondCard.data('id');
  const isMatch = firstId === secondId;

  if (isMatch) {
    memorizeState.firstCard.addClass('matched');
    memorizeState.secondCard.addClass('matched');
    // Reproducir sonido del Pokémon al hacer match
    const pokemonId = String(firstId).padStart(3, '0');
    const soundUrl = memorizeState.firstCard.data('sound') || memorizeState.secondCard.data('sound');
    playPokemonSound(pokemonId, soundUrl);

    memorizeState.matches += 1;
    resetTurn();
    // ¿Ganó?
    if (memorizeState.matches === memorizeState.size / 2) {
      showNotification("¡Completaste todas las parejas!", "success");
    }
  } else {
    memorizeState.lockBoard = true;
    setTimeout(() => {
      memorizeState.firstCard.removeClass('flipped');
      memorizeState.secondCard.removeClass('flipped');
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  memorizeState.firstCard = null;
  memorizeState.secondCard = null;
  memorizeState.lockBoard = false;
}

function wireMemorizeHandlers() {
  // Tabs modo
  $(document).on('click', '.mode-tab', function() {
    const mode = $(this).data('mode');
    setMemorizeMode(mode);
  });

  // Selector de tamaño
  $(document).on('change', '#memorize-size', function() {
    setMemorizeSize($(this).val());
  });

  // Generar al azar
  $(document).on('click', '#memorize-random-btn', async function() {
    setMemorizeMode('random');
    await startRandomMemorize();
  });

  // Reiniciar
  $(document).on('click', '#memorize-reset-btn', function() {
    $("#memorize-board").empty();
    memorizeState.selectedPokemons = [];
    memorizeState.deck = [];
    memorizeState.matches = 0;
    updateSelectedListUI();
  });

  // Autocompletado - Input de búsqueda
  $(document).on('input', '#memorize-search-input', function() {
    const query = $(this).val();
    const filtered = filterPokemons(query);
    showAutocomplete(filtered);
  });

  // Autocompletado - Click en item
  $(document).on('click', '.autocomplete-item', function() {
    const pokemonId = $(this).data('id');
    const pokemonName = $(this).data('name');
    selectPokemonFromAutocomplete(pokemonId, pokemonName);
  });

  // Autocompletado - Navegación con teclado
  $(document).on('keydown', '#memorize-search-input', function(e) {
    const items = $('.autocomplete-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateAutocomplete('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateAutocomplete('up');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (memorizeState.autocompleteIndex >= 0) {
        const selectedItem = items.eq(memorizeState.autocompleteIndex);
        const pokemonId = selectedItem.data('id');
        const pokemonName = selectedItem.data('name');
        selectPokemonFromAutocomplete(pokemonId, pokemonName);
      }
    } else if (e.key === 'Escape') {
      hideAutocomplete();
    }
  });

  // Ocultar autocompletado al hacer click fuera
  $(document).on('click', function(e) {
    if (!$(e.target).closest('.search-container').length) {
      hideAutocomplete();
    }
  });

  // Completar al azar los faltantes
  $(document).on('click', '#memorize-complete-random-btn', async function() {
    await completeSelectionWithRandom();
  });

  // Empezar juego (con selección actual)
  $(document).on('click', '#memorize-start-btn', function() {
    if (!canStartMemorize()) {
      showNotification("Debes tener la cantidad exacta de parejas para el tamaño elegido.", "info");
      return;
    }
    renderMemoryBoard();
  });

  // Quitar de la lista seleccionada
  $(document).on('click', '.selected-item .remove', function() {
    const id = $(this).closest('.selected-item').data('id');
    removeSelectedPokemon(id);
  });

  // Click en cartas
  $(document).on('click', '.memory-card', function() {
    onMemoryCardClick($(this));
  });
}

// Inicializa handlers de memorize al cargar
$(document).ready(function () {
  wireMemorizeHandlers();
  wireTicTacToeHandlers();
  loadAllPokemons(); // Cargar lista completa de Pokémon
});

// Cargar lista completa de Pokémon para autocompletado
async function loadAllPokemons() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1025');
    const data = await response.json();
    memorizeState.allPokemons = data.results.map((pokemon, index) => ({
      id: index + 1,
      name: pokemon.name,
      url: pokemon.url
    }));
  } catch (error) {
    console.error('Error cargando lista de Pokémon:', error);
  }
}

// Filtrar Pokémon por nombre
function filterPokemons(query) {
  if (!query || query.length < 1) return [];
  const normalizedQuery = query.toLowerCase();
  return memorizeState.allPokemons
    .filter(pokemon => pokemon.name.includes(normalizedQuery))
    .slice(0, 10); // Limitar a 10 resultados
}

// Mostrar autocompletado
function showAutocomplete(filteredPokemons) {
  const dropdown = $('#memorize-autocomplete');
  dropdown.empty();
  
  if (filteredPokemons.length === 0) {
    dropdown.hide();
    return;
  }
  
  filteredPokemons.forEach((pokemon, index) => {
    const item = $(`
      <div class="autocomplete-item" data-id="${pokemon.id}" data-name="${pokemon.name}">
        <span class="pokemon-name">${pokemon.name}</span>
        <span class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</span>
      </div>
    `);
    dropdown.append(item);
  });
  
  dropdown.show();
  memorizeState.autocompleteIndex = -1;
}

// Ocultar autocompletado
function hideAutocomplete() {
  $('#memorize-autocomplete').hide();
  memorizeState.autocompleteIndex = -1;
}

// Seleccionar Pokémon del autocompletado
async function selectPokemonFromAutocomplete(pokemonId, pokemonName) {
  // Verificar si ya está en la lista
  if (memorizeState.selectedPokemons.some(p => p.id === pokemonId)) {
    showNotification("Ese Pokémon ya está en la lista.", "info");
    return;
  }
  
  // Obtener datos completos del Pokémon
  const pokemon = await fetchPokemonByIdOrName(pokemonId);
  if (pokemon) {
    memorizeState.selectedPokemons.push(pokemon);
    updateSelectedListUI();
    $('#memorize-search-input').val('');
    hideAutocomplete();
  }
}

// Navegar autocompletado con teclado
function navigateAutocomplete(direction) {
  const items = $('.autocomplete-item');
  if (items.length === 0) return;
  
  if (direction === 'down') {
    memorizeState.autocompleteIndex = Math.min(memorizeState.autocompleteIndex + 1, items.length - 1);
  } else if (direction === 'up') {
    memorizeState.autocompleteIndex = Math.max(memorizeState.autocompleteIndex - 1, -1);
  }
  
  items.removeClass('selected');
  if (memorizeState.autocompleteIndex >= 0) {
    items.eq(memorizeState.autocompleteIndex).addClass('selected');
  }
}

// ===== Tic Tac Toe
const tictactoeState = {
  player1: null, // {id, name, img, sound}
  player2: null, // {id, name, img, sound}
  currentPlayer: 1, // 1 o 2
  board: Array(9).fill(null), // 3x3 grid
  gameActive: false,
  stats: {
    player1Wins: 0,
    player2Wins: 0
  }
};

// Crear tablero de Tic Tac Toe
function createTicTacToeBoard() {
  const board = $('#tictactoe-board');
  board.empty();
  
  for (let i = 0; i < 9; i++) {
    const cell = $(`<div class="tictactoe-cell" data-index="${i}"></div>`);
    board.append(cell);
  }
}

// Actualizar UI del jugador actual
function updateCurrentPlayerUI() {
  const currentPlayer = tictactoeState.currentPlayer === 1 ? tictactoeState.player1 : tictactoeState.player2;
  $('#current-player-img').attr('src', currentPlayer.img);
  $('#current-player-name').text(currentPlayer.name);
}

// Actualizar estadísticas
function updateStatsUI() {
  if (tictactoeState.player1) {
    $('#player1-stat-img').attr('src', tictactoeState.player1.img);
    $('#player1-stat-name').text(tictactoeState.player1.name);
    $('#player1-stat-wins').text(`${tictactoeState.stats.player1Wins} victorias`);
  }
  
  if (tictactoeState.player2) {
    $('#player2-stat-img').attr('src', tictactoeState.player2.img);
    $('#player2-stat-name').text(tictactoeState.player2.name);
    $('#player2-stat-wins').text(`${tictactoeState.stats.player2Wins} victorias`);
  }
}

// Verificar si hay un ganador
function checkWinner() {
  const board = tictactoeState.board;
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontales
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticales
    [0, 4, 8], [2, 4, 6] // diagonales
  ];
  
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // retorna 1 o 2
    }
  }
  
  return null;
}

// Verificar si es empate
function isDraw() {
  return tictactoeState.board.every(cell => cell !== null);
}

// Manejar clic en celda
function handleCellClick(index) {
  if (!tictactoeState.gameActive || tictactoeState.board[index] !== null) {
    return;
  }
  
  // Marcar celda
  tictactoeState.board[index] = tictactoeState.currentPlayer;
  const cell = $(`.tictactoe-cell[data-index="${index}"]`);
  const currentPlayer = tictactoeState.currentPlayer === 1 ? tictactoeState.player1 : tictactoeState.player2;
  
  cell.addClass('played');
  cell.html(`<img src="${currentPlayer.img}" alt="${currentPlayer.name}" />`);
  
  // Reproducir sonido
  const pokemonId = String(currentPlayer.id).padStart(3, '0');
  playPokemonSound(pokemonId, currentPlayer.sound);
  
  // Verificar victoria
  const winner = checkWinner();
  if (winner) {
    tictactoeState.gameActive = false;
    tictactoeState.stats[`player${winner}Wins`]++;
    updateStatsUI();
    
    const winnerPokemon = winner === 1 ? tictactoeState.player1 : tictactoeState.player2;
    showNotification(`¡${winnerPokemon.name} ha ganado!`, "success");
    return;
  }
  
  // Verificar empate
  if (isDraw()) {
    tictactoeState.gameActive = false;
    showNotification("¡Empate!", "info");
    return;
  }
  
  // Cambiar turno
  tictactoeState.currentPlayer = tictactoeState.currentPlayer === 1 ? 2 : 1;
  updateCurrentPlayerUI();
}

// Iniciar nuevo juego
function startNewGame() {
  tictactoeState.board = Array(9).fill(null);
  tictactoeState.currentPlayer = 1;
  tictactoeState.gameActive = true;
  
  createTicTacToeBoard();
  updateCurrentPlayerUI();
}

// Verificar si se puede iniciar el juego
function checkCanStartGame() {
  const canStart = tictactoeState.player1 && tictactoeState.player2;
  $('#start-tictactoe-btn').prop('disabled', !canStart);
}

// Actualizar UI del jugador seleccionado
function updatePlayerUI(playerNum, pokemon) {
  const container = $(`#player${playerNum}-selected`);
  if (pokemon) {
    container.html(`
      <img src="${pokemon.img}" alt="${pokemon.name}" />
      <span>${pokemon.name}</span>
    `);
  } else {
    container.html('<div class="placeholder">Sin Pokémon seleccionado</div>');
  }
}

// Autocompletado específico para Tic Tac Toe
function showTicTacToeAutocomplete(playerNum, filteredPokemons) {
  const dropdown = $(`#player${playerNum}-autocomplete`);
  dropdown.empty();
  
  if (filteredPokemons.length === 0) {
    dropdown.hide();
    return;
  }
  
  filteredPokemons.forEach((pokemon, index) => {
    const item = $(`
      <div class="autocomplete-item" data-id="${pokemon.id}" data-name="${pokemon.name}">
        <span class="pokemon-name">${pokemon.name}</span>
        <span class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</span>
      </div>
    `);
    dropdown.append(item);
  });
  
  dropdown.show();
}

// Seleccionar Pokémon para jugador
async function selectPlayerPokemon(playerNum, pokemonId, pokemonName) {
  // Verificar que no sea el mismo Pokémon que el otro jugador
  const otherPlayer = playerNum === 1 ? tictactoeState.player2 : tictactoeState.player1;
  if (otherPlayer && otherPlayer.id === pokemonId) {
    showNotification("No puedes seleccionar el mismo Pokémon que el otro jugador.", "info");
    return;
  }
  
  // Obtener datos completos del Pokémon
  const pokemon = await fetchPokemonByIdOrName(pokemonId);
  if (pokemon) {
    tictactoeState[`player${playerNum}`] = pokemon;
    updatePlayerUI(playerNum, pokemon);
    updateStatsUI();
    checkCanStartGame();
    
    $(`#player${playerNum}-search`).val('');
    $(`#player${playerNum}-autocomplete`).hide();
  }
}

function wireTicTacToeHandlers() {
  // Input de búsqueda para jugador 1
  $(document).on('input', '#player1-search', function() {
    const query = $(this).val();
    const filtered = filterPokemons(query);
    showTicTacToeAutocomplete(1, filtered);
  });
  
  // Input de búsqueda para jugador 2
  $(document).on('input', '#player2-search', function() {
    const query = $(this).val();
    const filtered = filterPokemons(query);
    showTicTacToeAutocomplete(2, filtered);
  });
  
  // Click en autocompletado para jugador 1
  $(document).on('click', '#player1-autocomplete .autocomplete-item', function() {
    const pokemonId = $(this).data('id');
    const pokemonName = $(this).data('name');
    selectPlayerPokemon(1, pokemonId, pokemonName);
  });
  
  // Click en autocompletado para jugador 2
  $(document).on('click', '#player2-autocomplete .autocomplete-item', function() {
    const pokemonId = $(this).data('id');
    const pokemonName = $(this).data('name');
    selectPlayerPokemon(2, pokemonId, pokemonName);
  });
  
  // Navegación con teclado para jugador 1
  $(document).on('keydown', '#player1-search', function(e) {
    const items = $('#player1-autocomplete .autocomplete-item');
    if (items.length === 0) return;
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Implementar navegación similar a memorize
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = items.filter('.selected');
      if (selectedItem.length > 0) {
        const pokemonId = selectedItem.data('id');
        const pokemonName = selectedItem.data('name');
        selectPlayerPokemon(1, pokemonId, pokemonName);
      }
    } else if (e.key === 'Escape') {
      $('#player1-autocomplete').hide();
    }
  });
  
  // Navegación con teclado para jugador 2
  $(document).on('keydown', '#player2-search', function(e) {
    const items = $('#player2-autocomplete .autocomplete-item');
    if (items.length === 0) return;
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Implementar navegación similar a memorize
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = items.filter('.selected');
      if (selectedItem.length > 0) {
        const pokemonId = selectedItem.data('id');
        const pokemonName = selectedItem.data('name');
        selectPlayerPokemon(2, pokemonId, pokemonName);
      }
    } else if (e.key === 'Escape') {
      $('#player2-autocomplete').hide();
    }
  });
  
  // Ocultar autocompletado al hacer click fuera
  $(document).on('click', function(e) {
    if (!$(e.target).closest('.search-container').length) {
      $('.autocomplete-dropdown').hide();
    }
  });
  
  // Empezar juego
  $(document).on('click', '#start-tictactoe-btn', function() {
    $('#tictactoe-setup').hide();
    $('#tictactoe-game').show();
    startNewGame();
  });
  
  // Nuevo juego
  $(document).on('click', '#new-game-btn', function() {
    $('#tictactoe-game').hide();
    $('#tictactoe-setup').show();
  });
  
  // Click en celda del tablero
  $(document).on('click', '.tictactoe-cell', function() {
    const index = $(this).data('index');
    handleCellClick(index);
  });
}
