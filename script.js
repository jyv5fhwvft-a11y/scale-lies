const WOMEN = [
  { id: "w1", name: "Woman A", bmi: 21, face: "faces/woman-a.jpg", shortCaption: "Low BMI, but look inside.", composition: { muscle: 22, subcutaneousFat: 30, visceralFat: 78 }, risk: { level: "high", label: "High — hidden visceral fat, low muscle" }, note: "The 'skinny fat' pattern. After menopause, falling estrogen can push fat into the abdomen and away from the hips even when scale weight barely moves." },
  { id: "w2", name: "Woman B", bmi: 24, face: "faces/woman-b.jpg", shortCaption: "Higher BMI, stronger inside.", composition: { muscle: 76, subcutaneousFat: 52, visceralFat: 18 }, risk: { level: "low", label: "Low — protective muscle, little visceral fat" }, note: "Higher BMI does not automatically mean higher risk. Muscle supports glucose metabolism, bone density, and balance." },
  { id: "w3", name: "Woman C", bmi: 30, face: "faces/woman-c.jpg", shortCaption: "Higher BMI, metabolically protected.", composition: { muscle: 45, subcutaneousFat: 35, visceralFat: 20 }, risk: { level: "moderate", label: "Moderate — high mass but muscle-preserved" }, note: "The 'metabolically protected obesity' profile. BMI is higher here, yet substantial muscle mass offsets risk." }
];

const OZEMPIC = { baseline: { weight: 82, fatMass: 36, muscleMass: 26 }, withoutProtection: { fatShare: 62, muscleShare: 33 }, withProtection: { fatShare: 90, muscleShare: 8 } };
const MENOPAUSE_SLIDER = { stops: [ { age: 35, label: "Premenopause", bmi: 24.0, hipFat: 78, visceralFat: 18, muscle: 72, message: "Estrogen protects. Fat sits on hips and thighs." }, { age: 45, label: "Perimenopause", bmi: 24.0, hipFat: 60, visceralFat: 40, muscle: 62, message: "Estrogen fluctuates. Fat is migrating." }, { age: 52, label: "Postmenopause", bmi: 24.0, hipFat: 42, visceralFat: 72, muscle: 50, message: "Visceral fat rises. Insulin resistance climbs." }, { age: 60, label: "Late postmenopause", bmi: 24.0, hipFat: 34, visceralFat: 84, muscle: 42, message: "Deep belly fat dominates." } ] };
const QUIZ = { question: "Who should be most worried?", options: [ { id: "w1", label: "Woman A", bmi: 21 }, { id: "w2", label: "Woman B", bmi: 24 }, { id: "w3", label: "Woman C", bmi: 30 }, { id: "all", label: "All equally", bmi: "—" } ], correct: "w1", correctText: "Woman A. BMI 21 — the 'healthy' number. But the highest visceral fat.", incorrectText: "Not quite. Woman A — BMI 21 — is actually the highest risk." };

const m1 = { revealed: false };
function buildSilhouette(woman) {
  const muscleWidth = 20 + woman.composition.muscle * 0.28;
  const viscWidth = 10 + woman.composition.visceralFat * 0.22;
  const subcutWidth = 26 + woman.composition.subcutaneousFat * 0.18;
  return `<svg class="fig" viewBox="0 0 200 300"><g class="layer l-body"><path d="M100 22 c16 0 28 12 28 28 c0 14 -8 24 -14 30 c12 4 22 12 26 26 l12 44 c3 12 -4 22 -16 22 l-6 0 l-4 60 c0 6 -4 10 -10 10 l-12 0 l0 -54 l-8 0 l0 54 l-12 0 c-6 0 -10 -4 -10 -10 l-4 -60 l-6 0 c-12 0 -19 -10 -16 -22 l12 -44 c4 -14 14 -22 26 -26 c-6 -6 -14 -16 -14 -30 c0 -16 12 -28 28 -28 z" fill="#5d6b9e"/></g><g class="layer l-subcut"><ellipse cx="100" cy="150" rx="${subcutWidth}" ry="62" fill="var(--fat)"/><ellipse cx="100" cy="228" rx="${subcutWidth * 0.55}" ry="34" fill="var(--fat)"/></g><g class="layer l-muscle"><ellipse cx="78" cy="150" rx="${muscleWidth * 0.45}" ry="54" fill="var(--muscle)"/><ellipse cx="122" cy="150" rx="${muscleWidth * 0.45}" ry="54" fill="var(--muscle)"/><ellipse cx="100" cy="222" rx="${muscleWidth * 0.50}" ry="30" fill="var(--muscle)"/></g><g class="layer l-visceral"><ellipse cx="100" cy="152" rx="${viscWidth}" ry="${viscWidth * 0.85}" fill="var(--visceral)"/></g></svg>`;
}

function initModule1() {
  const cardsEl = document.getElementById("cards");
  if(!cardsEl) return;
  WOMEN.forEach((w) => {
    const card = document.createElement("article");
    card.className = "card"; card.dataset.id = w.id;
    card.innerHTML = `<span class="bmi-badge">BMI ${w.bmi}</span><img class="bmi-face" src="${w.face}" alt="${w.name}"><p class="name">${w.name}</p><p class="caption">${w.shortCaption}</p>${buildSilhouette(w)}`;
    cardsEl.appendChild(card);
  });
  const revealBtn = document.getElementById("revealBtn");
  const resetBtn = document.getElementById("resetBtn");
  revealBtn.onclick = () => {
    document.querySelectorAll("#module-1 .card").forEach((c, i) => setTimeout(() => c.classList.add("revealed"), i * 180));
    revealBtn.hidden = true; resetBtn.hidden = false;
    document.querySelectorAll("#module-1 .card").forEach(card => {
      card.onclick = () => {
        const w = WOMEN.find(x => x.id === card.dataset.id);
        document.getElementById("modalTitle").textContent = w.name;
        document.getElementById("modalBmi").textContent = `BMI ${w.bmi}`;
        document.getElementById("modalNote").textContent = w.note;
        document.getElementById("modalRisk").className = `risk ${w.risk.level}`;
        document.getElementById("modalRisk").textContent = w.risk.label;
        document.getElementById("modal").hidden = false;
      };
    });
  };
  resetBtn.onclick = () => {
    document.querySelectorAll("#module-1 .card").forEach(c => c.classList.remove("revealed"));
    revealBtn.hidden = false; resetBtn.hidden = true;
  };
  document.getElementById("modalClose").onclick = () => document.getElementById("modal").hidden = true;
}

function initModule2() {
  const slider = document.getElementById("lossSlider");
  if(!slider) return;
  const toggle = document.getElementById("protectToggle");
  function render() {
    const loss = Number(slider.value);
    const protect = toggle.checked;
    document.getElementById("lossVal").textContent = loss + "%";
    document.getElementById("verdict").className = "verdict " + (protect ? "ok" : (loss >= 15 ? "danger" : "warn"));
    document.getElementById("verdict").textContent = protect ? "✓ Muscle preserved." : (loss >= 15 ? "⚠ Muscle lost — frailty risk." : "Muscle lost.");
  }
  slider.oninput = render; toggle.onchange = render; render();
}

function initModule3Slider() {
  const slider = document.getElementById("msSlider");
  if(!slider) return;
  function render() {
    const s = MENOPAUSE_SLIDER.stops[Number(slider.value)];
    document.getElementById("msStage").textContent = s.label;
    document.getElementById("msBmi").textContent = s.bmi.toFixed(1);
    document.getElementById("msMessage").textContent = s.message;
  }
  slider.oninput = render; render();
}

function initModule4Quiz() {
  const wrap = document.getElementById("quizOptions");
  if(!wrap) return;
  QUIZ.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-btn"; btn.innerHTML = `${opt.label}<span class="q-bmi">BMI ${opt.bmi}</span>`;
    btn.onclick = () => {
      document.getElementById("quizResult").hidden = false;
      document.getElementById("quizResult").className = "quiz-result " + (opt.id === QUIZ.correct ? "ok" : "bad");
      document.getElementById("quizResult").textContent = opt.id === QUIZ.correct ? QUIZ.correctText : QUIZ.incorrectText;
    };
    wrap.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cards")) initModule1();
  if (document.getElementById("figure")) initModule2();
  if (document.getElementById("menopauseSlider")) initModule3Slider();
  if (document.getElementById("quiz")) initModule4Quiz();
});
