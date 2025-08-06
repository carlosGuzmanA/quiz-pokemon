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
});
