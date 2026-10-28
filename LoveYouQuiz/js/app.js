(function () {
  const app   = document.getElementById('app');
  const state = { qi: 0, enteredCode: "" };

  function renderCode() {
    app.innerHTML = `
      <h1 class="fade-in">> . . .</h1>
      <p class="fade-in">Lets all love lain.</p>
      <p class="fade-in" style="margin-top:18px;opacity:0.85;">> ВВЕДИ КОД ДОСТУПА:</p>
      <input id="codeInput" type="text"
             inputmode="numeric" pattern="[0-9]*"
             autocomplete="off" autocapitalize="off" spellcheck="false"
             maxlength="${ACCESS_CODE.length}">
      <button id="codeBtn">> ENTER</button>
      <div id="msg" class="msg"></div>
    `;

    const input = document.getElementById('codeInput');
    input.focus();

    const tryCode = () => {
      const value = input.value.trim();
      if (value === ACCESS_CODE) {
        state.enteredCode = value;
        startQuiz();
      } else {
        document.getElementById('msg').textContent = '> ACCESS DENIED. TRY AGAIN.';
        input.value = '';
        input.focus();
      }
    };

    document.getElementById('codeBtn').addEventListener('click', tryCode);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') tryCode();
    });
  }

  function startQuiz() {
    app.innerHTML = `
      <h1 class="fade-in">> ACCESS GRANTED</h1>
      <p class="fade-in" style="opacity:0.8;">> INITIATING PROTOCOL<span id="dots"></span></p>
    `;

    let n = 0;
    const dots = document.getElementById('dots');
    const iv = setInterval(() => {
      n = (n + 1) % 4;
      dots.textContent = '.'.repeat(n);
    }, 200);

    setTimeout(() => {
      clearInterval(iv);
      state.qi = 0;
      renderQuestion();
    }, 1200);
  }

  function renderQuestion() {
    const q     = QUESTIONS[state.qi];
    const total = QUESTIONS.length + 1;

    app.innerHTML = `
      <div class="progress">> ВОПРОС ${state.qi + 1} / ${total}</div>
      <h2 class="fade-in">${q.q}</h2>
      <div class="options">
        ${q.options.map((o, i) =>
          `<button class="option fade-in" data-i="${i}">${i + 1}. ${o}</button>`
        ).join('')}
      </div>
      <div id="msg" class="msg"></div>
    `;

    const buttons = app.querySelectorAll('.option');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.i, 10);

        if (i === q.correct) {
          state.qi++;
          if (state.qi < QUESTIONS.length) renderQuestion();
          else                             renderFinal();
        } else {
          buttons.forEach(b => b.disabled = true);
          btn.style.borderColor = '#ff3b3b';
          btn.style.color       = '#ff3b3b';
          document.getElementById('msg').textContent = '> НЕВЕРНО. ПОПРОБУЙ ЕЩЁ РАЗ...';
          setTimeout(() => renderQuestion(), 1400);
        }
      });
    });
  }

  function renderFinal() {
    app.innerHTML = `
      <div class="progress">> ФИНАЛЬНЫЙ ВОПРОС</div>
      <h2 class="fade-in">Что ты думаешь обо мне?</h2>
      <textarea id="finalInput" placeholder="напиши от всего сердца..." spellcheck="false"></textarea>
      <button id="finalBtn">> ОТПРАВИТЬ</button>
      <div id="msg" class="msg"></div>
    `;

    const input = document.getElementById('finalInput');
    const btn   = document.getElementById('finalBtn');
    const msg   = document.getElementById('msg');

    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });

    const submit = async () => {
      const text = input.value.trim();

      if (!text) {
        msg.textContent = '> ПУСТО. НАПИШИ ХОТЬ ЧТО-НИБУДЬ.';
        return;
      }

      btn.disabled = true;
      btn.textContent = '> ОТПРАВКА...';
      msg.style.color = '#00ff41';
      msg.style.textShadow = '0 0 6px rgba(0,255,65,0.9)';
      msg.textContent = '> transmitting...';

      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content:
              `💚 **Ответ на финальный вопрос:**\n>>> ${text}\n\n` +
              `🔑 **Введённый код доступа:** \`${state.enteredCode}\``
          })
        });
      } catch (e) {
        console.warn('Webhook error:', e);
      }

      setTimeout(() => window.startHeart(), 600);
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit();
    });
  }

  renderCode();
})();