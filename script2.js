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
            "tint": "#fdf0d5ff",
            "bgImages":["./BGcookieone1.png","./BGcookieone2.png","choco1.png","choco2.png","choco3.png"]
        },
        {
            "name": "Avoine & Raisins",
            "price": "300 DZD",
            "ingredients": ["Flocons d'Avoine", "Raisins Secs", "Cannelle", "Sucre Roux"],
            "calories": "220 kcal",
            "img": "./FrezCookie.png", // Change your item picture here
            "color": "#D2691E",
            "tint": "#fcdec9ff",
            "bgImages":["avoine1.png","avoine2.png","avoine3.png","raisins1.png","raisins2.png"]
            
        },
        {
            "name": "Double Chocolat Noir",
            "price": "400 DZD",
            "ingredients": ["Cacao", "Chocolat Noir", "Fleur de Sel"],
            "calories": "280 kcal",
            "img": "./ChocoCookie.png", // Change your item picture here
            "color": "#3C2A21",
            "tint": "#ffe4c0ff",
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
//backround images animation
// function _rand(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function _randomPositions() {
//     const zones = [
//         // Top area
//         () => ({ top: `${_rand(3, 14)}%`, left: `${_rand(3, 18)}%` }),
//         () => ({ top: `${_rand(3, 14)}%`, left: `${_rand(27, 43)}%` }),
//         () => ({ top: `${_rand(3, 14)}%`, right: `${_rand(27, 43)}%` }),
//         () => ({ top: `${_rand(3, 14)}%`, right: `${_rand(3, 18)}%` }),

//         // Middle area
//         () => ({ top: `${_rand(25, 40)}%`, left: `${_rand(2, 13)}%` }),
//         () => ({ top: `${_rand(25, 40)}%`, left: `${_rand(25, 40)}%` }),
//         () => ({ top: `${_rand(25, 40)}%`, right: `${_rand(25, 40)}%` }),
//         () => ({ top: `${_rand(25, 40)}%`, right: `${_rand(2, 13)}%` }),

//         // Lower-middle area
//         () => ({ top: `${_rand(52, 65)}%`, left: `${_rand(5, 20)}%` }),
//         () => ({ top: `${_rand(52, 65)}%`, right: `${_rand(5, 20)}%` }),

//         // Bottom area
//         () => ({ bottom: `${_rand(3, 12)}%`, left: `${_rand(25, 43)}%` }),
//         () => ({ bottom: `${_rand(3, 12)}%`, right: `${_rand(25, 43)}%` })
//     ];

//     // Fisher-Yates Shuffle
//     for (let i = zones.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [zones[i], zones[j]] = [zones[j], zones[i]];
//     }

//     const count = _rand(10, 12);
//     return zones.slice(0, count).map(fn => fn());
// }

// const STAGGER_OUT = 35;
// const STAGGER_IN = 65;

// function showFloatingImages(itemData, direction) {
//     if (!floatingBarContainer) return;

//     const outY = direction === 'down' ? '-35vh' : '35vh';
//     const inY = direction === 'down' ? '35vh' : '-35vh';

//     const images = (itemData && itemData.bgImages)
//         ? itemData.bgImages
//         : ['./BGfrez1.png', './BGfrez2.png', './BGfrez3.png'];

//     if (!images.length) return;

//     // Repeat supplied images to create 10-12 particles
//     const count = _rand(10, 12);
//     const repeatedImages = Array.from(
//         { length: count },
//         (_, i) => images[i % images.length]
//     );

//     // 1. Smooth slide-out with fade
//     const oldFloaters = Array.from(
//         floatingBarContainer.querySelectorAll('.Floating-Item')
//     );

//     oldFloaters.forEach((el, i) => {
//         el.style.animation = 'none';
//         el.style.transition =
//             `transform 0.7s ${i * STAGGER_OUT}ms cubic-bezier(0.4, 0, 0.2, 1), ` +
//             `opacity 1s ${i * STAGGER_OUT}ms ease`;

//         // Preserve the current visual state before transitioning
//         void el.offsetWidth;

//         requestAnimationFrame(() => {
//             el.style.transform =
//                 `translate3d(0, ${outY}, 0) scale(0.88)`;
//             el.style.opacity = '0';
//         });
//     });

//     // Remove old images after their exit animation
//     setTimeout(() => {
//         oldFloaters.forEach(el => el.remove());
//     }, 850 + oldFloaters.length * STAGGER_OUT);

//     // 2. Create new images at distributed screen positions
//     const positions = _randomPositions();

//     const newDivs = repeatedImages.map((src, i) => {
//         const div = document.createElement('div');
//         div.className = 'Floating-Item';
//         div.style.backgroundImage = `url("${src}")`;

//         Object.assign(div.style, positions[i]);

//         div.style.position = 'absolute';
//         div.style.margin = '0';
//         div.style.width = `${_rand(55, 105)}px`;
//         div.style.height = `${_rand(55, 105)}px`;
//         div.style.backgroundSize = 'contain';
//         div.style.backgroundPosition = 'center';
//         div.style.backgroundRepeat = 'no-repeat';

//         // Keep the particles subtle and non-interactive
//         const opacity = 1;
//         div.style.opacity = '0';
//         div.style.pointerEvents = 'none';
//         div.style.willChange = 'transform, translate, rotate, opacity';

//         // Independent floating movement
//         div.style.setProperty('--float-x', `${_rand(-18, 18)}px`);
//         div.style.setProperty('--float-y', `${_rand(-24, 24)}px`);
//         div.style.setProperty('--float-rotate', `${_rand(-12, 12)}deg`);
//         div.style.setProperty('--float-duration', `${_rand(5, 10)}s`);
//         div.style.setProperty('--float-delay', `${_rand(-10, 0)}s`);
//         div.dataset.opacity = opacity;

//         div.style.transform =
//             `translate3d(0, ${inY}, 0) scale(0.88)`;
//         div.style.transition = 'none';

//         floatingBarContainer.appendChild(div);

//         return div;
//     });

//     // 3. Apply initial styles before starting entrance transitions
//     newDivs.forEach(div => void div.offsetWidth);

//     newDivs.forEach((div, i) => {
//         const delay = i * STAGGER_IN;

//         div.style.transition =
//             `transform 1s ${delay}ms cubic-bezier(0.16, 1, 0.3, 1), ` +
//             `opacity 1s ${delay}ms ease-out`;

//         requestAnimationFrame(() => {
//             div.style.transform = 'translate3d(0, 0, 0) scale(1)';
//             div.style.opacity = div.dataset.opacity;
//         });

//         // 4. Start floating after the entrance completes
//         setTimeout(() => {
//             if (!div.isConnected) return;

//             div.style.transition = 'none';
//             div.style.animation =
//                 'floatingMotion var(--float-duration) ease-in-out ' +
//                 'var(--float-delay) infinite alternate';
//         }, 1100 + delay);
//     });
// }

// // ── INITIALIZER ─────────────────────────────────────────────────────────────
// (function init() {
//     categoryItems.forEach(item => {
//         const trigger = item.querySelector(
//             '.Main-Category-Image, .Main-Category-Content'
//         );

//         if (trigger) {
//             trigger.addEventListener('click', () => {
//                 const name = item.dataset.category;

//                 setTimeout(() => {
//                     const items = menuData[name] || [];

//                     if (items.length > 0) {
//                         floatingBarContainer.innerHTML = '';
//                         showFloatingImages(items[0], 'down');
//                         updateItemCounter(0, items.length);
//                     }
//                 }, 50);
//             });
//         }
//     });
// })();
