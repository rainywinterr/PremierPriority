gsap.registerPlugin(ScrollTrigger);

let activeSectionId = null;
let currentCategory = "";

/* ── Viewport height fix ─────────────────────────── */
function updateViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', updateViewportHeight);
updateViewportHeight();

window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    initFlavorAnimations();
});

/* ── FAB Button ──────────────────────────────────── */
const fabAdd = document.getElementById('fab-add');
const fabPanel = document.getElementById('fab-panel');
const fabOrder = document.getElementById('fab-order');
const orderModal = document.getElementById('order-modal');
const orderBadge = document.getElementById('order-count-badge');
const orderListEl = document.getElementById('order-list');
const orderTotalEl = document.getElementById('order-total');
const orderSubmitBtn = document.getElementById('order-submit');

// Order state
let orderItems = [];

fabAdd.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !fabPanel.classList.contains('hidden');
    if (isOpen) {
        closeFabPanel();
    } else {
        openFabPanel();
    }
});

function openFabPanel() {
    // Reset pills to defaults
    document.querySelectorAll('#size-pills .pill').forEach((p, i) => p.classList.toggle('active', i === 0));
    document.querySelectorAll('#crust-pills .pill').forEach((p, i) => p.classList.toggle('active', i === 0));
    document.querySelectorAll('#extras-pills .pill').forEach(p => p.classList.remove('active'));

    fabPanel.classList.remove('hidden');
    fabAdd.classList.add('open');
}

function closeFabPanel() {
    fabPanel.classList.add('hidden');
    fabAdd.classList.remove('open');
}

document.addEventListener('click', (e) => {
    if (!fabPanel.contains(e.target) && e.target !== fabAdd) {
        closeFabPanel();
    }
});

// Pill toggle (single-select per group)
document.querySelectorAll('.fab-option-pills').forEach(group => {
    group.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            if (group.id === 'extras-pills') {
                pill.classList.toggle('active');
            } else {
                group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            }
        });
    });
});

// Confirm button — add item to order
document.getElementById('fab-confirm').addEventListener('click', () => {
    const activeSection = document.querySelector('.flavor-section[data-name]');
    // Use the currently visible section from activeSectionId
    const section = activeSectionId ? document.getElementById(activeSectionId) : null;
    const name = section ? section.getAttribute('data-name') : 'Item';
    const price = section ? section.getAttribute('data-price') : '';
    const category = section ? section.getAttribute('data-category') : '';

    const size = document.querySelector('#size-pills .pill.active')?.dataset.val || 'M';
    const crust = document.querySelector('#crust-pills .pill.active')?.dataset.val || 'Classic';
    const extras = [...document.querySelectorAll('#extras-pills .pill.active')].map(p => p.dataset.val);

    const item = { id: Date.now(), name, category, price, size, crust, extras, qty: 1 };
    orderItems.push(item);

    updateOrderBadge();

    // Visual feedback
    const btn = document.getElementById('fab-confirm');
    btn.textContent = '✓ Added!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
        btn.textContent = 'Add to Order';
        btn.style.background = '';
        closeFabPanel();
    }, 1000);
});

/* ── Order Badge & FAB Visibility ─────────────────── */
function updateOrderBadge() {
    const totalQty = orderItems.reduce((s, i) => s + i.qty, 0);
    orderBadge.textContent = totalQty;
    if (totalQty > 0) {
        fabOrder.classList.remove('hidden');
    } else {
        fabOrder.classList.add('hidden');
    }
}

/* ── Order Modal ──────────────────────────────────── */
fabOrder.addEventListener('click', (e) => {
    e.stopPropagation();
    openOrderModal();
});

document.getElementById('order-modal-close').addEventListener('click', () => {
    closeOrderModal();
});

orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) closeOrderModal();
});

function openOrderModal() {
    renderOrderList();
    orderModal.classList.remove('hidden');
}

function closeOrderModal() {
    orderModal.classList.add('hidden');
}

function renderOrderList() {
    if (orderItems.length === 0) {
        orderListEl.innerHTML = '<div class="order-empty">No items yet. Browse the menu and tap +</div>';
        orderTotalEl.textContent = 'Total: 0 DZD';
        orderSubmitBtn.disabled = true;
        return;
    }

    orderSubmitBtn.disabled = false;
    orderListEl.innerHTML = orderItems.map(item => {
        const detailParts = [item.size, item.crust];
        if (item.extras && item.extras.length) detailParts.push(item.extras.join(', '));
        const unitPrice = parseInt((item.price || '0').replace(/\D/g, '')) || 0;
        const linePrice = unitPrice * item.qty;
        return `
        <div class="order-item-card" data-id="${item.id}">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-details">${detailParts.filter(Boolean).join(' · ')}</div>
            </div>
            <div class="order-item-qty">
                <button class="qty-btn qty-dec" data-id="${item.id}">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn qty-inc" data-id="${item.id}">+</button>
            </div>
            <div class="order-item-price">${linePrice.toLocaleString('fr-DZ')} DZD</div>
        </div>`;
    }).join('');

    // Attach qty handlers
    orderListEl.querySelectorAll('.qty-dec').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = orderItems.find(i => i.id === id);
            if (!item) return;
            if (item.qty <= 1) {
                orderItems = orderItems.filter(i => i.id !== id);
            } else {
                item.qty--;
            }
            updateOrderBadge();
            renderOrderList();
            if (orderItems.length === 0) closeOrderModal();
        });
    });
    orderListEl.querySelectorAll('.qty-inc').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = orderItems.find(i => i.id === id);
            if (item) { item.qty++; updateOrderBadge(); renderOrderList(); }
        });
    });

    // Calculate total
    const total = orderItems.reduce((sum, item) => {
        const num = parseInt((item.price || '0').replace(/\D/g, '')) || 0;
        return sum + num * item.qty;
    }, 0);
    orderTotalEl.textContent = `Total: ${total.toLocaleString('fr-DZ')} DZD`;
}

// Submit to cuisine
orderSubmitBtn.addEventListener('click', () => {
    if (orderItems.length === 0) return;
    orderSubmitBtn.textContent = '✓ Sent!';
    orderSubmitBtn.style.background = '#22c55e';
    orderSubmitBtn.disabled = true;
    console.log('🍽 Order sent to kitchen:', orderItems);
    setTimeout(() => {
        orderItems = [];
        updateOrderBadge();
        closeOrderModal();
        orderSubmitBtn.textContent = 'Send to Kitchen';
        orderSubmitBtn.style.background = '';
    }, 1500);
});

/* ── Menu UI Update ──────────────────────────────── */
function updateMenuUI(color, section, isDown = true) {
    if (activeSectionId === section.id) return;
    activeSectionId = section.id;

    const catEl = section.querySelector(".mobile-category");
    const nameEl = section.querySelector(".mobile-product-name");
    const priceEl = section.querySelector(".mobile-price");
    const ingredientsEl = section.querySelector(".mobile-ingredients");
    const visual = section.querySelector(".flavor-visual");

    const category = section.getAttribute("data-category");
    const name = section.getAttribute("data-name");
    const price = section.getAttribute("data-price");
    const ingredientItems = (section.getAttribute("data-ingredients") || "").split(";");

    gsap.to(".fixed-bg", { backgroundColor: color, duration: 0.6, ease: "power2.inOut" });

    if (nameEl) {
        const ingredientsHTML = ingredientItems
            .map(item => `<div class="mask"><span class="ing-line">${item}</span></div>`)
            .join("");

        if (catEl) catEl.innerText = category;
        nameEl.innerText = name;
        priceEl.innerText = price;
        ingredientsEl.innerHTML = ingredientsHTML;

        const categoryChanged = category !== currentCategory;
        const oldCategory = currentCategory;
        currentCategory = category;

        if (categoryChanged) {
            if (oldCategory) {
                const oldWrapper = document.getElementById(`bg-${oldCategory}`);
                if (oldWrapper) {
                    const oldLabel = oldWrapper.querySelector('.bg-category-label');
                    gsap.killTweensOf(oldLabel);
                    gsap.to(oldLabel, { y: isDown ? "-110%" : "110%", opacity: 0, duration: 0.8, ease: "power2.in", onComplete: () => { oldWrapper.style.display = 'none'; } });
                }
            }
            const newWrapper = document.getElementById(`bg-${category}`);
            if (newWrapper) {
                newWrapper.style.display = 'block';
                const newLabel = newWrapper.querySelector('.bg-category-label');
                gsap.killTweensOf(newLabel);
                const entryYBg = isDown ? "110%" : "-110%";
                gsap.fromTo(newLabel,
                    { y: entryYBg, opacity: 0 },
                    { y: "0%", opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.5, overwrite: "auto" }
                );
            }
        }

        const catHrefMap = {
            "Pizza": "#category-pizza",
            "Burger": "#category-burger",
            "Shawarma": "#category-shawarma",
            "Bowls": "#category-bowls"
        };
        const activeHref = catHrefMap[category];
        const catNav = document.querySelector(".category-nav");

        if (catNav && activeHref) {
            let activeCatEl = null;
            catNav.querySelectorAll(".nav-cat-item").forEach(item => {
                const isActive = item.getAttribute("href") === activeHref;
                item.classList.toggle("active", isActive);
                if (isActive) activeCatEl = item;
            });

            const indicator = catNav.querySelector(".nav-indicator");
            if (activeCatEl && indicator) {
                indicator.style.opacity = "1";
                indicator.style.width = `${activeCatEl.offsetWidth}px`;
                indicator.style.height = `${activeCatEl.offsetHeight}px`;
                indicator.style.left = `${activeCatEl.offsetLeft}px`;
            }
        }

        const itemsToAnimate = [
            catEl,
            nameEl,
            ...gsap.utils.toArray(ingredientsEl.querySelectorAll(".ing-line")),
            priceEl
        ].filter(el => el !== null);

        gsap.killTweensOf(itemsToAnimate);

        const entryY = isDown ? "110%" : "-110%";
        const tl = gsap.timeline({ delay: 0.4 });

        tl.fromTo(itemsToAnimate,
            { y: entryY, opacity: 0 },
            { y: "0%", opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", overwrite: "auto" }
        );
    }

    if (visual) {
        gsap.killTweensOf(visual);
        const entryY = isDown ? "120%" : "-120%";
        gsap.fromTo(visual,
            { y: entryY, opacity: 0 },
            { y: "0%", opacity: 1, duration: 1.0, ease: "power3.out", overwrite: "auto" }
        );
    }
}

function hideMenuUI(section, isDown = true) {
    const visual = section.querySelector(".flavor-visual");
    const items = [
        section.querySelector(".mobile-category"),
        section.querySelector(".mobile-product-name"),
        ...section.querySelectorAll(".ing-line"),
        section.querySelector(".mobile-price")
    ].filter(el => el !== null);

    if (items.length === 0 && !visual) return;

    // Labels are now handled globally in updateMenuUI

    if (items.length > 0) {
        gsap.killTweensOf(items);
        const exitY = isDown ? "-110%" : "110%";
        gsap.to(items, { y: exitY, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.in", overwrite: "auto" });
    }

    if (visual) {
        gsap.killTweensOf(visual);
        const exitY = isDown ? "-120%" : "120%";
        gsap.to(visual, { y: exitY, opacity: 0, duration: 0.8, ease: "power3.in", overwrite: "auto" });
    }

    if (activeSectionId === section.id) activeSectionId = null;
}

/* ── Init Animations ─────────────────────────────── */
function initFlavorAnimations() {
    gsap.to(".floating-img", {
        y: 20, duration: 3, ease: "sine.inOut",
        repeat: -1, yoyo: true,
        stagger: { each: 0.5, from: "random" }
    });

    const flavorSections = gsap.utils.toArray(".flavor-section");
    flavorSections.forEach(section => {
        const color = section.getAttribute('data-bg');
        ScrollTrigger.create({
            trigger: section,
            scroller: ".snap-container",
            start: "top 95%",
            end: "bottom 5%",
            onEnter: () => updateMenuUI(color, section, true),
            onEnterBack: () => updateMenuUI(color, section, false),
            onLeave: () => hideMenuUI(section, true),
            onLeaveBack: () => hideMenuUI(section, false)
        });
    });
}
