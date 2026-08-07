/* CoreLink — website UI interactions
   scroll progress · sticky nav · reveal on scroll · animated counters · parallax
*/

(function () {
  "use strict";

  /* ---------- Scroll progress bar ---------- */
  var progress = document.getElementById("scrollProgress");

  /* ---------- Sticky nav ---------- */
  var nav = document.getElementById("nav");

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  /* ---------- Counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".stat[data-count]"));

  /* ---------- Parallax ambient orbs ---------- */
  var orbs = Array.prototype.slice.call(document.querySelectorAll(".orb"));

  var ticking = false;

  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + "%";

    if (window.scrollY > 30) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }

    /* subtle parallax on orbs */
    if (window.innerWidth > 640) {
      orbs.forEach(function (orb, i) {
        var speed = i === 0 ? 0.06 : -0.05;
        orb.style.transform = "translate3d(0, " + window.scrollY * speed + "px, 0)";
      });
    }

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });

  /* ---------- IntersectionObserver: reveals ---------- */
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
          setTimeout(function () {
            el.classList.add("visible");
          }, delay);
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var numEl = el.querySelector(".stat-num");
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      numEl.textContent = val.toFixed(decimals);
      if (t < 1) {
        window.requestAnimationFrame(step);
      } else {
        numEl.textContent = target.toFixed(decimals);
      }
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(function (c) {
      var target = parseFloat(c.getAttribute("data-count"));
      c.querySelector(".stat-num").textContent = target.toFixed(parseInt(c.getAttribute("data-decimals") || "0", 10));
    });
  }

  /* ---------- Initial state ---------- */
  requestTick();

  /* ---------- Smooth anchor offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var y = target.getBoundingClientRect().top + window.scrollY - 76;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    });
  });
})();
