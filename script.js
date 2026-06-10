
// 1. Baza danych 12 produktów ----------------------------------------------------------------------------------------------------
const products = [
    { id: 1, nazwa: "iPhone 16 Pro", cena: 3500, kategoria: "electronics", ocena: 4.8, opis: "Flagowy smartfon z tytanową obudową", img: "📱" },
    { id: 2, nazwa: "MacBook Air M5", cena: 4999, kategoria: "electronics", ocena: 4.9, opis: "Lekki laptop z czipem M3", img: "💻" },
    { id: 3, nazwa: "Bluza Hoodie Nike", cena: 99, kategoria: "clothes", ocena: 4.5, opis: "Wygodna bluza z kapturem", img: "🧥" },
    { id: 4, nazwa: "T-Shirt Oversize", cena: 40, kategoria: "clothes", ocena: 4.2, opis: "Luźny bawełniany t-shirt", img: "👕" },
    { id: 5, nazwa: "Wiedźmin: Ostatnie życzenie", cena: 25, kategoria: "books", ocena: 4.9, opis: "Pierwsza książka o Geralcie", img: "📚" },
    { id: 6, nazwa: "Słuchawki Sony XM5", cena: 350, kategoria: "electronics", ocena: 4.7, opis: "Słuchawki z redukcją hałasu", img: "🎧" },
    { id: 7, nazwa: "Buty Jordan 1", cena: 150, kategoria: "clothes", ocena: 4.6, opis: "Kultowe buty streetwearowe", img: "👟" },
    { id: 8, nazwa: "Clean Code", cena: 45, kategoria: "books", ocena: 4.8, opis: "Jak pisać czysty kod", img: "📖" },
    { id: 9, nazwa: "Apple Watch SE", cena: 499, kategoria: "electronics", ocena: 4.4, opis: "Inteligentny zegarek z EKG", img: "⌚" },
    { id: 10, nazwa: "Kurtka Puchowa Zimowa", cena: 220, kategoria: "clothes", ocena: 4.3, opis: "Ciepła kurtka na zimę", img: "🧥" },
    { id: 11, nazwa: "Głęboka praca", cena: 35, kategoria: "books", ocena: 4.6, opis: "Skupienie w świecie rozpraszaczy", img: "📘" },
    { id: 12, nazwa: "Plecak Miejski Kanken", cena: 85, kategoria: "clothes", ocena: 4.1, opis: "Klasyczny plecak Fjallraven", img: "🎒" }
];

// Inicjalizacja stanu koszyka z localStorage (jeśli jest pusty, dajemy pusta tablicę)
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentSortOrder = null; // Zmienna przechowująca aktualny typ sortowania
let currentDiscountPercentage = 0; // Wartość zniżki (np. 0.10 dla 10%)

// Słownik z jawnymi kodami rabatowymi i ich wartościami ułamkowymi
const discountCodes = {
    "RABAT10": 0.10,
    "PROMO20": 0.20,
    "STUDENT50": 0.50
};

// 2. Dom selectors (Pobieranie elementów z HTML)------------------------------------------------------------------------------
const cartButton = document.getElementById('cart-button');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartButton = document.getElementById('close-cart');
const productsContainer = document.getElementById('produkty');
const cartItemsContainer = document.getElementById('cart-items');
const cartCounterElement = document.getElementById('cart-counter');

// Filtry wejściowe
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');

// Sekcja podsumowania i kuponów
const couponInput = document.getElementById('coupon-input');
const applyDiscountButton = document.getElementById('apply-discount');
const couponMessage = document.getElementById('coupon-message');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartDiscountElement = document.getElementById('cart-discount');
const cartTotalElement = document.getElementById('cart-total');

// Dynamiczne tworzenie kontenera na powiadomienia Toast w drzewie DOM
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-notice';
document.body.appendChild(toastContainer);

// Elementy modalu
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

// 3. Otwieranie i zamykanie koszyka--------------------------------------------------------------------------------------------
// Funkcje anonimowe dla obsługi zdarzeń click
cartButton.addEventListener('click', function() {
    cartSidebar.classList.add('open');
});

closeCartButton.addEventListener('click', function() {
    cartSidebar.classList.remove('open');
});


// 4. Dynamiczne generowanie kart-------------------------------------------------------------------------------------------------
function displayProducts(productsArray) {
    // Czyszczenie kontenera przed ponownym renderowaniem
    productsContainer.innerHTML = "";

    // Sprawdzamy czy tablica nie jest pusta 
    if (productsArray.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-results">
                <h3>🔍 Brak wyników wyszukiwania</h3>
                <p>Niestety żaden z naszych produktów nie spełnia zaznaczonych przez Ciebie kryteriów filtracji. Spróbuj zmienić parametry wyszukiwania.</p>
            </div>
        `;
        return;
    }

    for (let i = 0; i < productsArray.length; i++) {
        const product = productsArray[i];
        
        // Obliczanie gwiazdek na podstawie oceny produktu
        const ratingStars = "⭐".repeat(Math.round(product.ocena)) + " (" + product.ocena + ")";
        
        // Struktura HTML pojedynczej karty produktu
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
        // Wstrzykiwanie wygenerowanej karty na koniec kontenera
        productsContainer.insertAdjacentHTML('beforeend', cardHTML);
    }
}

// 5. Filtrowanie i sortowanie w czasie rzeczywistym--------------------------------------------------------------------------------
function filterAndSortProducts() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;
    const maxPrice = parseInt(priceRange.value);

    // Stosowanie wszystkich filtrów jednocześnie za pomocą wymaganej metody .filter()
    let filtered = products.filter(function(product) {
        const matchesSearch = product.nazwa.toLowerCase().includes(searchText) ;
        const matchesCategory = (selectedCategory === 'all' || product.kategoria === selectedCategory);
        const matchesPrice = product.cena <= maxPrice;
        
        // Zwraca true tylko wtedy, gdy produkt spełnia absolutnie wszystkie 3 kryteria
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sortowanie tablicy na podstawie wybranego stanu przy użyciu metody .sort()
    if (currentSortOrder === 'asc') {
        filtered.sort(function(a, b) {
            return a.cena - b.cena; // Rosnąco po cenie
        });
    } else if (currentSortOrder === 'desc') {
        filtered.sort(function(a, b) {
            return b.cena - a.cena; // Malejąco po cenie
        });
    } else if (currentSortOrder === 'rating') {
        filtered.sort(function(a, b) {
            return b.ocena - a.ocena; // Od najwyższej oceny
        });
    } else if (currentSortOrder === 'alpha') {
        filtered.sort(function(a, b) {
            return a.nazwa.localeCompare(b.nazwa); // Alfabetycznie A-Z
        });
    }

    // Wywołanie funkcji renderującej przefiltrowane produkty
    displayProducts(filtered);

    // Aktualizacja podświetlenia linków kategorii w menu - w pętlę for
    const navLinks = document.querySelectorAll('#header-nav .nav-link, [data-category-link]');
    for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        if (link.getAttribute('data-category-link') === selectedCategory) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    }

    // Tablica kluczy konfiguracji przycisków sortowania do obsługi pętli
    const sortKeys = ['asc', 'desc', 'rating', 'alpha'];
    const sortButtonsConfig = {
        'asc': 'sort-asc',
        'desc': 'sort-desc',
        'rating': 'sort-rating',
        'alpha': 'sort-alpha'
    };
    
    // Zarządzanie stylami aktywnych przycisków sortowania za pomocą pętli for
    for (let i = 0; i < sortKeys.length; i++) {
        const key = sortKeys[i];
        const btnId = sortButtonsConfig[key];
        const btn = document.getElementById(btnId);
        
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
    }
}

//-------- Podpięcie zdarzeń wejściowych dla filtrów w czasie rzeczywistym -----------
searchInput.addEventListener('input', filterAndSortProducts);
categorySelect.addEventListener('change', filterAndSortProducts);
priceRange.addEventListener('input', function(e) {
    priceValue.innerText = e.target.value + " zł";
    filterAndSortProducts();
});

//--------------- Obsługa kliknięć w przyciski sortowania ------------------
document.getElementById('sort-asc').addEventListener('click', function() { 
    if (currentSortOrder === 'asc') {
        currentSortOrder = null;
    } else {
        currentSortOrder = 'asc';
    }
    filterAndSortProducts(); 
});

document.getElementById('sort-desc').addEventListener('click', function() { 
    if (currentSortOrder === 'desc') {
        currentSortOrder = null;
    } else {
        currentSortOrder = 'desc';
    }
    filterAndSortProducts(); 
});

document.getElementById('sort-rating').addEventListener('click', function() { 
    if (currentSortOrder === 'rating') {
        currentSortOrder = null;
    } else {
        currentSortOrder = 'rating';
    }
    filterAndSortProducts(); 
});

document.getElementById('sort-alpha').addEventListener('click', function() { 
    if (currentSortOrder === 'alpha') {
        currentSortOrder = null;
    } else {
        currentSortOrder = 'alpha';
    }
    filterAndSortProducts(); 
});


// 6. Funkcja otwierająca modal z szczegółami produktu-------------------------------------------------------------------------------------------------------------
function openModal(productId) {
    // ---Znajdź produkt po id----
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    //---------- Oblicz gwiazdki--------
    const ratingStars = "⭐".repeat(Math.round(product.ocena)) + " (" + product.ocena + ")";
    
    //------ Generuj HTML dla modala----
    modalBody.innerHTML = `
        <div class="modal-product-details">
            <div style="font-size: 4rem; text-align: center; margin-bottom: 10px;">${product.img}</div>
            <h2>${product.nazwa}</h2>
            <div class="modal-category">
                <span>${product.kategoria}</span>
            </div>
            <div class="product-rating" style="margin: 10px 0;">${ratingStars}</div>
            <div class="modal-desc">
                <strong>📝 Opis produktu:</strong><br>
                ${product.opis || "Brak szczegółowego opisu."}
            </div>
            <div class="modal-price">${product.cena} zł</div>
            <button class="modal-add-btn" data-id="${product.id}">📦 Dodaj do koszyka</button>
        </div>
    `;
    
    // Pokaż modal
    modal.style.display = "block";
    modal.style.opacity = "1";
    modal.style.zIndex = "2000";
    
    // Obsługa kliknięcia przycisku dodaj do koszyka w modalu
    const modalAddBtn = modalBody.querySelector('.modal-add-btn');
    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            
            if (product) {
                const cartItem = cart.find(item => item.produktId === productId);
                if (cartItem) {
                    cartItem.ilosc += 1;
                } else {
                    cart.push({ produktId: productId, ilosc: 1 });
                }
                
                //----- Animacja i toast---------
                const sourceElement = this;
                animateProductFly(sourceElement, product.img);
                showToast(`⭐ Dodano <strong>${product.nazwa}</strong> do koszyka!`);
                updateCartUI();
                
                // Zamknij modal po dodaniu
                closeModal();
            }
        });
    }
}

//-------------------- Funkcja zamykająca modal-----------------------
function closeModal() {
    modal.style.display = "none";
    modal.style.opacity = "0";
    modal.style.zIndex = "-1";
}

// Nasłuchiwanie na przycisk zamknięcia
closeModalBtn.addEventListener('click', closeModal);

// Kliknięcie poza modalem również zamyka
modal.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});


// 7. Silnik zarządzania koszykiem-------------------------------------------------------------------------------------------
function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;
    let totalItemsCount = 0;

    // Używamy pętli for...of oraz nowoczesnej metody .find().
    for (const item of cart) {
        const product = products.find(p => p.id === item.produktId);
        
        if (product) {
            subtotal += product.cena * item.ilosc;
            totalItemsCount += item.ilosc;

        
            cartItemsContainer.insertAdjacentHTML('beforeend', `
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
            `);
        }
    }

    // --------- Renderowanie pustego koszyka ------------
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px 10px;">
                <span style="font-size: 3rem; display: block; margin-bottom: 10px;">🛒</span>
                <p>Twój koszyk jest pusty.</p>
                <small style="display: block; margin-top: 5px; color: var(--text-light)">Dodaj produkty, aby rozpocząć zamówienie!</small>
            </div>
        `;
    }

    const discountValue = subtotal * currentDiscountPercentage;
    const finalTotal = subtotal - discountValue;

    // Bezpieczne i czytelne wstawianie wartości za pomocą łańcuchów szablonowych
    cartCounterElement.innerText = totalItemsCount;
    cartSubtotalElement.innerText = `${subtotal} zł`;
    cartDiscountElement.innerText = `-${discountValue.toFixed(0)} zł`;
    cartTotalElement.innerText = `${finalTotal.toFixed(0)} zł`;

    localStorage.setItem('cart', JSON.stringify(cart));
}

function showToast(message) {
    toastContainer.innerHTML = message;
    toastContainer.classList.add('show');
    setTimeout(() => toastContainer.classList.remove('show'), 2500);
}

// ------------- Optymalizacja interpolacji ciągów znaków w animacji ---------------
function animateProductFly(sourceElement, productEmoji) {
    const cartBtnRect = cartButton.getBoundingClientRect();
    const sourceRect = sourceElement.getBoundingClientRect();

    const particle = document.createElement('div');
    particle.className = 'flying-particle';
    particle.innerText = productEmoji;
    particle.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
    particle.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
    document.body.appendChild(particle);

    setTimeout(() => {
        const destX = cartBtnRect.left + cartBtnRect.width / 2;
        const destY = cartBtnRect.top + cartBtnRect.height / 2;
        particle.style.transform = `translate(${destX - sourceRect.left - sourceRect.width / 2}px, ${destY - sourceRect.top - sourceRect.height / 2}px) scale(0.3)`;
        particle.style.opacity = "0.2";
    }, 50);

    setTimeout(() => {
        particle.remove();
        cartButton.style.transform = "scale(1.1)";
        setTimeout(() => cartButton.style.transform = "", 150);
    }, 850);
}

// Optymalizacja interpolacji ciągów znaków w animacji
productsContainer.addEventListener('click', function(event) {
    const cartBtnObj = event.target.closest('.add-to-cart-btn');
    
    if (cartBtnObj) {
        event.stopPropagation();
        const productId = parseInt(cartBtnObj.getAttribute('data-id'));
        const product = products.find(p => p.id === productId);

        if (product) {
            const cartItem = cart.find(item => item.produktId === productId);

            if (cartItem) {
                cartItem.ilosc += 1;
            } else {
                cart.push({ produktId: productId, ilosc: 1 });
            }
            
            animateProductFly(cartBtnObj, product.img);
            showToast(`⭐ Dodano <strong>${product.nazwa}</strong> do koszyka!`);//-----------------!
            updateCartUI();
        }
    } else {
        const card = event.target.closest('.product-card');
        if (card) {
            openModal(parseInt(card.getAttribute('data-product-id')));
        }
    }
});

// ---------------Delegacja zdarzeń: dodawanie, odejmowanie oraz usuwanie w samym koszyku------------
cartItemsContainer.addEventListener('click', function(event) {
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


// 8. Walidacja kuponów rabatowych----------------------------------------------------------------------------------------------
applyDiscountButton.addEventListener('click', function() {
    const code = couponInput.value.trim().toUpperCase();

    // Sprawdzanie czy podany klucz tekstowy znajduje się wewnątrz obiektu bazy kodów rabatowych
    if (discountCodes.hasOwnProperty(code)) {
        currentDiscountPercentage = discountCodes[code];
        couponMessage.innerHTML = "🎉 Code: <strong>" + code + "</strong> is active! Discount of " + (currentDiscountPercentage * 100) + "% applied.";
        couponMessage.className = "success-msg";
    } else {
        currentDiscountPercentage = 0;
        couponMessage.innerHTML = "❌ Błąd: Podany kod jest nieważny lub wygasł.";
        couponMessage.className = "error-msg";
    }
    updateCartUI();
});

// 9. stopka---------------------------------------------------------------------------------------------------
// Podpięcie zdarzeń kliknięcia dla szybkiej nawigacji po kategoriach - zamiana forEach na pętlę for
const categoryLinks = document.querySelectorAll('[data-category-link]');
for (let i = 0; i < categoryLinks.length; i++) {
    const link = categoryLinks[i];
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const selectedCat = link.getAttribute('data-category-link');
        
        // Zmiana wartości w selektorze i uruchomienie ponownego filtrowania
        categorySelect.value = selectedCat;
        filterAndSortProducts();
        
        // Płynne przewijanie widoku użytkownika do sekcji z listą produktów
        const targetSection = document.getElementById('products-section');
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ---------------------Uruchomienie cyklu inicjalizacji aplikacji przy pierwszym ładowaniu drzewa DOM---------------
filterAndSortProducts();
updateCartUI();