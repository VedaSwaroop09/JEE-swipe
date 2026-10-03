const state = {
  allQuestions: [],
  filteredQuestions: [],
  currentIndex: 0,
  selectedSubject: "All",
  answered: new Map(),
};

const feed = document.getElementById("feed");
const filterButtons = [...document.querySelectorAll("[data-subject]")];

async function loadQuestions() {
  try {
    const response = await fetch("./questions.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    state.allQuestions = Array.isArray(data) ? data : data.questions;

    if (!Array.isArray(state.allQuestions) || state.allQuestions.length === 0) {
      throw new Error("Question bank is empty or invalid.");
    }

    applyFilter(state.selectedSubject);
  } catch (error) {
    console.error("Could not load questions.json:", error);
    feed.innerHTML = `
      <section class="question-card error-card">
        <div class="question-content">
          <h2>Question bank couldn't be loaded</h2>
          <p>Make sure <strong>questions.json</strong> is uploaded to the same GitHub Pages folder as <strong>app.js</strong>.</p>
          <p class="muted">${error.message}</p>
        </div>
      </section>
    `;
  }
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function applyFilter(subject) {
  state.selectedSubject = subject;
  state.currentIndex = 0;

  const pool = subject === "All"
    ? state.allQuestions
    : state.allQuestions.filter(q => q.subject === subject);

  state.filteredQuestions = shuffle(pool);
  renderFeed();
}

function renderFeed() {
  feed.innerHTML = "";

  state.filteredQuestions.forEach((question, index) => {
    feed.appendChild(createQuestionCard(question, index));
  });

  if (state.filteredQuestions.length === 0) {
    feed.innerHTML = `
      <section class="question-card error-card">
        <div class="question-content">
          <h2>No questions found</h2>
          <p>Try another subject.</p>
        </div>
      </section>
    `;
  }
}

function createQuestionCard(question, index) {
  const section = document.createElement("section");
  section.className = "question-card";
  section.dataset.index = index;

  const content = document.createElement("div");
  content.className = "question-content";

  const meta = document.createElement("div");
  meta.className = "question-meta";
  meta.innerHTML = `
    <span>${escapeHtml(question.subject)}</span>
    <span>${escapeHtml(question.chapter)}</span>
    <span>${escapeHtml(question.difficulty)}</span>
  `;

  const number = document.createElement("div");
  number.className = "question-number";
  number.textContent = `Q${question.id}`;

  const title = document.createElement("h2");
  title.textContent = question.question;

  const options = document.createElement("div");
  options.className = "options";

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + optionIndex)}</span><span>${escapeHtml(option)}</span>`;

    button.addEventListener("click", () => {
      answerQuestion(section, question, optionIndex);
    });

    options.appendChild(button);
  });

  const feedback = document.createElement("div");
  feedback.className = "feedback";
  feedback.hidden = true;

  content.append(number, meta, title, options, feedback);
  section.appendChild(content);

  return section;
}

function answerQuestion(section, question, selectedIndex) {
  if (state.answered.has(question.id)) return;

  state.answered.set(question.id, selectedIndex);

  const buttons = [...section.querySelectorAll(".option-button")];
  const feedback = section.querySelector(".feedback");
  const correct = selectedIndex === question.answer;

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === question.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("wrong");
    }
  });

  feedback.hidden = false;
  feedback.className = `feedback ${correct ? "feedback-correct" : "feedback-wrong"}`;
  feedback.innerHTML = `
    <strong>${correct ? "Correct ✓" : "Incorrect ✗"}</strong>
    <p>${escapeHtml(question.explanation)}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    applyFilter(button.dataset.subject);
  });
});

loadQuestions();
