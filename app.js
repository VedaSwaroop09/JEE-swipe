const QUESTIONS = [
  {
    id: 1, subject: "Physics",
    q: "A particle executes SHM with amplitude A. At what displacement from the mean position are its kinetic and potential energies equal?",
    options: ["A/2", "A/√2", "A/√3", "A/4"],
    answer: 1,
    explanation: "In SHM, total energy is (1/2)kA² and potential energy is (1/2)kx². Equality of KE and PE gives x² = A²/2, so |x| = A/√2."
  },
  {
    id: 2, subject: "Chemistry",
    q: "Which of the following is the strongest acid in aqueous solution?",
    options: ["CH₃COOH", "HCOOH", "CCl₃COOH", "ClCH₂COOH"],
    answer: 2,
    explanation: "Electron-withdrawing chlorine atoms stabilize the conjugate base by the −I effect. Three chlorine atoms make trichloroacetic acid the strongest among these."
  },
  {
    id: 3, subject: "Math",
    q: "If f(x) = xˣ for x > 0, then f′(x) is:",
    options: ["xˣ⁻¹", "xˣ(ln x + 1)", "xˣ ln x", "xˣ⁺¹"],
    answer: 1,
    explanation: "Logarithmic differentiation: ln f = x ln x, so f′/f = ln x + 1. Therefore f′ = xˣ(ln x + 1)."
  },
  {
    id: 4, subject: "Chemistry",
    q: "Which element has the highest first ionization enthalpy among B, C, N and O?",
    options: ["B", "C", "N", "O"],
    answer: 2,
    explanation: "Nitrogen has a half-filled 2p³ configuration, which is especially stable. Oxygen has one paired 2p electron, making its removal slightly easier."
  },
  {
    id: 5, subject: "Physics",
    q: "A capacitor is charged and then disconnected from the battery. If its plate separation is increased, what happens to its potential difference?",
    options: ["It decreases", "It remains constant", "It increases", "It becomes zero"],
    answer: 2,
    explanation: "After disconnection, charge Q remains constant. Since C = εA/d decreases when d increases and V = Q/C, the potential difference increases."
  },
  {
    id: 6, subject: "Math",
    q: "For a differentiable function f, if f′(x) > 0 throughout an interval, then f is:",
    options: ["Constant", "Strictly increasing", "Strictly decreasing", "Periodic"],
    answer: 1,
    explanation: "By the mean value theorem, for x₂ > x₁ there exists c with f(x₂)-f(x₁)=f′(c)(x₂-x₁)>0. Hence f is strictly increasing."
  },
  {
    id: 7, subject: "Physics",
    q: "A charged particle enters a uniform magnetic field with velocity perpendicular to the field. Its kinetic energy:",
    options: ["Increases", "Decreases", "Remains constant", "Becomes zero"],
    answer: 2,
    explanation: "The magnetic force is always perpendicular to velocity, so it does no work. Therefore speed and kinetic energy remain constant."
  },
  {
    id: 8, subject: "Chemistry",
    q: "Which coordination compound can show geometrical isomerism?",
    options: ["[Co(NH₃)₆]³⁺", "[Pt(NH₃)₂Cl₂]", "[Zn(NH₃)₄]²⁺", "[Co(en)₃]³⁺"],
    answer: 1,
    explanation: "[Pt(NH₃)₂Cl₂] is square planar and can exist as cis and trans isomers."
  }
];

let currentSubject = "All";
let pool = [];
let answered = new Map();

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool() {
  const filtered = currentSubject === "All"
    ? QUESTIONS
    : QUESTIONS.filter(q => q.subject === currentSubject);
  pool = shuffle(filtered);
  render();
}

function render() {
  const feed = document.getElementById("feed");
  const empty = document.getElementById("empty");
  feed.innerHTML = "";

  if (!pool.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  pool.forEach((q, index) => {
    const card = document.createElement("section");
    card.className = "card";

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<span>${q.subject}</span><span>${index + 1} / ${pool.length}</span>`;

    const question = document.createElement("h1");
    question.className = "question";
    question.textContent = q.q;

    const options = document.createElement("div");
    options.className = "options";

    const feedback = document.createElement("div");
    feedback.className = "feedback";

    q.options.forEach((option, optionIndex) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
      btn.addEventListener("click", () => answerQuestion(q, optionIndex, options, feedback));
      options.appendChild(btn);
    });

    const hint = document.createElement("div");
    hint.className = "swipe-hint";
    hint.textContent = "Answer → then scroll for the next question";

    inner.append(meta, question, options, feedback, hint);
    card.appendChild(inner);
    feed.appendChild(card);
  });
}

function answerQuestion(q, selected, optionsEl, feedbackEl) {
  if (answered.has(q.id)) return;

  answered.set(q.id, selected);
  const buttons = [...optionsEl.children];

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    if (i === selected && selected !== q.answer) btn.classList.add("wrong");
  });

  const correct = selected === q.answer;
  feedbackEl.className = `feedback show ${correct ? "correct" : "wrong"}`;
  feedbackEl.innerHTML = `
    <div class="feedback-title">${correct ? "✓ Correct" : "✕ Not quite"}</div>
    <div class="explanation">${q.explanation}</div>
  `;
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSubject = btn.dataset.subject;
    buildPool();
  });
});

document.getElementById("shuffleBtn").addEventListener("click", () => {
  buildPool();
  document.getElementById("feed").scrollTo({top: 0, behavior: "smooth"});
});

buildPool();
