const YOUTUBE_VIDEO_ID = "vMDjm_LR3RE";

const overlay = document.getElementById("challengeOverlay");
const finalOverlay = document.getElementById("finalOverlay");
const answers = document.getElementById("answers");
const feedback = document.getElementById("feedback");
const continueBtn = document.getElementById("continueBtn");
const restartBtn = document.getElementById("restartBtn");
const xpEl = document.getElementById("xp");
const correctEl = document.getElementById("correctCount");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const missionCount = document.getElementById("missionCount");
const missionTitle = document.getElementById("missionTitle");
const missionDescription = document.getElementById("missionDescription");
const timerEl = document.getElementById("timer");

// Preguntas integradas en el propio JavaScript.
// Nota: esto no oculta las respuestas al inspeccionar el código.
const lessonData = {
    "lessonTitle": "Laplace Challenge — Clase 2, parte 2",
    "lessonDescription": "Sistemas de control, diagramas de bloques y modelado de procesos",
    "challenges": [
        {
            "time": 180,
            "title": "Lee el diagrama",
            "icon": "🔎",
            "question": "En un diagrama de bloques de un sistema, ¿qué representa normalmente una flecha entre bloques?",
            "options": [
                "La señal que pasa de un elemento a otro",
                "Una pieza física del equipo sin relación con la señal",
                "El tiempo total de la clase"
            ],
            "answer": 0,
            "explanation": "Correcto. Las flechas indican el sentido en que se transmite una señal entre los elementos del sistema.",
            "xp": 100
        },
        {
            "time": 360,
            "title": "Reconoce el proceso",
            "icon": "🧪",
            "question": "En el ejemplo del tanque, ¿qué variable del proceso se busca controlar?",
            "options": [
                "El nivel del líquido en el tanque",
                "El color del tanque",
                "La velocidad del video"
            ],
            "answer": 0,
            "explanation": "El ejemplo representa un proceso de nivel: se busca regular la cantidad o altura de líquido en el tanque.",
            "xp": 100
        },
        {
            "time": 540,
            "title": "Identifica la referencia",
            "icon": "🎯",
            "question": "En un sistema de control, ¿para qué sirve la referencia o valor deseado?",
            "options": [
                "Indica el valor al que se quiere llevar la variable controlada",
                "Muestra cuánto dura la grabación",
                "Elimina la necesidad de medir el proceso"
            ],
            "answer": 0,
            "explanation": "La referencia establece el objetivo con el que se compara la salida real del sistema.",
            "xp": 100
        },
        {
            "time": 780,
            "title": "Piensa en la realimentación",
            "icon": "🔁",
            "question": "¿Qué hace la realimentación en un sistema de control de lazo cerrado?",
            "options": [
                "Devuelve información de la salida para compararla con la referencia",
                "Desconecta siempre el sensor",
                "Hace que la salida nunca cambie"
            ],
            "answer": 0,
            "explanation": "La realimentación permite usar información de la salida para detectar diferencias y corregir el comportamiento del proceso.",
            "xp": 150
        },
        {
            "time": 1020,
            "title": "Ordena las funciones",
            "icon": "⚙️",
            "question": "¿Cuál es el propósito general del controlador dentro del sistema?",
            "options": [
                "Actuar a partir del error para ayudar a regular el proceso",
                "Guardar únicamente el archivo de video",
                "Reemplazar la variable de salida por la referencia"
            ],
            "answer": 0,
            "explanation": "El controlador utiliza la diferencia entre el valor deseado y el medido para determinar una acción de control.",
            "xp": 150
        },
        {
            "time": 1260,
            "title": "Modelo matemático",
            "icon": "📐",
            "question": "¿Para qué se usa una función de transferencia al modelar un sistema lineal?",
            "options": [
                "Para describir matemáticamente la relación entre entrada y salida en el dominio de Laplace, bajo condiciones iniciales nulas",
                "Para indicar el tamaño del archivo MP4",
                "Para convertir un diagrama en una fotografía"
            ],
            "answer": 0,
            "explanation": "La función de transferencia relaciona la salida con la entrada en el dominio de Laplace para un sistema lineal e invariante en el tiempo, con condiciones iniciales nulas.",
            "xp": 150
        },
        {
            "time": 1440,
            "title": "Desafío final",
            "icon": "🏆",
            "question": "Si la salida medida no coincide con la referencia, ¿qué permite hacer el sistema de control con realimentación?",
            "options": [
                "Calcular el error y ajustar la acción de control",
                "Ignorar la medición para siempre",
                "Garantizar que no exista ninguna perturbación"
            ],
            "answer": 0,
            "explanation": "El sistema compara referencia y salida, obtiene el error y puede ajustar la acción de control para acercarse al objetivo.",
            "xp": 200
        }
    ]
};
let challenges = lessonData.challenges;

let current = 0;
let xp = 0;
let correct = 0;
let challengeOpen = false;
let answered = false;
let timer = null;
let seconds = 20;

// ============================================================
// YOUTUBE: reproductor + revisión del tiempo
// ============================================================
let player = null;        // objeto del reproductor de YouTube
let playerReady = false;  // true cuando el reproductor terminó de cargar
let watcher = null;       // intervalo que revisa el tiempo del video
let pendingPlay = false;  // por si se pide play antes de que cargue

// Carga la librería de YouTube. Cuando está lista, YouTube llama
// automáticamente a onYouTubeIframeAPIReady (debe ser una función global).
(function loadYouTubeAPI() {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
})();

window.onYouTubeIframeAPIReady = function () {
    // Reemplaza <div id="lessonVideo"> por el reproductor (un iframe)
    player = new YT.Player("lessonVideo", {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
            rel: 0,            // al pausar, solo sugiere videos de tu canal
            modestbranding: 1, // logo de YouTube más discreto
            playsinline: 1,    // reproduce dentro de la página en iPhone
            fs: 1
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
};

function onPlayerReady() {
    playerReady = true;
    if (pendingPlay) playVideo();
}

// YouTube avisa cada vez que el video cambia de estado:
// 1 = reproduciendo, 2 = en pausa, 0 = terminó, 3 = cargando...
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        startWatcher();
    } else {
        stopWatcher();
    }
    if (event.data === YT.PlayerState.ENDED) {
        handleEnded();
    }
}

// Reemplaza al evento "timeupdate" del <video>, que YouTube no tiene:
// mientras el video se reproduce, consultamos el tiempo cada 250 ms.
function startWatcher() {
    stopWatcher();
    watcher = setInterval(checkChallenge, 250);
}

function stopWatcher() {
    clearInterval(watcher);
    watcher = null;
}

function checkChallenge() {
    if (!playerReady || challengeOpen || current >= challenges.length) return;
    const c = challenges[current];
    if (player.getCurrentTime() >= c.time) {
        pauseVideo();
        showChallenge(c);
    }
}

function handleEnded() {
    if (current < challenges.length && !challengeOpen) {
        current = challenges.length;
        updateDashboard();
        finish();
    }
}

// Funciones auxiliares para no repetir código ni fallar si
// el reproductor todavía no ha cargado.
function playVideo() {
    if (!playerReady) { pendingPlay = true; return; }
    pendingPlay = false;
    player.playVideo();
}

function pauseVideo() {
    if (playerReady) player.pauseVideo();
}

function restartVideo() {
    if (playerReady) player.seekTo(0, true);
}

// ============================================================
// LÓGICA DE LA ACTIVIDAD (igual que antes)
// ============================================================
function updateDashboard() {
    const done = current;
    const total = challenges.length || 1;
    const pct = Math.round((done / total) * 100);
    progressBar.style.width = `${pct}%`;
    progressText.textContent = `Misión ${done} de ${challenges.length}`;
    progressPercent.textContent = `${pct}%`;
    xpEl.textContent = xp;
    correctEl.textContent = correct;
    missionCount.textContent = `${String(Math.min(current + 1, challenges.length)).padStart(2, "0")} / ${String(challenges.length).padStart(2, "0")}`;
}

function showChallenge(c) {
    challengeOpen = true;
    answered = false;
    seconds = 20;
    clearInterval(timer);
    timerEl.textContent = seconds;

    document.getElementById("challengeTitle").textContent = c.title;
    document.getElementById("challengeQuestion").textContent = c.question;
    document.getElementById("challengeIcon").textContent = c.icon;
    feedback.textContent = "";
    feedback.className = "feedback";
    continueBtn.classList.add("hidden");
    answers.innerHTML = "";

    c.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "answer";
        btn.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        btn.addEventListener("click", () => chooseAnswer(index));
        answers.appendChild(btn);
    });

    missionTitle.textContent = c.title;
    missionDescription.textContent = "Responde el reto para continuar con la clase.";
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");

    timer = setInterval(() => {
        seconds--;
        timerEl.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(timer);
            if (!answered) chooseAnswer(-1);
        }
    }, 1000);
}

function chooseAnswer(index) {
    if (answered) return;
    answered = true;
    clearInterval(timer);

    const c = challenges[current];
    const buttons = [...answers.querySelectorAll(".answer")];
    buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === c.answer) b.classList.add("correct");
        if (i === index && index !== c.answer) b.classList.add("wrong");
    });

    if (index === c.answer) {
        correct++;
        xp += c.xp;
        feedback.textContent = `✓ ${c.explanation} +${c.xp} XP`;
        feedback.className = "feedback good";
    } else {
        feedback.textContent = index === -1
            ? `⏱️ Se acabó el tiempo. ${c.explanation}`
            : `✕ No esta vez. ${c.explanation}`;
        feedback.className = "feedback bad";
    }

    xpEl.textContent = xp;
    correctEl.textContent = correct;
    continueBtn.classList.remove("hidden");
}

continueBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    challengeOpen = false;
    current++;
    updateDashboard();

    if (current >= challenges.length) {
        finish();
        return;
    }

    missionTitle.textContent = "Sigue observando";
    missionDescription.textContent = "El siguiente reto aparecerá automáticamente durante la explicación.";
    playVideo();
});

function finish() {
    pauseVideo();
    document.getElementById("finalXP").textContent = xp;
    document.getElementById("finalCorrect").textContent = `${correct}/${challenges.length}`;
    document.getElementById("finalMessage").textContent =
        correct >= 5
            ? "Excelente trabajo. Completaste todos los retos de esta clase."
            : "Actividad completada. Puedes repetirla para reforzar los conceptos.";
    finalOverlay.classList.remove("hidden");
    finalOverlay.setAttribute("aria-hidden", "false");
    progressBar.style.width = "100%";
    progressText.textContent = `Misión ${challenges.length} de ${challenges.length}`;
    progressPercent.textContent = "100%";
}

restartBtn.addEventListener("click", () => {
    current = 0;
    xp = 0;
    correct = 0;
    challengeOpen = false;
    clearInterval(timer);
    finalOverlay.classList.add("hidden");
    finalOverlay.setAttribute("aria-hidden", "true");
    restartVideo();
    updateDashboard();
    missionTitle.textContent = "Prepárate";
    missionDescription.textContent = "Mira la clase y presta atención: aparecerán retos durante la explicación.";
    playVideo();
});

function loadQuestions() {
    document.title = lessonData.lessonTitle || document.title;
    document.querySelector(".topbar h1").textContent = lessonData.lessonTitle || "Laplace Challenge";
    document.querySelector(".topbar p").textContent = lessonData.lessonDescription || "Actividad interactiva";
    document.querySelector(".stats div:nth-child(2) strong").textContent = challenges.length;
    document.getElementById("missionCount").textContent = `01 / ${String(challenges.length).padStart(2, "0")}`;
    document.getElementById("progressText").textContent = `Misión 0 de ${challenges.length}`;
    document.getElementById("finalCorrect").textContent = `0/${challenges.length}`;
    updateDashboard();
}

loadQuestions();

