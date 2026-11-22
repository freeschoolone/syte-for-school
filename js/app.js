(() => {
  "use strict";

  const MAX_POINTS_PER_CASE = 20;
  const BEST_SCORE_KEY = "factcheck-best-score";

  const elements = {
    trainer: document.querySelector("#trainer"),
    trainerIntro: document.querySelector("#trainer-intro"),
    quiz: document.querySelector("#quiz"),
    results: document.querySelector("#results"),
    caseNumber: document.querySelector("#case-number"),
    caseCategory: document.querySelector("#case-category"),
    score: document.querySelector("#score"),
    progressBar: document.querySelector("#progress-bar"),
    caseAvatar: document.querySelector("#case-avatar"),
    caseSource: document.querySelector("#case-source"),
    caseMeta: document.querySelector("#case-meta"),
    caseMedia: document.querySelector("#case-media"),
    caseBadge: document.querySelector("#case-badge"),
    caseTitle: document.querySelector("#case-title"),
    caseText: document.querySelector("#case-text"),
    caseLikes: document.querySelector("#case-likes"),
    caseComments: document.querySelector("#case-comments"),
    evidenceCounter: document.querySelector("#evidence-counter"),
    evidenceList: document.querySelector("#evidence-list"),
    verdictFieldset: document.querySelector("#verdict-fieldset"),
    feedback: document.querySelector("#feedback"),
    feedbackMark: document.querySelector("#feedback-mark"),
    feedbackLabel: document.querySelector("#feedback-label"),
    feedbackTitle: document.querySelector("#feedback-title"),
    feedbackExplanation: document.querySelector("#feedback-explanation"),
    feedbackLesson: document.querySelector("#feedback-lesson"),
    nextCase: document.querySelector("#next-case"),
    resultPercent: document.querySelector("#result-percent"),
    resultLevel: document.querySelector("#result-level"),
    resultSummary: document.querySelector("#result-summary"),
    resultCorrect: document.querySelector("#result-correct"),
    resultEvidence: document.querySelector("#result-evidence"),
    resultPoints: document.querySelector("#result-points"),
    bestScore: document.querySelector("#best-score"),
    recommendation: document.querySelector("#recommendation")
  };

  const state = {
    currentCase: 0,
    score: 0,
    correct: 0,
    evidenceTotal: 0,
    openedEvidence: new Set(),
    answered: false,
    mistakes: []
  };

  function getBestScore() {
    const value = Number.parseInt(localStorage.getItem(BEST_SCORE_KEY), 10);
    return Number.isFinite(value) ? value : 0;
  }

  function updateBestScore(score) {
    const best = Math.max(getBestScore(), score);
    localStorage.setItem(BEST_SCORE_KEY, String(best));
    return best;
  }

  function resetState() {
    state.currentCase = 0;
    state.score = 0;
    state.correct = 0;
    state.evidenceTotal = 0;
    state.openedEvidence = new Set();
    state.answered = false;
    state.mistakes = [];
  }

  function scrollToTrainer() {
    elements.trainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startTraining() {
    resetState();
    elements.trainerIntro.classList.add("is-hidden");
    elements.results.classList.add("is-hidden");
    elements.quiz.classList.remove("is-hidden");
    renderCase();
    scrollToTrainer();
  }

  function createEvidenceButton(evidence, index) {
    const button = document.createElement("button");
    button.className = "evidence-button";
    button.type = "button";
    button.dataset.index = String(index);
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `
      <span class="evidence-button__top">
        <span class="evidence-button__icon">${evidence.icon}</span>
        <span class="evidence-button__title"><strong>${evidence.title}</strong><small>${evidence.short}</small></span>
        <span class="evidence-button__plus" aria-hidden="true">+</span>
      </span>
      <span class="evidence-button__detail">${evidence.detail}</span>
    `;
    button.addEventListener("click", () => toggleEvidence(button, index));
    return button;
  }

  function toggleEvidence(button, index) {
    const isOpening = !button.classList.contains("is-open");
    button.classList.toggle("is-open", isOpening);
    button.setAttribute("aria-expanded", String(isOpening));

    if (!state.answered && !state.openedEvidence.has(index)) {
      state.openedEvidence.add(index);
      state.evidenceTotal += 1;
      state.score += 2;
      updateScoreDisplay();
      elements.evidenceCounter.textContent = `${state.openedEvidence.size}/3`;
    }
  }

  function renderCase() {
    const item = FACT_CASES[state.currentCase];
    state.openedEvidence = new Set();
    state.answered = false;

    elements.caseNumber.textContent = `Дело ${state.currentCase + 1} из ${FACT_CASES.length}`;
    elements.caseCategory.textContent = item.category;
    elements.score.textContent = String(state.score);
    elements.progressBar.style.width = `${(state.currentCase / FACT_CASES.length) * 100}%`;
    elements.caseAvatar.textContent = item.avatar;
    elements.caseSource.textContent = item.source;
    elements.caseMeta.textContent = item.meta;
    elements.caseMedia.className = `post-card__media ${item.mediaClass}`;
    elements.caseMedia.setAttribute("aria-label", item.mediaLabel);
    elements.caseBadge.textContent = item.badge;
    elements.caseTitle.textContent = item.title;
    elements.caseText.textContent = item.text;
    elements.caseLikes.textContent = item.likes;
    elements.caseComments.textContent = item.comments;
    elements.evidenceCounter.textContent = "0/3";
    elements.evidenceList.replaceChildren(...item.evidence.map(createEvidenceButton));
    elements.feedback.className = "feedback is-hidden";
    elements.verdictFieldset.disabled = false;
    document.querySelectorAll(".verdict-button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-selected");
    });
  }

  function updateScoreDisplay() {
    elements.score.textContent = String(state.score);
  }

  function submitVerdict(verdict, selectedButton) {
    if (state.answered) return;

    state.answered = true;
    const item = FACT_CASES[state.currentCase];
    const isCorrect = verdict === item.verdict;

    if (isCorrect) {
      state.score += 10;
      state.correct += 1;
    } else {
      state.mistakes.push(item.category);
    }

    if (state.openedEvidence.size === item.evidence.length) {
      state.score += 4;
    }

    updateScoreDisplay();
    elements.progressBar.style.width = `${((state.currentCase + 1) / FACT_CASES.length) * 100}%`;

    document.querySelectorAll(".verdict-button").forEach((button) => {
      button.disabled = true;
      button.classList.toggle("is-selected", button === selectedButton);
    });

    elements.feedback.classList.remove("is-hidden", "is-correct", "is-wrong");
    elements.feedback.classList.add(isCorrect ? "is-correct" : "is-wrong");
    elements.feedbackMark.textContent = isCorrect ? "✓" : "!";
    elements.feedbackLabel.textContent = isCorrect ? "Верный вердикт" : "Разберём ошибку";
    elements.feedbackTitle.textContent = item.verdict === "trust" ? "Информации можно доверять" : "Это манипуляция";
    elements.feedbackExplanation.textContent = item.explanation;
    elements.feedbackLesson.textContent = item.lesson;
    elements.nextCase.textContent = state.currentCase === FACT_CASES.length - 1 ? "Узнать результат →" : "Следующее дело →";
    elements.feedback.focus({ preventScroll: true });
    elements.feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function goToNextCase() {
    if (state.currentCase < FACT_CASES.length - 1) {
      state.currentCase += 1;
      renderCase();
      elements.quiz.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    showResults();
  }

  function getResultProfile(percent) {
    if (percent >= 85) {
      return {
        level: "Фактчекер",
        summary: "Ты внимательно изучаешь источники и умеешь отличать доказательства от убедительной подачи.",
        recommendation: "Продолжай проверять первоисточники и помогай другим не распространять сомнительные сообщения."
      };
    }
    if (percent >= 65) {
      return {
        level: "Исследователь",
        summary: "Ты замечаешь большинство сигналов, но иногда выносишь решение до полной проверки контекста.",
        recommendation: "Перед вердиктом открывай все доступные улики и обязательно ищи независимое подтверждение."
      };
    }
    if (percent >= 40) {
      return {
        level: "Наблюдатель",
        summary: "Ты уже видишь отдельные признаки манипуляции, но яркая подача всё ещё может отвлечь от проверки.",
        recommendation: "Пользуйся методом «ФАКТ» по порядку: утверждение, автор, контекст, подтверждение."
      };
    }
    return {
      level: "Новичок",
      summary: "Это начало тренировки. Главный шаг уже сделан: теперь ты знаешь, что любое сообщение можно исследовать.",
      recommendation: "Не спеши отвечать. Начни с автора и первоисточника, а затем сравни сообщение ещё с двумя источниками."
    };
  }

  function showResults() {
    const maxScore = FACT_CASES.length * MAX_POINTS_PER_CASE;
    const percent = Math.round((state.score / maxScore) * 100);
    const profile = getResultProfile(percent);
    const best = updateBestScore(state.score);
    const mistakeNote = state.mistakes.length
      ? `Особое внимание стоит уделить темам: ${[...new Set(state.mistakes)].join(", ").toLowerCase()}.`
      : "Ты правильно разобрал все восемь публикаций.";

    elements.quiz.classList.add("is-hidden");
    elements.results.classList.remove("is-hidden");
    elements.resultPercent.textContent = `${percent}%`;
    elements.resultLevel.textContent = profile.level;
    elements.resultSummary.textContent = profile.summary;
    elements.resultCorrect.textContent = `${state.correct}/${FACT_CASES.length}`;
    elements.resultEvidence.textContent = `${state.evidenceTotal}/${FACT_CASES.length * 3}`;
    elements.resultPoints.textContent = `${state.score}/${maxScore}`;
    elements.bestScore.textContent = `${best}/${maxScore}`;
    elements.recommendation.innerHTML = `<strong>Персональная рекомендация</strong>${profile.recommendation} ${mistakeNote}`;
    elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll("#header-start, #hero-start, #intro-start").forEach((button) => {
    button.addEventListener("click", startTraining);
  });

  document.querySelectorAll(".verdict-button").forEach((button) => {
    button.addEventListener("click", () => submitVerdict(button.dataset.verdict, button));
  });

  elements.nextCase.addEventListener("click", goToNextCase);
  document.querySelector("#restart").addEventListener("click", startTraining);
  document.querySelector("#print-memo").addEventListener("click", () => window.print());
  document.querySelector("#clear-best").addEventListener("click", () => {
    localStorage.removeItem(BEST_SCORE_KEY);
    elements.bestScore.textContent = `0/${FACT_CASES.length * MAX_POINTS_PER_CASE}`;
  });

  document.querySelectorAll(".method-card").forEach((card) => {
    card.dataset.letter = card.querySelector(".method-card__letter").textContent;
  });
})();
