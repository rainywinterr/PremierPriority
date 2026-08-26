/* =====================================================
   Admin Dashboard — admin.js
   ===================================================== */

let menuData = { main_categories: [] };
let activeMainCategoryIndex = 0;
let activeSubCategoryIndex = 0;
let editingIndex = -1; // -1 = new item
let pendingImageDataUrl = null;

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
const itemCategoryInput = document.getElementById('item-category');

const toast = document.getElementById('toast');

// ── Load Data ───────────────────────────────────────────
fetch('alice-menu.json')
    .then(res => res.json())
    .then(data => {
        menuData = data;
        buildCategoryTabs();
        buildCategorySelect();
        renderItems();
    })
    .catch(err => {
        console.error("Failed to load menu JSON", err);
        showToast("Error loading menu data", "error");
    });

// ═══════════════════════════════════════════════════════
// BUILD UI
// ═══════════════════════════════════════════════════════

function buildCategoryTabs() {
    categoryTabsEl.innerHTML = '';
    menuData.main_categories.forEach((mainCat, mIdx) => {
        // Main category header (optional visual grouping)
        const header = document.createElement('div');
        header.style.padding = "8px 12px";
        header.style.fontSize = "12px";
        header.style.fontWeight = "bold";
        header.style.color = "var(--text-faint)";
        header.style.marginTop = "8px";
        header.textContent = mainCat.main_category;
        categoryTabsEl.appendChild(header);

        mainCat.sub_categories.forEach((subCat, sIdx) => {
            const li = document.createElement('li');
            if (mIdx === activeMainCategoryIndex && sIdx === activeSubCategoryIndex) {
                li.classList.add('active');
            }
            const btn = document.createElement('button');
            const dot = document.createElement('span');
            dot.className = 'cat-dot';
            btn.appendChild(dot);
            btn.appendChild(document.createTextNode(subCat.category));
            btn.addEventListener('click', () => switchCategory(mIdx, sIdx));
            li.appendChild(btn);
            categoryTabsEl.appendChild(li);
        });
    });
}

function buildCategorySelect() {
    itemCategoryInput.innerHTML = '';
    menuData.main_categories.forEach((mainCat, mIdx) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = mainCat.main_category;
        mainCat.sub_categories.forEach((subCat, sIdx) => {
            const opt = document.createElement('option');
            opt.value = `${mIdx}-${sIdx}`;
            opt.textContent = subCat.category;
            optgroup.appendChild(opt);
        });
        itemCategoryInput.appendChild(optgroup);
    });
}

function getActiveSubCat() {
    if (!menuData.main_categories[activeMainCategoryIndex]) return null;
    return menuData.main_categories[activeMainCategoryIndex].sub_categories[activeSubCategoryIndex];
}

function renderItems() {
    const subCat = getActiveSubCat();
    if (!subCat) return;

    const items = subCat.items || [];
    currentTitleEl.textContent = subCat.category;
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
            <img class="item-thumb" src="${item.image}" alt="${item.name}"
                 onerror="this.style.opacity='.3'">
            <div class="item-info">
                <h3>${item.name}</h3>
                <div class="item-meta">
                    <span class="item-price">${item.price}</span>
                    <span class="item-cat-badge">${subCat.category}</span>
                </div>
                <p class="item-ings">${item.description || ''}</p>
            </div>
            <button class="item-edit-btn" data-idx="${idx}">Edit</button>
        `;

        // Desktop Drag events
        li.addEventListener('dragstart', onDragStart);
        li.addEventListener('dragover', onDragOver);
        li.addEventListener('dragleave', onDragLeave);
        li.addEventListener('drop', onDrop);
        li.addEventListener('dragend', onDragEnd);

        // Mobile / Touch Drag Events
        const handle = li.querySelector('.drag-handle');
        handle.addEventListener('touchstart', onTouchStart, { passive: false });
        handle.addEventListener('touchmove', onTouchMove, { passive: false });
        handle.addEventListener('touchend', onTouchEnd);

        // Edit btn
        li.querySelector('.item-edit-btn').addEventListener('click', () => openEditModal(idx));

        itemsListEl.appendChild(li);
    });
}

// ═══════════════════════════════════════════════════════
// CATEGORY SWITCHING
// ═══════════════════════════════════════════════════════
function switchCategory(mIdx, sIdx) {
    activeMainCategoryIndex = mIdx;
    activeSubCategoryIndex = sIdx;
    buildCategoryTabs();
    renderItems();
}

// ═══════════════════════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════════════════════
let dragSrcIndex = -1;

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
    finishReorder(dragSrcIndex, targetIdx);
}

function onDragEnd() {
    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('dragging', 'drag-over'));
    dragSrcIndex = -1;
}

// Mobile Touch D&D
let touchDraggingEl = null;

function onTouchStart(e) {
    const li = e.target.closest('.item-card');
    if (!li) return;
    dragSrcIndex = +li.dataset.idx;
    touchDraggingEl = li;
    document.body.style.overflow = 'hidden'; // prevent scrolling
    li.style.opacity = '0.5';
}

function onTouchMove(e) {
    if (!touchDraggingEl) return;
    e.preventDefault(); // Stop scroll
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('drag-over'));
    if (target) {
        const dropTarget = target.closest('.item-card');
        if (dropTarget && dropTarget !== touchDraggingEl) {
            dropTarget.classList.add('drag-over');
        }
    }
}

function onTouchEnd(e) {
    if (!touchDraggingEl) return;
    document.body.style.overflow = '';
    touchDraggingEl.style.opacity = '1';

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = target ? target.closest('.item-card') : null;

    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('drag-over'));

    if (dropTarget && dropTarget !== touchDraggingEl) {
        const targetIdx = +dropTarget.dataset.idx;
        finishReorder(dragSrcIndex, targetIdx);
    }

    touchDraggingEl = null;
    dragSrcIndex = -1;
}

function finishReorder(srcIdx, targetIdx) {
    if (srcIdx === targetIdx || srcIdx < 0 || targetIdx < 0) return;
    const items = getActiveSubCat().items;
    const moved = items.splice(srcIdx, 1)[0];
    items.splice(targetIdx, 0, moved);

    renderItems();
    showToast('Order updated', 'success');
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
    itemCategoryInput.value = `${activeMainCategoryIndex}-${activeSubCategoryIndex}`;

    showModal();
}

function openEditModal(idx) {
    editingIndex = idx;
    pendingImageDataUrl = null;

    const item = getActiveSubCat().items[idx];
    modalTitle.textContent = 'Edit Item';
    modalDelete.classList.remove('hidden');

    // Populate fields
    imagePathInput.value = item.image || '';
    itemNameInput.value = item.name || '';
    itemPriceInput.value = item.price || '';
    itemDescInput.value = item.description || '';
    itemCategoryInput.value = `${activeMainCategoryIndex}-${activeSubCategoryIndex}`;

    setPreview(item.image);
    showModal();
}

function clearModalFields() {
    imagePathInput.value = '';
    itemNameInput.value = '';
    itemPriceInput.value = '';
    itemDescInput.value = '';
    itemCategoryInput.value = `${activeMainCategoryIndex}-${activeSubCategoryIndex}`;
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

    const imgSrc = pendingImageDataUrl || imagePathInput.value.trim() || './placeholder.png';
    const description = itemDescInput.value.trim();

    const newItem = {
        name,
        description,
        price,
        image: imgSrc
    };

    const targetCatVal = itemCategoryInput.value;
    const [tm, ts] = targetCatVal.split('-').map(Number);
    const targetSubCat = menuData.main_categories[tm].sub_categories[ts];

    if (editingIndex === -1) {
        // Add
        if (!targetSubCat.items) targetSubCat.items = [];
        targetSubCat.items.push(newItem);
        if (tm !== activeMainCategoryIndex || ts !== activeSubCategoryIndex) {
            switchCategory(tm, ts);
        }
        showToast('Item added ✓', 'success');
    } else {
        // Edit 
        const currentSubCat = getActiveSubCat();
        if (tm === activeMainCategoryIndex && ts === activeSubCategoryIndex) {
            currentSubCat.items[editingIndex] = newItem;
        } else {
            currentSubCat.items.splice(editingIndex, 1);
            if (!targetSubCat.items) targetSubCat.items = [];
            targetSubCat.items.push(newItem);
            switchCategory(tm, ts);
        }
        showToast('Item saved ✓', 'success');
    }

    closeModal();
    renderItems();
    buildCategoryTabs();
}

function deleteItem() {
    if (editingIndex < 0) return;
    const currentSubCat = getActiveSubCat();
    const item = currentSubCat.items[editingIndex];
    if (!confirm(`Delete "${item.name}"?`)) return;

    currentSubCat.items.splice(editingIndex, 1);
    closeModal();
    renderItems();
    showToast('Item deleted', 'error');
}

// ═══════════════════════════════════════════════════════
// IMAGE UPLOAD
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
imagePathInput.addEventListener('input', () => {
    pendingImageDataUrl = null;
    setPreview(imagePathInput.value.trim());
});

// ═══════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════
exportBtn.addEventListener('click', () => {
    const json = JSON.stringify(menuData, null, 4);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alice-menu.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported JSON ✓', 'success');
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

modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
});
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

categoryTabsEl.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 && e.target.tagName === 'BUTTON') closeSidebar();
});
