(function () {
  const APP = window.NAC_DATA;
  const PANEL_KEYS = ["dx", "tx", "scales", "session"];
  const state = {
    entered: false,
    activePanel: null,
    currentIndex: 0,
    fullscreen: false,
    fullscreenFallback: false,
    standaloneReadingDismissed: false,
    summaryExpanded: false,
    swipeStart: null,
    slides: [],
    slidesReady: false,
    slidesPromise: null,
    returnFocusEl: null
  };
  const DEV_HOSTNAMES = ["localhost", "127.0.0.1"];

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    syncViewportMetrics();
    hydrateStaticCopy();
    bindBaseEvents();
    prepareCover();
    ensureSlides();
    registerServiceWorker();
  }

  function cacheElements() {
    els.appShell = document.querySelector(".app-shell");
    els.coverScreen = document.getElementById("cover-screen");
    els.appScreen = document.getElementById("app-screen");
    els.coverTitle = document.getElementById("cover-title");
    els.coverAuthor = document.getElementById("cover-author");
    els.coverImage = document.getElementById("cover-image");
    els.coverCaption = document.getElementById("cover-caption");
    els.enterButton = document.getElementById("enter-button");
    els.appTitle = document.getElementById("app-title");
    els.backToCoverButton = document.getElementById("back-to-cover-button");
    els.slideCounter = document.getElementById("slide-counter");
    els.slideKicker = document.getElementById("slide-kicker");
    els.slideHeading = document.getElementById("slide-heading");
    els.summaryToggleButton = document.getElementById("summary-toggle-button");
    els.viewerLayout = document.getElementById("viewer-layout");
    els.viewerCard = document.getElementById("viewer-card");
    els.slideMediaFrame = document.getElementById("slide-media-frame");
    els.slideImage = document.getElementById("slide-image");
    els.slidePlaceholder = document.getElementById("slide-placeholder");
    els.placeholderTitle = document.getElementById("placeholder-title");
    els.placeholderCopy = document.getElementById("placeholder-copy");
    els.slideSummary = document.getElementById("slide-summary");
    els.viewerPosition = document.getElementById("viewer-position");
    els.previousButton = document.getElementById("previous-button");
    els.nextButton = document.getElementById("next-button");
    els.fullscreenButton = document.getElementById("fullscreen-button");
    els.overlay = document.getElementById("overlay");
    els.summaryBackdrop = document.getElementById("summary-backdrop");
    els.summaryModal = document.getElementById("summary-modal");
    els.summaryModalTitle = document.getElementById("summary-modal-title");
    els.summaryModalBody = document.getElementById("summary-modal-body");
    els.closeSummaryButton = document.getElementById("close-summary-button");
    els.sidePanel = document.getElementById("side-panel");
    els.panelKicker = document.getElementById("panel-kicker");
    els.panelTitle = document.getElementById("panel-title");
    els.panelBody = document.getElementById("panel-body");
    els.closePanelButton = document.getElementById("close-panel-button");
    els.panelButtons = Array.from(document.querySelectorAll(".rail-button"));
  }

  function hydrateStaticCopy() {
    document.title = APP.appName;
    els.coverTitle.textContent = APP.appName;
    if (els.coverAuthor) {
      els.coverAuthor.textContent = "";
      els.coverAuthor.hidden = true;
    }
    els.appTitle.textContent = APP.appName;
  }

  function bindBaseEvents() {
    els.enterButton.addEventListener("click", enterPresentation);
    if (els.backToCoverButton) {
      els.backToCoverButton.addEventListener("click", returnToCover);
    }
    els.previousButton.addEventListener("click", () => changeSlide(-1));
    els.nextButton.addEventListener("click", () => changeSlide(1));
    els.fullscreenButton.addEventListener("click", toggleFullscreen);
    if (els.summaryToggleButton) {
      els.summaryToggleButton.addEventListener("click", toggleSummary);
    }
    els.overlay.addEventListener("click", closePanel);
    if (els.summaryBackdrop) {
      els.summaryBackdrop.addEventListener("click", closeSummaryModal);
    }
    if (els.closeSummaryButton) {
      els.closeSummaryButton.addEventListener("click", closeSummaryModal);
    }
    els.closePanelButton.addEventListener("click", closePanel);

    els.panelButtons.forEach((button) => {
      button.addEventListener("click", () => togglePanel(button.dataset.panel, button));
    });

    if (els.slideMediaFrame) {
      els.slideMediaFrame.addEventListener("touchstart", handleSwipeStart, { passive: true });
      els.slideMediaFrame.addEventListener("touchend", handleSwipeEnd, { passive: true });
      els.slideMediaFrame.addEventListener("touchcancel", resetSwipeState, { passive: true });
    }

    document.addEventListener("keydown", handleGlobalKeydown);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }
  }

  async function prepareCover() {
    const coverFound = await probeImage(APP.assets.cover);
    els.coverImage.src = coverFound ? APP.assets.cover : APP.assets.coverPlaceholder;
    els.coverCaption.textContent = "";
    els.coverCaption.hidden = true;
  }

  async function enterPresentation() {
    state.entered = true;
    els.coverScreen.hidden = true;
    els.appScreen.hidden = false;

    if (!state.slidesReady) {
      renderLoadingState("Cargando");
    }

    await ensureSlides();
    renderCurrentSlide();
    syncFullscreenState();
  }

  function returnToCover() {
    closePanel();
    closeSummaryModal();
    exitAppFullscreen();
    state.entered = false;
    state.standaloneReadingDismissed = false;
    state.summaryExpanded = false;
    els.appScreen.hidden = true;
    els.coverScreen.hidden = false;
    syncFullscreenState();
    if (els.enterButton) {
      els.enterButton.focus();
    }
  }

  function ensureSlides() {
    if (!state.slidesPromise) {
      state.slidesPromise = discoverSlides()
        .then((slides) => {
          state.slides = slides;
          state.slidesReady = true;
          updateSlideCounter();
          if (state.activePanel) {
            els.panelBody.innerHTML = renderPanelContent(state.activePanel);
            bindPanelEnhancements(state.activePanel);
          }
          if (state.entered) {
            renderCurrentSlide();
          }
          return slides;
        })
        .catch(() => {
          state.slidesReady = true;
          state.slides = [];
          updateSlideCounter();
          return [];
        });
    }
    return state.slidesPromise;
  }

  async function discoverSlides() {
    if (Array.isArray(APP.slides) && APP.slides.length) {
      return discoverSlidesFromManifest(APP.slides);
    }

    const slides = [];
    let misses = 0;
    let foundAny = false;

    for (let index = 1; index <= APP.slideScan.maxIndex; index += 1) {
      if (foundAny && misses >= APP.slideScan.stopAfterMisses) {
        break;
      }

      const code = String(index).padStart(3, "0");
      const imagePath = `assets/imagen/nac/${code}.png`;
      const textPath = `assets/texto/nac/${code}.txt`;
      const imageExists = await probeImage(imagePath);
      let text = null;

      if (imageExists) {
        text = await loadOptionalText(textPath);
      } else if (!foundAny || misses < 2) {
        text = await loadOptionalText(textPath);
      }

      if (imageExists || text) {
        foundAny = true;
        misses = 0;
        const parsedText = parseSlideText(code, text, slides.length);
        slides.push({
          number: index,
          code,
          imagePath,
          imageExists,
          textPath,
          textExists: Boolean(text),
          title: parsedText.title,
          summary: parsedText.summary
        });
      } else {
        misses += 1;
      }
    }

    return slides;
  }

  async function discoverSlidesFromManifest(entries) {
    const slides = [];

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index] || {};
      const code = String(entry.code || "").padStart(3, "0");
      if (!code) {
        continue;
      }

      const imagePath = entry.imagePath || `assets/imagen/nac/${code}.png`;
      const textPath = entry.textPath || `assets/texto/nac/${code}.txt`;
      const imageExists = entry.imageExists !== false;
      const text = entry.textExists === false ? null : await loadOptionalText(textPath);
      const parsedText = parseSlideText(code, text, slides.length);
      const number = Number.isFinite(Number(entry.number)) ? Number(entry.number) : index + 1;

      if (!imageExists && !text) {
        continue;
      }

      slides.push({
        number,
        code,
        imagePath,
        imageExists,
        textPath,
        textExists: Boolean(text),
        title: parsedText.title,
        summary: parsedText.summary
      });
    }

    return slides;
  }

  function parseSlideText(code, text, outlineIndex) {
    const slideIndex = Number(code) - 1;
    const fallbackTitle = APP.sessionOutline[slideIndex] || APP.sessionOutline[outlineIndex] || `Sesión ${code}`;
    if (!text) {
      return { title: fallbackTitle, summary: "" };
    }

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return { title: fallbackTitle, summary: "" };
    }

    if (lines.length && normalizeTitle(lines[0]) === normalizeTitle(fallbackTitle)) {
      return {
        title: fallbackTitle,
        summary: lines.slice(1).join("\n\n")
      };
    }

    return {
      title: fallbackTitle,
      summary: lines.join("\n\n")
    };
  }

  async function loadOptionalText(path) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        return null;
      }
      const content = (await response.text()).trim();
      return content || null;
    } catch (error) {
      if (location.protocol !== "file:") {
        return null;
      }
      return loadOptionalTextFromFile(path);
    }
  }

  function loadOptionalTextFromFile(path) {
    return new Promise((resolve) => {
      try {
        const request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.onload = () => {
          if (request.status === 0 || (request.status >= 200 && request.status < 300)) {
            const content = String(request.responseText || "").trim();
            resolve(content || null);
            return;
          }
          resolve(null);
        };
        request.onerror = () => resolve(null);
        request.send();
      } catch (error) {
        resolve(null);
      }
    });
  }

  function probeImage(path) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = path;
    });
  }

  function renderCurrentSlide() {
    if (!state.slides.length) {
      renderEmptyState();
      return;
    }

    const slide = state.slides[state.currentIndex];
    state.summaryExpanded = false;
    closeSummaryModal(true);
    els.slideKicker.hidden = true;
    els.slideKicker.textContent = "";
    els.slideHeading.textContent = slide.title;
    els.viewerPosition.textContent = `${state.currentIndex + 1} / ${state.slides.length}`;
    updateSlideCounter();

    if (slide.imageExists) {
      els.slideImage.src = slide.imagePath;
      els.slideImage.alt = `${slide.title} (${slide.code})`;
      els.slideImage.hidden = false;
      els.slidePlaceholder.hidden = true;
    } else {
      els.slideImage.hidden = true;
      els.slideImage.removeAttribute("src");
      els.slidePlaceholder.hidden = false;
      setPlaceholder("Diapositiva no disponible");
    }

    if (slide.summary) {
      els.slideSummary.innerHTML = formatTextAsParagraphs(slide.summary);
      syncSummaryPresentation(true);
    } else {
      els.slideSummary.innerHTML = "";
      syncSummaryPresentation(false);
    }

    els.previousButton.disabled = state.currentIndex === 0;
    els.nextButton.disabled = state.currentIndex === state.slides.length - 1;
    syncFullscreenButton();
  }

  function renderLoadingState(title) {
    state.summaryExpanded = false;
    closeSummaryModal(true);
    els.slideKicker.hidden = true;
    els.slideKicker.textContent = "";
    els.slideHeading.textContent = title;
    els.viewerPosition.textContent = "Cargando";
    els.slideCounter.textContent = "0 / 0";
    els.slideImage.hidden = true;
    els.slidePlaceholder.hidden = false;
    setPlaceholder(title);
    els.slideSummary.innerHTML = "";
    syncSummaryPresentation(false);
    els.previousButton.disabled = true;
    els.nextButton.disabled = true;
    syncFullscreenButton();
  }

  function renderEmptyState() {
    state.summaryExpanded = false;
    closeSummaryModal(true);
    els.slideKicker.hidden = true;
    els.slideKicker.textContent = "";
    els.slideHeading.textContent = "Sin diapositivas disponibles";
    els.viewerPosition.textContent = "Sin contenido";
    els.slideImage.hidden = true;
    els.slidePlaceholder.hidden = false;
    setPlaceholder("Sin diapositivas disponibles");
    els.slideSummary.innerHTML = "";
    syncSummaryPresentation(false);
    els.previousButton.disabled = true;
    els.nextButton.disabled = true;
    updateSlideCounter();
    syncFullscreenButton();
  }

  function changeSlide(delta) {
    if (!state.slides.length) {
      return;
    }
    const nextIndex = state.currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= state.slides.length) {
      return;
    }
    state.currentIndex = nextIndex;
    renderCurrentSlide();
  }

  function toggleSummary() {
    if (!state.slides.length || state.fullscreen) {
      return;
    }
    const slide = state.slides[state.currentIndex];
    if (!slide || !slide.summary) {
      return;
    }
    if (shouldUseSummaryModal()) {
      if (state.summaryExpanded) {
        closeSummaryModal();
      } else {
        openSummaryModal(slide);
      }
      return;
    }
  }

  function updateSlideCounter() {
    if (!state.slides.length) {
      els.slideCounter.textContent = "0 / 0";
      return;
    }
    els.slideCounter.textContent = `${state.currentIndex + 1} / ${state.slides.length}`;
  }

  function setPlaceholder(title, copy) {
    const text = typeof copy === "string" ? copy.trim() : "";
    els.placeholderTitle.textContent = title;
    els.placeholderCopy.textContent = text;
    els.placeholderCopy.hidden = !text;
  }

  function syncSummaryPresentation(hasSummary) {
    if (!els.viewerCard || !els.slideSummary) {
      return;
    }

    const modalSummary = shouldUseSummaryModal();
    const showSummary = Boolean(hasSummary) && !state.fullscreen;
    const inlineSummary = showSummary && !modalSummary;
    els.viewerCard.classList.toggle("has-summary", inlineSummary);
    els.viewerCard.classList.toggle("summary-open", false);
    els.viewerCard.classList.toggle("summary-collapsed", false);
    els.slideSummary.hidden = !inlineSummary;

    if (els.summaryToggleButton) {
      const showSummaryToggle = showSummary && modalSummary;
      els.summaryToggleButton.hidden = !showSummaryToggle;
      els.summaryToggleButton.setAttribute("aria-expanded", showSummaryToggle && state.summaryExpanded ? "true" : "false");
      els.summaryToggleButton.textContent = state.summaryExpanded ? "Cerrar resumen" : "Resumen";
    }

    if (!showSummary || !modalSummary) {
      closeSummaryModal(true);
    }
  }

  function openSummaryModal(slide) {
    if (!slide || !slide.summary || !els.summaryModal || !els.summaryBackdrop) {
      return;
    }

    state.summaryExpanded = true;
    if (els.summaryModalTitle) {
      els.summaryModalTitle.textContent = slide.title;
    }
    if (els.summaryModalBody) {
      els.summaryModalBody.innerHTML = formatTextAsParagraphs(slide.summary);
    }
    els.summaryModal.hidden = false;
    els.summaryBackdrop.hidden = false;
    requestAnimationFrame(() => {
      els.summaryModal.classList.add("is-open");
      els.summaryBackdrop.classList.add("is-open");
    });
    els.summaryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("panel-open");
    if (els.summaryToggleButton) {
      els.summaryToggleButton.setAttribute("aria-expanded", "true");
      els.summaryToggleButton.textContent = "Cerrar resumen";
    }
    if (els.closeSummaryButton) {
      els.closeSummaryButton.focus();
    }
  }

  function closeSummaryModal(silent) {
    if (!els.summaryModal || !els.summaryBackdrop) {
      state.summaryExpanded = false;
      return;
    }

    state.summaryExpanded = false;
    els.summaryModal.classList.remove("is-open");
    els.summaryBackdrop.classList.remove("is-open");
    els.summaryModal.setAttribute("aria-hidden", "true");

    if (els.summaryToggleButton) {
      els.summaryToggleButton.setAttribute("aria-expanded", "false");
      if (!els.summaryToggleButton.hidden) {
        els.summaryToggleButton.textContent = "Resumen";
      }
    }

    setTimeout(() => {
      if (state.summaryExpanded) {
        return;
      }
      els.summaryModal.hidden = true;
      els.summaryBackdrop.hidden = true;
      if (!state.activePanel) {
        document.body.classList.remove("panel-open");
      }
      if (!silent && els.summaryToggleButton && !els.summaryToggleButton.hidden) {
        els.summaryToggleButton.focus();
      }
    }, 220);
  }

  function togglePanel(panelKey, button) {
    if (!PANEL_KEYS.includes(panelKey)) {
      return;
    }

    if (state.activePanel === panelKey) {
      closePanel();
      return;
    }

    openPanel(panelKey, button);
  }

  function openPanel(panelKey, button) {
    closeSummaryModal(true);
    state.activePanel = panelKey;
    state.returnFocusEl = button || document.activeElement;

    const panelConfig = APP.panels[panelKey];
    els.panelKicker.textContent = panelConfig.kicker;
    els.panelTitle.textContent = panelConfig.title;
    els.panelBody.innerHTML = renderPanelContent(panelKey);

    els.sidePanel.hidden = false;
    els.overlay.hidden = false;
    document.body.classList.add("panel-open");
    requestAnimationFrame(() => {
      els.sidePanel.classList.add("is-open");
      els.overlay.classList.add("is-open");
    });
    els.sidePanel.setAttribute("aria-hidden", "false");

    els.panelButtons.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.panel === panelKey);
    });

    bindPanelEnhancements(panelKey);
    els.closePanelButton.focus();
  }

  function closePanel() {
    if (!state.activePanel) {
      return;
    }

    state.activePanel = null;
    els.sidePanel.classList.remove("is-open");
    els.overlay.classList.remove("is-open");
    els.sidePanel.setAttribute("aria-hidden", "true");
    els.panelButtons.forEach((item) => item.classList.remove("is-active"));

    setTimeout(() => {
      if (state.activePanel) {
        return;
      }
      els.sidePanel.hidden = true;
      els.overlay.hidden = true;
      if (!state.summaryExpanded) {
        document.body.classList.remove("panel-open");
      }
      if (state.returnFocusEl && typeof state.returnFocusEl.focus === "function") {
        state.returnFocusEl.focus();
      }
    }, 220);
  }

  function handleGlobalKeydown(event) {
    const tag = document.activeElement ? document.activeElement.tagName : "";
    const typing =
      tag === "INPUT" ||
      tag === "SELECT" ||
      tag === "TEXTAREA" ||
      Boolean(document.activeElement && document.activeElement.isContentEditable);

    if (event.key === "Escape" && state.activePanel) {
      closePanel();
      return;
    }

    if (event.key === "Escape" && state.summaryExpanded) {
      closeSummaryModal();
      return;
    }

    if (event.key === "Escape" && state.fullscreen) {
      exitAppFullscreen();
      return;
    }

    if (!state.entered || state.activePanel || typing) {
      return;
    }

    if (event.key === "ArrowLeft") {
      changeSlide(-1);
    } else if (event.key === "ArrowRight") {
      changeSlide(1);
    } else if (event.key.toLowerCase() === "f") {
      toggleFullscreen();
    }
  }

  function renderPanelContent(panelKey) {
    if (panelKey === "dx" || panelKey === "tx") {
      return renderStructuredPanel(APP.panels[panelKey]);
    }
    if (panelKey === "session") {
      return renderSessionPanel();
    }
    return renderScalesPanel();
  }

  function renderStructuredPanel(config) {
    const summaryBlock =
      config.summary && config.summary.length
        ? `
      <section class="summary-grid">
        ${config.summary.map((item) => `<article class="summary-card"><p>${escapeHtml(item)}</p></article>`).join("")}
      </section>
    `
        : "";

    return `
      <p class="panel-intro">${escapeHtml(config.intro)}</p>
      ${summaryBlock}
      ${config.sections
        .map(
          (section) => `
            <details class="topic"${section.open ? " open" : ""}>
              <summary>${escapeHtml(section.title)}</summary>
              <div class="topic-body">
                <ul>
                  ${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
                </ul>
                ${renderCitations(section.citations)}
              </div>
            </details>
          `
        )
        .join("")}
    `;
  }

  function renderSessionPanel() {
    const summaryBlock = APP.panels.session.summary.length
      ? `
      <section class="summary-grid">
        ${APP.panels.session.summary.map((item) => `<article class="summary-card"><p>${escapeHtml(item)}</p></article>`).join("")}
      </section>
    `
      : "";

    return `
      <p class="panel-intro">${escapeHtml(APP.panels.session.intro)}</p>
      ${summaryBlock}

      <section class="panel-block">
        <h3>Índice docente</h3>
        <div class="outline-list">
          ${APP.sessionOutline.map((item) => `<div class="outline-item"><span>${escapeHtml(item)}</span></div>`).join("")}
        </div>
      </section>

      <section class="panel-block">
        <h3>Ir a una diapositiva</h3>
        <form class="jump-form" id="jump-form">
          <div class="jump-row">
            <input id="jump-input" name="slideNumber" inputmode="numeric" type="number" min="1" aria-label="Número de diapositiva">
            <button class="button button-primary" type="submit">Ir</button>
          </div>
          <p class="muted-copy" id="jump-feedback">Introduce el número nominal de la diapositiva disponible.</p>
        </form>
        <div class="slide-list" id="slide-list">
          ${renderSlideButtons()}
        </div>
      </section>

      <section class="panel-block">
        <h3>Bibliografía integrada</h3>
        <ul class="bibliography-list">
          ${Object.values(APP.bibliography).map((entry) => `<li>${renderCitation(entry, true)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function renderSlideButtons() {
    if (!state.slides.length) {
      return `<p class="muted-copy">No hay diapositivas disponibles.</p>`;
    }

    return state.slides
      .map(
        (slide) => `
          <button class="slide-button" type="button" data-slide-number="${slide.number}">
            <span>
              <strong>${escapeHtml(slide.title)}</strong>
            </span>
          </button>
        `
      )
      .join("");
  }

  function renderScalesPanel() {
    return `
      <p class="panel-intro">${escapeHtml(APP.panels.scales.intro)}</p>

      <section class="scale-card">
        <div class="scale-card-header">
          <h3>CRB-65</h3>
          <p>Herramienta rápida de Atención Primaria. PRAN: 0 ambulatorio, 1 valoración hospitalaria, >=2 ingreso.</p>
        </div>
        <form id="crb65-form">
          <div class="form-grid">
            <label class="form-field"><span>Edad (años)</span><input name="age" type="number" min="16" inputmode="numeric" required></label>
            <label class="form-field"><span>Frecuencia respiratoria</span><input name="rr" type="number" min="0" inputmode="numeric" required></label>
            <label class="form-field"><span>PAS (mmHg)</span><input name="sbp" type="number" min="0" inputmode="numeric" required></label>
            <label class="form-field"><span>PAD (mmHg)</span><input name="dbp" type="number" min="0" inputmode="numeric" required></label>
          </div>
          <div class="check-stack">
            <label class="check-row"><input type="checkbox" name="confusion"><span>Confusión o desorientación nuevas</span></label>
          </div>
          <div class="scale-actions"><button class="button button-primary" type="submit">Calcular CRB-65</button></div>
        </form>
        <div class="result-shell neutral" id="crb65-result">
          <p class="result-title">Pendiente de cálculo</p>
          <p class="result-copy">Introduce constantes y estado mental para obtener interpretación y recomendación.</p>
        </div>
      </section>

      <section class="scale-card">
        <div class="scale-card-header">
          <h3>CURB-65</h3>
          <p>Versión hospitalaria. HUSE: 0-1 baja gravedad, 2 moderada, 3-5 grave.</p>
        </div>
        <form id="curb65-form">
          <div class="form-grid">
            <label class="form-field"><span>Edad (años)</span><input name="age" type="number" min="16" inputmode="numeric" required></label>
            <label class="form-field"><span>Frecuencia respiratoria</span><input name="rr" type="number" min="0" inputmode="numeric" required></label>
            <label class="form-field"><span>PAS (mmHg)</span><input name="sbp" type="number" min="0" inputmode="numeric" required></label>
            <label class="form-field"><span>PAD (mmHg)</span><input name="dbp" type="number" min="0" inputmode="numeric" required></label>
          </div>
          <div class="form-grid">
            <label class="form-field"><span>Urea</span><input name="ureaValue" type="number" min="0" step="0.1" inputmode="decimal" required></label>
            <label class="form-field">
              <span>Unidad de urea</span>
              <select name="ureaUnit">
                <option value="urea-mmol">mmol/L de urea</option>
                <option value="urea-mgdl">mg/dL de urea</option>
                <option value="bun-mgdl">mg/dL de BUN</option>
              </select>
            </label>
          </div>
          <div class="check-stack">
            <label class="check-row"><input type="checkbox" name="confusion"><span>Confusión o desorientación nuevas</span></label>
          </div>
          <div class="scale-actions"><button class="button button-primary" type="submit">Calcular CURB-65</button></div>
        </form>
        <div class="result-shell neutral" id="curb65-result">
          <p class="result-title">Pendiente de cálculo</p>
          <p class="result-copy">Incluye la urea con su unidad para obtener el score.</p>
        </div>
      </section>

      <section class="scale-card">
        <div class="scale-card-header">
          <h3>PSI</h3>
          <p>HUSE lo prioriza para identificar pacientes de bajo riesgo. Si faltan variables analíticas, el resultado puede infraestimar riesgo.</p>
        </div>
        <form id="psi-form">
          <div class="form-grid">
            <label class="form-field"><span>Edad</span><input name="age" type="number" min="16" inputmode="numeric" required></label>
            <label class="form-field">
              <span>Sexo</span>
              <select name="sex">
                <option value="male">Varón</option>
                <option value="female">Mujer</option>
              </select>
            </label>
          </div>
          <div class="check-stack">
            <label class="check-row"><input type="checkbox" name="nursingHome"><span>Institucionalizado/a o residencia</span></label>
            <label class="check-row"><input type="checkbox" name="neoplasm"><span>Neoplasia activa</span></label>
            <label class="check-row"><input type="checkbox" name="liver"><span>Hepatopatía crónica</span></label>
            <label class="check-row"><input type="checkbox" name="heartFailure"><span>Insuficiencia cardiaca</span></label>
            <label class="check-row"><input type="checkbox" name="cerebrovascular"><span>Enfermedad cerebrovascular</span></label>
            <label class="check-row"><input type="checkbox" name="renal"><span>Enfermedad renal crónica</span></label>
            <label class="check-row"><input type="checkbox" name="mentalStatus"><span>Alteración del estado mental</span></label>
            <label class="check-row"><input type="checkbox" name="pleuralEffusion"><span>Derrame pleural</span></label>
          </div>
          <div class="form-grid form-grid-3">
            <label class="form-field"><span>FR</span><input name="rr" type="number" min="0" inputmode="numeric" required></label>
            <label class="form-field"><span>PAS</span><input name="sbp" type="number" min="0" inputmode="numeric" required></label>
            <label class="form-field"><span>Temperatura</span><input name="temp" type="number" min="30" max="45" step="0.1" inputmode="decimal" required></label>
            <label class="form-field"><span>FC</span><input name="pulse" type="number" min="0" inputmode="numeric" required></label>
            <label class="form-field"><span>pH arterial</span><input name="ph" type="number" min="6" max="8" step="0.01" inputmode="decimal"></label>
            <label class="form-field"><span>Urea (mg/dL)</span><input name="urea" type="number" min="0" step="0.1" inputmode="decimal"></label>
            <label class="form-field"><span>Sodio (mEq/L)</span><input name="sodium" type="number" min="0" step="0.1" inputmode="decimal"></label>
            <label class="form-field"><span>Glucosa (mg/dL)</span><input name="glucose" type="number" min="0" step="0.1" inputmode="decimal"></label>
            <label class="form-field"><span>Hematocrito (%)</span><input name="hematocrit" type="number" min="0" step="0.1" inputmode="decimal"></label>
            <label class="form-field"><span>PaO2 (mmHg)</span><input name="pao2" type="number" min="0" step="0.1" inputmode="decimal"></label>
            <label class="form-field"><span>SatO2 (%)</span><input name="spo2" type="number" min="0" max="100" step="0.1" inputmode="decimal"></label>
          </div>
          <div class="scale-actions"><button class="button button-primary" type="submit">Calcular PSI</button></div>
        </form>
        <div class="result-shell neutral" id="psi-result">
          <p class="result-title">Pendiente de cálculo</p>
          <p class="result-copy">PSI combina clínica, exploración y datos analíticos. Completa el máximo de campos posible.</p>
        </div>
      </section>

      <section class="scale-card">
        <div class="scale-card-header">
          <h3>ATS/IDSA gravedad/UCI</h3>
          <p>HUSE: 1 criterio mayor o >=3 menores obliga a valorar ingreso en UCI/UCRI.</p>
        </div>
        <form id="ats-form">
          <div class="panel-block">
            <h4>Criterios mayores</h4>
            <div class="check-stack">
              <label class="check-row"><input type="checkbox" name="majorVentilation"><span>Necesidad de ventilación mecánica invasiva</span></label>
              <label class="check-row"><input type="checkbox" name="majorShock"><span>Shock séptico con necesidad de vasopresores</span></label>
            </div>
          </div>
          <div class="panel-block">
            <h4>Criterios menores</h4>
            <div class="check-stack">
              <label class="check-row"><input type="checkbox" name="minorRr"><span>FR >30 rpm</span></label>
              <label class="check-row"><input type="checkbox" name="minorPao2"><span>PaO2/FiO2 <250 mmHg</span></label>
              <label class="check-row"><input type="checkbox" name="minorMultilobar"><span>Infiltrados multilobares</span></label>
              <label class="check-row"><input type="checkbox" name="minorConfusion"><span>Confusión o desorientación</span></label>
              <label class="check-row"><input type="checkbox" name="minorHypotension"><span>Hipotensión que precisa aporte de volemia</span></label>
              <label class="check-row"><input type="checkbox" name="minorUrea"><span>Urea >43 mg/dL o BUN >20 mg/dL</span></label>
              <label class="check-row"><input type="checkbox" name="minorLeukopenia"><span>Leucocitos <4.000/µL</span></label>
              <label class="check-row"><input type="checkbox" name="minorPlatelets"><span>Plaquetas <100.000/µL</span></label>
              <label class="check-row"><input type="checkbox" name="minorTemp"><span>Temperatura <36 ºC</span></label>
            </div>
          </div>
          <div class="scale-actions"><button class="button button-primary" type="submit">Interpretar gravedad ATS/IDSA</button></div>
        </form>
        <div class="result-shell neutral" id="ats-result">
          <p class="result-title">Pendiente de cálculo</p>
          <p class="result-copy">Marca criterios presentes para estimar necesidad de cuidados intensivos.</p>
        </div>
      </section>

      <section class="scale-card">
        <div class="scale-card-header">
          <h3>PCR rápida en infección respiratoria</h3>
          <p>Interpretador docente combinado: umbrales operativos de PCR y checklist de gravedad/sospecha. La gravedad clínica siempre prevalece.</p>
        </div>
        <form id="crp-form">
          <div class="form-grid">
            <label class="form-field"><span>PCR capilar o sérica (mg/L)</span><input name="crp" type="number" min="0" step="0.1" inputmode="decimal" required></label>
          </div>
          <div class="check-stack">
            <label class="check-row"><input type="checkbox" name="fever"><span>Fiebre o febrícula con cuadro respiratorio</span></label>
            <label class="check-row"><input type="checkbox" name="dyspnea"><span>Disnea nueva o claramente peor</span></label>
            <label class="check-row"><input type="checkbox" name="focalSigns"><span>Hallazgos focales en auscultación</span></label>
            <label class="check-row"><input type="checkbox" name="pleuriticPain"><span>Dolor torácico pleurítico</span></label>
            <label class="check-row"><input type="checkbox" name="worsening"><span>Persistencia o empeoramiento a 48-72 horas</span></label>
            <label class="check-row"><input type="checkbox" name="frailty"><span>Fragilidad, edad avanzada o comorbilidad importante</span></label>
            <label class="check-row"><input type="checkbox" name="xrayInfiltrate"><span>Radiografía ya compatible con infiltrado</span></label>
            <label class="check-row"><input type="checkbox" name="hypoxemia"><span>Hipoxemia relevante o SatO2 baja</span></label>
            <label class="check-row"><input type="checkbox" name="rr30"><span>FR >=30 rpm</span></label>
            <label class="check-row"><input type="checkbox" name="bpLow"><span>PAS <90 mmHg o PAD <=60 mmHg</span></label>
            <label class="check-row"><input type="checkbox" name="confusion"><span>Confusión o deterioro del nivel de conciencia</span></label>
            <label class="check-row"><input type="checkbox" name="unableOral"><span>Intolerancia oral o ausencia de soporte seguro</span></label>
          </div>
          <div class="scale-actions"><button class="button button-primary" type="submit">Interpretar PCR rápida</button></div>
        </form>
        <div class="result-shell neutral" id="crp-result">
          <p class="result-title">Pendiente de cálculo</p>
          <p class="result-copy">La salida combina umbral de PCR, sospecha de NAC y red flags para proponer el siguiente paso.</p>
        </div>
      </section>
    `;
  }

  function bindPanelEnhancements(panelKey) {
    if (panelKey === "session") {
      const jumpForm = document.getElementById("jump-form");
      const slideButtons = Array.from(document.querySelectorAll("[data-slide-number]"));

      if (jumpForm) {
        jumpForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const feedback = document.getElementById("jump-feedback");
          const jumpInput = document.getElementById("jump-input");
          const rawValue = jumpInput ? jumpInput.value : "";
          const value = parseInt(rawValue || "", 10);
          const targetIndex = state.slides.findIndex((slide) => slide.number === value);

          if (targetIndex === -1) {
            if (feedback) {
              feedback.textContent = `La diapositiva ${Number.isNaN(value) ? "solicitada" : String(value).padStart(3, "0")} no está disponible.`;
            }
            return;
          }

          state.currentIndex = targetIndex;
          renderCurrentSlide();
          closePanel();
        });
      }

      slideButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const slideNumber = Number(button.dataset.slideNumber);
          const targetIndex = state.slides.findIndex((slide) => slide.number === slideNumber);
          if (targetIndex === -1) {
            return;
          }
          state.currentIndex = targetIndex;
          renderCurrentSlide();
          closePanel();
        });
      });

      return;
    }

    if (panelKey === "scales") {
      bindScaleForms();
    }
  }

  function bindScaleForms() {
    const crbForm = document.getElementById("crb65-form");
    const curbForm = document.getElementById("curb65-form");
    const psiForm = document.getElementById("psi-form");
    const atsForm = document.getElementById("ats-form");
    const crpForm = document.getElementById("crp-form");

    if (crbForm) {
      crbForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleCRB65(event.currentTarget);
      });
    }

    if (curbForm) {
      curbForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleCURB65(event.currentTarget);
      });
    }

    if (psiForm) {
      psiForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handlePSI(event.currentTarget);
      });
    }

    if (atsForm) {
      atsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleATS(event.currentTarget);
      });
    }

    if (crpForm) {
      crpForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleCRP(event.currentTarget);
      });
    }
  }

  function handleCRB65(form) {
    const data = new FormData(form);
    const age = numberFrom(data, "age");
    const rr = numberFrom(data, "rr");
    const sbp = numberFrom(data, "sbp");
    const dbp = numberFrom(data, "dbp");
    const confusion = checkboxFrom(data, "confusion");

    const criteria = [];
    if (confusion) criteria.push("Confusión");
    if (rr >= 30) criteria.push("FR >=30");
    if (sbp < 90 || dbp <= 60) criteria.push("Hipotensión");
    if (age >= 65) criteria.push("Edad >=65");

    const score = criteria.length;
    let tone = "low";
    let meaning = "Bajo riesgo";
    let recommendation =
      "Tratamiento ambulatorio si no hay hipoxemia, imposibilidad de vía oral, comorbilidad descompensada o problemas de soporte.";

    if (score === 1) {
      tone = "medium";
      meaning = "Riesgo intermedio";
      recommendation =
        "PRAN orienta a valoración hospitalaria. Prioriza derivación si además hay hipoxemia, radiología extensa o empeoramiento.";
    } else if (score >= 2) {
      tone = "high";
      meaning = "Riesgo alto";
      recommendation =
        "Ingreso hospitalario recomendado. Si coexistieran criterios ATS/IDSA o deterioro respiratorio/hemodinámico, valorar UCI/UCRI.";
    }

    setResult("crb65-result", {
      tone,
      score: `CRB-65 ${score}/4`,
      title: meaning,
      copy: recommendation,
      tags: criteria.length ? criteria : ["Sin criterios positivos"],
      footnote: "Aplica sobre todo en Atención Primaria y siempre junto con juicio clínico."
    });
  }

  function handleCURB65(form) {
    const data = new FormData(form);
    const age = numberFrom(data, "age");
    const rr = numberFrom(data, "rr");
    const sbp = numberFrom(data, "sbp");
    const dbp = numberFrom(data, "dbp");
    const confusion = checkboxFrom(data, "confusion");
    const ureaValue = numberFrom(data, "ureaValue");
    const ureaUnit = String(data.get("ureaUnit") || "urea-mmol");

    const criteria = [];
    if (confusion) criteria.push("Confusión");
    if (rr >= 30) criteria.push("FR >=30");
    if (sbp < 90 || dbp <= 60) criteria.push("Hipotensión");
    if (age >= 65) criteria.push("Edad >=65");
    if (isPositiveUrea(ureaValue, ureaUnit)) criteria.push("Urea alta");

    const score = criteria.length;
    let tone = "low";
    let meaning = "Baja gravedad";
    let recommendation = "Suele apoyar manejo ambulatorio si el contexto clínico y social lo permiten.";

    if (score === 2) {
      tone = "medium";
      meaning = "Gravedad moderada";
      recommendation = "HUSE orienta a hospitalización. Revisa microbiología y necesidad de vigilancia estrecha.";
    } else if (score >= 3) {
      tone = "high";
      meaning = "Gravedad alta";
      recommendation = "Hospitalización y valoración de cuidados intensivos o intermedios según estabilidad global.";
    }

    setResult("curb65-result", {
      tone,
      score: `CURB-65 ${score}/5`,
      title: meaning,
      copy: recommendation,
      tags: criteria.length ? criteria : ["Sin criterios positivos"],
      footnote: "PSI identifica mejor bajo riesgo, pero CURB-65 sigue siendo útil cuando se necesita una regla más simple."
    });
  }

  function handlePSI(form) {
    const data = new FormData(form);
    const age = numberFrom(data, "age");
    const sex = String(data.get("sex") || "male");
    const rr = numberFrom(data, "rr");
    const sbp = numberFrom(data, "sbp");
    const temp = numberFrom(data, "temp");
    const pulse = numberFrom(data, "pulse");

    let score = sex === "female" ? Math.max(age - 10, 0) : age;
    const missingCritical = [];

    if (age === null) {
      setResult("psi-result", {
        tone: "high",
        score: "PSI",
        title: "Faltan datos",
        copy: "La edad es obligatoria para calcular PSI."
      });
      return;
    }

    if (rr === null) missingCritical.push("FR");
    if (sbp === null) missingCritical.push("PAS");
    if (temp === null) missingCritical.push("Temperatura");
    if (pulse === null) missingCritical.push("FC");

    const flags = [];
    if (checkboxFrom(data, "nursingHome")) {
      score += 10;
      flags.push("Residencia");
    }
    if (checkboxFrom(data, "neoplasm")) {
      score += 30;
      flags.push("Neoplasia");
    }
    if (checkboxFrom(data, "liver")) {
      score += 20;
      flags.push("Hepatopatía");
    }
    if (checkboxFrom(data, "heartFailure")) {
      score += 10;
      flags.push("Insuficiencia cardiaca");
    }
    if (checkboxFrom(data, "cerebrovascular")) {
      score += 10;
      flags.push("Enfermedad cerebrovascular");
    }
    if (checkboxFrom(data, "renal")) {
      score += 10;
      flags.push("Enfermedad renal");
    }
    if (checkboxFrom(data, "mentalStatus")) {
      score += 20;
      flags.push("Alteración mental");
    }
    if (rr !== null && rr > 30) {
      score += 20;
      flags.push("FR >30");
    }
    if (sbp !== null && sbp < 90) {
      score += 20;
      flags.push("PAS <90");
    }
    if (temp !== null && (temp < 35 || temp > 40)) {
      score += 15;
      flags.push("Temperatura extrema");
    }
    if (pulse !== null && pulse > 125) {
      score += 10;
      flags.push("FC >125");
    }

    const ph = numberFrom(data, "ph");
    const urea = numberFrom(data, "urea");
    const sodium = numberFrom(data, "sodium");
    const glucose = numberFrom(data, "glucose");
    const hematocrit = numberFrom(data, "hematocrit");
    const pao2 = numberFrom(data, "pao2");
    const spo2 = numberFrom(data, "spo2");

    if (ph !== null && ph < 7.35) {
      score += 30;
      flags.push("pH <7.35");
    }
    if (urea !== null && urea > 64) {
      score += 20;
      flags.push("Urea >64");
    }
    if (sodium !== null && sodium < 130) {
      score += 20;
      flags.push("Na <130");
    }
    if (glucose !== null && glucose > 250) {
      score += 10;
      flags.push("Glucosa >250");
    }
    if (hematocrit !== null && hematocrit < 30) {
      score += 10;
      flags.push("Hto <30");
    }
    if ((pao2 !== null && pao2 < 60) || (spo2 !== null && spo2 < 90)) {
      score += 10;
      flags.push("Hipoxemia");
    }
    if (checkboxFrom(data, "pleuralEffusion")) {
      score += 10;
      flags.push("Derrame pleural");
    }

    const classI =
      age <= 50 &&
      !checkboxFrom(data, "nursingHome") &&
      !checkboxFrom(data, "neoplasm") &&
      !checkboxFrom(data, "liver") &&
      !checkboxFrom(data, "heartFailure") &&
      !checkboxFrom(data, "cerebrovascular") &&
      !checkboxFrom(data, "renal") &&
      !checkboxFrom(data, "mentalStatus") &&
      rr !== null &&
      rr < 30 &&
      sbp !== null &&
      sbp >= 90 &&
      temp !== null &&
      temp >= 35 &&
      temp <= 39.9 &&
      pulse !== null &&
      pulse < 125;

    let psiClass;
    let mortality;
    let place;
    let tone = "low";

    if (classI) {
      psiClass = "I";
      mortality = "0.1 %";
      place = "Domicilio";
    } else if (score < 70) {
      psiClass = "II";
      mortality = "0.6 %";
      place = "Domicilio";
    } else if (score <= 90) {
      psiClass = "III";
      mortality = "1-3 %";
      place = "Domicilio vs observación/hospitalización corta";
      tone = "medium";
    } else if (score <= 130) {
      psiClass = "IV";
      mortality = "8-10 %";
      place = "Hospital";
      tone = "high";
    } else {
      psiClass = "V";
      mortality = "27-30 %";
      place = "Hospital y valorar UCI";
      tone = "high";
    }

    let recommendation = `Clase ${psiClass}. Lugar de tratamiento orientativo: ${place}.`;
    if (psiClass === "I" || psiClass === "II" || psiClass === "III") {
      recommendation +=
        " Si además hay derrame pleural, mala vía oral, oxígeno, mala red de apoyo o descompensación basal, HUSE aconseja valorar ingreso pese al bajo riesgo teórico.";
    } else {
      recommendation += " Requiere manejo hospitalario y evaluación de gravedad global.";
    }

    const footnote = missingCritical.length
      ? `Faltan variables críticas (${missingCritical.join(", ")}); si no se introducen, PSI puede infraestimar riesgo.`
      : "PSI identifica mejor pacientes de bajo riesgo, pero no sustituye juicio clínico.";

    setResult("psi-result", {
      tone,
      score: `PSI ${score} puntos`,
      title: `Clase ${psiClass} · Mortalidad estimada ${mortality}`,
      copy: recommendation,
      tags: flags.length ? flags : ["Sin puntos añadidos extra"],
      footnote
    });
  }

  function handleATS(form) {
    const data = new FormData(form);
    const majorLabels = [
      ["majorVentilation", "Ventilación mecánica invasiva"],
      ["majorShock", "Shock séptico con vasopresores"]
    ];
    const minorLabels = [
      ["minorRr", "FR >30"],
      ["minorPao2", "PaO2/FiO2 <250"],
      ["minorMultilobar", "Infiltrados multilobares"],
      ["minorConfusion", "Confusión"],
      ["minorHypotension", "Hipotensión con fluidos"],
      ["minorUrea", "Urea/BUN alta"],
      ["minorLeukopenia", "Leucopenia"],
      ["minorPlatelets", "Plaquetopenia"],
      ["minorTemp", "Temperatura <36 ºC"]
    ];

    const majorHits = majorLabels.filter(([name]) => checkboxFrom(data, name)).map(([, label]) => label);
    const minorHits = minorLabels.filter(([name]) => checkboxFrom(data, name)).map(([, label]) => label);
    const severe = majorHits.length >= 1 || minorHits.length >= 3;

    let tone = severe ? "high" : minorHits.length === 2 ? "medium" : "low";
    let title = severe ? "NAC grave" : "No cumple definición formal de NAC grave";
    let copy = severe
      ? "HUSE recomienda valorar ingreso en UCI/UCRI. Si no hay criterio mayor pero sí >=3 menores, la decisión debe compartirse entre Urgencias, Neumología y UCI."
      : "Usa PSI/CURB-65 y juicio clínico para decidir el lugar de cuidado. Mantén vigilancia si la carga de criterios menores empieza a crecer.";

    if (!severe && minorHits.length === 2) {
      copy = "Dos criterios menores no sellan gravedad ATS/IDSA, pero obligan a vigilancia estrecha y bajo umbral de escalada.";
    }

    setResult("ats-result", {
      tone,
      score: `Mayores ${majorHits.length} · Menores ${minorHits.length}`,
      title,
      copy,
      tags: majorHits.concat(minorHits).length ? majorHits.concat(minorHits) : ["Sin criterios marcados"],
      footnote: "La regla prioriza necesidad de cuidados intensivos; no reemplaza la evaluación hemodinámica ni respiratoria continua."
    });
  }

  function handleCRP(form) {
    const data = new FormData(form);
    const crp = numberFrom(data, "crp");

    const severeFlags = [];
    const suspicionFlags = [];
    const contextFlags = [];

    if (checkboxFrom(data, "hypoxemia")) severeFlags.push("Hipoxemia");
    if (checkboxFrom(data, "rr30")) severeFlags.push("FR alta");
    if (checkboxFrom(data, "bpLow")) severeFlags.push("Hipotensión");
    if (checkboxFrom(data, "confusion")) severeFlags.push("Confusión");
    if (checkboxFrom(data, "unableOral")) severeFlags.push("Sin vía oral/soporte");

    if (checkboxFrom(data, "fever")) suspicionFlags.push("Fiebre");
    if (checkboxFrom(data, "dyspnea")) suspicionFlags.push("Disnea");
    if (checkboxFrom(data, "focalSigns")) suspicionFlags.push("Hallazgos focales");
    if (checkboxFrom(data, "pleuriticPain")) suspicionFlags.push("Dolor pleurítico");
    if (checkboxFrom(data, "worsening")) suspicionFlags.push("Empeoramiento");
    if (checkboxFrom(data, "xrayInfiltrate")) suspicionFlags.push("Infiltrado radiológico");
    if (checkboxFrom(data, "frailty")) contextFlags.push("Fragilidad/comorbilidad");

    const highSuspicion = suspicionFlags.length >= 2 || checkboxFrom(data, "xrayInfiltrate") || checkboxFrom(data, "focalSigns");
    const severe = severeFlags.length > 0;

    let tone = "low";
    let title = "PCR baja";
    let copy = "No apoya antibiótico de rutina.";
    let nextStep = "Siguiente paso sugerido: autocuidados, red flags y reevaluación si empeora.";

    if (severe) {
      tone = "high";
      title = "Gravedad clínica prioritaria";
      copy =
        "La gravedad pesa más que la PCR. Este cuadro necesita valoración presencial urgente; si la sospecha de NAC es real, prioriza radiografía y manejo hospitalario según estabilidad.";
      nextStep =
        severeFlags.length >= 2 || checkboxFrom(data, "hypoxemia")
          ? "Siguiente paso sugerido: derivación urgente / ingreso."
          : "Siguiente paso sugerido: derivación el mismo día y radiografía.";
    } else if (crp < 20) {
      tone = "low";
      title = "PCR <20 mg/L";
      if (highSuspicion || contextFlags.length) {
        copy =
          "No favorece antibiótico inmediato, pero tampoco cierra la discusión si persisten hallazgos focales, infiltrado, fragilidad o mala evolución.";
        nextStep = "Siguiente paso sugerido: reevaluación en 24-48 h y considerar radiografía si la sospecha persiste.";
      }
    } else if (crp <= 100) {
      tone = "medium";
      title = "PCR 20-100 mg/L";
      copy =
        "Zona intermedia. Compatible con observación estrecha o prescripción diferida; si la sospecha clínica de NAC es moderada-alta, apoya pedir radiografía y revisar muy pronto.";
      nextStep =
        highSuspicion || contextFlags.length
          ? "Siguiente paso sugerido: radiografía + reevaluación 24-48 h; decidir antibiótico según evolución."
          : "Siguiente paso sugerido: seguimiento precoz, sin antibiótico inmediato por defecto.";
    } else {
      tone = "high";
      title = "PCR >100 mg/L";
      copy =
        "Apoya antibiótico inmediato si el foco respiratorio encaja. Si además hay hallazgos focales, disnea, infiltrado o fragilidad, el siguiente paso no debe ser solo recetar: hay que revalorar pronto y considerar imagen.";
      nextStep =
        highSuspicion || contextFlags.length
          ? "Siguiente paso sugerido: antibiótico inmediato + radiografía/reevaluación precoz."
          : "Siguiente paso sugerido: antibiótico inmediato y confirmación diagnóstica.";
    }

    if (checkboxFrom(data, "xrayInfiltrate") && !severe && crp < 20) {
      copy =
        "La radiografía compatible obliga a reabrir el juicio clínico: una PCR baja no descarta por sí sola NAC ya documentada o en fase temprana.";
      nextStep = "Siguiente paso sugerido: reevaluación diagnóstica presencial y decisión terapéutica individual.";
      tone = "medium";
      title = "Radiografía compatible con PCR baja";
    }

    if (contextFlags.length && !severe) {
      nextStep += " Fragilidad/comorbilidad baja el umbral para derivación.";
    }

    setResult("crp-result", {
      tone,
      score: `PCR ${crp.toFixed(1)} mg/L`,
      title,
      copy,
      tags: severeFlags.concat(suspicionFlags, contextFlags).length
        ? severeFlags.concat(suspicionFlags, contextFlags)
        : ["Sin hallazgos adicionales marcados"],
      footnote: `${nextStep} Herramienta docente derivada de PRAN + gravedad clínica; no sustituye radiografía ni valoración médica.`
    });
  }

  function setResult(targetId, config) {
    const container = document.getElementById(targetId);
    if (!container) {
      return;
    }

    container.className = `result-shell ${config.tone || "neutral"}`;
    container.innerHTML = `
      <div class="result-topline">
        <span class="result-score">${escapeHtml(config.score || "")}</span>
        <p class="result-title">${escapeHtml(config.title || "")}</p>
      </div>
      <p class="result-copy">${escapeHtml(config.copy || "")}</p>
      ${config.tags && config.tags.length ? `<div class="result-tags">${config.tags.map((tag) => `<span class="result-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      ${config.footnote ? `<p class="result-footnote">${escapeHtml(config.footnote)}</p>` : ""}
    `;
  }

  function renderCitations(citations) {
    if (!citations || !citations.length) {
      return "";
    }
    return `
      <div class="source-tags">
        ${citations.map((item) => renderCitation(item, false)).join("")}
      </div>
    `;
  }

  function renderCitation(label, blockLink) {
    const href = getDocsHref(label);
    if (!href) {
      return `<span class="source-tag">${escapeHtml(label)}</span>`;
    }
    const className = blockLink ? "bibliography-link" : "source-tag source-link";
    return `<a class="${className}" href="${href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
  }

  function getDocsHref(label) {
    if (!label) {
      return "";
    }
    return encodeURI(`docs/${String(label)}`);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (location.protocol === "file:") {
      return;
    }

    if (DEV_HOSTNAMES.includes(location.hostname)) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker
      .register("service-worker.js")
      .then((registration) => {
        registration.update();
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) {
            return;
          }
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {});

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!window.__nacReloadedForUpdate) {
        window.__nacReloadedForUpdate = true;
        window.location.reload();
      }
    });
  }

  function toggleFullscreen() {
    if (!els.appShell) {
      return;
    }

    if (isStandaloneMobileApp()) {
      state.standaloneReadingDismissed = !state.standaloneReadingDismissed;
      syncFullscreenState();
      return;
    }

    if (state.fullscreen) {
      exitAppFullscreen();
      return;
    }

    const requested = requestFullscreen(els.appShell);

    if (!requested) {
      enterFallbackFullscreen();
      return;
    }

    if (typeof requested.then === "function") {
      requested.catch(() => {
        enterFallbackFullscreen();
      });
    }
  }

  function syncFullscreenState() {
    syncViewportMetrics();
    state.fullscreen =
      getFullscreenElement() === els.appShell ||
      state.fullscreenFallback ||
      shouldUseStandaloneReadingMode();
    if (els.appShell) {
      els.appShell.classList.toggle("is-fullscreen", state.fullscreen);
      els.appShell.classList.toggle("is-standalone-app", isStandaloneAppDisplay());
    }
    syncMobileReadingMode();
    if (state.slides.length) {
      syncSummaryPresentation(Boolean(state.slides[state.currentIndex] && state.slides[state.currentIndex].summary));
    } else {
      syncSummaryPresentation(false);
    }
    syncFullscreenButton();
  }

  function syncFullscreenButton() {
    if (!els.fullscreenButton) {
      return;
    }
    if (isStandaloneMobileApp()) {
      els.fullscreenButton.textContent = state.standaloneReadingDismissed ? "Modo lectura" : "Mostrar interfaz";
      return;
    }
    els.fullscreenButton.textContent = state.fullscreen ? "Salir de pantalla completa" : "Pantalla completa";
  }

  function requestFullscreen(element) {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    }
    if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    }
    return null;
  }

  function exitAppFullscreen() {
    if (state.fullscreenFallback) {
      state.fullscreenFallback = false;
      syncFullscreenState();
      return;
    }
    exitFullscreen();
  }

  function enterFallbackFullscreen() {
    state.fullscreenFallback = true;
    syncFullscreenState();
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      return;
    }
    if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function handleViewportChange() {
    syncViewportMetrics();
    syncMobileReadingMode();
    if (state.summaryExpanded && !shouldUseSummaryModal()) {
      closeSummaryModal(true);
    }
    if (state.slides.length) {
      syncSummaryPresentation(Boolean(state.slides[state.currentIndex] && state.slides[state.currentIndex].summary));
    }
  }

  function syncMobileReadingMode() {
    if (!els.appShell) {
      return;
    }
    els.appShell.classList.toggle("is-mobile-reading", shouldUseMobileReadingMode());
  }

  function handleSwipeStart(event) {
    if (!shouldHandleSwipe(event)) {
      state.swipeStart = null;
      return;
    }

    const touch = event.touches && event.touches[0];
    if (!touch) {
      state.swipeStart = null;
      return;
    }

    state.swipeStart = {
      x: touch.clientX,
      y: touch.clientY
    };
  }

  function handleSwipeEnd(event) {
    if (!state.swipeStart || !shouldHandleSwipe(event)) {
      state.swipeStart = null;
      return;
    }

    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) {
      state.swipeStart = null;
      return;
    }

    const deltaX = touch.clientX - state.swipeStart.x;
    const deltaY = touch.clientY - state.swipeStart.y;
    const horizontalDistance = Math.abs(deltaX);
    const verticalDistance = Math.abs(deltaY);

    state.swipeStart = null;

    if (horizontalDistance < 52 || horizontalDistance <= verticalDistance * 1.25) {
      return;
    }

    changeSlide(deltaX < 0 ? 1 : -1);
  }

  function resetSwipeState() {
    state.swipeStart = null;
  }

  function shouldHandleSwipe(event) {
    if (!isMobileViewport() || !state.entered || !state.slides.length || state.activePanel || state.summaryExpanded) {
      return false;
    }

    if (!event || !event.touches && !event.changedTouches) {
      return false;
    }

    const touchList = event.touches && event.touches.length ? event.touches : event.changedTouches;
    return Boolean(touchList && touchList.length === 1);
  }

  function syncViewportMetrics() {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    const height = viewport ? viewport.height : window.innerHeight;
    const width = viewport ? viewport.width : window.innerWidth;

    if (Number.isFinite(height) && height > 0) {
      root.style.setProperty("--viewport-height", `${Math.round(height)}px`);
    }

    if (Number.isFinite(width) && width > 0) {
      root.style.setProperty("--viewport-width", `${Math.round(width)}px`);
    }
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 640px), (hover: none) and (pointer: coarse) and (max-height: 500px)").matches;
  }

  function shouldUseSummaryModal() {
    return window.matchMedia("(max-width: 1024px)").matches;
  }

  function shouldUseMobileReadingMode() {
    return state.entered && isMobileViewport() && (state.fullscreen || shouldUseStandaloneReadingMode());
  }

  function shouldUseStandaloneReadingMode() {
    return state.entered && isStandaloneMobileApp() && !state.standaloneReadingDismissed;
  }

  function isStandaloneMobileApp() {
    return isMobileViewport() && isStandaloneAppDisplay();
  }

  function isStandaloneAppDisplay() {
    const standaloneMatch =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches;
    return standaloneMatch || window.navigator.standalone === true;
  }

  function formatTextAsParagraphs(text) {
    return text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
  }

  function numberFrom(formData, key) {
    const rawValue = formData.get(key);
    const raw = String(rawValue === null ? "" : rawValue).replace(",", ".").trim();
    if (!raw) {
      return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }

  function checkboxFrom(formData, key) {
    return formData.get(key) === "on";
  }

  function normalizeTitle(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function isPositiveUrea(value, unit) {
    if (value === null) {
      return false;
    }
    if (unit === "urea-mgdl") {
      return value > 43;
    }
    if (unit === "bun-mgdl") {
      return value > 20;
    }
    return value > 7;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();
