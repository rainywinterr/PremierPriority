// ── CLEANED & DECRYPTED MENU DATA ──────────────────────────────────────────
const menuData = {
    "Cookies": [
        {
            "name": "Pépites de Chocolat",
            "price": "350 DZD",
            "ingredients": ["Farine", "Beurre", "Pépites de Chocolat", "Sucre"],
            "calories": "250 kcal",
            "img": "./VanillaCookie.png", // Change your item picture here
            "color": "#6F4E37",
            "tint": "#FFFaf0",
            "bgImages":["./BGcookieone1.png","./BGcookieone2.png","choco1.png","choco2.png","choco3.png"]
        },
        {
            "name": "Avoine & Raisins",
            "price": "300 DZD",
            "ingredients": ["Flocons d'Avoine", "Raisins Secs", "Cannelle", "Sucre Roux"],
            "calories": "220 kcal",
            "img": "./FrezCookie.png", // Change your item picture here
            "color": "#D2691E",
            "tint": "#FFF5EE",
            "bgImages":["avoine1.png","avoine2.png","avoine3.png","raisins1.png","raisins2.png"]
            
        },
        {
            "name": "Double Chocolat Noir",
            "price": "400 DZD",
            "ingredients": ["Cacao", "Chocolat Noir", "Fleur de Sel"],
            "calories": "280 kcal",
            "img": "./ChocoCookie.png", // Change your item picture here
            "color": "#3C2A21",
            "tint": "#f2efe4",
            "bgImages":["choco1.png","choco2.png","choco3.png","choco1.png","choco2.png",]
        }
    ],
    "Glaces": [
        {
            "name": "Gousse de Vanille",
            "price": "450 DZD",
            "ingredients": ["Crème", "Lait", "Vanille de Madagascar"],
            "calories": "300 kcal",
            "img": "./vanillaScoop.png", // Change your item picture here
            "color": "#F3E5AB",
            "tint": "#FFFDE7",
            "bgImages":["./BGcookieone1.png","./BGcookieone1.png","./BGcookieone2.png"]
        },
        {
            "name": "Chocolat Belge",
            "price": "500 DZD",
            "ingredients": ["Cacao Belge", "Crème Fraîche"],
            "calories": "350 kcal",
            "img": "./ChocoScoop.png", // Change your item picture here
            "color": "#4B3621",
            "tint": "#EFEBE9",
            "bgImages":["./hazel1.png","hazel2.png","choco1.png","choco2.png","choco3.png" ]
                   }
    ],
    "Boissons": [
        {
            "name": "Latte Glacé",
            "price": "400 DZD",
            "ingredients": ["Espresso", "Lait", "Glaçons"],
            "calories": "150 kcal",
            "img": "./drinkslatte.png", // Change your item picture here
            "color": "#C0A080",
            "tint": "#EFEBE9",
            "bgImages":["./BGcookieone1.png","coffe1.png","choco1.png","coffe2.png",]
        },
        {
            "name": "Smoothie aux Fruits Rouges",
            "price": "550 DZD",
            "ingredients": ["Mélange de Fruits Rouges", "Yaourt", "Miel"],
            "calories": "210 kcal",
            "img": "./drinksfrez.png", // Change your item picture here
            "color": "#904D77",
            "tint": "#F3E5F5",
            "bgImages":["./BGfrez1.png","BGfrez2.png","blueb1.png"]
        }
    ],
    "Macarons": [
        {
            "name": "Pistache",
            "price": "250 DZD",
            "ingredients": ["Poudre d'Amande", "Pâte de Pistache"],
            "calories": "80 kcal",
            "img": "./macaronpistach.png", // Change your item picture here
            "color": "#93C572",
            "tint": "#F1F8E9",
            "bgImages": ["./BGpistach1.png", "./BGpistach2.png","./BGpistach1.png"] // Floating background images
        },
        {
            "name": "Framboise",
            "price": "250 DZD",
            "ingredients": ["Confiture de Framboise", "Blancs d'Œufs"],
            "calories": "85 kcal",
            "img": "./macaronfrez.png", // Change your item picture here
            "color": "#E30B5C",
            "tint": "#FCE4EC",
            "bgImages": ["./BGfrez1.png", "./BGfrez2.png", "./BGfrez3.png"] // Floating background images
        }
    ]
};

// ── DOM ELEMENTS ───────────────────────────────────────────────────────────
const categoryItems = document.querySelectorAll(".Category-Item");
const detailView = document.getElementById("Detail-View");
const detailList = document.getElementById("Detail-List");
const closeBtn = document.getElementById("Close-Btn");
const backgroundTint = document.getElementById("Background-Tint");
const floatingBarContainer = document.getElementById("Floating-BG-Container");
const detailItemCounter = document.getElementById("Detail-Item-Counter");

// ── STATE VARIABLES ────────────────────────────────────────────────────────
let currentCategoryItems = [];
let currentCategory = "";
let lastIndex = -1;
let lastScrollTop = 0;

// ── EVENT LISTENERS ────────────────────────────────────────────────────────
categoryItems.forEach(item => {
    const trigger = item.querySelector(".Main-Category-Image, .Main-Category-Content");
    if (trigger) {
        trigger.addEventListener("click", () => {
            const categoryName = item.dataset.category;
            currentCategory = categoryName;
            currentCategoryItems = menuData[categoryName] || [];
            showCategoryDetails(categoryName);
        });
    }
});

closeBtn.addEventListener("click", () => {
    detailView.classList.remove("active");
    setTimeout(() => {
        detailList.innerHTML = '';
        backgroundTint.style.backgroundColor = "transparent";
        floatingBarContainer.innerHTML = '';
    }, 428);
});

detailList.addEventListener("scroll", () => {
    const itemHeight = window.innerHeight;
    const scrollPos = detailList.scrollTop;
    const index = Math.round(scrollPos / itemHeight);
    const dir = scrollPos > lastScrollTop ? "down" : "up";
    lastScrollTop = scrollPos;

    if (currentCategoryItems[index]) {
        backgroundTint.style.backgroundColor = currentCategoryItems[index].tint;
    }

    if (index !== lastIndex) {
        lastIndex = index;
        if (currentCategoryItems[index]) {
            showFloatingImages(currentCategoryItems[index], dir);
            updateItemCounter(index, currentCategoryItems.length);
        }
    }
});

// ── CORE FUNCTIONS ──────────────────────────────────────────────────────────
function showCategoryDetails(category) {
    lastIndex = 0;
    const items = menuData[category] || [];
    detailList.innerHTML = '';
    detailView.dataset.category = category;

    items.forEach(data => {
        const itemElement = document.createElement("div");
        itemElement.className = "Detail-Item";
        itemElement.dataset.category = category;
        itemElement.innerHTML = `
            <div class="Detail-Content">
                <div class="Header-Section">
                    <h2 style="color: ${data.color || "black"}">${data.name}</h2>
                    <p class="Price">${data.price}</p>
                </div>
                <div class="Image-Container">
                    <img src="${data.img}" alt="${data.name}">
                </div>
                <div class="Info-Section">
                    <div class="Ingredients-List">
                        ${data.ingredients.map(ing => `<p class="Ingredient">${ing}</p>`).join('')}
                    </div>
                </div>
            </div>
        `;
        detailList.appendChild(itemElement);
    });

    detailList.scrollTop = 0;
    lastScrollTop = 0;

    if (items.length > 0) {
        backgroundTint.style.backgroundColor = items[0].tint;
    }

    floatingBarContainer.innerHTML = '';
    detailView.classList.add("active");
}

function updateItemCounter(index, total) {
    if (detailItemCounter) {
        detailItemCounter.textContent = `${index + 1} / ${total}`;
    }
}

// ── FLOATING BACKGROUND IMAGES MANAGEMENT ──────────────────────────────────
function _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _randomPositions() {
    const zones = [
        () => ({ top: `${_rand(5, 20)}%`, left: `${_rand(2, 14)}%` }),   // Top Left
        () => ({ top: `${_rand(5, 20)}%`, right: `${_rand(2, 14)}%` }),  // Top Right
        () => ({ top: `${_rand(32, 55)}%`, left: `${_rand(1, 10)}%` }),  // Middle Left
        () => ({ top: `${_rand(32, 55)}%`, right: `${_rand(1, 10)}%` }), // Middle Right
        () => ({ bottom: `${_rand(5, 20)}%`, left: `${_rand(5, 22)}%` }), // Bottom Left
        () => ({ bottom: `${_rand(5, 20)}%`, right: `${_rand(5, 22)}%` }),// Bottom Right
    ];

    // Fisher-Yates Shuffle
    for (let i = zones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [zones[i], zones[j]] = [zones[j], zones[i]];
    }
    return zones.slice(0, 3).map(fn => fn());
}

const STAGGER_OUT = 55;
const STAGGER_IN = 90;

function showFloatingImages(itemData, direction) {
    if (!floatingBarContainer) return;

    const outY = direction === 'down' ? '-110vh' : '110vh';
    const inY = direction === 'down' ? '110vh' : '-110vh';

    const images = (itemData && itemData.bgImages)
        ? itemData.bgImages
        : ['./BGfrez1.png', './BGfrez2.png', './BGfrez3.png'];

    // 1. Staggered slide-out of old images
    const oldFloaters = Array.from(floatingBarContainer.querySelectorAll('.Floating-Item'));
    oldFloaters.forEach((el, i) => {
        const delay = i * STAGGER_OUT;
        el.style.transition = `transform 0.45s ${delay}ms cubic-bezier(0.4,0,1,1)`;
        el.style.transform = `translateY(${outY})`;
    });

    setTimeout(() => oldFloaters.forEach(el => el.remove()), (oldFloaters.length * STAGGER_OUT) + 460);

    // 2. Create new images at random peripheral positions
    const positions = _randomPositions();
    const newDivs = images.map((src, i) => {
        const div = document.createElement('div');
        div.className = 'Floating-Item';
        div.style.backgroundImage = `url("${src}")`;
        Object.assign(div.style, positions[i] || positions[0]);
        div.style.transition = 'none';
        div.style.transform = `translateY(${inY})`;
        floatingBarContainer.appendChild(div);
        return div;
    });

    // 3. Force reflow, then apply slide-in animation
    newDivs.forEach(div => void div.getBoundingClientRect());
    newDivs.forEach((div, i) => {
        const delay = i * STAGGER_IN;
        div.style.transition = `transform 0.65s ${delay}ms cubic-bezier(0.22,1,0.36,1)`;
        div.style.transform = 'translateY(0)';
    });
}

// ── INITIALIZER ─────────────────────────────────────────────────────────────
(function init() {
    categoryItems.forEach(item => {
        const trigger = item.querySelector('.Main-Category-Image, .Main-Category-Content');
        if (trigger) {
            trigger.addEventListener('click', () => {
                const name = item.dataset.category;
                setTimeout(() => {
                    const items = menuData[name] || [];
                    if (items.length > 0) {
                        floatingBarContainer.innerHTML = '';
                        showFloatingImages(items[0], 'down');
                        updateItemCounter(0, items.length);
                    }
                }, 50);
            });
        }
    });
})();