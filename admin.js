/* =====================================================
   Admin Dashboard — admin.js
   All menu data is kept in-memory. Export button
   outputs JSON you can paste back into script1.js.
   ===================================================== */

// ── Initial data (mirrors script1.js) ──────────────────
let menuData = {
    "Cookies": [
        { name: "Choco Chip", price: "350 DZD", ingredients: ["Flour", "Butter", "Chocolate Chips", "Sugar"], calories: "250 kcal", img: "./VanillaCookie.png", color: "#6F4E37", tint: "#FFFaf0" },
        { name: "Oatmeal Raisin", price: "300 DZD", ingredients: ["Oats", "Raisins", "Cinnamon", "Brown Sugar"], calories: "220 kcal", img: "./FrezCookie.png", color: "#D2691E", tint: "#FFF5EE" },
        { name: "Double Dark", price: "400 DZD", ingredients: ["Cocoa", "Dark Chocolate", "Sea Salt"], calories: "280 kcal", img: "./ChocoCookie.png", color: "#3C2A21", tint: "#f2efe4" }
    ],
    "Ice Cream": [
        { name: "Vanilla Bean", price: "450 DZD", ingredients: ["Cream", "Milk", "Madagascar Vanilla"], calories: "300 kcal", img: "./vanillaScoop.png", color: "#F3E5AB", tint: "#FFFDE7" },
        { name: "Belgian Choco", price: "500 DZD", ingredients: ["Belgian Cocoa", "Fresh Cream"], calories: "350 kcal", img: "./ChocoScoop.png", color: "#4B3621", tint: "#EFEBE9" }
    ],
    "Drinks": [
        { name: "Iced Latte", price: "400 DZD", ingredients: ["Espresso", "Milk", "Ice"], calories: "150 kcal", img: "./drinkslatte.png", color: "#C0A080", tint: "#EFEBE9" },
        { name: "Berry Smoothie", price: "550 DZD", ingredients: ["Mixed Berries", "Yogurt", "Honey"], calories: "210 kcal", img: "./drinksfrez.png", color: "#904D77", tint: "#F3E5F5" }
    ],
    "Macarons": [
        { name: "Pistachio", price: "250 DZD", ingredients: ["Almond Flour", "Pistachio Paste"], calories: "80 kcal", img: "./macaronpistach.png", color: "#93C572", tint: "#F1F8E9", bgImages: ["./BGpistach1.png", "./BGpistach2.png"] },
        { name: "Raspberry", price: "250 DZD", ingredients: ["Raspberry Jam", "Egg Whites"], calories: "85 kcal", img: "./macaronfrez.png", color: "#E30B5C", tint: "#FCE4EC", bgImages: ["./BGfrez1.png", "./BGfrez2.png", "./BGfrez3.png"] }
    ]
};

// ── State ───────────────────────────────────────────────
let activeCategory = Object.keys(menuData)[0];
let editingIndex = -1; // -1 = new item
let dragSrcIndex = -1;
let pendingImageDataUrl = null; // base64 from file upload

// ── DOM refs ────────────────────────────────────────────
const categoryTabsEl = document.getElementById('category-tabs');
const itemsListEl = document.getElementById('items-list');
const currentTitleEl = document.getElementById('current-category-title');
const itemCountEl = document.getElementById('item-count');
const addBtn = document.getElementById('add-btn');
const exportBtn = document.getElementById('export-btn');

const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const modalDelete = document.getElementById('modal-delete');

const imageUploadArea = document.getElementById('image-upload-area');
const imageInput = document.getElementById('image-input');
const previewImg = document.getElementById('preview-img');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const imagePathInput = document.getElementById('image-path');

const itemNameInput = document.getElementById('item-name');
const itemPriceInput = document.getElementById('item-price');
const itemDescInput = document.getElementById('item-desc');
const itemCalInput = document.getElementById('item-calories');
const itemColorInput = document.getElementById('item-color');
const colorHexEl = document.getElementById('color-hex');
const itemTintInput = document.getElementById('item-tint');
const tintHexEl = document.getElementById('tint-hex');
const itemCategoryInput = document.getElementById('item-category');

const toast = document.getElementById('toast');

// ═══════════════════════════════════════════════════════
// BUILD UI
// ═══════════════════════════════════════════════════════

// Category dot colours (one per category in order)
const CAT_COLORS = ["#D4A373", "#B5CFB7", "#C9B1FF", "#FFB3C6"];

function buildCategoryTabs() {
    categoryTabsEl.innerHTML = '';
    const cats = Object.keys(menuData);
    cats.forEach((cat, i) => {
        const li = document.createElement('li');
        if (cat === activeCategory) li.classList.add('active');
        const btn = document.createElement('button');
        const dot = document.createElement('span');
        dot.className = 'cat-dot';
        dot.style.background = CAT_COLORS[i % CAT_COLORS.length];
        btn.appendChild(dot);
        btn.appendChild(document.createTextNode(cat));
        btn.addEventListener('click', () => switchCategory(cat));
        li.appendChild(btn);
        categoryTabsEl.appendChild(li);
    });
}

function buildCategorySelect() {
    itemCategoryInput.innerHTML = '';
    Object.keys(menuData).forEach(cat => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = cat;
        itemCategoryInput.appendChild(opt);
    });
}

function renderItems() {
    const items = menuData[activeCategory] || [];
    currentTitleEl.textContent = activeCategory;
    itemCountEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
    itemsListEl.innerHTML = '';

    items.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'item-card';
        li.draggable = true;
        li.dataset.idx = idx;

        li.innerHTML = `
            <div class="drag-handle" title="Drag to reorder">
                <span></span><span></span><span></span>
            </div>
            <span class="rank-badge">#${idx + 1}</span>
            <img class="item-thumb" src="${item.img}" alt="${item.name}"
                 onerror="this.style.opacity='.3'">
            <div class="item-info">
                <h3 style="color:${item.color || 'inherit'}">${item.name}</h3>
                <div class="item-meta">
                    <span class="item-price">${item.price}</span>
                    <span class="item-cal">${item.calories || ''}</span>
                    <span class="item-cat-badge">${activeCategory}</span>
                </div>
                <p class="item-ings">${item.ingredients.join(' · ')}</p>
            </div>
            <div class="item-color-dot" style="background:${item.tint || '#fff'}"></div>
            <button class="item-edit-btn" data-idx="${idx}">Edit</button>
        `;

        // Drag events
        li.addEventListener('dragstart', onDragStart);
        li.addEventListener('dragover', onDragOver);
        li.addEventListener('dragleave', onDragLeave);
        li.addEventListener('drop', onDrop);
        li.addEventListener('dragend', onDragEnd);

        // Edit btn
        li.querySelector('.item-edit-btn').addEventListener('click', () => openEditModal(idx));

        itemsListEl.appendChild(li);
    });
}

// ═══════════════════════════════════════════════════════
// CATEGORY SWITCHING
// ═══════════════════════════════════════════════════════
function switchCategory(cat) {
    activeCategory = cat;
    buildCategoryTabs();
    renderItems();
}

// ═══════════════════════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════════════════════
function onDragStart(e) {
    dragSrcIndex = +this.dataset.idx;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragSrcIndex);
}

function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('drag-over'));
    this.classList.add('drag-over');
}

function onDragLeave() {
    this.classList.remove('drag-over');
}

function onDrop(e) {
    e.preventDefault();
    const targetIdx = +this.dataset.idx;
    if (dragSrcIndex === targetIdx) return;

    const items = menuData[activeCategory];
    const moved = items.splice(dragSrcIndex, 1)[0];
    items.splice(targetIdx, 0, moved);

    renderItems();
    showToast('Order updated', 'success');
}

function onDragEnd() {
    document.querySelectorAll('.item-card').forEach(c => {
        c.classList.remove('dragging', 'drag-over');
    });
    dragSrcIndex = -1;
}

// ═══════════════════════════════════════════════════════
// MODAL — Open / Close
// ═══════════════════════════════════════════════════════
function openAddModal() {
    editingIndex = -1;
    pendingImageDataUrl = null;

    modalTitle.textContent = 'Add New Item';
    modalDelete.classList.add('hidden');

    clearModalFields();
    itemCategoryInput.value = activeCategory;

    showModal();
}

function openEditModal(idx) {
    editingIndex = idx;
    pendingImageDataUrl = null;

    const item = menuData[activeCategory][idx];
    modalTitle.textContent = 'Edit Item';
    modalDelete.classList.remove('hidden');

    // Populate fields
    imagePathInput.value = item.img || '';
    itemNameInput.value = item.name || '';
    itemPriceInput.value = item.price || '';
    itemDescInput.value = (item.ingredients || []).join(', ');
    itemCalInput.value = item.calories || '';
    itemColorInput.value = item.color || '#6F4E37';
    colorHexEl.textContent = item.color || '#6F4E37';
    itemTintInput.value = item.tint || '#ffffff';
    tintHexEl.textContent = item.tint || '#ffffff';
    itemCategoryInput.value = activeCategory;

    setPreview(item.img);
    showModal();
}

function clearModalFields() {
    imagePathInput.value = '';
    itemNameInput.value = '';
    itemPriceInput.value = '';
    itemDescInput.value = '';
    itemCalInput.value = '';
    itemColorInput.value = '#6F4E37';
    colorHexEl.textContent = '#6F4E37';
    itemTintInput.value = '#FFFaf0';
    tintHexEl.textContent = '#FFFaf0';
    itemCategoryInput.value = activeCategory;
    clearPreview();
}

function setPreview(src) {
    if (!src) { clearPreview(); return; }
    previewImg.src = src;
    previewImg.classList.remove('hidden');
    uploadPlaceholder.classList.add('hidden');
}

function clearPreview() {
    previewImg.src = '';
    previewImg.classList.add('hidden');
    uploadPlaceholder.classList.remove('hidden');
}

function showModal() { modalOverlay.classList.remove('hidden'); }
function closeModal() { modalOverlay.classList.add('hidden'); }

// ═══════════════════════════════════════════════════════
// MODAL — Save / Delete
// ═══════════════════════════════════════════════════════
function saveItem() {
    const name = itemNameInput.value.trim();
    const price = itemPriceInput.value.trim();

    if (!name) { showToast('Name is required', 'error'); return; }
    if (!price) { showToast('Price is required', 'error'); return; }

    // Resolve image: prefer file-upload data URL, else typed path
    const imgSrc = pendingImageDataUrl || imagePathInput.value.trim() || './placeholder.png';

    const ingRaw = itemDescInput.value.trim();
    const ingredients = ingRaw ? ingRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const newItem = {
        name,
        price,
        ingredients,
        calories: itemCalInput.value.trim(),
        img: imgSrc,
        color: itemColorInput.value,
        tint: itemTintInput.value
    };

    const targetCat = itemCategoryInput.value;

    if (editingIndex === -1) {
        // Add
        if (!menuData[targetCat]) menuData[targetCat] = [];
        menuData[targetCat].push(newItem);
        if (targetCat !== activeCategory) switchCategory(targetCat);
        showToast('Item added ✓', 'success');
    } else {
        // Edit — might move to different category
        if (targetCat === activeCategory) {
            menuData[activeCategory][editingIndex] = newItem;
        } else {
            menuData[activeCategory].splice(editingIndex, 1);
            if (!menuData[targetCat]) menuData[targetCat] = [];
            menuData[targetCat].push(newItem);
            switchCategory(targetCat);
        }
        showToast('Item saved ✓', 'success');
    }

    closeModal();
    renderItems();
    buildCategoryTabs();
}

function deleteItem() {
    if (editingIndex < 0) return;
    const item = menuData[activeCategory][editingIndex];
    if (!confirm(`Delete "${item.name}"?`)) return;

    menuData[activeCategory].splice(editingIndex, 1);
    closeModal();
    renderItems();
    showToast('Item deleted', 'error');
}

// ═══════════════════════════════════════════════════════
// IMAGE UPLOAD (file input)
// ═══════════════════════════════════════════════════════
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        pendingImageDataUrl = e.target.result;
        imagePathInput.value = file.name;
        setPreview(pendingImageDataUrl);
    };
    reader.readAsDataURL(file);
});

// Drag-over on upload area
imageUploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    imageUploadArea.classList.add('drag-active');
});
imageUploadArea.addEventListener('dragleave', () => {
    imageUploadArea.classList.remove('drag-active');
});
imageUploadArea.addEventListener('drop', e => {
    e.preventDefault();
    imageUploadArea.classList.remove('drag-active');
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => {
        pendingImageDataUrl = ev.target.result;
        imagePathInput.value = file.name;
        setPreview(pendingImageDataUrl);
    };
    reader.readAsDataURL(file);
});

// Sync path input → preview
imagePathInput.addEventListener('input', () => {
    pendingImageDataUrl = null;
    setPreview(imagePathInput.value.trim());
});

// ═══════════════════════════════════════════════════════
// COLOR PICKERS
// ═══════════════════════════════════════════════════════
itemColorInput.addEventListener('input', () => {
    colorHexEl.textContent = itemColorInput.value;
});
itemTintInput.addEventListener('input', () => {
    tintHexEl.textContent = itemTintInput.value;
});

// ═══════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════
exportBtn.addEventListener('click', () => {
    const json = JSON.stringify(menuData, null, 4);
    const blob = new Blob([`const menuData = ${json};\n`], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menuData.js';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as menuData.js ✓', 'success');
});

// ═══════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg, type = '') {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.className = 'toast hidden', 300);
    }, 2800);
}

// ═══════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════
addBtn.addEventListener('click', openAddModal);
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalSave.addEventListener('click', saveItem);
modalDelete.addEventListener('click', deleteItem);

// Close on backdrop click
modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
});

// Keyboard: Escape closes modal
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

// ── Sidebar toggle (mobile) ─────────────────────────────
const menuToggleBtn = document.getElementById('menu-toggle');
const sidebarEl = document.querySelector('.sidebar');
const backdropEl = document.getElementById('sidebar-backdrop');

function openSidebar() { sidebarEl.classList.add('open'); backdropEl.classList.add('visible'); }
function closeSidebar() { sidebarEl.classList.remove('open'); backdropEl.classList.remove('visible'); }

menuToggleBtn.addEventListener('click', () => {
    sidebarEl.classList.contains('open') ? closeSidebar() : openSidebar();
});
backdropEl.addEventListener('click', closeSidebar);

// Close sidebar when a category is picked on mobile
categoryTabsEl.addEventListener('click', () => {
    if (window.innerWidth <= 900) closeSidebar();
});

// ── Init ────────────────────────────────────────────────

buildCategoryTabs();
buildCategorySelect();
renderItems();
