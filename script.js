// ==========================================
// 1. DATA BASE (Min. 12 premium products with rich fields)
// ==========================================
const products = [
    { id: 1, nazwa: "iPhone 15 Pro", cena: 999, kategoria: "electronics", ocena: 4.8, opis: "Flagowy smartfon z tytanową obudową i procesorem A17 Pro. Nieskazitelny wyświetlacz Super Retina XDR oraz profesjonalny system aparatów.", img: "📱" },
    { id: 2, nazwa: "MacBook Air M3", cena: 1200, kategoria: "electronics", ocena: 4.9, opis: "Superlekki i niesamowicie wydajny laptop od Apple. Wyposażony w najnowszy czip M3 zapewniający rewolucyjną szybkość działania baterii.", img: "💻" },
    { id: 3, nazwa: "Bluza Hoodie Nike", cena: 80, kategoria: "clothes", ocena: 4.5, opis: "Klasyczna, wygodna bluza sportowa z kapturem. Miękka dzianina dresowa zapewnia komfort i ciepło przez cały dzień.", img: "🧥" },
    { id: 4, nazwa: "T-Shirt Oversize", cena: 40, kategoria: "clothes", ocena: 4.2, opis: "Luźny, nowoczesny t-shirt wykonany w 100% z wysokogatunkowej bawełny czesanej. Doskonała baza do codziennych stylizacji streetwear.", img: "👕" },
    { id: 5, nazwa: "Wiedźmin: Ostatnie życzenie", cena: 25, kategoria: "books", ocena: 4.9, opis: "Zbiór opowiadań Andrzeja Sapkowskiego wprowadzający w kultowe uniwersum Geralta z Rivii. Pozycja obowiązkowa dla fanów fantasy.", img: "📚" },
    { id: 6, nazwa: "Słuchawki Sony XM5", cena: 350, kategoria: "electronics", ocena: 4.7, opis: "Słuchawki bezprzewodowe wokółuszne z najlepszą na rynku aktywną redukcją hałasu (ANC) i krystalicznie czystym dźwiękiem Hi-Res.", img: "🎧" },
    { id: 7, nazwa: "Buty Jordan 1", cena: 150, kategoria: "clothes", ocena: 4.6, opis: "Ikona światowego streetwearu. Ponadczasowy design ze skóry i kultowe logo Nike Air. Doskonałe dla kolekcjonerów i miłośników mody.", img: "👟" },
    { id: 8, nazwa: "Clean Code (Książka)", cena: 45, kategoria: "books", ocena: 4.8, opis: "Podręcznik pisania czytelnego, utrzymywalnego i profesjonalnego kodu autorstwa Roberta C. Martina. Święty Graal każdego programisty.", img: "📖" },
    { id: 9, nazwa: "Apple Watch 9", cena: 399, kategoria: "electronics", ocena: 4.4, opis: "Inteligentny zegarek z zaawansowanymi funkcjami monitorowania zdrowia, innowacyjnym gestem dwukrotnego stuknięcia i jasnym ekranem Retina.", img: "⌚" },
    { id: 10, nazwa: "Kurtka Puchowa Zimowa", cena: 220, kategoria: "clothes", ocena: 4.3, opis: "Wyjątkowo ciepła, odporna na wiatry i deszcze kurtka z naturalnego puchu. Zaprojektowana tak, by sprostać najtrudniejszym warunkom.", img: "🧥" },
    { id: 11, nazwa: "Głęboka praca - Cal Newport", cena: 35, kategoria: "books", ocena: 4.6, opis: "Książka o tym, jak odzyskać pełną kontrolę nad skupieniem uwagi i pracować wydajnie w świecie pełnym rozpraszaczy cyfrowych.", img: "📘" },
    { id: 12, nazwa: "Plecak Miejski Kanken", cena: 85, kategoria: "clothes", ocena: 4.1, opis: "Stylowy, kultowy plecak skandynawskiej marki Fjallraven. Niezwykle trwały materiał Vinylon F oraz ergonomiczny, lekki system szelek.", img: "🎒" }
];

// Load cart state from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentSortOrder = null;
let currentDiscountPercentage = 0; // Discount value (e.g. 0.10 for 10%)

// Define valid discount promo codes
const discountCodes = {
    "RABAT10": 0.10,
    "PROMO20": 0.20,
    "STUDENT50": 0.50
};

// ==========================================
// 2. DOM SELECTORS
// ==========================================
const cartButton = document.getElementById('cart-button');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartButton = document.getElementById('close-cart');
const productsContainer = document.getElementById('produkty');
const cartItemsContainer = document.getElementById('cart-items');
const cartCounterElement = document.getElementById('cart-counter');

// Filters
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');

// Summary & coupons
const couponInput = document.getElementById('coupon-input');
const applyDiscountButton = document.getElementById('apply-discount');
const couponMessage = document.getElementById('coupon-message');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartDiscountElement = document.getElementById('cart-discount');
const cartTotalElement = document.getElementById('cart-total');

// Modals
const productModal = document.getElementById('product-modal');
const closeModalButton = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

// Create a single toast notification container in DOM
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-notice';
document.body.appendChild(toastContainer);

// ==========================================
// 3. CART SIDEBAR CONTROLS
// ==========================================
cartButton.addEventListener('click', () => {
    cartSidebar.classList.add('open');
});

closeCartButton.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

// ==========================================
// 4. GENERATING PRODUCT CARDS
// ==========================================
function displayProducts(productsArray) {
    productsContainer.innerHTML = "";

    if (productsArray.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-results">
                <h3>🔍 Brak wyników wyszukiwania</h3>
                <p>Niestety żaden z naszych produktów nie spełnia zaznaczonych przez Ciebie kryteriów filtracji. Spróbuj zmienić parametry wyszukiwania.</p>
            </div>
        `;
        return;
    }

    productsArray.forEach(product => {
        const ratingStars = "⭐".repeat(Math.round(product.ocena)) + ` (${product.ocena})`;
        const cardHTML = `
            <div class="product-card" data-product-id="${product.id}" style="animation: fadeInUp 0.4s ease forwards;">
                <div class="product-img">${product.img}</div>
                <div class="product-category">${product.kategoria}</div>
                <h3 class="product-title">${product.nazwa}</h3>
                <div class="product-rating">${ratingStars}</div>
                <div class="product-price">${product.cena} zł</div>
                <button class="add-to-cart-btn" data-id="${product.id}">📦 Dodaj do koszyka</button>
            </div>
        `;
        productsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// ==========================================
// 5. FILTERS & SORTING (REAL-TIME, ADAPTIVITY)
// ==========================================
function filterAndSortProducts() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;
    const maxPrice = parseInt(priceRange.value);

    // Apply all filters simultaneously (Synchronous evaluation)
    let filtered = products.filter(product => {
        const matchesSearch = product.nazwa.toLowerCase().includes(searchText) || product.opis.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === 'all' || product.kategoria === selectedCategory;
        const matchesPrice = product.cena <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Handle sort order styles & matching parameters
    if (currentSortOrder === 'asc') {
        filtered.sort((a, b) => a.cena - b.cena);
    } else if (currentSortOrder === 'desc') {
        filtered.sort((a, b) => b.cena - a.cena);
    } else if (currentSortOrder === 'rating') {
        filtered.sort((a, b) => b.ocena - a.ocena);
    } else if (currentSortOrder === 'alpha') {
        filtered.sort((a, b) => a.nazwa.localeCompare(b.nazwa));
    }

    displayProducts(filtered);

    // Synchronize current category styling in main navigation links
    document.querySelectorAll('#header-nav .nav-link, [data-category-link]').forEach(link => {
        if (link.getAttribute('data-category-link') === selectedCategory) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Synchronize and highlight which sorting button is currently active
    const sortButtonsConfig = {
        'asc': 'sort-asc',
        'desc': 'sort-desc',
        'rating': 'sort-rating',
        'alpha': 'sort-alpha'
    };
    
    Object.keys(sortButtonsConfig).forEach(key => {
        const btn = document.getElementById(sortButtonsConfig[key]);
        if (btn) {
            if (currentSortOrder === key) {
                btn.style.backgroundColor = "var(--primary)";
                btn.style.color = "#ffffff";
                btn.style.borderColor = "var(--primary)";
            } else {
                btn.style.backgroundColor = "";
                btn.style.color = "";
                btn.style.borderColor = "";
            }
        }
    });
}

// Bind interactive event listeners for filtering
searchInput.addEventListener('input', filterAndSortProducts);
categorySelect.addEventListener('change', filterAndSortProducts);
priceRange.addEventListener('input', (e) => {
    priceValue.innerText = `${e.target.value} zł`;
    filterAndSortProducts();
});

// Bind sort actions with simple toggle mechanics
document.getElementById('sort-asc').addEventListener('click', () => { 
    currentSortOrder = (currentSortOrder === 'asc') ? null : 'asc'; 
    filterAndSortProducts(); 
});
document.getElementById('sort-desc').addEventListener('click', () => { 
    currentSortOrder = (currentSortOrder === 'desc') ? null : 'desc'; 
    filterAndSortProducts(); 
});
document.getElementById('sort-rating').addEventListener('click', () => { 
    currentSortOrder = (currentSortOrder === 'rating') ? null : 'rating'; 
    filterAndSortProducts(); 
});
document.getElementById('sort-alpha').addEventListener('click', () => { 
    currentSortOrder = (currentSortOrder === 'alpha') ? null : 'alpha'; 
    filterAndSortProducts(); 
});

// ==========================================
// 6. CART MANAGEMENT ENGINE
// ==========================================
function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;
    let totalItemsCount = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.produktId);
        if (!product) return;

        const itemTotal = product.cena * item.ilosc;
        subtotal += itemTotal;
        totalItemsCount += item.ilosc;

        const itemHTML = `
            <li class="cart-item">
                <span class="cart-item-img">${product.img}</span>
                <div class="cart-item-info">
                    <strong>${product.nazwa}</strong><br>
                    <small>${product.cena} zł × ${item.ilosc}</small>
                </div>
                <div class="cart-qty-controls">
                    <button class="qty-change-btn btn-minus" data-id="${product.id}">-</button>
                    <span>${item.ilosc}</span>
                    <button class="qty-change-btn btn-plus" data-id="${product.id}">+</button>
                </div>
                <button class="cart-remove-btn" data-id="${product.id}" aria-label="Usuń z koszyka">&times;</button>
            </li>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px 10px;">
                <span style="font-size: 3rem; display: block; margin-bottom: 10px;">🛒</span>
                <p>Twój koszyk jest pusty.</p>
                <small style="display: block; margin-top: 5px; color: var(--text-light)">Dodaj produkty, aby rozpocząć zamówienie!</small>
            </div>
        `;
    }

    // Advanced discount formula logic
    const discountValue = subtotal * currentDiscountPercentage;
    const finalTotal = subtotal - discountValue;

    // Apply values inside DOM safely with transition animations
    cartCounterElement.innerText = totalItemsCount;
    cartSubtotalElement.innerText = `${subtotal} zł`;
    cartDiscountElement.innerText = `-${discountValue.toFixed(0)} zł`;
    cartTotalElement.innerText = `${finalTotal.toFixed(0)} zł`;

    // Persist cart array state to localStorage browser storage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Dynamic Toast alert notifications for smooth interactions
function showToast(message) {
    toastContainer.innerHTML = message;
    toastContainer.classList.add('show');
    setTimeout(() => {
        toastContainer.classList.remove('show');
    }, 2500);
}

// Smooth particles arc transition helper animation ("flying emoji Gimmick" ★)
function animateProductFly(sourceElement, productEmoji) {
    const cartBtnRect = cartButton.getBoundingClientRect();
    const sourceRect = sourceElement.getBoundingClientRect();

    const particle = document.createElement('div');
    particle.className = 'flying-particle';
    particle.innerText = productEmoji;
    particle.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
    particle.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
    
    document.body.appendChild(particle);

    // Use absolute window positions coordinates to fly matching element
    setTimeout(() => {
        const destX = cartBtnRect.left + cartBtnRect.width / 2;
        const destY = cartBtnRect.top + cartBtnRect.height / 2;
        
        particle.style.transform = `translate(${destX - sourceRect.left - sourceRect.width / 2}px, ${destY - sourceRect.top - sourceRect.height / 2}px) scale(0.3)`;
        particle.style.opacity = "0.2";
    }, 50);

    // Clean element completely on transition finish
    setTimeout(() => {
        particle.remove();
        // Give cart button a beautiful mini bounce effect
        cartButton.style.transform = "scale(1.1)";
        setTimeout(() => cartButton.style.transform = "", 150);
    }, 850);
}

// EVENT DELEGATION: Clicking on products section (Add to cart / Modal popup detail)
productsContainer.addEventListener('click', (event) => {
    // Detect trigger on "Add to cart" button
    const cartBtnObj = event.target.closest('.add-to-cart-btn');
    if (cartBtnObj) {
        event.stopPropagation(); // Stop from bubbling to card detail trigger click
        const productId = parseInt(cartBtnObj.getAttribute('data-id'));
        const product = products.find(p => p.id === productId);

        if (product) {
            const cartItem = cart.find(item => item.produktId === productId);
            if (cartItem) {
                cartItem.ilosc += 1;
            } else {
                cart.push({ produktId: productId, ilosc: 1 });
            }
            // Trigger effects
            animateProductFly(cartBtnObj, product.img);
            showToast(`⭐ Dodano <strong>${product.nazwa}</strong> do koszyka!`);
            updateCartUI();
        }
    } 
    // Otherwise open product card detail view in professional overlay Modal
    else {
        const card = event.target.closest('.product-card');
        if (card) {
            const productId = parseInt(card.getAttribute('data-product-id'));
            openModal(productId);
        }
    }
});

// EVENT DELEGATION: Cart items list modifications inside the slider
cartItemsContainer.addEventListener('click', (event) => {
    const btn = event.target;
    const id = parseInt(btn.getAttribute('data-id'));
    if (!id) return;

    const cartItem = cart.find(item => item.produktId === id);
    if (!cartItem) return;

    if (btn.classList.contains('btn-plus')) {
        cartItem.ilosc += 1;
    } else if (btn.classList.contains('btn-minus')) {
        cartItem.ilosc -= 1;
        if (cartItem.ilosc <= 0) {
            cart = cart.filter(item => item.produktId !== id);
        }
    } else if (btn.classList.contains('cart-remove-btn')) {
        cart = cart.filter(item => item.produktId !== id);
    }

    updateCartUI();
});

// ==========================================
// 7. COUPON SUBMISSIONS & VALIDATION
// ==========================================
applyDiscountButton.addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase();

    if (discountCodes.hasOwnProperty(code)) {
        currentDiscountPercentage = discountCodes[code];
        couponMessage.innerHTML = `🎉 Code: <strong>${code}</strong> is active! Discount of ${currentDiscountPercentage * 100}% applied.`;
        couponMessage.className = "success-msg";
    } else {
        currentDiscountPercentage = 0;
        couponMessage.innerHTML = "❌ Błąd: Podany kod jest nieważny lub wygasł.";
        couponMessage.className = "error-msg";
    }
    updateCartUI();
});

// ==========================================
// 8. LUXURIOUS DETAILS MODAL WRAPPER
// ==========================================
function openModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    modalBody.innerHTML = `
        <div class="modal-product-details">
            <div style="font-size: 6rem; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%); padding: 30px; border-radius: var(--radius-lg);">${product.img}</div>
            <div class="star-rating">⭐⭐⭐⭐⭐ <strong>${product.ocena} / 5.0</strong></div>
            <h2>${product.nazwa}</h2>
            <p class="modal-category">Dział: <span>${product.kategoria}</span></p>
            <p class="modal-desc">${product.opis}</p>
            <p class="modal-price">${product.cena} zł</p>
            <button class="modal-add-btn" id="modal-buy-now-btn" data-id="${product.id}">⚡ Kup i dodaj do koszyka</button>
        </div>
    `;

    // Connect modal button action safely
    const modalBuyBtn = document.getElementById('modal-buy-now-btn');
    modalBuyBtn.addEventListener('click', () => {
        const cartItem = cart.find(item => item.produktId === product.id);
        if (cartItem) {
            cartItem.ilosc += 1;
        } else {
            cart.push({ produktId: product.id, ilosc: 1 });
        }
        animateProductFly(modalBuyBtn, product.img);
        showToast(`⭐ Dodano <strong>${product.nazwa}</strong> do koszyka!`);
        updateCartUI();
        closeModal();
    });

    // Make modal show up cleanly with transition animation
    productModal.style.display = "block";
    // Trigger animation frame on class assignment for smooth opacity entrance
    requestAnimationFrame(() => {
        productModal.classList.add('show');
    });
}

function closeModal() {
    productModal.classList.remove('show');
    // Align block removal on delay to let the fade transition finish cleanly
    setTimeout(() => {
        productModal.style.display = "none";
    }, 250);
}

closeModalButton.addEventListener('click', closeModal);

// Close overlay modal if clicking outside boundaries
window.addEventListener('click', (e) => {
    if (e.target === productModal) {
        closeModal();
    }
});

// ==========================================
// 9. EVENT REGISTRATION IN THE FOOTER METRICS & POLICIES
// ==========================================
const policyContents = {
    delivery: {
        title: "🚚 Czas i koszty dostawy",
        html: `
            <div style="font-size: 4rem; text-align: center; margin-bottom: 20px;">🚚</div>
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; margin-bottom: 15px;">Czas i koszty dostawy</h2>
            <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; line-height: 1.6; color: var(--text-muted);">
                <p>Dokładamy wszelkich starań, aby Twoje zamówienie dotarło jak najszybciej. Poniżej przedstawiamy dostępne formy dostawy oraz ich koszty:</p>
                <div style="background-color: var(--bg-base); padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <strong style="color: var(--text-main);">⚡ Paczkomaty InPost 24/7</strong> — 12.99 zł<br>
                    <span>Czas dostawy: 1-2 dni robocze. Najwygodniejsza forma odbioru.</span>
                </div>
                <div style="background-color: var(--bg-base); padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <strong style="color: var(--text-main);">📦 Kurier DPD / DHL</strong> — 15.10 zł<br>
                    <span>Czas dostawy: 1 dzień roboczy. Dostawa bezpośrednio pod wskazany adres.</span>
                </div>
                <div style="background-color: var(--primary-light); padding: 15px; border-radius: var(--radius-md); border: 1px dashed var(--primary);">
                    <strong style="color: var(--primary);">🎉 Darmowa dostawa od 150 zł!</strong><br>
                    <span style="color: var(--text-main);">Zrób zakupy za minimum 150 zł, a Twoją przesyłkę wyślemy kurierem lub do Paczkomatu całkowicie bezpłatnie!</span>
                </div>
            </div>
        `
    },
    returns: {
        title: "🔄 Zwroty i reklamacje",
        html: `
            <div style="font-size: 4rem; text-align: center; margin-bottom: 20px;">🔄</div>
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; margin-bottom: 15px;">Zwroty i reklamacje</h2>
            <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; line-height: 1.6; color: var(--text-muted);">
                <p>Twój spokój jest naszym priorytetem. Jeśli zamówiony produkt nie spełnił Twoich oczekiwań, masz pełne prawo do jego zwrotu:</p>
                <div style="background-color: var(--bg-base); padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; gap: 12px; align-items: flex-start;">
                    <span style="font-size: 1.5rem;">📅</span>
                    <div>
                        <strong style="color: var(--text-main);">Aż 30 dni na zwrot</strong><br>
                        <span>Możesz zwrócić zakupiony towar w ciągu 30 dni bez podawania jakiejkolwiek przyczyny.</span>
                    </div>
                </div>
                <div style="background-color: var(--bg-base); padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; gap: 12px; align-items: flex-start;">
                    <span style="font-size: 1.5rem;">📝</span>
                    <div>
                        <strong style="color: var(--text-main);">Szybki proces reklamacji</strong><br>
                        <span>Artykuł posiada wadę fabryczną? Zgłoś reklamację na adres <span style="color: var(--primary);">sklep@abc.pl</span>, a my wymienimy go na nowy w 48h.</span>
                    </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-light);">* Pamiętaj, że odsyłany towar nie może nosić śladów użytkowania i powinien posiadać oryginalne metki.</p>
            </div>
        `
    },
    terms: {
        title: "📜 Regulamin sklepu abc.pl",
        html: `
            <div style="font-size: 4rem; text-align: center; margin-bottom: 20px;">📜</div>
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; margin-bottom: 15px;">Regulamin sklepu</h2>
            <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; line-height: 1.5; color: var(--text-muted); max-height: 300px; overflow-y: auto; padding-right: 8px;">
                <h4 style="color: var(--text-main); font-weight: 700;">§ 1 Postanowienia ogólne</h4>
                <p>Sklep internetowy działający pod adresem abc.pl prowadzony jest przez ABC Group S.A. Regulamin określa zasady dokonywania zakupów, świadczenia usług drogą elektroniczną oraz realizacji transakcji.</p>
                
                <h4 style="color: var(--text-main); font-weight: 700;">§ 2 Składanie zamówień</h4>
                <p>Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu za pośrednictwem serwisu internetowego. Klient zobowiązany jest do podania prawidłowych danych teleadresowych.</p>
                
                <h4 style="color: var(--text-main); font-weight: 700;">§ 3 Ceny i Płatności</h4>
                <p>Wszystkie ceny podawane są w polskich złotych (PLN) i zawierają podatki. Sklep akceptuje płatności przelewem, kartą kredytową oraz kody promocyjne (np. RABAT10).</p>
                
                <h4 style="color: var(--text-main); font-weight: 700;">§ 4 Prawa konsumenta</h4>
                <p>Klient będący konsumentem ma prawo odstąpienia od umowy w terminie 30 dni od fizycznego odbioru towaru.</p>
            </div>
        `
    },
    privacy: {
        title: "🔒 Polityka prywatności i Cookies",
        html: `
            <div style="font-size: 4rem; text-align: center; margin-bottom: 20px;">🔒</div>
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; margin-bottom: 15px;">Polityka prywatności</h2>
            <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; line-height: 1.5; color: var(--text-muted); max-height: 300px; overflow-y: auto; padding-right: 8px;">
                <p>Twoje dane osobowe są u nas w 100% bezpieczne. Działamy w ścisłej zgodzie z przepisami RODO (GDPR):</p>
                
                <strong style="color: var(--text-main);">1. Administrator Danych Osobowych</strong>
                <p>Administratorem danych jest ABC Group S.A. z siedzibą w Warszawie.</p>
                
                <strong style="color: var(--text-main);">2. Cel przetwarzania</strong>
                <p>Dane są przetwarzane wyłącznie w celu pomyślnej realizacji zamówień, wysyłki newslettera (w przypadku wyrażenia zgody) oraz obsługi zgłoszeń.</p>
                
                <strong style="color: var(--text-main);">3. Pliki Cookies (Ciasteczka)</strong>
                <p>Wykorzystujemy pliki cookies, aby zapewnić sprawne funkcjonowanie koszyka, zapamiętać stan filtrów oraz analizować ruch w celu optymalizacji i stałego unowocześniania interfejsu.</p>
                
                <strong style="color: var(--text-main);">4. Twoje Prawa</strong>
                <p>Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia ("prawo do bycia zapomnianym") oraz ograniczenia ich przetwarzania.</p>
            </div>
        `
    }
};

document.querySelectorAll('[data-category-link]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const selectedCat = link.getAttribute('data-category-link');
        
        // Change category select control state
        categorySelect.value = selectedCat;
        filterAndSortProducts();
        
        // Scroll user smoothly to start of listings section
        const targetSection = document.getElementById('products-section');
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Dynamic info policy modal trigger for assistance links
document.querySelectorAll('[data-info-link]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const key = link.getAttribute('data-info-link');
        const policy = policyContents[key];
        if (!policy) return;

        modalBody.innerHTML = policy.html;

        // Make modal show up cleanly with transition animation
        productModal.style.display = "block";
        requestAnimationFrame(() => {
            productModal.classList.add('show');
        });
    });
});

// Run initial system cycles on DOM lifecycle load
filterAndSortProducts();
updateCartUI();
