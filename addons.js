// addons.js - Shared Features (Language & Fullscreen, Call Server, Per-item Takeout/Eat Here, Order Status, Pop-out Notifications, Timer Pill)

(function () {
    // ── Translation Dictionaries (EN, FR, AR) ──
    const translations = {
        en: {
            chooseLanguage: "Choose Language / Langue",
            services: "Services",
            callServer: "Call Server",
            requestBill: "Request Bill",
            needNapkins: "Need Napkins",
            checkOrderStatus: "Check Order Status",
            orderPreparing: "Order in Progress: Preparing in Kitchen...",
            serverNotified: "A server has been notified and will be at your table shortly.",
            billSent: "Your bill request has been sent to the cashier.",
            napkinsSent: "Napkins request sent. We will bring them to your table.",
            diningPreference: "Dining Preference",
            takeAllOut: "Take All Out",
            eatAllHere: "Eat All Here",
            eatHere: "Eat Here",
            takeOut: "Take Out",
            yourOrder: "Your Order",
            sendToKitchen: "Send to Kitchen",
            total: "Total",
            customize: "Customize",
            addToOrder: "Add to Order",
            size: "Size",
            crust: "Crust",
            extras: "Extras",
            notification: "Notification",
            orderSubmitted: "Order sent to kitchen! Preparation underway.",
            // Common Categories
            cookiesCat: "COOKIES",
            glacesCat: "ICE CREAM",
            boissonsCat: "DRINKS",
            macaronsCat: "MACARONS",
            pizzaCat: "PIZZA",
            burgerCat: "BURGERS",
            shawarmaCat: "SHAWARMA",
            bowlsCat: "BOWLS"
        },
        fr: {
            chooseLanguage: "Choisissez la langue / Choose Language",
            services: "Services",
            callServer: "Appeler le serveur",
            requestBill: "Demander l'addition",
            needNapkins: "Demander des serviettes",
            checkOrderStatus: "Statut de la commande",
            orderPreparing: "Commande en cours : En préparation en cuisine...",
            serverNotified: "Un serveur a été prévenu et arrive à votre table.",
            billSent: "Votre demande d'addition a été envoyée au caissier.",
            napkinsSent: "Demande de serviettes envoyée. Nous vous les apportons.",
            diningPreference: "Mode de consommation",
            takeAllOut: "Tout à emporter",
            eatAllHere: "Tout sur place",
            eatHere: "Sur place",
            takeOut: "À emporter",
            yourOrder: "Votre Commande",
            sendToKitchen: "Envoyer en cuisine",
            total: "Total",
            customize: "Personnaliser",
            addToOrder: "Ajouter à la commande",
            size: "Taille",
            crust: "Pâte",
            extras: "Suppléments",
            notification: "Notification",
            orderSubmitted: "Commande envoyée en cuisine ! Préparation en cours.",
            // Common Categories
            cookiesCat: "COOKIES",
            glacesCat: "GLACES",
            boissonsCat: "BOISSONS",
            macaronsCat: "MACARONS",
            pizzaCat: "PIZZA",
            burgerCat: "BURGERS",
            shawarmaCat: "SHAWARMA",
            bowlsCat: "BOWLS"
        },
        ar: {
            chooseLanguage: "اختر اللغة / Choose Language",
            services: "الخدمات",
            callServer: "استدعاء النادل",
            requestBill: "طلب الفاتورة",
            needNapkins: "طلب مناديل",
            checkOrderStatus: "متابعة الطلب",
            orderPreparing: "الطلب قيد التحضير في المطبخ...",
            serverNotified: "تم إبلاغ النادل وسيصل إلى طاولتك قريباً.",
            billSent: "تم إرسال طلب الفاتورة إلى المحاسب.",
            napkinsSent: "تم إرسال طلب المناديل. سنحضرها لطاولتك.",
            diningPreference: "تفضيل تناول الطعام",
            takeAllOut: "سفري للكل",
            eatAllHere: "تناول الكل هنا",
            eatHere: "في المطعم",
            takeOut: "سفري",
            yourOrder: "طلبك",
            sendToKitchen: "إرسال إلى المطبخ",
            total: "المجموع",
            customize: "تخصيص",
            addToOrder: "إضافة إلى الطلب",
            size: "الحجم",
            crust: "العجينة",
            extras: "إضافات",
            notification: "إشعار",
            orderSubmitted: "تم إرسال الطلب إلى المطبخ! جاري التحضير.",
            // Common Categories
            cookiesCat: "كوكيز",
            glacesCat: "آيس كريم",
            boissonsCat: "مشروبات",
            macaronsCat: "ماكارون",
            pizzaCat: "بيتزا",
            burgerCat: "برجر",
            shawarmaCat: "شاورما",
            bowlsCat: "أطباق"
        }
    };

    let currentLang = localStorage.getItem('menu_lang') || 'en';

    // ── Ingredient Translation Map (Only translates ingredients) ──
    const ingredientDict = {
        // Cookies Menu
        "Farine": { en: "Flour", fr: "Farine", ar: "طحين" },
        "Beurre": { en: "Butter", fr: "Beurre", ar: "زبدة" },
        "Pépites de Chocolat": { en: "Chocolate Chips", fr: "Pépites de Chocolat", ar: "رقائق الشوكولاتة" },
        "Sucre": { en: "Sugar", fr: "Sucre", ar: "سكر" },
        "Flocons d'Avoine": { en: "Oat Flakes", fr: "Flocons d'Avoine", ar: "رقائق الشوفان" },
        "Raisins Secs": { en: "Raisins", fr: "Raisins Secs", ar: "زبيب" },
        "Cannelle": { en: "Cinnamon", fr: "Cannelle", ar: "قرفة" },
        "Sucre Roux": { en: "Brown Sugar", fr: "Sucre Roux", ar: "سكر بني" },
        "Cacao": { en: "Cocoa", fr: "Cacao", ar: "كاكاو" },
        "Chocolat Noir": { en: "Dark Chocolate", fr: "Chocolat Noir", ar: "شوكولاتة داكنة" },
        "Fleur de Sel": { en: "Sea Salt Flakes", fr: "Fleur de Sel", ar: "زهرة الملح" },
        "Crème": { en: "Cream", fr: "Crème", ar: "كريمة" },
        "Lait": { en: "Milk", fr: "Lait", ar: "حليب" },
        "Vanille de Madagascar": { en: "Madagascar Vanilla", fr: "Vanille de Madagascar", ar: "فانيليا مدغشقر" },
        "Cacao Belge": { en: "Belgian Cocoa", fr: "Cacao Belge", ar: "كاكاو بلجيكي" },
        "Crème Fraîche": { en: "Fresh Cream", fr: "Crème Fraîche", ar: "قشطة طازجة" },
        "Espresso": { en: "Espresso", fr: "Espresso", ar: "إسبريسو" },
        "Glaçons": { en: "Ice Cubes", fr: "Glaçons", ar: "مكعبات ثلج" },
        "Mélange de Fruits Rouges": { en: "Mixed Berries", fr: "Mélange de Fruits Rouges", ar: "مزيج توت أحمر" },
        "Yaourt": { en: "Yogurt", fr: "Yaourt", ar: "زبادي" },
        "Miel": { en: "Honey", fr: "Miel", ar: "عسل" },
        "Poudre d'Amande": { en: "Almond Powder", fr: "Poudre d'Amande", ar: "بودرة اللوز" },
        "Pâte de Pistache": { en: "Pistachio Paste", fr: "Pâte de Pistache", ar: "معجون الفستق" },
        "Confiture de Framboise": { en: "Raspberry Jam", fr: "Confiture de Framboise", ar: "مربى التوت" },
        "Blancs d'Œufs": { en: "Egg Whites", fr: "Blancs d'Œufs", ar: "بياض البيض" },

        // Pizza / Burger / Shawarma / Bowls Menu
        "San Marzano DOP": { en: "San Marzano DOP", fr: "San Marzano AOP", ar: "سان مارزانو AOP" },
        "Buffalo Mozzarella": { en: "Buffalo Mozzarella", fr: "Mozzarella di Bufala", ar: "موزاريلا بافلو" },
        "Fresh Basil": { en: "Fresh Basil", fr: "Basilic Frais", ar: "ريحان طازج" },
        "EVOO": { en: "EVOO (Olive Oil)", fr: "Huile d'Olive Vierge Extra", ar: "زيت زيتون بكر ممتاز" },
        "Sea Salt": { en: "Sea Salt", fr: "Sel Marin", ar: "ملح بحري" },
        "Autumn Truffle": { en: "Autumn Truffle", fr: "Truffe d'Automne", ar: "كمأة الخريف" },
        "Wild Mushrooms": { en: "Wild Mushrooms", fr: "Champignons Sauvages", ar: "فطر بري" },
        "Pecorino Romano": { en: "Pecorino Romano", fr: "Pecorino Romano", ar: "جبن بيكورينو رومانو" },
        "Garlic Confit": { en: "Garlic Confit", fr: "Confit d'Ail", ar: "ثوم كونفي" },
        "Spicy Nduja": { en: "Spicy Nduja", fr: "Nduja Piquante", ar: "ندوجا حارة" },
        "Calabrese Pepperoni": { en: "Calabrese Pepperoni", fr: "Pepperoni Calabrais", ar: "بيبروني كالابريزي" },
        "Smoked Scamorza": { en: "Smoked Scamorza", fr: "Scamorza Fumée", ar: "سكامورزا مدخنة" },
        "Chilli Honey": { en: "Chilli Honey", fr: "Miel Pimenté", ar: "عسل بالفلفل الحار" },
        "Dry-Aged Wagyu": { en: "Dry-Aged Wagyu", fr: "Wagyu Mâturé", ar: "واغيو معتق" },
        "Black Truffle Aioli": { en: "Black Truffle Aioli", fr: "Aïoli à la Truffe Noire", ar: "أيولي الكمأة السوداء" },
        "Gruyère": { en: "Gruyère", fr: "Gruyère", ar: "جبن غرويير" },
        "GruyA\"re": { en: "Gruyère", fr: "Gruyère", ar: "جبن غرويير" },
        "Caramelized Onions": { en: "Caramelized Onions", fr: "Oignons Caramélisés", ar: "بصل مكرمل" },
        "Brioche": { en: "Brioche", fr: "Brioche", ar: "خبز بريوش" },
        "Double Smash Patty": { en: "Double Smash Patty", fr: "Double Steak Smashé", ar: "شريحة سماش مزدوجة" },
        "Blue Cheese": { en: "Blue Cheese", fr: "Fromage Bleu", ar: "جبنة زرقاء" },
        "Arugula": { en: "Arugula", fr: "Roquette", ar: "جرجير" },
        "Truffle Mayo": { en: "Truffle Mayo", fr: "Mayo à la Truffe", ar: "مايونيز الكمأة" },
        "Sesame Brioche": { en: "Sesame Brioche", fr: "Brioche au Sésame", ar: "بريوش بالسمسم" },
        "Slow-Roasted Lamb": { en: "Slow-Roasted Lamb", fr: "Agneau Confit", ar: "لحم خروف مشوي ببطء" },
        "Tahini": { en: "Tahini", fr: "Tahini", ar: "طحينة" },
        "Pickled Turnips": { en: "Pickled Turnips", fr: "Navets Marinés", ar: "لفت مخلل" },
        "Fresh Parsley": { en: "Fresh Parsley", fr: "Persil Frais", ar: "بقدونس طازج" },
        "Homemade Lavash": { en: "Homemade Lavash", fr: "Lavash Maison", ar: "خبز لافاش منزلي" },
        "Marinated Chicken": { en: "Marinated Chicken", fr: "Poulet Mariné", ar: "دجاج متبل" },
        "Garlic Sauce": { en: "Garlic Sauce", fr: "Sauce à l'Ail", ar: "صلصة الثوم" },
        "Sumac Onions": { en: "Sumac Onions", fr: "Oignons au Sumac", ar: "بصل بالسماق" },
        "Amba": { en: "Amba Sauce", fr: "Sauce Amba", ar: "صلصة عنبة" },
        "Flatbread": { en: "Flatbread", fr: "Pain Plat", ar: "خبز مفرود" },
        "Lamb & Chicken Mix": { en: "Lamb & Chicken Mix", fr: "Mélange Agneau & Poulet", ar: "ميكس خروف ودجاج" },
        "Hummus": { en: "Hummus", fr: "Houmous", ar: "حمص" },
        "Tomatoes": { en: "Tomatoes", fr: "Tomates", ar: "طماطم" },
        "Herb Salad": { en: "Herb Salad", fr: "Salade d'Herbes", ar: "سلطة أعشاب" },
        "Pita Bread": { en: "Pita Bread", fr: "Pain Pita", ar: "خبز بيتا" },
        "Quinoa": { en: "Quinoa", fr: "Quinoa", ar: "كينوا" },
        "Roasted Sweet Potato": { en: "Roasted Sweet Potato", fr: "Patate Douce Rôtie", ar: "بطاطا حلوة مشوية" },
        "Kale": { en: "Kale", fr: "Chou Kale", ar: "كرنب كالي" },
        "Avocado": { en: "Avocado", fr: "Avocat", ar: "أفوكادو" },
        "Lemon-Tahini Dressing": { en: "Lemon-Tahini Dressing", fr: "Vinaigrette Citron-Tahini", ar: "تتبيلة الليمون والطحينة" },
        "Sashimi-Grade Salmon": { en: "Sashimi-Grade Salmon", fr: "Saumon Qualité Sashimi", ar: "سلمون درجة ساشيمي" },
        "Brown Rice": { en: "Brown Rice", fr: "Riz Complet", ar: "أرز أسمر" },
        "Edamame": { en: "Edamame", fr: "Edamame", ar: "إدامامي" },
        "Cucumber": { en: "Cucumber", fr: "Concombre", ar: "خيار" },
        "Ponzu Dressing": { en: "Ponzu Dressing", fr: "Sauce Ponzu", ar: "صلصة بونزو" },

        // Alice Sushi Menu
        "Saumon": { en: "Salmon", fr: "Saumon", ar: "سلمون" },
        "Riz vinaigré": { en: "Seasoned Sushi Rice", fr: "Riz vinaigré", ar: "أرز متبل" },
        "Crevette tempura": { en: "Tempura Shrimp", fr: "Crevette tempura", ar: "جمبري تمبورا" },
        "Poisson blanc": { en: "White Fish", fr: "Poisson blanc", ar: "سمك أبيض" },
        "Avocat": { en: "Avocado", fr: "Avocat", ar: "أفوكادو" },
        "Oshinko": { en: "Pickled Radish (Oshinko)", fr: "Oshinko", ar: "أوشينكو (فجل مخلل)" },
        "Algue": { en: "Nori Seaweed", fr: "Algue", ar: "طحالب نوري" },
        "Surimi": { en: "Surimi", fr: "Surimi", ar: "سوريمي" },
        "Carotte": { en: "Carrot", fr: "Carotte", ar: "جزر" },
        "Concombre": { en: "Cucumber", fr: "Concombre", ar: "خيار" },
        "Poulet": { en: "Chicken", fr: "Poulet", ar: "دجاج" },
        "Fromage": { en: "Cream Cheese", fr: "Fromage", ar: "جبنة كريمية" },
        "Crevette": { en: "Shrimp", fr: "Crevette", ar: "جمبري" },
        "Oignon frit": { en: "Crispy Fried Onion", fr: "Oignon frit", ar: "بصل مقلي مقرمش" },
        "Sésame": { en: "Sesame", fr: "Sésame", ar: "سمسم" },
        "Poulet haché tendre": { en: "Tender Minced Chicken", fr: "Poulet haché tendre", ar: "دجاج مفروم طري" },
        "Viande hachée fraîche": { en: "Fresh Minced Beef", fr: "Viande hachée fraîche", ar: "لحم مفروم طازج" }
    };

    function translateIngredient(text, targetLang) {
        if (!text) return text;
        const trimmed = text.trim();
        if (ingredientDict[trimmed] && ingredientDict[trimmed][targetLang]) {
            return ingredientDict[trimmed][targetLang];
        }
        for (const [key, val] of Object.entries(ingredientDict)) {
            if (val.en === trimmed || val.fr === trimmed || val.ar === trimmed) {
                return val[targetLang] || trimmed;
            }
        }
        return text;
    }

    let isTranslating = false;

    function translateAllIngredients(targetLang) {
        if (isTranslating) return;
        isTranslating = true;
        try {
            // 1. Cookies.html / script2.js (.Ingredient)
            document.querySelectorAll('.Ingredient').forEach(el => {
                if (!el.dataset.rawIngredient) {
                    el.dataset.rawIngredient = el.textContent.trim();
                }
                const translated = translateIngredient(el.dataset.rawIngredient, targetLang);
                if (el.textContent !== translated) {
                    el.textContent = translated;
                }
            });

            // 2. pizza.html (.ing-line in mobile-ingredients)
            document.querySelectorAll('.ing-line').forEach(el => {
                if (!el.dataset.rawIngredient) {
                    el.dataset.rawIngredient = el.textContent.trim();
                }
                const translated = translateIngredient(el.dataset.rawIngredient, targetLang);
                if (el.textContent !== translated) {
                    el.textContent = translated;
                }
            });

            // 3. pizza.html sections (data-ingredients attributes)
            document.querySelectorAll('.flavor-section[data-ingredients]').forEach(sec => {
                if (!sec.dataset.rawIngredientsList) {
                    sec.dataset.rawIngredientsList = sec.getAttribute('data-ingredients') || '';
                }
                const rawList = sec.dataset.rawIngredientsList.split(';');
                const translatedList = rawList.map(item => translateIngredient(item, targetLang));
                const newAttr = translatedList.join(';');
                if (sec.getAttribute('data-ingredients') !== newAttr) {
                    sec.setAttribute('data-ingredients', newAttr);
                }
            });

            // 4. alice.html / script.js & allo.html / allo-script.js
            document.querySelectorAll('.flavor-section[data-ingredients-list]').forEach(sec => {
                if (!sec.dataset.rawIngredientsList) {
                    sec.dataset.rawIngredientsList = sec.getAttribute('data-ingredients-list') || '';
                }
                const rawList = sec.dataset.rawIngredientsList.split(';');
                const translatedList = rawList.map(item => {
                    if (item.includes(' - ')) {
                        return item.split(' - ').map(part => translateIngredient(part, targetLang)).join(' - ');
                    }
                    return translateIngredient(item, targetLang);
                });
                const newAttr = translatedList.join(';');
                if (sec.getAttribute('data-ingredients-list') !== newAttr) {
                    sec.setAttribute('data-ingredients-list', newAttr);
                }
            });
        } finally {
            isTranslating = false;
        }
    }

    // ── Global Pop-out Notification System (Replaces alert) ──
    window.showPopoutNotification = function (msg, type = 'info', customTitle = null) {
        let container = document.getElementById('addons-popout-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'addons-popout-container';
            document.body.appendChild(container);
        }

        const dict = translations[currentLang] || translations.en;
        const titleText = customTitle || dict.notification;

        const card = document.createElement('div');
        card.className = 'addons-popout-card';
        card.innerHTML = `
            <div class="addons-popout-icon">🔔</div>
            <div class="addons-popout-content">
                <div class="addons-popout-title">${titleText}</div>
                <div class="addons-popout-msg">${msg}</div>
            </div>
            <button class="addons-popout-close" aria-label="Close">&times;</button>
            <div class="addons-popout-bar"></div>
        `;

        container.appendChild(card);

        // Animate in
        requestAnimationFrame(() => {
            card.classList.add('show');
        });

        // Close on X click
        const closeBtn = card.querySelector('.addons-popout-close');
        const dismiss = () => {
            card.classList.remove('show');
            setTimeout(() => card.remove(), 400);
        };
        closeBtn.addEventListener('click', dismiss);

        // Auto dismiss after 4 seconds
        setTimeout(dismiss, 4000);
    };

    // Override browser native alert to use Pop-out Card!
    window.alert = function (msg) {
        window.showPopoutNotification(msg);
    };

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
                    <h2 id="addons-modal-title">Choose Language / Langue</h2>
                    <div class="addons-btn-group" id="addons-lang-btns">
                        <button class="addons-btn" data-val="en"><span>🇬🇧</span> English</button>
                        <button class="addons-btn" data-val="fr"><span>🇫🇷</span> Français</button>
                        <button class="addons-btn" data-val="ar"><span>🇩🇿</span> العربية</button>
                    </div>
                </div>
            </div>
        `;

        // 2. Services FAB & Order Tracker WITH TIMER PILL
        const overlayHTML = `
            <div id="addons-fab-container">
                <div id="addons-fab-menu">
                    <div class="addons-menu-lang-select">
                        <button class="addons-lang-chip ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                        <button class="addons-lang-chip ${currentLang === 'fr' ? 'active' : ''}" data-lang="fr">FR</button>
                        <button class="addons-lang-chip ${currentLang === 'ar' ? 'active' : ''}" data-lang="ar">AR</button>
                    </div>
                    <div class="addons-menu-item" id="addons-btn-server">
                        <span class="addons-txt" data-key="callServer">Call Server</span>
                    </div>
                    <div class="addons-menu-item" id="addons-btn-bill">
                        <span class="addons-txt" data-key="requestBill">Request Bill</span>
                    </div>
                    <div class="addons-menu-item" id="addons-btn-napkins">
                        <span class="addons-txt" data-key="needNapkins">Need Napkins</span>
                    </div>
                    <div class="addons-menu-item" id="addons-btn-mock-order">
                        <span class="addons-txt" data-key="checkOrderStatus">Check Order Status</span>
                    </div>
                </div>
                <button id="addons-fab" title="Services">
                    <span class="addons-txt" data-key="services">Services</span>
                </button>
            </div>

            <div id="addons-order-tracker">
                <div class="addons-status-dot"></div>
                <div class="addons-tracker-text addons-txt" data-key="orderPreparing">Order in Progress: Preparing in Kitchen...</div>
                <div class="addons-tracker-time-pill" id="addons-timer-pill">
                    <span class="timer-icon">⏱️</span>
                    <span id="addons-timer-countdown">15:00</span>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML + overlayHTML);

        const modal = document.getElementById('addons-start-modal');
        const langBtns = document.querySelectorAll('#addons-lang-btns .addons-btn');

        // Apply Language across entire application
        function applyLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('menu_lang', lang);
            const dict = translations[lang] || translations.en;

            // HTML Direction for Arabic RTL
            document.documentElement.setAttribute('lang', lang);
            if (lang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
            }

            // Update modal title
            const mTitle = document.getElementById('addons-modal-title');
            if (mTitle) mTitle.textContent = dict.chooseLanguage;

            // Update data-key elements
            document.querySelectorAll('.addons-txt[data-key]').forEach(el => {
                const key = el.dataset.key;
                if (dict[key]) el.textContent = dict[key];
            });

            // Update language chips
            document.querySelectorAll('.addons-lang-chip').forEach(chip => {
                chip.classList.toggle('active', chip.dataset.lang === lang);
            });

            // Update order modal & cart texts if present
            const orderModalHeader = document.querySelector('.order-modal-header span');
            if (orderModalHeader) orderModalHeader.textContent = dict.yourOrder;

            const orderSubmitBtn = document.getElementById('order-submit');
            if (orderSubmitBtn) orderSubmitBtn.textContent = dict.sendToKitchen;

            const fabPanelHeader = document.querySelector('.fab-panel-header');
            if (fabPanelHeader) fabPanelHeader.textContent = dict.customize;

            const fabConfirmBtn = document.getElementById('fab-confirm');
            if (fabConfirmBtn) fabConfirmBtn.textContent = dict.addToOrder;

            // Update category labels dynamically if category elements exist
            document.querySelectorAll('.Category-Name, .bg-category-label').forEach(el => {
                const raw = el.textContent.trim().toUpperCase();
                if (raw.includes('COOKIE') || raw.includes('كوكيز')) el.textContent = dict.cookiesCat;
                else if (raw.includes('GLACE') || raw.includes('ICE') || raw.includes('آيس')) el.textContent = dict.glacesCat;
                else if (raw.includes('BOISSON') || raw.includes('DRINK') || raw.includes('مشروبات')) el.textContent = dict.boissonsCat;
                else if (raw.includes('MACARON') || raw.includes('ماكارون')) el.textContent = dict.macaronsCat;
                else if (raw.includes('PIZZA') || raw.includes('بيتزا')) el.textContent = dict.pizzaCat;
                else if (raw.includes('BURGER') || raw.includes('برجر')) el.textContent = dict.burgerCat;
                else if (raw.includes('SHAWARMA') || raw.includes('شاورما')) el.textContent = dict.shawarmaCat;
                else if (raw.includes('BOWL') || raw.includes('أطباق')) el.textContent = dict.bowlsCat;
            });
            // Translate ingredients only
            translateAllIngredients(lang);
        }

        // Language Selection -> Trigger Fullscreen & Hide Modal
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedLang = btn.dataset.val;
                applyLanguage(selectedLang);

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

        // Quick language switcher chips inside FAB menu
        document.querySelectorAll('.addons-lang-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                applyLanguage(chip.dataset.lang);
                const dict = translations[chip.dataset.lang];
                window.showPopoutNotification(`Language changed / Langue modifiée`, 'info', dict.notification);
            });
        });

        // Apply saved language on load
        applyLanguage(currentLang);

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

        const triggerServiceNotification = (key) => {
            const dict = translations[currentLang] || translations.en;
            window.showPopoutNotification(dict[key]);
            fabMenu.classList.remove('open');
        };

        document.getElementById('addons-btn-server')?.addEventListener('click', () => triggerServiceNotification("serverNotified"));
        document.getElementById('addons-btn-bill')?.addEventListener('click', () => triggerServiceNotification("billSent"));
        document.getElementById('addons-btn-napkins')?.addEventListener('click', () => triggerServiceNotification("napkinsSent"));

        // ── LIVE TIMER PILL LOGIC ──
        const tracker = document.getElementById('addons-order-tracker');
        const timerCountdownElem = document.getElementById('addons-timer-countdown');
        let trackerHideTimer = null;
        let countdownInterval = null;
        let secondsRemaining = 15 * 60; // 15:00 countdown

        function updateTimerDisplay() {
            if (!timerCountdownElem) return;
            const m = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
            const s = (secondsRemaining % 60).toString().padStart(2, '0');
            timerCountdownElem.textContent = `${m}:${s}`;
        }

        function startTimerPillCountdown() {
            if (countdownInterval) clearInterval(countdownInterval);
            updateTimerDisplay();
            countdownInterval = setInterval(() => {
                if (secondsRemaining > 0) {
                    secondsRemaining--;
                    updateTimerDisplay();
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }

        document.getElementById('addons-btn-mock-order')?.addEventListener('click', () => {
            fabMenu.classList.remove('open');
            tracker.classList.add('visible');

            startTimerPillCountdown();

            clearTimeout(trackerHideTimer);
            trackerHideTimer = setTimeout(() => {
                tracker.classList.remove('visible');
            }, 8000);
        });

        // Trigger order tracker and pop-out notification when order submit button is clicked
        const orderSubmitBtn = document.getElementById('order-submit');
        if (orderSubmitBtn) {
            orderSubmitBtn.addEventListener('click', () => {
                const dict = translations[currentLang] || translations.en;
                window.showPopoutNotification(dict.orderSubmitted);
                tracker.classList.add('visible');
                startTimerPillCountdown();
                clearTimeout(trackerHideTimer);
                trackerHideTimer = setTimeout(() => {
                    tracker.classList.remove('visible');
                }, 8000);
            });
        }

        // 3. Per-Item Eat Here / Take Out & Global Select All Toggle
        const itemDiningPreferences = {};
        let globalTakeoutState = false;

        function applyDiningUI() {
            const orderList = document.getElementById('order-list');
            if (!orderList) return;

            const itemElements = Array.from(orderList.querySelectorAll('.order-item-info, .order-item, [class*="item"]'));
            if (itemElements.length === 0) return;

            const dict = translations[currentLang] || translations.en;

            // 1. Inject Global Bar if not present
            let globalBar = document.getElementById('addons-takeout-global-bar');
            if (!globalBar) {
                globalBar = document.createElement('div');
                globalBar.id = 'addons-takeout-global-bar';
                globalBar.innerHTML = `
                    <span class="addons-takeout-label">${dict.diningPreference}</span>
                    <button id="addons-toggle-all-takeout" class="addons-takeout-btn ${globalTakeoutState ? 'active' : ''}">
                        <span>🛍️</span> ${globalTakeoutState ? dict.eatAllHere : dict.takeAllOut}
                    </button>
                `;
                orderList.insertBefore(globalBar, orderList.firstChild);

                document.getElementById('addons-toggle-all-takeout')?.addEventListener('click', () => {
                    globalTakeoutState = !globalTakeoutState;
                    const toggleBtn = document.getElementById('addons-toggle-all-takeout');
                    if (toggleBtn) {
                        toggleBtn.classList.toggle('active', globalTakeoutState);
                        toggleBtn.innerHTML = globalTakeoutState ? `<span>🍽️</span> ${dict.eatAllHere}` : `<span>🛍️</span> ${dict.takeAllOut}`;
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
                const container = itemEl.closest('.order-item, [data-id], .order-item-info') || itemEl;
                if (container.querySelector('.addons-item-dining-toggle')) return;

                const itemId = container.dataset?.id || container.getAttribute('data-id') || `item-${idx}`;
                if (!itemDiningPreferences[itemId]) {
                    itemDiningPreferences[itemId] = globalTakeoutState ? 'takeout' : 'dine-in';
                }

                const toggleGroup = document.createElement('div');
                toggleGroup.className = 'addons-item-dining-toggle';
                toggleGroup.innerHTML = `
                    <button class="addons-dining-opt ${itemDiningPreferences[itemId] === 'dine-in' ? 'active' : ''}" data-mode="dine-in">🍽️ ${dict.eatHere}</button>
                    <button class="addons-dining-opt ${itemDiningPreferences[itemId] === 'takeout' ? 'active' : ''}" data-mode="takeout">🛍️ ${dict.takeOut}</button>
                `;

                container.appendChild(toggleGroup);

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
        // Observe detail list for Cookies.html when items are dynamically created
        const detailList = document.getElementById('Detail-List');
        if (detailList) {
            const detailObserver = new MutationObserver(() => {
                if (!isTranslating) {
                    translateAllIngredients(currentLang);
                }
            });
            detailObserver.observe(detailList, { childList: true });
        }
    });
})();
