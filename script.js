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
            // Extras group allows multi-select
            if (group.id === 'extras-pills') {
                pill.classList.toggle('active');
            } else {
                group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            }
        });
    });
});

// Confirm button
document.getElementById('fab-confirm').addEventListener('click', () => {
    const size = document.querySelector('#size-pills .pill.active')?.dataset.val || 'M';
    const crust = document.querySelector('#crust-pills .pill.active')?.dataset.val || 'Classic';
    const extras = [...document.querySelectorAll('#extras-pills .pill.active')].map(p => p.dataset.val);

    // Visual feedback
    const btn = document.getElementById('fab-confirm');
    btn.textContent = '✓ Added!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
        btn.textContent = 'Add to Order';
        btn.style.background = '';
        closeFabPanel();
    }, 1200);

    console.log('Order:', { size, crust, extras });
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
