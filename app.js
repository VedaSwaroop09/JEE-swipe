const state = {
  allQuestions: [],
  filteredQuestions: [],
  selectedSubject: "All",
  answered: new Map(),
};

const feed = document.getElementById("feed");
const filterButtons = [...document.querySelectorAll("[data-subject]")];

async function loadQuestions() {
  try {
    const response = await fetch("./questions.json?v=300", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    state.allQuestions = Array.isArray(data) ? data : data.questions;

    if (!Array.isArray(state.allQuestions) || state.allQuestions.length === 0) {
      throw new Error("Question bank is empty or invalid.");
    }

    applyFilter("All");
  } catch (error) {
    console.error("Could not load questions.json:", error);
    feed.innerHTML = `
      <section class="question-card error-card">
        <div class="question-content">
          <div class="question-number">JEE SWIPE</div>
          <h2>Question bank couldn't be loaded</h2>
          <p>Make sure <strong>questions.json</strong> is in the same GitHub Pages folder as <strong>app.js</strong>.</p>
          <p class="muted">${escapeHtml(error.message)}</p>
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

  const pool = subject === "All"
    ? state.allQuestions
    : state.allQuestions.filter(q => q.subject === subject);

  state.filteredQuestions = shuffle(pool);
  renderFeed();

  if (feed) feed.scrollTo({ top: 0, behavior: "instant" });
}

function renderFeed() {
  feed.innerHTML = "";

  state.filteredQuestions.forEach((question, index) => {
    feed.appendChild(createQuestionCard(question, index));
  });
}

function createQuestionCard(question, index) {
  const section = document.createElement("section");
  section.className = "question-card";
  section.dataset.index = index;

  const content = document.createElement("div");
  content.className = "question-content";

  const number = document.createElement("div");
  number.className = "question-number";
  number.textContent = `Q${question.id}`;

  const meta = document.createElement("div");
  meta.className = "question-meta";

  [question.subject, question.chapter, question.difficulty].forEach(value => {
    const tag = document.createElement("span");
    tag.textContent = value;
    meta.appendChild(tag);
  });

  const title = document.createElement("h2");
  title.textContent = question.question;

  const options = document.createElement("div");
  options.className = "options";

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + optionIndex);

    const text = document.createElement("span");
    text.textContent = option;

    button.append(letter, text);

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

  const heading = document.createElement("strong");
  heading.textContent = correct ? "Correct ✓" : "Incorrect ✗";

  const explanation = document.createElement("p");
  explanation.textContent = question.explanation;

  feedback.replaceChildren(heading, explanation);
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    applyFilter(button.dataset.subject);
  });
});

loadQuestions();
