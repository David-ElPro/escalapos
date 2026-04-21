// Variables de estado inicial
let selectedPlanPrice = 299;
let selectedPlanName = "Comercial";
let activeAddons = [];

// 1. FUNCIÓN PARA ABRIR EL WIDGET AUTOMÁTICAMENTE (Si está cerrado)
function openWidget() {
    const widget = document.getElementById('summaryWidget');
    const toggleBtn = document.getElementById('toggleWidget');
    
    if (widget && widget.classList.contains('is-closed')) {
        widget.classList.remove('is-closed');
        
        // Actualizamos visualmente el botón del widget
        const icon = toggleBtn.querySelector('i');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        
        if (toggleText) toggleText.innerText = "Guardar";
        if (icon) icon.style.transform = "rotate(180deg)";
    }
}

// 2. FUNCIÓN ÚNICA PARA ACTUALIZAR TODA LA UI
function updateSummary() {
    const totalAddonsPrice = activeAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = selectedPlanPrice + totalAddonsPrice;
    const formattedPrice = `$${totalPrice.toFixed(2)}`;

    // --- ACTUALIZAR CARD INFERIOR (Resumen horizontal) ---
    const displayPlan = document.getElementById('display-plan-name');
    const displayAddonsList = document.getElementById('display-addons-list');
    const displayTotalPrice = document.getElementById('total-price');

    if (displayPlan) displayPlan.innerText = `${selectedPlanName} + ${activeAddons.length} add-ons`;
    
    if (displayAddonsList) {
        displayAddonsList.innerText = activeAddons.length > 0 
            ? activeAddons.map(a => a.name).join(", ") 
            : "Sin add-ons seleccionados";
    }
    
    if (displayTotalPrice) displayTotalPrice.innerHTML = `${formattedPrice}<span>/mes</span>`;


    // --- ACTUALIZAR WIDGET LATERAL (Drawer) ---
    const widgetPlan = document.getElementById('widget-plan-name');
    const widgetCount = document.getElementById('widget-addons-count');
    const widgetPrice = document.getElementById('widget-total-price');
    const widgetList = document.getElementById('widget-addons-list');

    if (widgetPlan) widgetPlan.innerText = selectedPlanName;
    if (widgetCount) widgetCount.innerText = `${activeAddons.length} add-on(s) seleccionado(s)`;
    if (widgetPrice) widgetPrice.innerText = formattedPrice;
    
    if (widgetList) {
        if (activeAddons.length > 0) {
            widgetList.innerHTML = activeAddons.map(a => `<p>• ${a.name}</p>`).join("");
        } else {
            widgetList.innerHTML = '<p class="empty-msg">No has agregado complementos</p>';
        }
    }
}

// 3. Lógica para SELECCIÓN DE PLANES BASE
document.querySelectorAll('.btn-plan').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();

        // Estilos visuales
        document.querySelectorAll('.price-card').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.btn-plan').forEach(b => {
            b.classList.remove('is-active');
            b.innerText = "Elegir plan"; 
        });

        const card = this.closest('.price-card');
        card.classList.add('selected');
        this.classList.add('is-active');
        this.innerText = "Plan seleccionado";

        // Actualizar variables globales
        selectedPlanPrice = parseFloat(card.querySelector('.value').innerText.replace('$', ''));
        selectedPlanName = card.querySelector('h3').innerText;
        
        // Ejecutar actualizaciones
        updateSummary();
        openWidget(); // <--- Se abre solo si estaba cerrado
    });
});

// 4. Lógica para BOTONES DE ADD-ONS
function toggleAddon(btn, price) {
    const card = btn.closest('.addon-card');
    const name = card.querySelector('h3').innerText;

    btn.classList.toggle('selected');

    if (btn.classList.contains('selected')) {
        activeAddons.push({ name, price });
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';
        openWidget(); // <--- Se abre al agregar un servicio
    } else {
        activeAddons = activeAddons.filter(addon => addon.name !== name);
        btn.innerHTML = 'Agregar al trial';
    }

    updateSummary();
}

// 5. Lógica del WIDGET LATERAL (Click manual del usuario)
const widget = document.getElementById('summaryWidget');
const toggleBtn = document.getElementById('toggleWidget');

if (toggleBtn && widget) {
    toggleBtn.addEventListener('click', () => {
        widget.classList.toggle('is-closed');
        
        const icon = toggleBtn.querySelector('i');
        const toggleText = toggleBtn.querySelector('.toggle-text');

        if (widget.classList.contains('is-closed')) {
            toggleText.innerText = "Ver resumen";
            icon.style.transform = "rotate(0deg)"; 
        } else {
            toggleText.innerText = "Guardar";
            icon.style.transform = "rotate(180deg)"; 
        }
    });
}

// 6. Menú Sandwich Responsivo
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.nav-menu');

if (menu) {
    menu.addEventListener('click', function() {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    menu.classList.remove('is-active');
    menuLinks.classList.remove('active');
}));
// Asegúrate de que tu script.js incluya esta parte para la card de preselección:

function updateSummary() {
    const totalAddonsPrice = activeAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = selectedPlanPrice + totalAddonsPrice;
    const formattedPrice = `$${totalPrice.toFixed(2)}`;

    // 1. ACTUALIZAR WIDGET LATERAL
    document.getElementById('widget-plan-name').innerText = selectedPlanName;
    document.getElementById('widget-addons-count').innerText = `${activeAddons.length} add-on(s)`;
    document.getElementById('widget-total-price').innerText = formattedPrice;

    // 2. ACTUALIZAR CARD DE PRESELECCIÓN (La que tiene la imagen al lado)
    const prePlan = document.getElementById('pre-plan-base');
    const preAddons = document.getElementById('pre-addons-text');
    const prePrice = document.getElementById('pre-total-price');

    if (prePlan) prePlan.innerText = selectedPlanName;
    if (prePrice) prePrice.innerText = formattedPrice;
    if (preAddons) {
        preAddons.innerText = activeAddons.length > 0 
            ? activeAddons.map(a => a.name).join(", ") 
            : "Sin add-ons por ahora";
    }

    // Lógica para abrir widget automáticamente si se agrega algo
    if(activeAddons.length > 0) {
        openWidget();
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', updateSummary);