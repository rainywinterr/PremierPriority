const menuData = {
    "Cookies": [
        { name: "Choco Chip", price: "350 DZD", ingredients: ["Flour", "Butter", "Chocolate Chips", "Sugar"], calories: "250 kcal", img: "./VanillaCookie.png", color: "#6F4E37", tint: "#FFFaf0" },
        { name: "Oatmeal Raisin", price: "300 DZD", ingredients: ["Oats", "Raisins", "Cinnamon", "Brown Sugar"], calories: "220 kcal", img: "./FrezCookie.png", color: "#D2691E", tint: "#FFF5EE" },
        { name: "Double Dark", price: "400 DZD", ingredients: ["Cocoa", "Dark Chocolate", "Sea Salt"], calories: "280 kcal", img: "./ChocoCookie.png", color: "#3C2A21", tint: "#f2efe4" }
    ],
    "Ice Cream": [
        { name: "Vanilla Bean", price: "450 DZD", ingredients: ["Cream", "Milk", "Madagascar Vanilla"], calories: "300 kcal", img: "./VanillaScoop.png", color: "#F3E5AB", tint: "#FFFDE7" },
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

const categoryItems = document.querySelectorAll('.Category-Item');
const detailView = document.getElementById('Detail-View');
const detailList = document.getElementById('Detail-List');
const closeBtn = document.getElementById('Close-Btn');
const backgroundTint = document.getElementById('Background-Tint');

const floatingBarContainer = document.getElementById('Floating-BG-Container');
let currentCategoryItems = [];
let currentCategory = "";
let lastIndex = -1;
let lastScrollTop = 0;

categoryItems.forEach(item => {
    const trigger = item.querySelector('.Main-Category-Image, .Main-Category-Content');
    if (trigger) {
        trigger.addEventListener('click', () => {
            const categoryName = item.dataset.category;
            currentCategory = categoryName;
            currentCategoryItems = menuData[categoryName] || [];
            showCategoryDetails(categoryName);
        });
    }
});



closeBtn.addEventListener('click', () => {
    detailView.classList.remove('active');
    setTimeout(() => {
        detailList.innerHTML = '';
        backgroundTint.style.backgroundColor = 'transparent';
        floatingBarContainer.innerHTML = '';
    }, 500);
});

function animTextInItem(item, dir) {
    if (typeof gsap === 'undefined') return;
    const texts = Array.from(item.querySelectorAll('.Price, .Ingredient'));
    if (dir === 'up') {
        texts.reverse();
    }
    gsap.fromTo(texts,
        {
            y: dir === 'down' ? 30 : -30,
            clipPath: dir === 'down' ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)'
        },
        {
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            stagger: 0.1,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
        }
    );
}

function showCategoryDetails(category) {
    lastIndex = 0;
    const items = menuData[category] || [];
    detailList.innerHTML = '';

    items.forEach(data => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'Detail-Item';
        itemDiv.innerHTML = `
            <div class="Detail-Content">
                <div class="Header-Section">
                    <h2 style="color: ${data.color || 'black'}">${data.name}</h2>
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
        detailList.appendChild(itemDiv);
    });

    if (typeof gsap !== 'undefined') {
        const allTexts = detailList.querySelectorAll('.Price, .Ingredient');
        gsap.set(allTexts, { clipPath: 'inset(0% 0% 100% 0%)', y: 30 });
    }

    detailList.scrollTop = 0;
    lastScrollTop = 0;

    if (items.length > 0) {
        backgroundTint.style.backgroundColor = items[0].tint;
    }

    if (category === "Macarons") {
        createFloatingBG(true, items[0].bgImages);
    } else {
        floatingBarContainer.innerHTML = '';
    }

    detailView.classList.add('active');

    setTimeout(() => {
        const firstItem = document.querySelector('.Detail-Item');
        if (firstItem) {
            animTextInItem(firstItem, 'down');
        }
    }, 400);
}

detailList.addEventListener('scroll', () => {
    const itemHeight = window.innerHeight;
    const scrollPos = detailList.scrollTop;
    const index = Math.round(scrollPos / itemHeight);

    const dir = scrollPos > lastScrollTop ? 'down' : 'up';
    lastScrollTop = scrollPos;

    if (currentCategoryItems[index]) {
        backgroundTint.style.backgroundColor = currentCategoryItems[index].tint;
    }

    if (index !== lastIndex) {
        lastIndex = index;

        if (currentCategory === "Macarons") {
            const currentItem = currentCategoryItems[index];
            updateFloatingBG(currentItem ? currentItem.bgImages : []);
        }

        const items = document.querySelectorAll('.Detail-Item');
        const nextItem = items[index];
        if (nextItem) {
            animTextInItem(nextItem, dir);
        }
    }
});

function createFloatingBG(shouldClear = false, images = []) {
    if (shouldClear) floatingBarContainer.innerHTML = '';
    if (!images || images.length === 0) return;

    const itemCount = 8;
    for (let i = 0; i < itemCount; i++) {
        const item = document.createElement('div');
        item.className = 'Floating-Item';

        // Pick a random image from the provided set
        const randomImg = images[Math.floor(Math.random() * images.length)];
        item.style.backgroundImage = `url('${randomImg}')`;

        item.style.left = `${Math.random() * 85}%`;
        item.style.top = `${Math.random() * 80 + 10}%`;

        const rotate = Math.random() * 360;
        const scale = 0.6 + Math.random() * 0.8;
        const speed = 1.2 + Math.random() * 1.3;

        item.dataset.rotate = rotate;
        item.dataset.scale = scale;
        item.dataset.speed = speed;

        item.style.transform = `translateY(110vh) rotate(${rotate}deg) scale(${scale})`;
        item.style.transition = `transform ${speed}s cubic-bezier(0.2, 0.8, 0.2, 1)`;

        floatingBarContainer.appendChild(item);

        setTimeout(() => {
            item.style.transform = `translateY(0vh) rotate(${rotate}deg) scale(${scale})`;
        }, 50);
    }
}

function updateFloatingBG(newImages = []) {
    const oldItems = document.querySelectorAll('.Floating-Item:not(.Exiting)');

    oldItems.forEach((item, i) => {
        item.classList.add('Exiting');

        const rotate = item.dataset.rotate || '0';
        const scale = item.dataset.scale || '1';
        const speed = item.dataset.speed || '1.5';

        item.style.transition = `transform ${speed}s cubic-bezier(0.2, 0.8, 0.2, 1)`;
        item.style.transform = `translateY(-110vh) rotate(${rotate}deg) scale(${scale})`;

        setTimeout(() => {
            if (item.parentNode) item.remove();
        }, 3000);
    });

    createFloatingBG(false, newImages);
}
