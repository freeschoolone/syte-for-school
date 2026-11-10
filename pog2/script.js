// Общий скрипт для многостраничного сайта проекта 10 класса
// МБОУ «Гимназия № 1 им. А. Н. Барсукова» г. Коврова

document.addEventListener('DOMContentLoaded', () => {
    // 1. Фильтрация каталога нейросетей на странице catalog.html
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-filter');

                toolCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (category === 'all' || cardCat.includes(category)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 2. Интерактивный конструктор промптов на странице practice.html
    const roleSelect = document.getElementById('prompt-role');
    const subjectSelect = document.getElementById('prompt-subject');
    const goalSelect = document.getElementById('prompt-goal');
    const topicInput = document.getElementById('prompt-topic');
    const levelSelect = document.getElementById('prompt-level');
    const promptResult = document.getElementById('prompt-result');
    const generateBtn = document.getElementById('generate-prompt-btn');
    const copyBtn = document.getElementById('copy-prompt-btn');

    function buildPrompt() {
        if (!promptResult) return;
        const role = roleSelect.value;
        const subject = subjectSelect.value;
        const goal = goalSelect.value;
        const topic = topicInput.value.trim() || 'Законы сохранения импульса и энергии';
        const level = levelSelect.value;

        const text = `Действуй как ${role} в профильном 10 классе МБОУ «Гимназия № 1 имени А. Н. Барсукова».
` +
            `Предмет: ${subject}.
` +
            `Задача: ${goal} по теме «${topic}».
` +
            `Уровень сложности: ${level}.

` +
            `Требования к ответу:
` +
            `1. Не выдавай готовое решение сразу — разбей объяснение на логические шаги.
` +
            `2. Приведи 2 конкретных примера и укажи типичные ошибки десятиклассников на ЕГЭ.
` +
            `3. В конце задай 3 контрольных вопроса для самопроверки.`;

        promptResult.textContent = text;
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', buildPrompt);
        buildPrompt(); // Инициализация при загрузке
    }

    if (copyBtn && promptResult) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(promptResult.textContent).then(() => {
                const original = copyBtn.textContent;
                copyBtn.textContent = '✓ Скопировано в буфер!';
                setTimeout(() => { copyBtn.textContent = original; }, 2000);
            });
        });
    }

    // 3. Блиц-тест по этике и практике ИИ на странице practice.html
    const quizOptions = document.querySelectorAll('.quiz-option');
    const scoreDisplay = document.getElementById('quiz-score');
    let answeredCount = 0;
    let correctCount = 0;

    if (quizOptions.length > 0) {
        quizOptions.forEach(option => {
            option.addEventListener('click', () => {
                const parent = option.closest('.quiz-question');
                if (parent.classList.contains('answered')) return;
                parent.classList.add('answered');
                answeredCount++;

                const isCorrect = option.getAttribute('data-correct') === 'true';
                if (isCorrect) {
                    option.classList.add('correct');
                    correctCount++;
                } else {
                    option.classList.add('wrong');
                    const rightOpt = parent.querySelector('[data-correct="true"]');
                    if (rightOpt) rightOpt.classList.add('correct');
                }

                if (scoreDisplay) {
                    scoreDisplay.textContent = `Ваш результат: ${correctCount} из ${answeredCount} (всего 4 вопроса)`;
                }
            });
        });
    }
});
