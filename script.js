"use strict";

const gallery = document.querySelector(".gallery");

if (gallery) {
  const slides = gallery.querySelector(".slides");
  const pauseButton = gallery.querySelector("#pause");
  const previousButton = gallery.querySelector("#prev");
  const nextButton = gallery.querySelector("#next");
  const counter = gallery.querySelector("#counter");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const subjects = [
    "Philosophy and Objectives",
    "Faculty",
    "Instruction",
    "Laboratories",
    "Employability",
    "Research",
    "Library",
    "Student Services",
    "Social Orientation and Community Involvement",
    "Physical Plants and Activities",
    "Organization and Administration",
    "Fingerprint and DNA",
    "Digital Forensics and Trace Evidence"
  ];

  const photos = subjects.map((subject, index) => {
    const image = new Image(1200, 800);
    const number = String(index + 1).padStart(3, "0");

    image.alt = `Conceptual forensic science illustration: ${subject}`;
    image.decoding = "async";
    image.src = `i_forensic${number}.png`;

    return image;
  });

  let current = 0;
  let timer;
  let playing = !reducedMotion.matches;
  let hovered = false;

  function stop() {
    window.clearInterval(timer);
  }

  function schedule() {
    stop();

    const hasFocus = gallery.contains(document.activeElement);

    if (playing && !document.hidden && !hovered && !hasFocus) {
      timer = window.setInterval(() => {
        show(current + 1);
      }, 6500);
    }
  }

  function show(index) {
    const next = (index + photos.length) % photos.length;
    const image = photos[next];

    if (!image.complete || !image.naturalWidth) {
      return;
    }

    current = next;
    slides.replaceChildren(image);

    counter.textContent =
      `${String(current + 1).padStart(2, "0")} / ` +
      String(photos.length).padStart(2, "0");
  }

  function updatePauseButton() {
    pauseButton.textContent = playing ? "Ⅱ" : "▶";

    pauseButton.setAttribute(
      "aria-label",
      playing ? "Pause slideshow" : "Play slideshow"
    );

    schedule();
  }

  counter.textContent = "01 / 13";

  previousButton.addEventListener("click", () => {
    show(current - 1);
    schedule();
  });

  nextButton.addEventListener("click", () => {
    show(current + 1);
    schedule();
  });

  pauseButton.addEventListener("click", () => {
    playing = !playing;
    updatePauseButton();
  });

  gallery.addEventListener("mouseenter", () => {
    hovered = true;
    stop();
  });

  gallery.addEventListener("mouseleave", () => {
    hovered = false;
    schedule();
  });

  gallery.addEventListener("focusin", stop);

  gallery.addEventListener("focusout", (event) => {
    if (!gallery.contains(event.relatedTarget)) {
      window.setTimeout(schedule, 0);
    }
  });

  document.addEventListener("visibilitychange", schedule);

  reducedMotion.addEventListener("change", (event) => {
    playing = !event.matches;
    updatePauseButton();
  });

  updatePauseButton();
}
