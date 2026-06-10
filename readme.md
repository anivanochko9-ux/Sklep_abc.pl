# 🛒 Projekt: Sklep internetowy "abc.pl"

## Część 1: Opis projektu i jego funkcjonalności

**abc.pl** to nowoczesna, responsywna (RWD) aplikacja sklepu internetowego, stworzona przy użyciu czystego HTML, CSS oraz JavaScript (Vanilla JS), bez wykorzystania zewnętrznych bibliotek czy frameworków. Projekt został zrealizowany jako zadanie zaliczeniowe, aby zaprezentować umiejętności pracy z modelem DOM, zdarzeniami (events) oraz pamięcią przeglądarki (localStorage).

### 🌟 Główne funkcje (Features) aplikacji:

1. **Dynamiczny katalog produktów:** Karty produktów są generowane na stronie automatycznie za pomocą JavaScriptu na podstawie przygotowanej "bazy danych" (tablicy obiektów).
2. **Zaawansowany system filtrowania i sortowania:**
   - **Wyszukiwarka:** Wyszukiwanie "na żywo" (Live search) po nazwie lub opisie produktu.
   - **Kategorie:** Filtrowanie po typie (Elektronika, Odzież, Książki).
   - **Cena:** Interaktywny suwak (range slider) do ustalania maksymalnej ceny.
   - **Sortowanie:** Możliwość posortowania produktów po cenie (rosnąco/malejąco), ocenie lub alfabetycznie.
   - _Wszystkie filtry działają jednocześnie w czasie rzeczywistym._
3. **Interaktywny koszyk (Shopping Cart):**
   - Dodawanie produktów do koszyka bez przeładowywania strony.
   - Zmiana ilości sztuk (+ / -) oraz usuwanie produktów.
   - Automatyczne przeliczanie całkowitej kwoty i liczby przedmiotów.
   - **Trwałość danych:** Stan koszyka jest zapisywany w `localStorage`, dzięki czemu po odświeżeniu strony produkty nie znikają.
4. **System kodów rabatowych:** Możliwość zastosowania zniżki (np. `RABAT10` lub `STUDENT50`), która automatycznie przelicza cenę finalną.
5. **Nowoczesny UI/UX (Interfejs i doświadczenie użytkownika):**
   - Animacja "lotu" produktu do koszyka po kliknięciu przycisku "Dodaj".
   - Wyskakujące powiadomienia (Toast notifications) o pomyślnym dodaniu produktu.
   - Płynnie wysuwany panel boczny koszyka (Sidebar).

---

## Część 2: Architektura kodu (Ściąga na obronę projektu)

_Ta część pomoże Ci płynnie wytłumaczyć prowadzącemu, jak Twój kod działa "pod maską"._

### 1. Baza danych i stan aplikacji

- **`products`**: To tablica obiektów. Każdy obiekt reprezentuje pojedynczy produkt z jego właściwościami (id, nazwa, cena, kategoria itp.). Jest to symulacja danych, które w prawdziwej aplikacji pobralibyśmy z backendu (serwera).
- **`cart`**: Tablica przechowująca aktualny stan naszego koszyka. Przy ładowaniu strony próbujemy pobrać ją z `localStorage` (pamięci przeglądarki). Jeśli jest pusta, inicjalizujemy ją jako pustą tablicę `[]`.
- **`currentSortOrder` / `currentDiscountPercentage`**: Zmienne globalne, które przechowują informację o tym, jakie sortowanie jest obecnie włączone i jaka zniżka została zaaplikowana.

### 2. Główne funkcje (Jak to działa)

#### `displayProducts(productsArray)`

**Co robi:** Renderuje (rysuje) karty produktów na ekranie.
**Jak wytłumaczyć na obronie:**

> "Funkcja ta przyjmuje tablicę produktów. Na początku czyści kontener (`innerHTML = ""`). Jeśli tablica jest pusta (brak wyników wyszukiwania), wyświetla stosowny komunikat. Następnie, używając klasycznej pętli `for`, przechodzi przez każdy produkt, buduje strukturę HTML za pomocą _template literals_ (szablonów ciągów znaków z użyciem backticków) i wstawia ją do drzewa DOM za pomocą metody `insertAdjacentHTML`. Jest to wydajniejsze i bezpieczniejsze niż ciągłe dodawanie stringów przez `innerHTML +=`."

#### `filterAndSortProducts()`

**Co robi:** Filtruje i sortuje produkty. Wywołuje się za każdym razem, gdy użytkownik coś wpisze, przesunie suwak lub kliknie sortowanie.
**Jak wytłumaczyć na obronie:**

> "To serce logiki wyświetlania. Najpierw pobieram wartości ze wszystkich inputów (wyszukiwarka, kategoria, cena). Następnie używam metody tablicowej `.filter()`. Produkt przechodzi przez filtr tylko wtedy, gdy spełnia **wszystkie trzy** warunki jednocześnie (użyłem operatora logicznego `&&`). Następnie, jeśli wybrano sortowanie, używam metody `.sort()`, która porównuje ceny, oceny lub nazwy. Na koniec przekazuję przefiltrowaną tablicę do funkcji `displayProducts`."

#### `updateCartUI()`

**Co robi:** Aktualizuje widok koszyka i zapisuje dane.
**Jak wytłumaczyć na obronie:**

> "Funkcja iteruje po tablicy `cart` za pomocą nowoczesnej pętli `for...of`. Dla każdego elementu w koszyku szuka pełnych informacji o produkcie w głównej tablicy `products` przy użyciu metody `.find()`. Następnie oblicza sumę (`subtotal`) i generuje HTML dla listy w koszyku. Na koniec wylicza zniżkę, aktualizuje teksty w DOM i, co najważniejsze, zapisuje zaktualizowany stan koszyka w `localStorage` za pomocą `JSON.stringify()`."

### 3. Efekty wizualne (UI/UX)

#### `showToast(message)`

**Co robi:** Wyświetla powiadomienie na dole ekranu.
**Jak wytłumaczyć:**

> "Funkcja dodaje klasę `show` do elementu powiadomienia, co uruchamia animację CSS (pojawienie się). Aby powiadomienie zniknęło, używam asynchronicznej funkcji `setTimeout`, która po 2.5 sekundy (2500 ms) usuwa tę klasę."

#### `animateProductFly(sourceElement, productEmoji)`

**Co robi:** Tworzy efekt lecącego produktu do koszyka.
**Jak wytłumaczyć:**

> "Używam metody `getBoundingClientRect()`, aby pobrać dokładne współrzędne (X, Y) przycisku 'Dodaj' oraz ikony koszyka na ekranie. Następnie tworzę tymczasowy element (div z emotką), ustawiam go w miejscu przycisku i za pomocą właściwości CSS `transform: translate` wysyłam go do współrzędnych koszyka. Po zakończeniu animacji element jest usuwany z drzewa DOM."

### 4. Delegacja zdarzeń (Event Delegation)

> "Zamiast przypisywać `addEventListener` do każdego pojedynczego przycisku 'Dodaj do koszyka' (co obciążałoby pamięć przeglądarki), zastosowałem wzorzec **Delegacji Zdarzeń (Event Delegation)**. Podpiąłem jeden nasłuchiwacz (listener) na cały główny kontener `productsContainer`. Kiedy następuje kliknięcie, sprawdzam za pomocą metody `event.target.closest()`, czy kliknięto właśnie w przycisk. Dzięki temu kod działa poprawnie nawet dla elementów, które są generowane dynamicznie w JavaScript."

Ten sam wzorzec (delegacja) został użyty wewnątrz koszyka dla przycisków `+`, `-` oraz `x` (usuń).

### 5. Obsługa kodów rabatowych

> "Stworzyłem obiekt (słownik) `discountCodes`, gdzie kluczami są nazwy kodów (np. 'RABAT10'), a wartościami ułamki dziesiętne reprezentujące zniżkę (0.10). Po kliknięciu 'Zastosuj', sprawdzam czy wpisany tekst istnieje jako klucz w tym obiekcie za pomocą metody `hasOwnProperty()`. Jeśli tak – przypisuję zniżkę i wywołuję `updateCartUI()`."
