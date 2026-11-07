/* ═══════════════════════════════════════════════════════════
   THE SCALE LIES — Unified Dashboard Script
   Modules: 1 (BMI reveal) · 2 (Ozempic sim) · 3 (timeline) · 4 (static)
   Data is inlined so there is nothing to fetch — safe for GitHub Pages.
   ═══════════════════════════════════════════════════════════ */

/* ── MODULE 1 DATA ───────────────────────────────────────
   BMIs from the original matrix (21 / 24 / 36) give the strongest
   narrative contrast. Composition and prose come from the richer
   JSON dataset, with Woman C reframed as "protected obesity".
   Composition numbers are independent 0-100 scores (muscle shading,
   subcutaneous ring, visceral core) — not parts of a 100% whole.
   ───────────────────────────────────────────────────────── */
const WOMEN = [
  {
    id: "w1",
    name: "Woman A",
    bmi: 21,
    shortCaption: "Low BMI, but look inside.",
    composition: { muscle: 22, subcutaneousFat: 30, visceralFat: 78 },
    risk: { level: "high", label: "High — hidden visceral fat, low muscle" },
    note: "The 'skinny fat' pattern. After menopause, falling estrogen can push fat into the abdomen and away from the hips even when scale weight barely moves. Visceral fat is metabolically active and inflammatory; low muscle reduces glucose disposal. A low BMI can mask real cardiometabolic risk."
  },
  {
    id: "w2",
    name: "Woman B",
    bmi: 24,
    shortCaption: "Higher BMI, stronger inside.",
    composition: { muscle: 76, subcutaneousFat: 52, visceralFat: 18 },
    risk: { level: "low", label: "Low — protective muscle, little visceral fat" },
    note: "Higher BMI does not automatically mean higher risk. Muscle supports glucose metabolism, bone density, and balance — all especially important as women age. With low visceral fat and strong muscle, this profile can be metabolically healthier than a lower-BMI, low-muscle body."
  },
  {
    id: "w3",
    name: "Woman C",
    bmi: 36,
    shortCaption: "Largest frame, metabolically protected.",
    composition: { muscle: 45, subcutaneousFat: 35, visceralFat: 20 },
    risk: { level: "moderate", label: "Moderate — high mass but muscle-preserved" },
    note: "The 'metabolically protected obesity' profile. BMI is highest here, yet substantial muscle mass and comparatively low visceral fat offset much of the cardiometabolic risk. The target of any intervention is not a lower number — it is shifting the ratio toward muscle and away from visceral fat."
  }
];

/* ── MODULE 2 DATA ───────────────────────────────────────
   Muscle-share of weight lost on semaglutide sits in the 25-45%
   range across STEP 1 and related trial tabulations. Using 33%
   (mid-range) for the unprotected scenario and 8% for the
   protein + resistance-training scenario, which is consistent with
   observational cohorts showing fat-mass loss with preserved or
   increased muscle mass under that protocol.
   ───────────────────────────────────────────────────────── */
const OZEMPIC = {
  baseline: { weight: 82, fatMass: 36, muscleMass: 26 },
  withoutProtection: { fatShare: 62, muscleShare: 33, otherShare: 5 },
  withProtection:    { fatShare: 90, muscleShare: 8,  otherShare: 2 }
};

/* ═══════════════════════════════════════════════════════════
   MODULE 1 — Silhouette cards, reveal, and modal
   ═══════════════════════════════════════════════════════════ */
const m1 = {
  revealed: false,
  cardsEl: null,
  modalEl: null
};

function buildSilhouette(woman) {
  const muscle = woman.composition.muscle;
  const visceral = woman.composition.visceralFat;
  const subcut = woman.composition.subcutaneousFat;

  // Map 0-100 scores to visual dimensions
  const muscleWidth  = 20 + muscle   * 0.28;
  const viscWidth    = 10 + visceral * 0.22;
  const subcutWidth  = 26 + subcut   * 0.18;

  return `
  <svg class="fig" viewBox="0 0 200 300" role="img" aria-label="${woman.name} body composition figure">
    <g class="layer l-body">
      <path d="M100 22
               c16 0 28 12 28 28
               c0 14 -8 24 -14 30
               c12 4 22 12 26 26
               l12 44
               c3 12 -4 22 -16 22
               l-6 0
               l-4 60
               c0 6 -4 10 -10 10
               l-12 0
               l0 -54
               l-8 0
               l0 54
               l-12 0
               c-6 0 -10 -4 -10 -10
               l-4 -60
               l-6 0
               c-12 0 -19 -10 -16 -22
               l12 -44
               c4 -14 14 -22 26 -26
               c-6 -6 -14 -16 -14 -30
               c0 -16 12 -28 28 -28 z"
            fill="#5d6b9e"/>
    </g>
    <g class="layer l-subcut">
      <ellipse cx="100" cy="150" rx="${subcutWidth}" ry="62" fill="var(--fat)"/>
      <ellipse cx="100" cy="228" rx="${subcutWidth * 0.55}" ry="34" fill="var(--fat)"/>
    </g>
    <g class="layer l-muscle">
      <ellipse cx="78"  cy="150" rx="${muscleWidth * 0.45}" ry="54" fill="var(--muscle)"/>
      <ellipse cx="122" cy="150" rx="${muscleWidth * 0.45}" ry="54" fill="var(--muscle)"/>
      <ellipse cx="100" cy="222" rx="${muscleWidth * 0.50}" ry="30" fill="var(--muscle)"/>
      <ellipse cx="100" cy="60"  rx="${muscleWidth * 0.32}" ry="22" fill="var(--muscle)"/>
    </g>
    <g class="layer l-visceral">
      <ellipse cx="100" cy="152" rx="${viscWidth}" ry="${viscWidth * 0.85}" fill="var(--visceral)"/>
    </g>
  </svg>`;
}

function renderModule1() {
  m1.cardsEl = document.getElementById("cards");
  m1.cardsEl.innerHTML = "";

  WOMEN.forEach((w) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = w.id;
    card.setAttribute("aria-label", `${w.name}, BMI ${w.bmi}`);
    card.innerHTML = `
      <span class="bmi-badge">BMI ${w.bmi}</span>
      ${buildSilhouette(w)}
      <p class="name">${w.name}</p>
      <p class="caption">${w.shortCaption}</p>
    `;
    m1.cardsEl.appendChild(card);
  });
}

function openModal(id) {
  const w = WOMEN.find((x) => x.id === id);
  if (!w) return;

  document.getElementById("modalTitle").textContent = w.name;
  document.getElementById("modalBmi").textContent = `BMI ${w.bmi}`;
  document.getElementById("modalNote").textContent = w.note;

  const meters = document.getElementById("modalMeters");
  meters.innerHTML = "";
  const rows = [
    { key: "muscle",          label: "Muscle mass",      cls: "muscle"   },
    { key: "visceralFat",     label: "Visceral fat",     cls: "visceral" },
    { key: "subcutaneousFat", label: "Subcutaneous fat", cls: "subcut"   }
  ];
  rows.forEach((r) => {
    const val = w.composition[r.key];
    const row = document.createElement("div");
    row.className = "meter-row";
    row.innerHTML = `
      <span>${r.label}</span>
      <div class="meter-track"><div class="meter-fill ${r.cls}" data-w="${val}"></div></div>
      <span class="meter-val">${val}</span>
    `;
    meters.appendChild(row);
  });

  const risk = document.getElementById("modalRisk");
  risk.className = `risk ${w.risk.level}`;
  risk.textContent = `Metabolic risk profile: ${w.risk.label}`;

  const modal = m1.modalEl;
  modal.hidden = false;
  requestAnimationFrame(() => {
    modal.querySelectorAll(".meter-fill").forEach((el) => {
      el.style.width = `${el.dataset.w}%`;
    });
  });
}

function closeModal() {
  if (!m1.modalEl) return;
  m1.modalEl.hidden = true;
  m1.modalEl.querySelectorAll(".meter-fill").forEach((el) => (el.style.width = "0%"));
}

function initModule1() {
  renderModule1();
  m1.modalEl = document.getElementById("modal");

  const revealBtn = document.getElementById("revealBtn");
  const resetBtn  = document.getElementById("resetBtn");
  const hint      = document.getElementById("hint");

  revealBtn.addEventListener("click", () => {
    if (m1.revealed) return;
    m1.revealed = true;
    document.querySelectorAll("#module-1 .card").forEach((c, i) => {
      setTimeout(() => c.classList.add("revealed"), i * 180);
    });
    revealBtn.hidden = true;
    resetBtn.hidden = false;
    hint.textContent = "Now tap a woman to see her metabolic risk profile.";

    document.querySelectorAll("#module-1 .card").forEach((card) => {
      card.classList.add("clickable");
      card.onclick = () => openModal(card.dataset.id);
    });
  });

  resetBtn.addEventListener("click", () => {
    m1.revealed = false;
    document.querySelectorAll("#module-1 .card").forEach((c) => {
      c.classList.remove("revealed", "clickable");
      c.onclick = null;
    });
    revealBtn.hidden = false;
    resetBtn.hidden = true;
    hint.textContent = "Press Reveal to see what the scale can't show, then tap a woman to inspect her risk profile.";
    closeModal();
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  m1.modalEl.addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* ═══════════════════════════════════════════════════════════
   MODULE 2 — Ozempic toggle simulation (corrected math)
   ═══════════════════════════════════════════════════════════ */
const m2 = {
  svg: null,
  lossSlider: null,
  lossVal: null,
  protectToggle: null,
  toggleLabel: null,
  verdict: null,
  caption: null
};

function buildSimFigure() {
  m2.svg.innerHTML = `
    <g id="bodyGroup">
      <ellipse id="fatRing" cx="120" cy="210" rx="80" ry="110" fill="var(--fat)" opacity="0.35"/>
      <path id="bodyPath"
        d="M120 40
           c22 0 38 16 38 38
           c0 20 -12 34 -20 42
           c18 6 32 18 38 38
           l14 60
           c4 16 -6 28 -22 28
           l-10 0
           l-6 82
           c0 8 -6 14 -14 14
           l-16 0
           l0 -76
           l-12 0
           l0 76
           l-16 0
           c-8 0 -14 -6 -14 -14
           l-6 -82
           l-10 0
           c-16 0 -26 -12 -22 -28
           l14 -60
           c6 -20 20 -32 38 -38
           c-8 -8 -20 -22 -20 -42
           c0 -22 16 -38 38 -38 z"
        fill="#5d6b9e"/>
      <ellipse id="muscleCore" cx="120" cy="200" rx="46" ry="80" fill="var(--muscle)" opacity="0.55"/>
    </g>
  `;
}

function setMeter(barId, valId, pct, label) {
  document.getElementById(barId).style.width = `${Math.max(0, Math.min(100, pct))}%`;
  document.getElementById(valId).textContent = label;
}

function renderModule2() {
  const lossPct = Number(m2.lossSlider.value);
  const protect = m2.protectToggle.checked;

  m2.lossVal.textContent = `${lossPct}%`;
  m2.toggleLabel.textContent = protect
    ? "Protein + resistance training: ON"
    : "Add protein + resistance training";

  const base = OZEMPIC.baseline;
  const split = protect ? OZEMPIC.withProtection : OZEMPIC.withoutProtection;

  /* CORRECT MATH
     lossPct = % of TOTAL starting body weight lost (0-20%).
     Split shares are % of the weight lost.
     fatLostKg    = totalLostKg * fatShare/100
     muscleLostKg = totalLostKg * muscleShare/100
     → convert to % of the component's own starting mass for the meters.
  */
  const totalLostKg  = base.weight * (lossPct / 100);
  const fatLostKg    = totalLostKg * (split.fatShare / 100);
  const muscleLostKg = totalLostKg * (split.muscleShare / 100);

  const weight = base.weight - totalLostKg;
  const fat    = base.fatMass - fatLostKg;
  const muscle = base.muscleMass - muscleLostKg;

  setMeter("mWeight", "vWeight", (weight / base.weight) * 100, `${weight.toFixed(1)} kg`);
  setMeter("mFat",    "vFat",    (fat    / base.fatMass) * 100,  `${fat.toFixed(1)} kg`);
  setMeter("mMuscle", "vMuscle", (muscle / base.muscleMass) * 100, `${muscle.toFixed(1)} kg`);

  m2.caption.textContent =
    `Current: ${weight.toFixed(1)} kg total · ${fat.toFixed(1)} kg fat · ${muscle.toFixed(1)} kg muscle`;

  updateSimFigure(lossPct, fatLostKg, fat, muscleLostKg, muscle);
  updateVerdict(lossPct, protect, muscleLostKg, muscle);
}

function updateSimFigure(lossPct, fatLostKg, fatNow, muscleLostKg, muscleNow) {
  const bodyGroup = document.getElementById("bodyGroup");
  const fatRing = document.getElementById("fatRing");
  const muscleCore = document.getElementById("muscleCore");

  const base = OZEMPIC.baseline;

  // Whole body shrinks subtly with total weight loss (max ~12% at 20%)
  const scale = 1 - lossPct * 0.006;
  bodyGroup.setAttribute(
    "transform",
    `translate(120 180) scale(${scale}) translate(-120 -180)`
  );

  // Fat ring scales by remaining fat fraction
  const fatFrac = fatNow / base.fatMass; // 0..1
  fatRing.setAttribute("rx", 80 * fatFrac);
  fatRing.setAttribute("ry", 110 * fatFrac);
  fatRing.setAttribute("opacity", 0.15 + 0.4 * fatFrac);

  // Muscle core scales by remaining muscle fraction
  const muscleFrac = muscleNow / base.muscleMass;
  muscleCore.setAttribute("rx", 46 * muscleFrac);
  muscleCore.setAttribute("ry", 80 * muscleFrac);
  muscleCore.setAttribute("opacity", 0.35 + 0.35 * muscleFrac);
}

function updateVerdict(lossPct, protect, muscleLostKg, muscleNow) {
  m2.verdict.className = "verdict";

  if (lossPct === 0) {
    m2.verdict.textContent = "Move the slider to begin.";
    return;
  }

  if (!protect && lossPct >= 15) {
    m2.verdict.className = "verdict danger";
    m2.verdict.textContent =
      `⚠ ${muscleLostKg.toFixed(1)} kg of muscle gone — the frailty risk is real.`;
  } else if (!protect && lossPct >= 8) {
    m2.verdict.className = "verdict warn";
    m2.verdict.textContent =
      `Heads up: ${muscleLostKg.toFixed(1)} kg of muscle lost — try toggling protection on.`;
  } else if (protect && lossPct >= 15) {
    m2.verdict.className = "verdict ok";
    m2.verdict.textContent =
      `✓ Muscle mostly preserved (${muscleNow.toFixed(1)} kg remaining). This is the goal.`;
  } else if (protect) {
    m2.verdict.className = "verdict ok";
    m2.verdict.textContent =
      `Muscle preserved: only ${muscleLostKg.toFixed(1)} kg lost.`;
  } else {
    m2.verdict.className = "verdict warn";
    m2.verdict.textContent =
      `Muscle lost: ${muscleLostKg.toFixed(1)} kg. Toggle protection on to compare.`;
  }
}

function initModule2() {
  m2.svg = document.getElementById("figure");
  m2.lossSlider = document.getElementById("lossSlider");
  m2.lossVal = document.getElementById("lossVal");
  m2.protectToggle = document.getElementById("protectToggle");
  m2.toggleLabel = document.getElementById("toggleLabel");
  m2.verdict = document.getElementById("verdict");
  m2.caption = document.getElementById("figureCaption");

  buildSimFigure();
  m2.lossSlider.addEventListener("input", renderModule2);
  m2.protectToggle.addEventListener("change", renderModule2);
  renderModule2();
}

/* ═══════════════════════════════════════════════════════════
   MODULE 3 — Timeline scroll reveal
   ═══════════════════════════════════════════════════════════ */
function initModule3() {
  const steps = document.querySelectorAll(".tl-step");
  if (!("IntersectionObserver" in window)) {
    steps.forEach((s) => s.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  steps.forEach((s) => io.observe(s));
}

/* ═══════════════════════════════════════════════════════════
   HERO STAT COUNTERS + STICKY NAV ACTIVE STATE
   ═══════════════════════════════════════════════════════════ */
function initHeroCounters() {
  const nums = document.querySelectorAll(".stat-num");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  nums.forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduce) {
      el.textContent = target + suffix;
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      current += step;
      if (current >= target) {
        el.textContent = target + suffix;
        return;
      }
      el.textContent = current + suffix;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function initNav() {
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".module");
  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          links.forEach((l) =>
            l.classList.toggle("active", l.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => io.observe(s));
}

/* ═══════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initModule1();
  initModule2();
  initModule3();
  initHeroCounters();
  initNav();
});
