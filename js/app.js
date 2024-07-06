/** ENCRYPTION TEXT */

// Elementos del DOM
const inputText = document.querySelector('.text-input__textarea'); // Selecciona el área de texto de entrada para encriptar
const resultMessage = document.querySelector('.result__message'); // Selecciona el contenedor para mensajes cuando no hay resultados
const resultOutput = document.querySelector('.result__output'); // Selecciona el contenedor de salida para el texto encriptado
const outputText = document.querySelector('.result__text'); // Selecciona el elemento de salida para mostrar el texto encriptado


// Llaves de encriptación
const encryptionKeys = {
    e: "enter",
    i: "imes",
    a: "ai",
    o: "ober",
    u: "ufat"
};

const keysArray = Object.keys(encryptionKeys); // Array de llaves
const valuesArray = Object.values(encryptionKeys); // Array de valores de las llaves


// Función para encriptar texto
function encryptText() {
    let text = removeAccents(inputText.value); // Obtener texto de entrada sin acentos
    for (let i = 0; i < keysArray.length; i++) {
        text = text.replaceAll(keysArray[i], valuesArray[i]); // Reemplazar llaves por valores en el texto
    }
    outputText.textContent = text; // Mostrar texto encriptado en la salida
    checkInputText(); // Verificar y Actualizar visualización de resultados
}

// Función para desencriptar texto
function decryptText() {
    let text = removeAccents(inputText.value); // Obtener texto de entrada sin acentos
    for (let i = 0; i < keysArray.length; i++) {
        text = text.replaceAll(valuesArray[i], keysArray[i]); // Reemplazar valores por llaves en el texto
    }
    outputText.textContent = text; // Mostrar texto desencriptado en la salida
    checkInputText(); // Verificar y Actualizar visualización de resultados
}

// Función para verificar y ajustar la visualización de los elementos de resultado
function checkInputText() {
    const isEmpty = inputText.value.trim() === ''; // Verificar si el campo de entrada está vacío
    resultMessage.classList.toggle('hidden', !isEmpty); // Mostrar u ocultar mensaje cuando no se ha detectado ningún texto e entrada
    resultOutput.classList.toggle('hidden', isEmpty); // Mostrar u ocultar texto encriptado o desencriptado
}


/** COPY TEXT */

// Función para copiar texto al portapapeles
async function copyText() {
    const copyMessage = document.querySelector('.result__copy-message'); // Mensaje informativo
    try {
        await navigator.clipboard.writeText(outputText.textContent.trim()); // Intentar copiar texto al portapapeles
        copyMessage.style.display = 'block'; // Mostrar mensaje de copia exitosa
        setTimeout(() => { copyMessage.style.display = 'none'; }, 2000); // Ocultar mensaje de copia después de 2 segundos
    } catch (error) {
        console.log('Error al copiar el texto: ', error);
    }
}


/** DARK MODE */

// Elementos del DOM relacionados con el modo oscuro
const favicon = document.getElementById('favicon'); // Icono del navegador
const darkModeIcon = document.getElementById('dark-mode-icon'); // Icono del modo oscuro
const darkModeText = document.querySelector('.dark-mode-toggle__text'); // Texto del modo oscuro
const figureImg = document.querySelector('.result__message__img'); // Imagen del resultado

// Función para alternar el modo oscuro
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode'); // Alternar clase de modo oscuro en el body
    updateDarkModeUI(isDarkMode); // Actualizar interfaz de usuario del modo oscuro
}

// Función para actualizar la interfaz de usuario del modo oscuro
function updateDarkModeUI(isDarkMode) {
    darkModeIcon.src = isDarkMode ? './assets/toggle-on.svg' : './assets/toggle-off.svg'; // Actualizar icono de modo oscuro
    figureImg.src = isDarkMode ? './assets/figure-dark.svg' : './assets/figure.svg'; // Actualizar imagen del resultado
    darkModeText.textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro'; // Actualizar texto del modo oscuro
}

// funcion para obtener la preferencia de modo oscuro del usuario y aplicarla
function getUserDarkModePreference() {
    const preferDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches; // Verificar preferencia del sistema
    document.body.classList.toggle('dark-mode', preferDarkMode); // Aplicar clase de modo oscuro al body según preferencia
    updateDarkModeUI(preferDarkMode); // Actualizar interfaz de usuario del modo oscuro
    favicon.href = preferDarkMode ? './assets/faviconDark.svg' : './assets/favicon.svg'; // Actualizar favicon según modo oscuro
}

getUserDarkModePreference(); // Obtener y aplicar preferencia de modo oscuro al cargar la página


/** SPEECH RECOGNITION */

// Variables y funciones para el reconocimiento de voz
let lastText = ''; // Último texto reconocido
let isMicroEnabled = false; // Estado del micrófono
let recognition; // Objeto de reconocimiento de voz

// Función para habilitar el micrófono y realizar reconocimiento de voz
function enableMicrophone() {
    const microButton = document.querySelector('.microphone__button'); // Botón del micrófono
    const microText = document.querySelector('.microphone__text'); // Texto del micrófono

    // Verificar compatibilidad con reconocimiento de voz
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
        alert("El reconocimiento de voz no es compatible con este navegador.");
        return;
    }
    
    // Inicializar reconocimiento si no está creado
    if (!recognition) {
        recognition = new SpeechRecognition();

        recognition.lang = 'es-ES'; // Establecer idioma español
        recognition.continuous = isMobileDevice() ? false : true; // Configurar reconocimiento continuo según dispositivo
        recognition.interimResults = true; // Habilitar resultados intermedios

        // Evento al finalizar el reconocimiento
        recognition.onend = function() {
            microButton.style.backgroundImage = "url('./assets/micro-off.svg')";
            microText.textContent = 'Activar micrófono';
            isMicroEnabled = false;
        };

        // Evento al iniciar el reconocimiento
        recognition.onstart = function() {
            lastText = inputText.value; // Guardar texto actual
            microButton.style.backgroundImage = "url('./assets/micro-on.svg')";
            microText.textContent = 'Escuchando...';
            isMicroEnabled = true;
        };

        // Evento al finalizar de hablar
        recognition.onspeechend = function() {
            recognition.stop();
        };
        
        // Evento al obtener resultados del reconocimiento de voz
        recognition.onresult = function(e) {
            let temporaryTranscript = ''; // Variable para reconocimiento de voz temporal no finalizada
            let finalizedTranscript = ''; // Variable para reconocimiento de voz finalizada

            // Iterar sobre los resultados obtenidos
            for (let i = 0; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript; // Obtener texto reconocimiento
                if (e.results[i].isFinal) {
                    finalizedTranscript += transcript; // Agregar reconocimiento finalizado
                } else {
                    temporaryTranscript += transcript; // Agregar reconocimiento temporal
                }
            }

            // Combinar texto reconocido finalizado y temporal en un único resultado completo
            const fullTranscript = finalizedTranscript + temporaryTranscript;
            inputText.value = lastText + (lastText ? ' ' : '') + removeAccents(fullTranscript
                .replace(/[.?]/g, ' ') // Remplazar puntos y signos de interrogación de cierre por espacios
                .replace(/[,¿]/g, '')); // Remover comas y signos de interrogación de apertura
        };
    }

    // Alternar entre activar y desactivar el micrófono
    if (isMicroEnabled) {
        recognition.abort();
    } else {
        recognition.start();
    }
}

// Función para remover acentos
function removeAccents(text) {
    const result = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return result.toLowerCase().trim()
} 

// Función para verificar si es un dispositivo móvil
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}