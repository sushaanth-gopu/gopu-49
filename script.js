/* ============================================================
   GOPU.49 — interactions
   ============================================================ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- PRELOADER: count 00 -> 49 ---------- */
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loaderCount");
  const loaderBar = document.getElementById("loaderBar");

  const finishLoader = () => {
    loader.classList.add("done");
    document.body.style.overflow = "";
    setTimeout(() => loader.remove(), 1000);
  };

  if (reduceMotion) {
    finishLoader();
  } else {
    document.body.style.overflow = "hidden";
    let n = 0;
    const tick = () => {
      n++;
      loaderCount.textContent = String(n).padStart(2, "0");
      loaderBar.style.width = `${(n / 49) * 100}%`;
      if (n < 49) {
        setTimeout(tick, 18 + Math.random() * 30);
      } else {
        setTimeout(finishLoader, 350);
      }
    };
    tick();
  }

  /* ---------- CUSTOM CURSOR ---------- */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    const lerp = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(lerp);
    };
    lerp();
    document.querySelectorAll("[data-hover], a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  /* ---------- SCROLL PROGRESS ---------- */
  const progress = document.getElementById("progress");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${(window.scrollY / max) * 100}%`;
  }, { passive: true });

  /* ---------- REVEAL ON SCROLL ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  /* ---------- PARALLAX WATERMARKS ---------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (!reduceMotion && parallaxEls.length) {
    window.addEventListener("scroll", () => {
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax);
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.translate = `0 ${-offset}px`;
      });
    }, { passive: true });
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counterIO.unobserve(entry.target);
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1600;
      const start = performance.now();
      const fmt = (v) => target > 9999 ? v.toLocaleString("en-US") : String(v);
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach((el) => counterIO.observe(el));

  /* ---------- TILT CARDS ---------- */
  if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- CONFETTI ENGINE ---------- */
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let confettiRunning = false;

  const sizeCanvas = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  const COLORS = ["#d2ff00", "#f4f4f2", "#9dbf00", "#7a8f00", "#ffffff"];

  const burst = (x, y, count) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 13;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        w: 5 + Math.random() * 7,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1,
        decay: 0.004 + Math.random() * 0.006,
      });
    }
    if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(frame); }
  };

  const frame = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    particles.forEach((p) => {
      p.vy += 0.22;           // gravity
      p.vx *= 0.985;          // drag
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (particles.length) {
      requestAnimationFrame(frame);
    } else {
      confettiRunning = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  /* ---------- HOLD-TO-BLOW CANDLES ---------- */
  const blowBtn = document.getElementById("blowBtn");
  const blowFill = document.getElementById("blowFill");
  const cake = document.querySelector(".cake");
  const wishReveal = document.getElementById("wishReveal");
  const againBtn = document.getElementById("againBtn");

  let holdStart = null;
  let holdRAF = null;
  let blown = false;
  const HOLD_MS = 1200;

  const celebrate = () => {
    blown = true;
    cake.classList.add("blown");
    blowFill.style.width = "100%";
    blowBtn.querySelector(".btn__text").textContent = "WISH GRANTED ✦";

    const r = cake.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 3;
    burst(cx, cy, 160);
    setTimeout(() => burst(window.innerWidth * 0.25, window.innerHeight * 0.35, 110), 240);
    setTimeout(() => burst(window.innerWidth * 0.75, window.innerHeight * 0.35, 110), 480);

    wishReveal.classList.add("show");
    setTimeout(() => wishReveal.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), 700);
  };

  const holdFrame = (now) => {
    const p = Math.min((now - holdStart) / HOLD_MS, 1);
    blowFill.style.width = `${p * 100}%`;
    if (p >= 1) { celebrate(); return; }
    holdRAF = requestAnimationFrame(holdFrame);
  };

  const startHold = (e) => {
    if (blown) return;
    e.preventDefault();
    holdStart = performance.now();
    holdRAF = requestAnimationFrame(holdFrame);
  };
  const cancelHold = () => {
    if (blown) return;
    cancelAnimationFrame(holdRAF);
    blowFill.style.width = "0%";
  };

  blowBtn.addEventListener("mousedown", startHold);
  blowBtn.addEventListener("touchstart", startHold, { passive: false });
  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((ev) =>
    blowBtn.addEventListener(ev, cancelHold)
  );
  // keyboard access: press-and-hold Enter/Space
  blowBtn.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) startHold(e);
  });
  blowBtn.addEventListener("keyup", cancelHold);

  againBtn.addEventListener("click", () => {
    blown = false;
    cake.classList.remove("blown");
    blowFill.style.width = "0%";
    blowBtn.querySelector(".btn__text").textContent = "HOLD TO BLOW THE CANDLES";
    wishReveal.classList.remove("show");
    cake.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });

  /* ---------- LITTLE WELCOME BURST ---------- */
  if (!reduceMotion) {
    setTimeout(() => burst(window.innerWidth / 2, window.innerHeight * 0.3, 70), 1900);
  }
})();
