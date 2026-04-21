(() => {
  const STORAGE_KEY = "escalapos-config-v1";
  const DEFAULT_STATE = {
    planName: "Comercial",
    planPrice: 299,
    addons: []
  };

  let selectedPlanPrice = DEFAULT_STATE.planPrice;
  let selectedPlanName = DEFAULT_STATE.planName;
  let activeAddons = [];

  function getElement(id) {
    return document.getElementById(id);
  }

  function parsePrice(rawValue) {
    if (!rawValue) return 0;
    const normalized = String(rawValue).replace(/[^0-9.,]/g, "").replace(/,/g, "");
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatMoney(value) {
    return `$${value.toFixed(2)}`;
  }

  function getRootPrefix() {
    const path = window.location.pathname || "";
    if (path.includes("/ModulosEscala/") || path.includes("/Solucionespos/")) {
      return "../";
    }
    return "";
  }

  function getTargetLinks() {
    const prefix = getRootPrefix();
    return {
      plans: `${prefix}index.html#precios`,
      addons: `${prefix}index.html#modulos`
    };
  }

  function saveState() {
    try {
      const payload = {
        planName: selectedPlanName,
        planPrice: selectedPlanPrice,
        addons: activeAddons
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {
      // no-op
    }
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      selectedPlanName = parsed.planName || DEFAULT_STATE.planName;
      selectedPlanPrice = Number(parsed.planPrice) || DEFAULT_STATE.planPrice;
      activeAddons = Array.isArray(parsed.addons) ? parsed.addons : [];
    } catch (_) {
      selectedPlanName = DEFAULT_STATE.planName;
      selectedPlanPrice = DEFAULT_STATE.planPrice;
      activeAddons = [];
    }
  }

  function ensureWidgetExists() {
    if (getElement("summaryWidget")) return;

    const links = getTargetLinks();
    const widgetMarkup = `
<div class="summary-widget" id="summaryWidget">
  <button class="widget-toggle" id="toggleWidget" type="button">
    <i class="fa-solid fa-chevron-left"></i>
    <span class="toggle-text">Ver resumen</span>
  </button>
  <div class="widget-content">
    <div class="widget-header">
      <span class="label">CONFIGURACION ACTUAL</span>
      <h3 id="widget-plan-name">Comercial</h3>
      <p id="widget-addons-count">0 add-ons</p>
    </div>
    <div class="widget-body">
      <div class="summary-item">
        <span>Caja extra:</span>
        <span>$99.00/mes</span>
      </div>
      <div class="widget-addons-list" id="widget-addons-list">
        <p class="empty-msg">No has agregado complementos</p>
      </div>
      <div class="widget-actions">
        <a class="widget-jump" data-widget-jump="addons" href="${links.addons}">Ver Add-ons</a>
        <a class="widget-jump" data-widget-jump="plans" href="${links.plans}">Cambiar plan</a>
      </div>
      <p class="widget-note">Ajusta tu configuracion cuando quieras.</p>
    </div>
    <div class="widget-footer">
      <div class="widget-total">
        <span>Total estimado:</span>
        <h2 id="widget-total-price">$299.00</h2>
      </div>
      <button class="btn-primary-widget" type="button">Crear mi trial</button>
    </div>
  </div>
</div>`;

    const footer = document.querySelector("footer.footer-seo");
    if (footer) {
      footer.insertAdjacentHTML("beforebegin", widgetMarkup);
    } else {
      document.body.insertAdjacentHTML("beforeend", widgetMarkup);
    }
  }

  function ensureWidgetActions() {
    const widgetBody = document.querySelector("#summaryWidget .widget-body");
    if (!widgetBody) return;

    const links = getTargetLinks();
    let actions = widgetBody.querySelector(".widget-actions");

    if (!actions) {
      actions = document.createElement("div");
      actions.className = "widget-actions";
      actions.innerHTML = `
        <a class="widget-jump" data-widget-jump="addons" href="${links.addons}">Ver Add-ons</a>
        <a class="widget-jump" data-widget-jump="plans" href="${links.plans}">Cambiar plan</a>
      `;
      const note = widgetBody.querySelector(".widget-note");
      if (note) {
        note.insertAdjacentElement("beforebegin", actions);
      } else {
        widgetBody.appendChild(actions);
      }
      return;
    }

    const addonsLink = actions.querySelector('[data-widget-jump="addons"]');
    const plansLink = actions.querySelector('[data-widget-jump="plans"]');
    if (addonsLink) addonsLink.setAttribute("href", links.addons);
    if (plansLink) plansLink.setAttribute("href", links.plans);
  }

  function openWidget() {
    const widget = getElement("summaryWidget");
    const toggleBtn = getElement("toggleWidget");
    if (!widget || !toggleBtn) return;

    widget.classList.remove("is-closed");
    const icon = toggleBtn.querySelector("i");
    const toggleText = toggleBtn.querySelector(".toggle-text");
    if (toggleText) toggleText.innerText = "Guardar";
    if (icon) icon.style.transform = "rotate(180deg)";
  }

  function updateSummary() {
    const totalAddonsPrice = activeAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = selectedPlanPrice + totalAddonsPrice;
    const formattedPrice = formatMoney(totalPrice);

    const displayPlan = getElement("display-plan-name");
    const displayAddonsList = getElement("display-addons-list");
    const displayTotalPrice = getElement("total-price");

    if (displayPlan) displayPlan.innerText = `${selectedPlanName} + ${activeAddons.length} add-ons`;
    if (displayAddonsList) {
      displayAddonsList.innerText = activeAddons.length > 0
        ? activeAddons.map((addon) => addon.name).join(", ")
        : "Sin add-ons seleccionados";
    }
    if (displayTotalPrice) displayTotalPrice.innerHTML = `${formattedPrice}<span>/mes</span>`;

    const widgetPlan = getElement("widget-plan-name");
    const widgetCount = getElement("widget-addons-count");
    const widgetPrice = getElement("widget-total-price");
    const widgetList = getElement("widget-addons-list");

    if (widgetPlan) widgetPlan.innerText = selectedPlanName;
    if (widgetCount) widgetCount.innerText = `${activeAddons.length} add-on(s)`;
    if (widgetPrice) widgetPrice.innerText = formattedPrice;
    if (widgetList) {
      if (activeAddons.length > 0) {
        widgetList.innerHTML = activeAddons
          .map(
            (addon, index) => `
              <div class="widget-addon-row">
                <p>• ${addon.name}</p>
                <button type="button" class="widget-remove-addon" data-addon-index="${index}">Quitar</button>
              </div>
            `
          )
          .join("");
      } else {
        widgetList.innerHTML = '<p class="empty-msg">No has agregado complementos</p>';
      }
    }

    const prePlan = getElement("pre-plan-base");
    const preAddons = getElement("pre-addons-text");
    const prePrice = getElement("pre-total-price");

    if (prePlan) prePlan.innerText = selectedPlanName;
    if (prePrice) prePrice.innerText = formattedPrice;
    if (preAddons) {
      preAddons.innerText = activeAddons.length > 0
        ? activeAddons.map((addon) => addon.name).join(", ")
        : "Sin add-ons por ahora";
    }

    saveState();
  }

  function syncPlanButtonsFromState() {
    const cards = document.querySelectorAll(".price-card");
    if (!cards.length) return;

    let matched = false;
    cards.forEach((card) => {
      const title = card.querySelector("h3");
      const button = card.querySelector(".btn-plan");
      const isSelected = title && title.innerText.trim() === selectedPlanName;

      card.classList.toggle("selected", isSelected);
      if (button) {
        if (!button.dataset.defaultText) button.dataset.defaultText = button.innerText.trim();
        button.classList.toggle("is-active", isSelected);
        button.innerText = isSelected ? "Plan seleccionado" : (button.dataset.defaultText || "Elegir plan");
      }
      if (isSelected) matched = true;
    });

    if (!matched) {
      const selectedCard = document.querySelector(".price-card.selected") || cards[0];
      const selectedValue = selectedCard.querySelector(".value");
      const selectedTitle = selectedCard.querySelector("h3");
      selectedPlanPrice = parsePrice(selectedValue ? selectedValue.innerText : selectedPlanPrice);
      selectedPlanName = selectedTitle ? selectedTitle.innerText.trim() : selectedPlanName;
    }
  }

  function syncAddonButtonsFromState() {
    const addonButtons = document.querySelectorAll(".addon-card .btn-addon-add");
    addonButtons.forEach((button) => {
      const card = button.closest(".addon-card");
      const title = card ? card.querySelector("h3") : null;
      const name = title ? title.innerText.trim() : "";
      const active = activeAddons.some((addon) => addon.name === name);

      button.classList.toggle("selected", active);
      button.innerHTML = active
        ? '<i class="fa-solid fa-check"></i> Agregado al trial'
        : "Agregar al trial";
    });
  }

  function setupPlanButtons() {
    const buttons = document.querySelectorAll(".btn-plan");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      if (!btn.dataset.defaultText) btn.dataset.defaultText = btn.innerText.trim();

      btn.addEventListener("click", (event) => {
        event.preventDefault();

        document.querySelectorAll(".price-card").forEach((card) => card.classList.remove("selected"));
        buttons.forEach((button) => {
          button.classList.remove("is-active");
          button.innerText = button.dataset.defaultText || "Elegir plan";
        });

        const currentCard = btn.closest(".price-card");
        if (!currentCard) return;

        currentCard.classList.add("selected");
        btn.classList.add("is-active");
        btn.innerText = "Plan seleccionado";

        const cardValue = currentCard.querySelector(".value");
        const cardTitle = currentCard.querySelector("h3");

        selectedPlanPrice = parsePrice(cardValue ? cardValue.innerText : selectedPlanPrice);
        selectedPlanName = cardTitle ? cardTitle.innerText.trim() : selectedPlanName;

        updateSummary();
        openWidget();
      });
    });
  }

  function setupWidgetToggle() {
    const widget = getElement("summaryWidget");
    const toggleBtn = getElement("toggleWidget");
    if (!widget || !toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      widget.classList.toggle("is-closed");
      const icon = toggleBtn.querySelector("i");
      const toggleText = toggleBtn.querySelector(".toggle-text");

      if (widget.classList.contains("is-closed")) {
        if (toggleText) toggleText.innerText = "Ver resumen";
        if (icon) icon.style.transform = "rotate(0deg)";
      } else {
        if (toggleText) toggleText.innerText = "Guardar";
        if (icon) icon.style.transform = "rotate(180deg)";
      }
    });
  }

  function setupWidgetRemoveActions() {
    const widgetList = getElement("widget-addons-list");
    if (!widgetList) return;

    widgetList.addEventListener("click", (event) => {
      const removeButton = event.target.closest(".widget-remove-addon");
      if (!removeButton) return;

      const index = Number(removeButton.dataset.addonIndex);
      if (!Number.isInteger(index) || index < 0 || index >= activeAddons.length) return;

      const addonName = activeAddons[index] ? activeAddons[index].name : "este add-on";
      const isMobile = window.matchMedia("(max-width: 992px)").matches;
      if (isMobile) {
        const confirmed = window.confirm(`¿Quitar ${addonName} de tu configuración?`);
        if (!confirmed) return;
      }

      activeAddons.splice(index, 1);
      syncAddonButtonsFromState();
      updateSummary();
    });
  }

  function closeMobileMenu(menuButton, navMenu) {
    menuButton.classList.remove("is-active");
    menuButton.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("active");
  }

  function normalizePath(path) {
    return (path || "").replace(/\/index\.html$/i, "/").replace(/\/$/, "") || "/";
  }

  function markActiveNavigation() {
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll(".nav-menu a[href]");

    navLinks.forEach((link) => {
      const url = new URL(link.href, window.location.origin);
      const linkPath = normalizePath(url.pathname);
      const isCurrent = currentPath === linkPath;
      if (!isCurrent) return;

      link.classList.add("is-current");
      const dropdown = link.closest(".has-dropdown");
      if (dropdown) {
        dropdown.classList.add("is-current-parent");
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (toggle) toggle.classList.add("is-current");
      }
    });
  }

  function setupNavigation() {
    const menuButton = getElement("mobile-menu");
    const navMenu = document.querySelector(".nav-menu");
    if (!menuButton || !navMenu) return;

    menuButton.addEventListener("click", () => {
      menuButton.classList.toggle("is-active");
      navMenu.classList.toggle("active");
      menuButton.setAttribute("aria-expanded", menuButton.classList.contains("is-active") ? "true" : "false");
    });

    document.querySelectorAll(".nav-link:not(.dropdown-toggle)").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 992) closeMobileMenu(menuButton, navMenu);
      });
    });

    document.querySelectorAll(".dropdown-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const dropdown = button.closest(".has-dropdown");
        if (!dropdown || window.innerWidth > 992) return;

        const isOpen = dropdown.classList.contains("open");
        document.querySelectorAll(".has-dropdown.open").forEach((item) => {
          item.classList.remove("open");
          const toggle = item.querySelector(".dropdown-toggle");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        });

        dropdown.classList.toggle("open", !isOpen);
        button.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".main-navbar")) return;

      document.querySelectorAll(".has-dropdown.open").forEach((item) => {
        item.classList.remove("open");
        const toggle = item.querySelector(".dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    });

    markActiveNavigation();
  }

  function setupWhatsApp() {
    const phone = "527771234567";
    const message = encodeURIComponent("Hola, quiero informacion de EscalaPOS.");
    const url = `https://wa.me/${phone}?text=${message}`;

    document.querySelectorAll(".whatsapp-float").forEach((link) => {
      link.setAttribute("href", url);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  window.toggleAddon = function toggleAddon(btn, rawPrice) {
    const card = btn ? btn.closest(".addon-card") : null;
    if (!card) return;

    const title = card.querySelector("h3");
    const name = title ? title.innerText.trim() : "Add-on";
    const price = Number(rawPrice) || 0;

    btn.classList.toggle("selected");

    if (btn.classList.contains("selected")) {
      if (!activeAddons.some((addon) => addon.name === name)) {
        activeAddons.push({ name, price });
      }
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Agregado al trial';
      openWidget();
    } else {
      activeAddons = activeAddons.filter((addon) => addon.name !== name);
      btn.innerHTML = "Agregar al trial";
    }

    updateSummary();
  };

  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    ensureWidgetExists();
    ensureWidgetActions();
    setupNavigation();
    setupPlanButtons();
    setupWidgetToggle();
    setupWidgetRemoveActions();
    setupWhatsApp();
    syncPlanButtonsFromState();
    syncAddonButtonsFromState();
    updateSummary();
  });
})();
