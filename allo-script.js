gsap.registerPlugin(ScrollTrigger);

let activeSectionId = null;
let currentCategory = "";
let menuData = null;
let mainCategoriesGrouped = []; // [{ main_category: "...", sub_categories: [...] }]
let allCategories = []; // flat array of { category, pieces, items, mainCategoryTitle, mainCatIdx }
let currentViewMode = "scroll"; // "scroll" or "grid"
let isAnimating = false;
let currentGridIndex = 0;

/* ── Viewport height fix ─────────────────────────── */
function updateViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', updateViewportHeight);
updateViewportHeight();

/* ── Helper Slugs ─────────────────────────── */
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

/* ── Fetch Data & Build UI ──────────────────────── */
async function loadMenuData() {
    try {
        let response = await fetch('./alice-menu.json');
        if (!response.ok) {
            response = await fetch('./alice-menu.json');
        }
        menuData = await response.json();

        mainCategoriesGrouped = menuData.main_categories || [];
        allCategories = [];

        mainCategoriesGrouped.forEach((mainCat, mainIdx) => {
            (mainCat.sub_categories || []).forEach(subCat => {
                allCategories.push({
                    category: subCat.category,
                    pieces: subCat.pieces,
                    items: subCat.items || [],
                    mainCategoryTitle: mainCat.main_category,
                    mainCatIdx: mainIdx
                });
            });
        });

        renderMenu();
        renderCategoryDropdown();
        renderGridView();
        setTimeout(() => {
            ScrollTrigger.refresh();
            initFlavorAnimations();
        }, 100);
    } catch (err) {
        console.error("Failed to load menu data:", err);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadMenuData);
} else {
    loadMenuData();
}

/* ── Render Scroll-Through Sections ──────────────── */
function renderMenu() {
    const snapContainer = document.getElementById('snap-container');
    const bgMasksContainer = document.getElementById('bg-masks-container');

    snapContainer.innerHTML = '';
    bgMasksContainer.innerHTML = '';

    const bgColors = ["#12100e", "#0e0d12", "#110a0a", "#12120e", "#0b0f12", "#0e1210", "#100e0b", "#0e0f12", "#0f120e", "#0a0f12", "#120e10"];
    let colorIdx = 0;

    allCategories.forEach((cat, catIdx) => {
        const subTitle = cat.category;
        const subSlug = slugify(subTitle);

        // Background Mask Element
        const maskDiv = document.createElement('div');
        maskDiv.className = 'mask bg-category-mask global-cat-bg';
        maskDiv.id = `bg-${subSlug}`;
        maskDiv.style.cssText = 'position: fixed; top: 50%; left: 10%; transform: translateY(-50%); z-index: 1; pointer-events: none; display: none;';
        maskDiv.innerHTML = `<div class="bg-category-label">${subTitle.toUpperCase()}</div>`;
        bgMasksContainer.appendChild(maskDiv);

        // Render Product Sections
        (cat.items || []).forEach((item, itemIdx) => {
            const section = document.createElement('section');
            const sectionId = (itemIdx === 0) ? `category-${subSlug}` : `${subSlug}-${itemIdx + 1}`;
            section.setAttribute('id', sectionId);

            const bgColor = bgColors[colorIdx % bgColors.length];
            colorIdx++;

            const ingArray = [];
            if (item.description) ingArray.push(item.description);
            if (item.pieces) ingArray.push(`${item.pieces} pièces`);
            if (cat.pieces && !item.pieces) ingArray.push(`${cat.pieces} pièces`);
            if (item.portion) ingArray.push(item.portion);

            section.className = 'snap-section flavor-section';
            section.setAttribute('data-bg', bgColor);
            section.setAttribute('data-category', subTitle);
            section.setAttribute('data-category-slug', subSlug);
            section.setAttribute('data-cat-index', catIdx);
            section.setAttribute('data-item-index', itemIdx);
            section.setAttribute('data-name', item.name);
            section.setAttribute('data-price', item.price || '');
            section.setAttribute('data-ingredients', ingArray.join(';'));

            section.innerHTML = `
                <div class="flavor-layout">
                    <div class="mask"><div class="mobile-category"></div></div>
                    <div class="mask"><div class="mobile-product-name"></div></div>
                    <div class="mask"><div class="mobile-price"></div></div>
                    <div class="flavor-visual"><img src="${item.image}" alt="${item.name}" class="floating-img"></div>
                    <div class="mask"><div class="mobile-ingredients"></div></div>
                </div>
            `;
            snapContainer.appendChild(section);
        });
    });
}

/* ── Render Grid View Slides ─────────────────────── */
function renderGridView() {
    const gridSwipeContainer = document.getElementById('grid-swipe-container');
    if (!gridSwipeContainer) return;
    gridSwipeContainer.innerHTML = '';

    allCategories.forEach((cat, catIdx) => {
        const subTitle = cat.category;
        const subSlug = slugify(subTitle);

        const slide = document.createElement('div');
        slide.className = 'subcat-grid-slide';
        slide.id = `grid-slide-${subSlug}`;
        slide.setAttribute('data-cat-index', catIdx);

        let itemsHTML = (cat.items || []).map((item, itemIdx) => {
            const sectionId = (itemIdx === 0) ? `category-${subSlug}` : `${subSlug}-${itemIdx + 1}`;
            return `
                <div class="grid-item-card" data-section-id="${sectionId}" data-cat-index="${catIdx}">
                    <img src="${item.image}" alt="${item.name}" class="grid-item-img">
                    <div class="grid-item-name">${item.name}</div>
                    <div class="grid-item-price">${item.price || ''}</div>
                </div>
            `;
        }).join('');

        slide.innerHTML = `
            <h3 class="subcat-grid-title">${subTitle}</h3>
            <div class="subcat-items-grid">
                ${itemsHTML}
            </div>
        `;

        slide.addEventListener('click', (e) => {
            const card = e.target.closest('.grid-item-card');
            if (!card) return;
            e.stopPropagation();
            const targetId = card.getAttribute('data-section-id');
            if (targetId) {
                switchToScrollView(targetId);
            }
        });

        gridSwipeContainer.appendChild(slide);
    });

    gridSwipeContainer.onscroll = () => {
        const scrollLeft = gridSwipeContainer.scrollLeft;
        const slideWidth = gridSwipeContainer.clientWidth;
        currentGridIndex = Math.round(scrollLeft / slideWidth);
        if (currentViewMode === 'grid') {
            updateNavDots();
            updateGridArrows();
            if (allCategories[currentGridIndex]) {
                updateTitleDisplay(allCategories[currentGridIndex].category);
            }
        }
    };
}

/* ── Render Category Dropdown (With Title & Spacing Between Main Cats) ── */
function renderCategoryDropdown() {
    const dropdownList = document.getElementById('category-dropdown-list');
    if (!dropdownList) return;
    dropdownList.innerHTML = '';

    // Add Title "Catégories"
    const headerTitle = document.createElement('div');
    headerTitle.className = 'dropdown-header-title';
    headerTitle.textContent = 'Catégories';
    dropdownList.appendChild(headerTitle);

    let lastMainIdx = -1;

    allCategories.forEach((cat, idx) => {
        // Add spacing before new main category group
        if (lastMainIdx !== -1 && cat.mainCatIdx !== lastMainIdx) {
            const groupSpacer = document.createElement('div');
            groupSpacer.className = 'dropdown-group-spacer';
            dropdownList.appendChild(groupSpacer);
        }
        lastMainIdx = cat.mainCatIdx;

        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.setAttribute('data-cat-index', idx);
        item.textContent = cat.category;
        item.addEventListener('click', () => {
            dropdownList.classList.add('hidden');
            if (currentViewMode === 'scroll') {
                const subSlug = slugify(cat.category);
                const targetEl = document.getElementById(`category-${subSlug}`);
                jumpToSection(targetEl);
            } else {
                const gridSwipeContainer = document.getElementById('grid-swipe-container');
                if (gridSwipeContainer) {
                    gridSwipeContainer.style.scrollBehavior = 'auto'; // Instant jump 
                    gridSwipeContainer.scrollLeft = idx * gridSwipeContainer.clientWidth;
                    gridSwipeContainer.style.scrollBehavior = '';
                    currentGridIndex = idx;
                    updateNavDots();
                    updateGridArrows();
                    updateTitleDisplay(cat.category);
                }
            }
        });
        dropdownList.appendChild(item);
    });
}

/* ── Fullscreen & Welcome Overlay ─────────────────── */
function requestFullScreen() {
    const docEl = document.documentElement;
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => { });
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen().catch(() => { });
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen().catch(() => { });
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT).catch(() => { });
        }
    }
}

/* ── Welcome Button → Open Menu Directly ─────────── */
document.addEventListener('click', (e) => {
    const enterBtn = e.target.closest('#enter-fullscreen-btn');
    if (enterBtn) {
        requestFullScreen();
        const welcomeOverlay = document.getElementById('welcome-overlay');
        if (welcomeOverlay) {
            welcomeOverlay.classList.add('dismissed');
        }
        openMenuView();
    }
});

/* ── Open Menu View (scroll-through, first item) ── */
function openMenuView() {
    if (isAnimating) return;
    isAnimating = true;

    const menuView = document.getElementById('menu-view');
    const snapContainer = document.getElementById('snap-container');

    currentViewMode = 'scroll';
    showScrollView();

    menuView.classList.remove('hidden-slide');

    const firstSection = snapContainer.querySelector('.snap-section');
    if (firstSection && snapContainer) {
        snapContainer.style.scrollBehavior = 'auto';
        snapContainer.scrollTop = firstSection.offsetTop;
        snapContainer.style.scrollBehavior = '';

        activeSectionId = null;
        currentCategory = "";
        const color = firstSection.getAttribute('data-bg');
        updateMenuUI(color, firstSection, true);
    }

    setTimeout(() => {
        ScrollTrigger.refresh();
        isAnimating = false;
    }, 600);
}

/* ── Category Dropdown Toggle ────────────────────── */
const categoryDropdownBtn = document.getElementById('category-dropdown-btn');
if (categoryDropdownBtn) {
    categoryDropdownBtn.addEventListener('click', () => {
        const dropdown = document.getElementById('category-dropdown-list');
        if (dropdown) dropdown.classList.toggle('hidden');
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#category-dropdown-btn') && !e.target.closest('#category-dropdown-list')) {
        const dropdown = document.getElementById('category-dropdown-list');
        if (dropdown) dropdown.classList.add('hidden');
    }
});

/* ── View Toggle (Scroll ↔ Grid) ─────────────────── */
const viewToggleBtn = document.getElementById('view-toggle-btn');
if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', () => {
        const dropdown = document.getElementById('category-dropdown-list');
        if (dropdown) dropdown.classList.add('hidden');

        if (currentViewMode === 'scroll') {
            currentViewMode = 'grid';

            if (activeSectionId) {
                const sec = document.getElementById(activeSectionId);
                if (sec) {
                    currentGridIndex = parseInt(sec.getAttribute('data-cat-index')) || 0;
                }
            }

            showGridView();

            const gridSwipeContainer = document.getElementById('grid-swipe-container');
            if (gridSwipeContainer) {
                gridSwipeContainer.style.scrollBehavior = 'auto';
                gridSwipeContainer.scrollLeft = currentGridIndex * gridSwipeContainer.clientWidth;
                gridSwipeContainer.style.scrollBehavior = '';
            }

            if (allCategories[currentGridIndex]) {
                updateTitleDisplay(allCategories[currentGridIndex].category);
            }
        } else {
            currentViewMode = 'scroll';
            const cat = allCategories[currentGridIndex];
            if (cat) {
                const subSlug = slugify(cat.category);
                switchToScrollView(`category-${subSlug}`);
            } else {
                showScrollView();
            }
        }

        updateNavDots();
        updateViewToggleIcon();
    });
}

function switchToScrollView(targetSectionId) {
    currentViewMode = 'scroll';
    showScrollView();
    updateViewToggleIcon();

    const targetEl = document.getElementById(targetSectionId);
    if (targetEl) {
        jumpToSection(targetEl);
    }
}

function showScrollView() {
    const snap = document.getElementById('snap-container');
    const grid = document.getElementById('grid-view-container');
    const vertNav = document.getElementById('vertical-scroll-nav');
    const horzNav = document.getElementById('horizontal-grid-nav');

    if (snap) snap.classList.remove('hidden');
    if (grid) grid.classList.add('hidden');
    if (vertNav) vertNav.classList.remove('hidden');
    if (horzNav) horzNav.classList.add('hidden');
    updateViewToggleIcon();
}

function showGridView() {
    const snap = document.getElementById('snap-container');
    const grid = document.getElementById('grid-view-container');
    const vertNav = document.getElementById('vertical-scroll-nav');
    const horzNav = document.getElementById('horizontal-grid-nav');

    if (snap) snap.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    if (vertNav) vertNav.classList.add('hidden');
    if (horzNav) horzNav.classList.remove('hidden');
    updateGridArrows();
    updateViewToggleIcon();
}

function updateViewToggleIcon() {
    const iconScroll = document.getElementById('icon-scroll');
    const iconGrid = document.getElementById('icon-grid');
    if (currentViewMode === 'scroll') {
        if (iconScroll) iconScroll.classList.add('hidden-icon');
        if (iconGrid) iconGrid.classList.remove('hidden-icon');
    } else {
        if (iconScroll) iconScroll.classList.remove('hidden-icon');
        if (iconGrid) iconGrid.classList.add('hidden-icon');
    }
}

/* ── Vertical Nav Dots (Max 5 Visible, Auto-Scroll Windowing) ── */
function updateNavDots() {
    const scrollNavContainer = document.getElementById('sub-nav');
    const gridNavContainer = document.getElementById('grid-sub-nav');

    let activeDotElement = null;

    if (currentViewMode === 'grid') {
        if (!gridNavContainer) return;
        gridNavContainer.innerHTML = '';
        allCategories.forEach((cat, idx) => {
            const isActive = (idx === currentGridIndex);
            const dot = document.createElement('a');
            dot.className = `sub-nav-dot-item ${isActive ? 'active' : ''}`;
            dot.setAttribute('title', cat.category);
            dot.innerHTML = `<span class="sub-dot-icon"></span>`;

            if (isActive) activeDotElement = dot;

            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const gridSwipeContainer = document.getElementById('grid-swipe-container');
                if (gridSwipeContainer) {
                    gridSwipeContainer.style.scrollBehavior = 'auto'; // Instant jump
                    gridSwipeContainer.scrollLeft = idx * gridSwipeContainer.clientWidth;
                    gridSwipeContainer.style.scrollBehavior = '';
                }
            });
            gridNavContainer.appendChild(dot);
        });

        if (activeDotElement) {
            const dotLeft = activeDotElement.offsetLeft;
            const containerWidth = gridNavContainer.clientWidth;
            gridNavContainer.scrollTo({
                left: dotLeft - containerWidth / 2 + activeDotElement.clientWidth / 2,
                behavior: 'smooth'
            });
        }
    } else {
        if (!scrollNavContainer) return;
        scrollNavContainer.innerHTML = '';
        const currentCatData = allCategories.find(c => c.category === currentCategory);
        if (!currentCatData) return;
        const subSlug = slugify(currentCategory);

        currentCatData.items.forEach((item, idx) => {
            const sectionId = (idx === 0) ? `category-${subSlug}` : `${subSlug}-${idx + 1}`;
            const isActive = (activeSectionId === sectionId);
            const dot = document.createElement('a');
            dot.className = `sub-nav-dot-item ${isActive ? 'active' : ''}`;
            dot.setAttribute('title', item.name);
            dot.innerHTML = `<span class="sub-dot-icon"></span>`;

            if (isActive) activeDotElement = dot;

            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const targetEl = document.getElementById(sectionId);
                jumpToSection(targetEl);
            });
            scrollNavContainer.appendChild(dot);
        });

        if (activeDotElement) {
            const dotTop = activeDotElement.offsetTop;
            const containerHeight = scrollNavContainer.clientHeight;
            scrollNavContainer.scrollTo({
                top: dotTop - containerHeight / 2 + activeDotElement.clientHeight / 2,
                behavior: 'smooth'
            });
        }
    }
}

/* ── Title Display ───────────────────────────────── */
function updateTitleDisplay(categoryName) {
    const display = document.getElementById('current-subcat-display');
    if (!display) return;
    if (display.textContent !== categoryName) {
        gsap.to(display, {
            y: -12, opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: () => {
                display.textContent = categoryName;
                gsap.fromTo(display, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' });
            }
        });
    }
}

function jumpToSection(targetEl) {
    const snapContainer = document.getElementById('snap-container');
    if (!targetEl || !snapContainer) return;

    snapContainer.style.scrollBehavior = 'auto'; // Instant jump
    snapContainer.scrollTop = targetEl.offsetTop;
    snapContainer.style.scrollBehavior = '';

    activeSectionId = null;
    const color = targetEl.getAttribute('data-bg');
    updateMenuUI(color, targetEl, true);
    setTimeout(() => ScrollTrigger.refresh(), 50);
}

/* ── Smooth Scroll to Section with GSAP / ScrollTo ── */
function smoothScrollToSection(targetEl) {
    const snapContainer = document.getElementById('snap-container');
    if (!targetEl || !snapContainer) return;

    const targetTop = targetEl.offsetTop;

    gsap.to(snapContainer, {
        scrollTop: targetTop,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
            activeSectionId = null;
            const color = targetEl.getAttribute('data-bg');
            updateMenuUI(color, targetEl, true);
        }
    });
}

/* ── Scroll Arrow Controls ───────────────────────── */
function updateGridArrows() {
    const arrowLeft = document.getElementById('scroll-arrow-left');
    const arrowRight = document.getElementById('scroll-arrow-right');
    if (currentViewMode !== 'grid') return;

    if (arrowLeft) arrowLeft.classList.toggle('disabled', currentGridIndex <= 0);
    if (arrowRight) arrowRight.classList.toggle('disabled', currentGridIndex >= allCategories.length - 1);
}

// Arrow click handlers
document.addEventListener('click', (e) => {
    const snapContainer = document.getElementById('snap-container');
    const gridSwipeContainer = document.getElementById('grid-swipe-container');

    if (e.target.closest('#scroll-arrow-up')) {
        if (currentViewMode === 'scroll' && snapContainer) {
            const sections = Array.from(snapContainer.querySelectorAll('.snap-section'));
            const currentIdx = sections.findIndex(s => s.id === activeSectionId);
            if (currentIdx > 0) {
                const prev = sections[currentIdx - 1];
                smoothScrollToSection(prev);
            }
        } else if (currentViewMode === 'grid' && gridSwipeContainer) {
            if (currentGridIndex > 0) {
                currentGridIndex--;
                gridSwipeContainer.style.scrollBehavior = 'smooth';
                gridSwipeContainer.scrollLeft = currentGridIndex * gridSwipeContainer.clientWidth;
            }
        }
    }

    if (e.target.closest('#scroll-arrow-down')) {
        if (currentViewMode === 'scroll' && snapContainer) {
            const sections = Array.from(snapContainer.querySelectorAll('.snap-section'));
            const currentIdx = sections.findIndex(s => s.id === activeSectionId);
            if (currentIdx < sections.length - 1) {
                const next = sections[currentIdx + 1];
                smoothScrollToSection(next);
            }
        } else if (currentViewMode === 'grid' && gridSwipeContainer) {
            if (currentGridIndex < allCategories.length - 1) {
                currentGridIndex++;
                gridSwipeContainer.style.scrollBehavior = 'smooth';
                gridSwipeContainer.scrollLeft = currentGridIndex * gridSwipeContainer.clientWidth;
            }
        }
    }

    if (e.target.closest('#scroll-arrow-left') && gridSwipeContainer) {
        if (currentGridIndex > 0) {
            currentGridIndex--;
            gridSwipeContainer.style.scrollBehavior = 'smooth';
            gridSwipeContainer.scrollLeft = currentGridIndex * gridSwipeContainer.clientWidth;
        }
    }

    if (e.target.closest('#scroll-arrow-right') && gridSwipeContainer) {
        if (currentGridIndex < allCategories.length - 1) {
            currentGridIndex++;
            gridSwipeContainer.style.scrollBehavior = 'smooth';
            gridSwipeContainer.scrollLeft = currentGridIndex * gridSwipeContainer.clientWidth;
        }
    }
});

/* ── Order System & Double Click Add ─────────────── */
const fabOrder = document.getElementById('fab-order');
const orderModal = document.getElementById('order-modal');
const orderBadge = document.getElementById('order-count-badge');
const orderListEl = document.getElementById('order-list');
const orderTotalEl = document.getElementById('order-total');
const orderSubmitBtn = document.getElementById('order-submit');

let orderItems = [];

function addToOrder(section) {
    if (!section) section = activeSectionId ? document.getElementById(activeSectionId) : null;
    if (!section) return;

    const name = section.getAttribute('data-name') || 'Item';
    const price = section.getAttribute('data-price') || '';
    const category = section.getAttribute('data-category') || '';

    const existing = orderItems.find(i => i.name === name && i.price === price);
    if (existing) {
        existing.qty++;
    } else {
        orderItems.push({
            id: Date.now(),
            name,
            category,
            price,
            qty: 1
        });
    }

    updateOrderBadge();
    showOrderToast(name);
    triggerBorderFlash();
}

function triggerBorderFlash() {
    let flash = document.getElementById('flash-border-overlay');
    if (!flash) {
        flash = document.createElement('div');
        flash.id = 'flash-border-overlay';
        flash.className = 'flash-border-overlay';
        document.body.appendChild(flash);
    }
    gsap.killTweensOf(flash);
    gsap.fromTo(flash,
        { opacity: 1, boxShadow: "inset 0 0 70px 20px rgba(0, 0, 0, 0.65)", duration: 1.5 },
        { opacity: 0, boxShadow: "inset 0 0 0px 0px rgba(255, 255, 255, 0)", duration: 3.5, ease: "power3.out" }
    );
}

function showOrderToast(itemName) {
    let toast = document.getElementById('order-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'order-toast';
        toast.className = 'order-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-icon">✓</span> <strong>${itemName}</strong>`;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

const mainSnapContainer = document.getElementById('snap-container');
if (mainSnapContainer) {
    mainSnapContainer.addEventListener('dblclick', (e) => {
        const section = e.target.closest('.snap-section');
        if (section) {
            addToOrder(section);
        }
    });

    let lastTapTime = 0;
    let lastTapSection = null;
    mainSnapContainer.addEventListener('touchend', (e) => {
        const section = e.target.closest('.snap-section');
        if (!section) return;

        const currentTime = Date.now();
        const tapLength = currentTime - lastTapTime;

        if (tapLength < 300 && tapLength > 0 && lastTapSection === section) {
            e.preventDefault();
            addToOrder(section);
            lastTapTime = 0;
            lastTapSection = null;
        } else {
            lastTapTime = currentTime;
            lastTapSection = section;
        }
    });
}

function updateOrderBadge() {
    const totalQty = orderItems.reduce((s, i) => s + i.qty, 0);
    if (orderBadge) orderBadge.textContent = totalQty;
    if (fabOrder) {
        if (totalQty > 0) fabOrder.classList.remove('hidden');
        else fabOrder.classList.add('hidden');
    }
}

if (fabOrder) {
    fabOrder.addEventListener('click', (e) => {
        e.stopPropagation();
        openOrderModal();
    });
}

const closeOrderModalBtn = document.getElementById('order-modal-close');
if (closeOrderModalBtn) {
    closeOrderModalBtn.addEventListener('click', closeOrderModal);
}

if (orderModal) {
    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) closeOrderModal();
    });
}

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
        orderTotalEl.textContent = '0 DA';
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
            <div class="order-item-price">${linePrice.toLocaleString('fr-DZ')} DA</div>
        </div>`;
    }).join('');

    orderListEl.querySelectorAll('.qty-dec').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = orderItems.find(i => i.id === id);
            if (!item) return;
            if (item.qty <= 1) orderItems = orderItems.filter(i => i.id !== id);
            else item.qty--;
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

    const total = orderItems.reduce((sum, item) => {
        const num = parseInt((item.price || '0').replace(/\D/g, '')) || 0;
        return sum + num * item.qty;
    }, 0);
    orderTotalEl.textContent = `${total.toLocaleString('fr-DZ')} DA`;
}

if (orderSubmitBtn) {
    orderSubmitBtn.addEventListener('click', () => {
        if (orderItems.length === 0) return;
        orderSubmitBtn.textContent = '✓ Sent!';
        orderSubmitBtn.style.background = '#22c55e';
        orderSubmitBtn.disabled = true;
        setTimeout(() => {
            orderItems = [];
            updateOrderBadge();
            closeOrderModal();
            orderSubmitBtn.textContent = 'Send Order';
            orderSubmitBtn.style.background = '';
        }, 1500);
    });
}

/* ── Menu UI & Scroll Animation Update ────────────── */
function updateMenuUI(color, section, isDown = true) {
    if (!section) return;
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

    if (nameEl) {
        const ingredientsHTML = ingredientItems
            .map(item => `<div class="mask"><span class="ing-line">${item}</span></div>`)
            .join("");

        if (catEl) catEl.innerText = category;
        nameEl.innerText = name;
        priceEl.innerText = price;
        ingredientsEl.innerHTML = ingredientsHTML;

        const categoryChanged = category !== currentCategory;
        currentCategory = category; 

        updateTitleDisplay(category);
        updateNavDots();

        const ingLineEls = Array.from(ingredientsEl.querySelectorAll(".ing-line"));

        const animElements = [];
        if (catEl) animElements.push(catEl);
        if (nameEl) animElements.push(nameEl);
        if (priceEl) animElements.push(priceEl);
        animElements.push(...ingLineEls);

        gsap.killTweensOf(animElements);
        gsap.fromTo(animElements,
            { y: "150%" },
            { y: "0%", delay: 0.1, duration: 0.8, stagger: 0.2, ease: "power3.out", overwrite: "auto" }
        );
    }

    if (visual) {
        gsap.killTweensOf(visual);
        gsap.set(visual, { y: "0%", opacity: 1 });
    }
}

function hideMenuUI(section, isDown = true) {
    if (!section) return;
    const visual = section.querySelector(".flavor-visual");
    const items = [
        section.querySelector(".mobile-category"),
        section.querySelector(".mobile-product-name"),
        ...section.querySelectorAll(".ing-line"),
        section.querySelector(".mobile-price")
    ].filter(Boolean);

    if (items.length === 0 && !visual) return;

    if (items.length > 0) {
        gsap.killTweensOf(items);
        gsap.set(items, { y: "120%" });
    }

    if (activeSectionId === section.id) activeSectionId = null;
}

/* ── Init Scroll Animations ─────────────────────── */
function initFlavorAnimations() {
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
