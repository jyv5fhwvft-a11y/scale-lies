/* ═══════════════════════════════════════════════════════════
   THE WEIGHT YOU LOSE vs. THE BODY YOU KEEP
   Slide navigation — no sim logic here, that lives in script.js
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const deck = document.querySelector(".pres-deck");
  if (!deck) return;

  const slides = Array.from(deck.querySelectorAll(".pres-slide"));
  if (!slides.length) return;

  const totalSlides = slides.length;
  let currentIndex = 0;

  // ── Nav elements (created once we know slides exist) ──
  const prevBtn = document.getElementById("presPrev");
  const nextBtn = document.getElementById("presNext");
  const counter = document.getElementById("presCounter");
  const dotsWrap = document.getElementById("presDots");

  // ── Build dots ────────────────────────────────────────
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "pres-nav-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.dataset.index = i;
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  // ── Read slide from URL hash ──────────────────────────
  function readHash() {
    const m = window.location.hash.match(/^#slide-(\d+)$/);
    if (!m) return 0;
    const n = parseInt(m[1], 10);
    if (isNaN(n) || n < 1 || n > totalSlides) return 0;
    return n - 1;
  }

  // ── Write slide to URL hash (no history spam) ─────────
  function writeHash(index) {
    if (!history.replaceState) return;
    const newHash = `#slide-${index + 1}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, "", newHash);
    }
  }

  // ── Core: go to a slide ───────────────────────────────
  function goTo(index, opts) {
    opts = opts || {};
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    if (index === currentIndex && !opts.force) return;

    const prev = currentIndex;
    currentIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.remove("pres-active", "pres-prev");
      if (i === currentIndex) {
        slide.classList.add("pres-active");
        // Scroll active slide to top for a clean entry
        slide.scrollTop = 0;
      } else if (i === prev && i < currentIndex) {
        slide.classList.add("pres-prev");
      }
    });

    // Update counter
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }

    // Update dots
    if (dotsWrap) {
      dotsWrap.querySelectorAll(".pres-nav-dot").forEach((d, i) => {
        d.classList.toggle("pres-dot-active", i === currentIndex);
      });
    }

    // Update arrow buttons
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;

    // Persist to hash
    writeHash(currentIndex);

    // Fire a custom event so presentation.html can react
    // (e.g., init sims only when their slide becomes active)
    window.dispatchEvent(
      new CustomEvent("pres:slide", {
        detail: { index: currentIndex, total: totalSlides }
      })
    );
  }

  // ── Next / prev ───────────────────────────────────────
  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  // ── Wire buttons ──────────────────────────────────────
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  // ── Keyboard (desktop / iPad with keyboard) ───────────
  document.addEventListener("keydown", (e) => {
    // Don't hijack when user is interacting with a form control
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(totalSlides - 1);
    }
  });

  // ── Swipe gestures (iPad / touch) ─────────────────────
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  const SWIPE_THRESHOLD = 60;      // px
  const SWIPE_MAX_TIME = 700;      // ms
  const SWIPE_MAX_Y = 60;          // reject mostly-vertical swipes

  deck.addEventListener(
    "touchstart",
    (e) => {
      // Don't interfere with sliders or form controls
      const t = e.target;
      if (t.closest("input, textarea, select, button.pres-nav-btn, .pres-nav-dot")) return;
      if (t.tagName === "INPUT" && t.type === "range") return;
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    },
    { passive: true }
  );

  deck.addEventListener(
    "touchend",
    (e) => {
      const t = e.target;
      if (t.closest("input, textarea, select, button.pres-nav-btn, .pres-nav-dot")) return;
      if (t.tagName === "INPUT" && t.type === "range") return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const dt = Date.now() - touchStartTime;

      if (dt > SWIPE_MAX_TIME) return;                  // too slow — user is scrolling
      if (Math.abs(dy) > SWIPE_MAX_Y) return;           // mostly vertical — not a slide swipe
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;       // too small — not a swipe

      if (dx < 0) next();                               // swipe left → next
      else prev();                                      // swipe right → prev
    },
    { passive: true }
  );

  // ── Respond to hash changes (Back button, deep links) ─
  window.addEventListener("hashchange", () => {
    const target = readHash();
    if (target !== currentIndex) goTo(target, { force: true });
  });

  // ── Boot ──────────────────────────────────────────────
  // Start on the slide indicated by the hash, or slide 1
  const initial = readHash();
  goTo(initial, { force: true });

  // Expose a minimal API for the page to call (used by sims)
  window.Presentation = {
    goTo: goTo,
    next: next,
    prev: prev,
    currentIndex: () => currentIndex,
    totalSlides: () => totalSlides
  };

  console.log(
    `[presentation.js] ready · ${totalSlides} slides · starting at ${initial + 1}`
  );
})();
