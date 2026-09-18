Replace **script.js** with:

```javascript
"use strict";

(() => {
  function initializeSlideshow() {
    const gallery = document.querySelector(".gallery");

    if (!gallery) return;

    const slides = gallery.querySelector("#slideshow");
    const previousButton = gallery.querySelector("#prev");
    const nextButton = gallery.querySelector("#next");
    const pauseButton = gallery.querySelector("#pause");
    const counter = gallery.querySelector("#counter");

    if (
      !slides ||
      !previousButton ||
      !nextButton ||
      !pauseButton ||
      !counter
    ) {
      return;
    }

    const totalImages = 13;
    const slideDuration = 6500;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let currentIndex = 0;
    let timer = null;
    let playing = !reducedMotion.matches;
    let pointerInside = false;
    let requestId = 0;

    const imageCache = new Map();

    const pauseIcon = `
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="6" y="5" width="4" height="14" rx="1"></rect>
        <rect x="14" y="5" width="4" height="14" rx="1"></rect>
      </svg>
    `;

    const playIcon = `
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M8 5v14l11-7z"></path>
      </svg>
    `;

    function imageSource(index) {
      const number = String(index + 1).padStart(3, "0");
      return `i_forensic${number}.jpg`;
    }

    function updateCounter() {
      const current = String(currentIndex + 1).padStart(2, "0");
      counter.textContent = `${current} / ${totalImages}`;
    }

    function stopTimer() {
      window.clearTimeout(timer);
      timer = null;
    }

    function canAutoplay() {
      return (
        playing &&
        !document.hidden &&
        !pointerInside &&
        !gallery.contains(document.activeElement)
      );
    }

    function scheduleNextSlide() {
      stopTimer();

      if (!canAutoplay()) return;

      timer = window.setTimeout(() => {
        navigate(1);
      }, slideDuration);
    }

    function updatePauseButton() {
      pauseButton.innerHTML = playing ? pauseIcon : playIcon;

      pauseButton.setAttribute(
        "aria-label",
        playing ? "Pause slideshow" : "Play slideshow"
      );
    }

    function loadImage(index) {
      if (imageCache.has(index)) {
        return imageCache.get(index);
      }

      const promise = new Promise((resolve) => {
        const image = new Image(1200, 800);

        // Empty alternative text prevents visible fallback wording.
        image.alt = "";
        image.decoding = "async";
        image.draggable = false;

        image.onload = () => {
          image.onload = null;
          image.onerror = null;
          resolve(image);
        };

        image.onerror = () => {
          image.onload = null;
          image.onerror = null;
          resolve(null);
        };

        image.src = imageSource(index);
      });

      imageCache.set(index, promise);
      return promise;
    }

    async function navigate(direction) {
      stopTimer();

      const thisRequest = ++requestId;
      const startingIndex = currentIndex;

      // Skip unavailable images while keeping the current image visible.
      for (let step = 1; step < totalImages; step += 1) {
        const candidate =
          (startingIndex + direction * step + totalImages) %
          totalImages;

        const image = await loadImage(candidate);

        // A newer navigation request takes priority.
        if (thisRequest !== requestId) return;

        if (!image) continue;

        slides.replaceChildren(image);
        currentIndex = candidate;
        updateCounter();

        // Prepare the following image without delaying display.
        void loadImage((currentIndex + 1) % totalImages);

        scheduleNextSlide();
        return;
      }

      scheduleNextSlide();
    }

    previousButton.addEventListener("click", () => {
      void navigate(-1);
    });

    nextButton.addEventListener("click", () => {
      void navigate(1);
    });

    pauseButton.addEventListener("click", () => {
      playing = !playing;
      updatePauseButton();
      scheduleNextSlide();
    });

    // Pause automatic movement while using mouse controls.
    gallery.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;

      pointerInside = true;
      stopTimer();
    });

    gallery.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;

      pointerInside = false;
      scheduleNextSlide();
    });

    // Keep the image still while keyboard focus is inside the gallery.
    gallery.addEventListener("focusin", stopTimer);

    gallery.addEventListener("focusout", (event) => {
      if (!gallery.contains(event.relatedTarget)) {
        window.setTimeout(scheduleNextSlide, 0);
      }
    });

    // Arrow keys work when a slideshow control has focus.
    gallery.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void navigate(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        void navigate(1);
      }
    });

    document.addEventListener(
      "visibilitychange",
      scheduleNextSlide
    );

    reducedMotion.addEventListener("change", (event) => {
      playing = !event.matches;
      updatePauseButton();
      scheduleNextSlide();
    });

    // Keep the first image already present in index.html.
    // It displays immediately without waiting for JavaScript.
    const firstImage = slides.querySelector("img");

    if (firstImage) {
      firstImage.alt = "";
      firstImage.loading = "eager";
      firstImage.draggable = false;

      if (firstImage.complete && firstImage.naturalWidth > 0) {
        imageCache.set(0, Promise.resolve(firstImage));
      } else if (firstImage.complete) {
        void navigate(1);
      } else {
        firstImage.addEventListener(
          "load",
          () => {
            imageCache.set(0, Promise.resolve(firstImage));
          },
          { once: true }
        );

        firstImage.addEventListener(
          "error",
          () => {
            if (currentIndex === 0) void navigate(1);
          },
          { once: true }
        );
      }
    }

    updateCounter();
    updatePauseButton();

    // Preload the remaining images in the background.
    for (let index = 1; index < totalImages; index += 1) {
      void loadImage(index);
    }

    scheduleNextSlide();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeSlideshow,
      { once: true }
    );
  } else {
    initializeSlideshow();
  }
})();
```
