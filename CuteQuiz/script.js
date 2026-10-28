/* ================= СОСТОЯНИЕ ================= */
const TOTAL = QUESTIONS.length;
let current = 0;
let mistakes = 0;
let locked = false;

const questionArea = document.getElementById("questionArea");
const progressBar = document.getElementById("progressBar");

const isSmallScreen = window.matchMedia("(max-width: 560px)").matches;
const BURST_COUNT = isSmallScreen ? 8 : 14;
const RAIN_COUNT  = isSmallScreen ? 20 : 34;

const HEARTS = ["💖", "💗", "💕", "💞", "🌸", "✨", "🩷", "💘"];

/* ================= КАРТИНКИ ИЗ ПАПКИ ================= */
function getRandomFemboyImage() {
  if (typeof FEMBOY_IMAGES === "undefined") return null;
  const { count, folder, prefix, ext } = FEMBOY_IMAGES;
  if (!count) return null;
  const n = 1 + Math.floor(Math.random() * count);
  return `${folder}/${prefix}${n}.${ext}`;
}

/* Фоновая предзагрузка, чтобы картинки не мигали */
function preloadFemboys() {
  if (typeof FEMBOY_IMAGES === "undefined") return;
  const { count, folder, prefix, ext } = FEMBOY_IMAGES;
  if (!count) return;
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    img.decoding = "async";
    img.src = `${folder}/${prefix}${i}.${ext}`;
  }
}
preloadFemboys();

/* ================= ПРОГРЕСС ================= */
function updateProgress() {
  progressBar.style.width = (current / TOTAL) * 100 + "%";
}

/* ================= ВОПРОС ================= */
function showQuestion() {
  locked = false;
  updateProgress();

  const q = QUESTIONS[current];
  questionArea.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card enter";

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = `Вопрос ${current + 1} из ${TOTAL}`;

  const emoji = document.createElement("div");
  emoji.className = "emoji";
  emoji.textContent = q.emoji;

  const title = document.createElement("h1");
  title.className = "title-h";
  title.textContent = q.title;

  const sub = document.createElement("p");
  sub.className = "subtitle";
  sub.textContent = q.subtitle || "Выбери единственное верное утверждение";

  const options = document.createElement("div");
  options.className = "options";

  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.style.animationDelay = 0.1 + i * 0.06 + "s";
    btn.innerHTML =
      `<span class="option-letter">${String.fromCharCode(65 + i)}</span>` +
      `<span class="option-text">${text}</span>`;
    btn.addEventListener("click", () => handleAnswer(i, btn, options));
    options.appendChild(btn);
  });

  const feedback = document.createElement("div");
  feedback.className = "feedback";
  feedback.id = "feedback";

  card.append(badge, emoji, title, sub, options, feedback);
  questionArea.appendChild(card);
}

/* ================= ОТВЕТ ================= */
function handleAnswer(index, btn, container) {
  if (locked) return;
  const q = QUESTIONS[current];

  if (index === q.correct) {
    locked = true;
    container.classList.add("locked");
    btn.classList.add("correct");
    burstHearts();
    setTimeout(() => showFact(q.fact), 700);
  } else {
    mistakes++;
    btn.classList.add("wrong");

    const fb = document.getElementById("feedback");
    fb.textContent = "Попробуй ещё раз 💕";
    fb.classList.add("show");

    setTimeout(() => {
      btn.classList.remove("wrong");
      fb.classList.remove("show");
    }, 1200);
  }
}

/* ================= ФАКТ (с картинкой) ================= */
function showFact(fact) {
  const card = questionArea.querySelector(".card");
  if (card) card.classList.add("leaving");

  setTimeout(() => {
    questionArea.innerHTML = "";

    const factCard = document.createElement("div");
    factCard.className = "card fact enter";
    factCard.innerHTML = `
      <div class="fact-top" id="factTop"></div>
      <div class="fact-label">А ты знал?</div>
      <p class="fact-text">${fact}</p>
      <button class="continue-btn" id="continueBtn">Дальше →</button>
    `;
    questionArea.appendChild(factCard);

    /* вставляем картинку или фолбэк с сердечками */
    const top = factCard.querySelector("#factTop");
    const src = getRandomFemboyImage();

    if (src) {
      const img = new Image();
      img.className = "fact-image";
      img.decoding = "async";
      img.alt = "";
      img.onerror = () => {
        top.innerHTML = `<div class="fact-hearts">💖 💗 💕</div>`;
      };
      img.src = src;
      top.appendChild(img);
    } else {
      top.innerHTML = `<div class="fact-hearts">💖 💗 💕</div>`;
    }

    document.getElementById("continueBtn")
      .addEventListener("click", nextQuestion, { once: true });
  }, 220);
}

/* ================= ДАЛЬШЕ ================= */
function nextQuestion() {
  current++;
  if (current >= TOTAL) showFinal();
  else showQuestion();
}

/* ================= ФИНАЛ ================= */
function getResult(mistakes) {
  if (mistakes === 0) {
    return {
      emoji: "🏆",
      title: "Умничка!",
      text: "Все ответы верные — ты просто гений 💕✨",
    };
  }
  if (mistakes <= 2) {
    return {
      emoji: "💖",
      title: "Почти идеально!",
      text: "Всего пара ошибок — ты всё равно молодец 💕",
    };
  }
  if (mistakes <= 4) {
    return {
      emoji: "💗",
      title: "Хороший результат!",
      text: "Ничего страшного, главное ты старался 💕",
    };
  }
  return {
    emoji: "🌸",
    title: "Ты справился!",
    text: "Не важно сколько ошибок — ты всё равно классный 💕",
  };
}

function showFinal() {
  updateProgress();
  questionArea.innerHTML = "";

  const { emoji, title, text } = getResult(mistakes);
  const stats = mistakes === 0
    ? "Без единой ошибки ✨"
    : `Ошибок: ${mistakes}`;

  const card = document.createElement("div");
  card.className = "card final enter";
  card.innerHTML = `
    <div class="final-emoji">${emoji}</div>
    <h1 class="title-h">${title}</h1>
    <p class="subtitle">${text}</p>
    <div class="final-stats">${stats}</div>
    <div class="final-actions">
      <button class="restart-btn" id="restartBtn">Пройти ещё раз 🔄</button>
    </div>
  `;
  questionArea.appendChild(card);

  document.getElementById("restartBtn")
    .addEventListener("click", restart, { once: true });

  rainHearts();
}

function restart() {
  current = 0;
  mistakes = 0;
  showQuestion();
}

/* ================= ЧАСТИЦЫ ================= */
function burstHearts() {
  const rect = questionArea.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const frag = document.createDocumentFragment();

  for (let i = 0; i < BURST_COUNT; i++) {
    const h = document.createElement("span");
    h.className = "burst-heart";
    h.textContent = HEARTS[(Math.random() * HEARTS.length) | 0];
    h.style.left = cx + "px";
    h.style.top = cy + "px";
    h.style.setProperty("--tx", Math.random() * 280 - 140 + "px");
    h.style.setProperty("--ty", -Math.random() * 240 - 40 + "px");
    h.style.setProperty("--r", Math.random() * 360 - 180 + "deg");
    h.style.fontSize = 16 + Math.random() * 14 + "px";
    h.addEventListener("animationend", () => h.remove(), { once: true });
    frag.appendChild(h);
  }

  questionArea.appendChild(frag);
}

function rainHearts() {
  const frag = document.createDocumentFragment();

  for (let i = 0; i < RAIN_COUNT; i++) {
    const h = document.createElement("span");
    h.className = "rain-heart";
    h.textContent = HEARTS[(Math.random() * HEARTS.length) | 0];
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 14 + Math.random() * 20 + "px";
    h.style.animationDuration = 2.6 + Math.random() * 2.2 + "s";
    h.style.animationDelay = (Math.random() * 1.4) + "s";
    h.addEventListener("animationend", () => h.remove(), { once: true });
    frag.appendChild(h);
  }

  document.body.appendChild(frag);
}

/* ================= СТАРТ ================= */
showQuestion();