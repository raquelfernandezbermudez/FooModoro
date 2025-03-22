document.addEventListener('DOMContentLoaded', function() {
    // Distribución aleatoria de las nubes en el eje X para inicio escalonado
    const nubes = document.querySelectorAll('.cloud');
    
    nubes.forEach(nube => {
        // Posición inicial aleatoria
        const randomStartPosition = Math.random() * 100;
        nube.style.left = `${randomStartPosition}%`;
        
        // Variación en el tamaño
        const scaleVariation = 0.8 + Math.random() * 0.6; // Entre 0.8 y 1.4
        nube.style.transform = `scale(${scaleVariation})`;
    });
    
    // ----- AGREGAR ESTRELLAS PARA MODO NOCHE -----
    const sky = document.querySelector('.sky');
    const stars = [];
    
    // Crear estrellas
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Posición aleatoria
        const starX = Math.random() * 100;
        const starY = Math.random() * 100;
        
        star.style.left = `${starX}%`;
        star.style.top = `${starY}%`;
        
        // Tamaño aleatorio
        const starSize = (Math.random() * 2) + 1;
        star.style.width = `${starSize}px`;
        star.style.height = `${starSize}px`;
        
        // Parpadeo aleatorio
        const blinkDelay = Math.random() * 5;
        star.style.animation = `blink 5s ease-in-out ${blinkDelay}s infinite`;
        
        // Ocultar inicialmente
        star.style.opacity = "0";
        
        sky.appendChild(star);
        stars.push(star);
    }
    
    // Crear luna
    const moon = document.createElement('div');
    moon.classList.add('moon');
    moon.style.opacity = "0"; // Ocultar inicialmente
    sky.appendChild(moon);
    
    // ----- LÓGICA DEL TEMPORIZADOR -----
    
    // Elementos del DOM
    const timerDisplay = document.getElementById('timer');
    const statusText = document.getElementById('statusText');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    
    // Sonidos de la aplicación
    let tickSound = null;
    let meowSound = null;
    
    // Función para verificar y cargar sonidos
    function loadSounds() {
        try {
            // Comprobar si el navegador soporta la API de Audio
            if (typeof Audio !== "undefined") {
                // Sonido de tic-tac de reloj
                tickSound = new Audio('sounds/clock-tick.mp3');
                
                // Sonido de miau para cambios de modo
                meowSound = new Audio('sounds/cat-meow.mp3');
                
                // Alternativa en caso de error con archivos de audio
                tickSound.onerror = function() {
                    console.log("Error al cargar sonido de tic-tac, usando alternativa");
                    tickSound = null;
                };
                
                meowSound.onerror = function() {
                    console.log("Error al cargar sonido de miau, usando alternativa");
                    meowSound = null;
                };
            }
        } catch (e) {
            console.log("Error al configurar sonidos:", e);
            tickSound = null;
            meowSound = null;
        }
    }
    
    // Intentar cargar sonidos
    loadSounds();
    
    // Función para reproducir tic-tac usando oscillator como fallback
    function playClockTick() {
        if (!tickSound) {
            if (!window.beepContext) {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                if (typeof AudioContext !== "undefined") {
                    window.beepContext = new AudioContext();
                } else {
                    return; // No se puede reproducir sonido
                }
            }
            
            try {
                const oscillator = window.beepContext.createOscillator();
                const gainNode = window.beepContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(window.beepContext.destination);
                
                gainNode.gain.value = 0.1; // Volumen bajo
                oscillator.frequency.value = 1200; // Frecuencia más alta para sonido de reloj
                oscillator.type = 'sine';
                
                oscillator.start();
                setTimeout(function() {
                    oscillator.stop();
                }, 50); // Duración más corta para tic-tac
            } catch (e) {
                console.log("Error al reproducir tic-tac:", e);
            }
        } else {
            try {
                // Reiniciar el sonido para poder reproducirlo múltiples veces
                tickSound.currentTime = 0;
                tickSound.play();
            } catch (e) {
                console.log("Error al reproducir sonido de tic-tac:", e);
            }
        }
    }
    
    // Función para reproducir miau (o alternativa)
    function playMeow() {
        if (!meowSound) {
            if (!window.beepContext) {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                if (typeof AudioContext !== "undefined") {
                    window.beepContext = new AudioContext();
                } else {
                    return; // No se puede reproducir sonido
                }
            }
            
            try {
                // Crear un sonido tipo "miau" con osciladores
                const oscillator = window.beepContext.createOscillator();
                const gainNode = window.beepContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(window.beepContext.destination);
                
                // Configurar para un sonido tipo miau
                gainNode.gain.value = 0.2;
                oscillator.frequency.value = 500;
                oscillator.type = 'sine';
                
                // Modular la frecuencia para simular un miau
                oscillator.frequency.setValueAtTime(400, window.beepContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(1200, window.beepContext.currentTime + 0.2);
                oscillator.frequency.linearRampToValueAtTime(500, window.beepContext.currentTime + 0.4);
                
                oscillator.start();
                setTimeout(function() {
                    oscillator.stop();
                }, 400);
            } catch (e) {
                console.log("Error al reproducir miau alternativo:", e);
            }
        } else {
            try {
                meowSound.currentTime = 0;
                meowSound.play();
            } catch (e) {
                console.log("Error al reproducir sonido de miau:", e);
            }
        }
    }
    
    // Variables para el temporizador
    const workTime = 1 * 60; // 25 minutos en segundos
    const breakTime = 1 * 60;  // 5 minutos en segundos
    let timeLeft = workTime;
    let timerId = null;
    let isPaused = false;
    let isBreakTime = false;
    let soundPlaying = false;
    
    // Función para formatear el tiempo (convierte segundos a formato MM:SS)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Función para actualizar la visualización del temporizador
    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
        
        // Iniciar sonido de tic-tac cuando quedan 5 segundos
        if (timeLeft <= 5 && timeLeft > 0 && !soundPlaying) {
            soundPlaying = true;
            playTickSound();
        } else if (timeLeft > 5) {
            soundPlaying = false;
        }
        
        // Cambiar color cuando queden menos de 1 minuto durante tiempo de trabajo
        if (timeLeft < 60 && !isBreakTime) {
            timerDisplay.style.color = '#f44336'; // Rojo
        } else if (isBreakTime) {
            // Durante el tiempo de descanso, el color es verde (definido en CSS)
        } else {
            // Durante tiempo de trabajo, el color depende del modo (día/noche)
            if (document.body.classList.contains('night-mode')) {
                timerDisplay.style.color = '#e0e0e0'; // Blanco para modo noche
            } else {
                timerDisplay.style.color = '#333'; // Gris oscuro para modo día
            }
        }
    }
    
    // Función para reproducir el sonido de tic-tac
    function playTickSound() {
        if (timeLeft <= 5 && timeLeft > 0) {
            // Reproducir sonido de reloj
            playClockTick();
            
            // Programar el próximo sonido
            setTimeout(() => {
                if (timeLeft <= 5 && timeLeft > 0) {
                    playTickSound();
                }
            }, 1000);
        }
    }
    
    // Función para cambiar entre modo día y noche
    function toggleNightMode(setNightMode) {
        if (setNightMode) {
            document.body.classList.add('night-mode');
            
            // Mostrar estrellas y luna
            stars.forEach(star => {
                star.style.opacity = "1";
            });
            moon.style.opacity = "1";
        } else {
            document.body.classList.remove('night-mode');
            
            // Ocultar estrellas y luna
            stars.forEach(star => {
                star.style.opacity = "0";
            });
            moon.style.opacity = "0";
        }
        
        // Actualizar color del timer según el modo actual
        updateTimerDisplay();
    }
    
    // Función para iniciar el temporizador
    function startTimer() {
        if (timerId !== null) return; // Evitar múltiples temporizadores
        
        // Mostrar botones de pausar y reiniciar
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        resetButton.style.display = 'inline-block';
        
        // Iniciar la cuenta regresiva
        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                // Tiempo agotado
                clearInterval(timerId);
                timerId = null;
                
                // Alternar entre tiempo de trabajo y descanso
                isBreakTime = !isBreakTime;
                
                if (isBreakTime) {
                    // Cambiar a tiempo de descanso
                    timeLeft = breakTime;
                    statusText.textContent = 'Tiempo de Descanso';
                    document.body.classList.add('break-time');
                    
                    // Activar modo noche automáticamente durante el descanso
                    toggleNightMode(true);
                    
                    // Reproducir sonido de miau para indicar el cambio a descanso
                    playMeow();
                } else {
                    // Cambiar a tiempo de trabajo
                    timeLeft = workTime;
                    statusText.textContent = 'Tiempo de Trabajo';
                    document.body.classList.remove('break-time');
                    
                    // Volver al modo día durante el tiempo de trabajo
                    toggleNightMode(false);
                    
                    // Reproducir un sonido de miau para indicar el cambio a trabajo
                    playMeow();
                }
                
                updateTimerDisplay();
                startTimer(); // Iniciar el siguiente temporizador automáticamente
            }
        }, 1000);
    }
    
    // Función para pausar el temporizador
    function pauseTimer() {
        if (isPaused) {
            // Reanudar
            isPaused = false;
            pauseButton.textContent = 'Pausar';
            timerDisplay.classList.remove('paused');
            startTimer();
        } else {
            // Pausar
            isPaused = true;
            clearInterval(timerId);
            timerId = null;
            pauseButton.textContent = 'Reanudar';
            timerDisplay.classList.add('paused');
        }
    }
    
    // Función para reiniciar el temporizador
    function resetTimer() {
        clearInterval(timerId);
        timerId = null;
        
        // Volver al tiempo de trabajo
        isBreakTime = false;
        timeLeft = workTime;
        statusText.textContent = 'Tiempo de Trabajo';
        document.body.classList.remove('break-time');
        
        // Volver al modo día
        toggleNightMode(false);
        
        updateTimerDisplay();
        resetTimerInterface();
    }
    
    // Función para reiniciar la interfaz
    function resetTimerInterface() {
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        resetButton.style.display = 'none';
        pauseButton.textContent = 'Pausar';
        isPaused = false;
        timerDisplay.classList.remove('paused');
        
        if (document.body.classList.contains('night-mode')) {
            timerDisplay.style.color = '#e0e0e0'; // Blanco para modo noche
        } else {
            timerDisplay.style.color = '#333'; // Gris oscuro para modo día
        }
    }
    
    // Asegurar que estamos en modo día al cargar
    toggleNightMode(false);
    
    // Eventos de los botones
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
});