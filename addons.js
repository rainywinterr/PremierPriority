// addons.js - Shared Features (Language & Fullscreen, Call Server, Per-item Takeout/Eat Here, Order Status)

document.addEventListener('DOMContentLoaded', () => {

    // Ensure CSS is injected
    if (!document.querySelector('link[href*="addons.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'addons.css';
        document.head.appendChild(link);
    }

    // 1. Language & Fullscreen Modal
    const modalHTML = `
        <div id="addons-start-modal">
            <div class="addons-modal-box">
                <h2>Choose Language / Langue</h2>
                <div class="addons-btn-group" id="addons-lang-btns">
                    <button class="addons-btn" data-val="en">English</button>
                    <button class="addons-btn" data-val="fr">Français</button>
                    <button class="addons-btn" data-val="ar">العربية</button>
                </div>
            </div>
        </div>
    `;

    // 2. Services FAB & Order Tracker
    const overlayHTML = `
        <div id="addons-fab-container">
            <div id="addons-fab-menu">
                <div class="addons-menu-item" id="addons-btn-server">🛎️ Call Server</div>
                <div class="addons-menu-item" id="addons-btn-bill">📜 Request Bill</div>
                <div class="addons-menu-item" id="addons-btn-napkins">🧻 Need Napkins</div>
                <div class="addons-menu-item" id="addons-btn-mock-order">📍 Check Order Status</div>
            </div>
            <button id="addons-fab" title="Services / Call Server">
                <span>Services</span>
            </button>
        </div>

        <div id="addons-order-tracker">
            <div class="addons-status-dot"></div>
            <div class="addons-tracker-text">Preparing Order...</div>
            <div class="addons-tracker-time" id="addons-timer" style="display: none;">15:00</div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML + overlayHTML);

    const modal = document.getElementById('addons-start-modal');
    const langBtns = document.querySelectorAll('#addons-lang-btns .addons-btn');

    // Language Selection -> Trigger Fullscreen & Hide Modal
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => console.log('Fullscreen request handled:', err));
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen().catch(err => console.log('Fullscreen request handled:', err));
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen().catch(err => console.log('Fullscreen request handled:', err));
            }

            modal.classList.add('hidden');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 500);
        });
    });

    // Services FAB Click to Reveal Logic
    const fab = document.getElementById('addons-fab');
    const fabMenu = document.getElementById('addons-fab-menu');

    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        fabMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!fabMenu.contains(e.target) && e.target !== fab) {
            fabMenu.classList.remove('open');
        }
    });

    const triggerServiceNotification = (msg) => {
        alert(msg);
        fabMenu.classList.remove('open');
    };

    document.getElementById('addons-btn-server')?.addEventListener('click', () => triggerServiceNotification("A server has been notified and will be at your table shortly."));
    document.getElementById('addons-btn-bill')?.addEventListener('click', () => triggerServiceNotification("Your bill request has been sent to the cashier."));
    document.getElementById('addons-btn-napkins')?.addEventListener('click', () => triggerServiceNotification("Napkins request sent. We will bring them to your table."));

    // Order Status Tracker (Timer Invisible)
    const tracker = document.getElementById('addons-order-tracker');
    const statusTextElem = document.querySelector('.addons-tracker-text');
    let trackerHideTimer = null;

    document.getElementById('addons-btn-mock-order')?.addEventListener('click', () => {
        fabMenu.classList.remove('open');
        tracker.classList.add('visible');
        statusTextElem.innerText = "Order in Progress: Preparing in Kitchen...";

        clearTimeout(trackerHideTimer);
        trackerHideTimer = setTimeout(() => {
            tracker.classList.remove('visible');
        }, 8000);
    });

    // 3. Per-Item Eat Here / Take Out & Global Select All Toggle
    // Stores dining preferences per item ID: { [itemId]: 'dine-in' | 'takeout' }
    const itemDiningPreferences = {};
    let globalTakeoutState = false;

    function applyDiningUI() {
        const orderList = document.getElementById('order-list');
        if (!orderList) return;

        const itemElements = Array.from(orderList.querySelectorAll('.order-item-info, .order-item, [class*="item"]'));
        if (itemElements.length === 0) return;

        // 1. Inject Global Bar if not present
        let globalBar = document.getElementById('addons-takeout-global-bar');
        if (!globalBar) {
            globalBar = document.createElement('div');
            globalBar.id = 'addons-takeout-global-bar';
            globalBar.innerHTML = `
                <span class="addons-takeout-label">Dining Preference</span>
                <button id="addons-toggle-all-takeout" class="addons-takeout-btn ${globalTakeoutState ? 'active' : ''}">
                    <span>🛍️</span> Take All Out
                </button>
            `;
            orderList.insertBefore(globalBar, orderList.firstChild);

            document.getElementById('addons-toggle-all-takeout')?.addEventListener('click', () => {
                globalTakeoutState = !globalTakeoutState;
                const toggleBtn = document.getElementById('addons-toggle-all-takeout');
                if (toggleBtn) {
                    toggleBtn.classList.toggle('active', globalTakeoutState);
                    toggleBtn.innerHTML = globalTakeoutState ? '<span>🍽️</span> Eat All Here' : '<span>🛍️</span> Take All Out';
                }

                // Update all items
                const itemToggles = orderList.querySelectorAll('.addons-item-dining-toggle');
                itemToggles.forEach(toggleGroup => {
                    const targetMode = globalTakeoutState ? 'takeout' : 'dine-in';
                    const targetBtn = toggleGroup.querySelector(`[data-mode="${targetMode}"]`);
                    if (targetBtn) targetBtn.click();
                });
            });
        }

        // 2. Inject item-level toggles for each item entry
        itemElements.forEach((itemEl, idx) => {
            // Find parent item container or use current element
            const container = itemEl.closest('.order-item, [data-id], .order-item-info') || itemEl;
            if (container.querySelector('.addons-item-dining-toggle')) return;

            const itemId = container.dataset?.id || container.getAttribute('data-id') || `item-${idx}`;
            if (!itemDiningPreferences[itemId]) {
                itemDiningPreferences[itemId] = globalTakeoutState ? 'takeout' : 'dine-in';
            }

            const toggleGroup = document.createElement('div');
            toggleGroup.className = 'addons-item-dining-toggle';
            toggleGroup.innerHTML = `
                <button class="addons-dining-opt ${itemDiningPreferences[itemId] === 'dine-in' ? 'active' : ''}" data-mode="dine-in">🍽️ Eat Here</button>
                <button class="addons-dining-opt ${itemDiningPreferences[itemId] === 'takeout' ? 'active' : ''}" data-mode="takeout">🛍️ Take Out</button>
            `;

            container.appendChild(toggleGroup);

            // Handle option click
            toggleGroup.querySelectorAll('.addons-dining-opt').forEach(optBtn => {
                optBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const mode = optBtn.dataset.mode;
                    itemDiningPreferences[itemId] = mode;

                    toggleGroup.querySelectorAll('.addons-dining-opt').forEach(b => b.classList.remove('active'));
                    optBtn.classList.add('active');
                });
            });
        });
    }

    // Observe changes to order-list to dynamically attach dining options when user opens cart
    const observerTarget = document.body;
    const observer = new MutationObserver(() => {
        const orderList = document.getElementById('order-list');
        if (orderList && orderList.children.length > 0) {
            applyDiningUI();
        }
    });

    observer.observe(observerTarget, { childList: true, subtree: true });
});
