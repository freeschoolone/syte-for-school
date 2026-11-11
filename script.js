"use strict";

document.documentElement.classList.add("js-ready");

const initNavigation = () => {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");

  if (!menuButton || !navigation) return;

  const closeMenu = () => {
    document.documentElement.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = !document.body.classList.contains("nav-open");
    document.documentElement.classList.toggle("nav-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1120) closeMenu();
  });
};

const initTilt = () => {
  const tiltElements = document.querySelectorAll("[data-tilt]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (reduceMotion || !finePointer) return;

  tiltElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
      element.style.setProperty("--tilt-x", `${relativeY * -5}deg`);
      element.style.setProperty("--tilt-y", `${relativeX * 6}deg`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
    });
  });
};

const initCatalogFilters = () => {
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const toolCards = [...document.querySelectorAll(".tool-card[data-categories]")];
  const status = document.querySelector("#filter-status");

  if (!filterButtons.length || !toolCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });

      toolCards.forEach((card) => {
        const categories = card.dataset.categories.split(/\s+/);
        const shouldShow = selectedFilter === "all" || categories.includes(selectedFilter);
        card.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
      });

      if (status) {
        status.textContent = `Показано инструментов: ${visibleCount} из ${toolCards.length}`;
      }
    });
  });
};

const initNewsFilters = () => {
  const filterButtons = [...document.querySelectorAll("[data-news-filter]")];
  const newsCards = [...document.querySelectorAll(".news-card[data-news-category]")];
  const status = document.querySelector("#news-filter-status");

  if (!filterButtons.length || !newsCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.newsFilter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });

      newsCards.forEach((card) => {
        const shouldShow = selectedFilter === "all" || card.dataset.newsCategory === selectedFilter;
        card.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
      });

      if (status) status.textContent = `Показано публикаций: ${visibleCount}`;
    });
  });
};

const initPromptBuilder = () => {
  const form = document.querySelector("#prompt-form");
  const topicInput = document.querySelector("#prompt-topic");
  const contextInput = document.querySelector("#prompt-context");
  const placeholder = document.querySelector("#output-placeholder");
  const resultBlock = document.querySelector("#output-result");
  const promptOutput = document.querySelector("#generated-prompt");
  const formStatus = document.querySelector("#prompt-status");
  const copyButton = document.querySelector("#copy-prompt");
  const copyStatus = document.querySelector("#copy-status");

  if (!form || !topicInput || !promptOutput) return;

  const setFormStatus = (message, type = "") => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status${type ? ` is-${type}` : ""}`;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const topic = topicInput.value.trim();
    if (!topic) {
      topicInput.setAttribute("aria-invalid", "true");
      setFormStatus("Введите тему урока или задачи, чтобы собрать промпт.", "error");
      topicInput.focus();
      return;
    }

    topicInput.removeAttribute("aria-invalid");

    const role = document.querySelector("#prompt-role").value;
    const subject = document.querySelector("#prompt-subject").value;
    const task = document.querySelector("#prompt-task").value;
    const level = document.querySelector("#prompt-level").value;
    const context = contextInput ? contextInput.value.trim() : "";

    const promptParts = [
      `Роль: ты — ${role.toLowerCase()} и доброжелательный учебный тьютор.`,
      `Предмет: ${subject}.`,
      `Уровень: ${level}.`,
      `Тема: «${topic}».`,
      `Моя задача: ${task.toLowerCase()}.`,
    ];

    if (context) {
      promptParts.push(`Мой текущий контекст: ${context}`);
    }

    promptParts.push(
      "Правила работы:",
      "1. Не выдавай готовый финальный ответ, готовое сочинение или полный код для сдачи.",
      "2. Сначала уточни, что я уже понимаю, одним коротким вопросом.",
      "3. Объясняй по шагам: на каждом шаге давай только одну ключевую идею и проси меня применить её самостоятельно.",
      "4. Если я ошибусь, укажи тип ошибки и дай наводящую подсказку, но не исправляй всё за меня.",
      "5. Проверяй формулы, единицы, даты и цитаты. Если не уверен в факте, прямо сообщи об этом и предложи способ проверки по первоисточнику.",
      "6. В конце кратко подведи итог и задай ровно 3 контрольных вопроса разной сложности.",
      "7. Используй ясный русский язык, корректные термины и форматирование, подходящее ученику 10 класса.",
      "Начни с уточняющего вопроса, а не с решения."
    );

    promptOutput.value = promptParts.join("\n\n");
    if (placeholder) placeholder.hidden = true;
    if (resultBlock) resultBlock.hidden = false;
    if (copyStatus) copyStatus.textContent = "";
    setFormStatus("Промпт сформирован. Проверьте формулировку перед использованием.", "success");
  });

  topicInput.addEventListener("input", () => {
    if (topicInput.value.trim()) {
      topicInput.removeAttribute("aria-invalid");
      if (formStatus?.classList.contains("is-error")) setFormStatus("");
    }
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      topicInput.removeAttribute("aria-invalid");
      promptOutput.value = "";
      if (placeholder) placeholder.hidden = false;
      if (resultBlock) resultBlock.hidden = true;
      if (copyStatus) copyStatus.textContent = "";
      setFormStatus("");
    }, 0);
  });

  const fallbackCopy = (text) => {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    return copied;
  };

  copyButton?.addEventListener("click", async () => {
    const text = promptOutput.value;
    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else if (!fallbackCopy(text)) {
        throw new Error("Copy command failed");
      }
      if (copyStatus) {
        copyStatus.textContent = "Промпт скопирован в буфер обмена.";
        copyStatus.className = "form-status is-success";
      }
      copyButton.textContent = "Скопировано";
      window.setTimeout(() => {
        copyButton.textContent = "Скопировать";
      }, 1800);
    } catch {
      promptOutput.focus();
      promptOutput.select();
      if (copyStatus) {
        copyStatus.textContent = "Автокопирование недоступно. Текст выделен — нажмите Ctrl+C.";
        copyStatus.className = "form-status is-error";
      }
    }
  });
};

const initQuiz = () => {
  const quiz = document.querySelector("#quiz");
  const questions = [...document.querySelectorAll(".quiz-question")];
  const scoreLabel = document.querySelector("#quiz-score");
  const result = document.querySelector("#quiz-result");
  const resetButton = document.querySelector("#reset-quiz");

  if (!quiz || !questions.length) return;

  let score = 0;
  let answered = 0;

  const updateScore = () => {
    if (scoreLabel) {
      scoreLabel.textContent = `Отвечено: ${answered} из ${questions.length} · Баллы: ${score}`;
    }
  };

  const showResult = () => {
    if (!result || answered !== questions.length) return;

    let message = "";
    if (score === questions.length) {
      message = "Отличный результат: вы понимаете принципы ответственной работы с ИИ.";
    } else if (score >= 3) {
      message = "Хороший результат: основные принципы усвоены, осталось закрепить отдельные детали.";
    } else if (score >= 2) {
      message = "Базовые знания есть. Вернитесь к каталогу и регламенту академической честности.";
    } else {
      message = "Стоит повторить материалы портала и пройти тест ещё раз.";
    }

    result.innerHTML = `<strong>Итог: ${score} из ${questions.length}.</strong> ${message}`;
    result.hidden = false;
  };

  questions.forEach((question) => {
    const options = [...question.querySelectorAll(".quiz-option")];
    const feedback = question.querySelector(".quiz-feedback");

    options.forEach((option) => {
      option.addEventListener("click", () => {
        if (question.dataset.answered === "true") return;

        const isCorrect = option.dataset.correct === "true";
        question.dataset.answered = "true";
        answered += 1;

        options.forEach((item) => {
          item.disabled = true;
          if (item.dataset.correct === "true") item.classList.add("is-correct");
        });

        if (isCorrect) {
          score += 1;
          if (feedback) {
            feedback.textContent = "Верно. Этот выбор соответствует принципам проекта.";
            feedback.className = "quiz-feedback is-correct";
          }
        } else {
          option.classList.add("is-wrong");
          if (feedback) {
            feedback.textContent = "Неверно. Правильный вариант выделен зелёным — обратите внимание на объясняемый принцип.";
            feedback.className = "quiz-feedback is-wrong";
          }
        }

        quiz.dataset.score = String(score);
        quiz.dataset.answered = String(answered);
        updateScore();
        showResult();
      });
    });
  });

  resetButton?.addEventListener("click", () => {
    score = 0;
    answered = 0;
    quiz.dataset.score = "0";
    quiz.dataset.answered = "0";

    questions.forEach((question) => {
      delete question.dataset.answered;
      question.querySelectorAll(".quiz-option").forEach((option) => {
        option.disabled = false;
        option.classList.remove("is-correct", "is-wrong");
      });
      const feedback = question.querySelector(".quiz-feedback");
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "quiz-feedback";
      }
    });

    if (result) {
      result.hidden = true;
      result.textContent = "";
    }
    updateScore();
    questions[0]?.querySelector(".quiz-option")?.focus();
  });
};

initNavigation();
initTilt();
initCatalogFilters();
initNewsFilters();
initPromptBuilder();
initQuiz();
