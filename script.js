// Product Data (Same as previous - includes INR currency and prices)
const products = [
    { id: 1, name: "Tomatoes (1kg)", price: 40.00, rating: 4.5, image: "Tomato.jpg", category: "vegetables" },
    { id: 2, name: "Apples (1kg)", price: 80.00, rating: 4.8, image: "Apple.png", category: "fruits" },
    { id: 3, name: "Amul Taaza Milk (1 Litre)", price: 60.00, rating: 4.5, image: "Milk.jpg", category: "dairy" },
    { id: 4, name: "Carrots (500g)", price: 30.00, rating: 4.0, image: "Carrot.jpg", category: "vegetables" },
    { id: 5, name: "Brown Rice (1kg Sona Masoori)", price: 75.00, rating: 4.7, image: "Rice .jpg", category: "grains" },
    { id: 6, name: "Bananas (1 Dozen)", price: 50.00, rating: 4.6, image: "Banana.jpg", category: "fruits" },
    { id: 7, name: "Broccoli (1 kg)", price: 80.00, rating: 4.3, image: "Broccoli.jpg", category: "vegetables" },
    { id: 8, name: "Orange (1kg)", price: 60.00, rating: 4.7, image: "orange.jpg", category: "fruits" },
    { id: 9, name: "Amul Masti Dahi (400g Cup)", price: 20.00, rating: 4.1, image: "Dahi.jpg", category: "dairy" },
    { id: 10, name: "Brown Bread (400g)", price: 35.00, rating: 4.4, image: "Brown Bread .jpg", category: "grains" },
    { id: 10, name: "50-50 Golmaal(100g)", price: 30.00, rating: 4.4, image: "50-50.jpg", category: "Biscuits" }

];

// DOM Elements
const body = document.body; // Get the body element
const productContainer = document.getElementById("product-container");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountSpan = document.getElementById("cart-count");
const cartSummaryDiv = document.getElementById("cart-summary");
const summaryTotalItemsSpan = document.getElementById("summary-total-items");
const summarySubtotalSpan = document.getElementById("summary-subtotal");
const proceedToCheckoutButton = document.getElementById("proceed-to-checkout");
const paymentSection = document.getElementById("payment");
const categoryButtons = document.querySelectorAll(".category-btn");
const searchInput = document.getElementById("search-input");
const searchClearButton = document.getElementById("search-clear");
const noProductsFoundMessage = document.getElementById("no-products-found");
const mobileMenuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const contactForm = document.getElementById("contact-form");
const paymentForm = document.getElementById("payment-form");
const themeToggle = document.getElementById('theme-toggle'); // Get the theme toggle button
const themeToggleIcon = themeToggle ? themeToggle.querySelector('i') : null; // Get the icon

let cart = [];
let currentCategory = 'all';
let searchTerm = '';

// --- Utility Functions ---

// Function to generate star rating HTML (includes half stars and empty stars)
function generateRatingHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    let ratingHTML = '';
    for (let i = 0; i < fullStars; i++) ratingHTML += '<i class="fa fa-star"></i>';
    if (halfStar) ratingHTML += '<i class="fa fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) ratingHTML += '<i class="fa fa-regular fa-star"></i>'; // Use regular for empty
    return ratingHTML;
}


// Function to save cart to localStorage
function saveCart() {
    localStorage.setItem('freshbasket_cart', JSON.stringify(cart));
}

// Function to load cart from localStorage
function loadCart() {
    const storedCart = localStorage.getItem('freshbasket_cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
    updateCartDisplay();
}

// Function to save theme preference to localStorage
function saveThemePreference(theme) {
    localStorage.setItem('freshbasket_theme', theme);
}

// Function to load theme preference from localStorage
function loadThemePreference() {
    const storedTheme = localStorage.getItem('freshbasket_theme');
    if (storedTheme) {
        body.setAttribute('data-theme', storedTheme);
        updateThemeToggleIcon(storedTheme);
    } else {
        // Default to light theme if no preference is stored
        body.setAttribute('data-theme', 'light');
        updateThemeToggleIcon('light');
    }
}

// Function to update the theme toggle icon
function updateThemeToggleIcon(theme) {
    if (themeToggleIcon) {
        if (theme === 'dark') {
            themeToggleIcon.classList.remove('fa-moon');
            themeToggleIcon.classList.add('fa-sun');
            themeToggle.setAttribute('aria-label', 'Toggle light mode');
        } else {
            themeToggleIcon.classList.remove('fa-sun');
            themeToggleIcon.classList.add('fa-moon');
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        }
    }
}


// --- Product Display and Filtering ---

// Filter products based on category and search term
function filterProducts() {
    return products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = searchTerm === '' ||
                              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              product.category.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });
}

// Render products onto the page
function renderProducts() {
    const filtered = filterProducts();
    productContainer.innerHTML = '';

    if (filtered.length === 0) {
        noProductsFoundMessage.classList.remove('hidden');
    } else {
         noProductsFoundMessage.classList.add('hidden');
        filtered.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("product-item");
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <div class="rating">${generateRatingHTML(item.rating)}</div>
                <p class="price">₹${item.price.toFixed(2)}</p>
                <label for="qty-${item.id}">Quantity:</label>
                <input type="number" id="qty-${item.id}" min="1" max="99" value="1">
                <button class="btn btn-primary add-to-cart-button" data-product-id="${item.id}">
                    <i class="fa fa-cart-plus"></i> Add to Cart
                </button>
            `;
            productContainer.appendChild(card);
        });
    }

    attachAddToCartListeners();
}

// --- Cart Functionality ---

// Add product to cart
function addToCart(event) {
    const button = event.target.closest('.add-to-cart-button');
    if (!button) return;

    const productId = parseInt(button.dataset.productId);
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value);

    if (quantity > 0) {
        const product = products.find(p => p.id === productId);
        const existingItemIndex = cart.findIndex(item => item.id === productId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }

        updateCartDisplay();
        saveCart();
        console.log(`${quantity} of ${product.name} added to cart.`);

        if (quantityInput) quantityInput.value = 1;
    } else {
        alert("Please enter a valid quantity (at least 1).");
    }
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCart();
}

// Update the cart display on the page
function updateCartDisplay() {
    cartItemsContainer.innerHTML = '';
    let totalItems = 0;
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
        cartSummaryDiv.classList.add('hidden');
    } else {
        cart.forEach(item => {
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-quantity">Qty: ${item.quantity}</div>
                <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-from-cart" aria-label="Remove ${item.name}" title="Remove">
                    <i class="fa fa-trash"></i>
                </button>
            `;
             itemElement.querySelector('.remove-from-cart').onclick = () => removeFromCart(item.id);
            cartItemsContainer.appendChild(itemElement);
        });
        cartSummaryDiv.classList.remove('hidden');
    }

    if (cartCountSpan) cartCountSpan.textContent = totalItems;
    if (summaryTotalItemsSpan) summaryTotalItemsSpan.textContent = totalItems;
    if (summarySubtotalSpan) summarySubtotalSpan.textContent = subtotal.toFixed(2);
}


// --- Event Listeners ---

function attachAddToCartListeners() {
     document.querySelectorAll('.add-to-cart-button').forEach(button => {
       button.removeEventListener('click', addToCart);
       button.addEventListener('click', addToCart);
     });
}

// Category filter buttons
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        renderProducts();
    });
});

// Search input
searchInput.addEventListener('input', (event) => {
    searchTerm = event.target.value.trim();
    if (searchTerm.length > 0) {
        searchClearButton.style.display = 'block';
    } else {
        searchClearButton.style.display = 'none';
    }
    renderProducts();
});

// Search clear button
searchClearButton.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    searchClearButton.style.display = 'none';
    renderProducts();
});


// Theme toggle button
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        updateThemeToggleIcon(newTheme);
        saveThemePreference(newTheme);
    });
}

// Proceed to Checkout button handler
if (proceedToCheckoutButton) {
    proceedToCheckoutButton.addEventListener('click', function() {
        if (cart.length === 0) {
            alert("Your cart is empty. Add some products first!");
            return;
        }
        document.getElementById('cart').classList.add('hidden');
        paymentSection.classList.remove('hidden');
        paymentSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Payment Form Submission (Placeholder)
if (paymentForm) {
    paymentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (paymentForm.checkValidity()) {
             const cardNumber = document.getElementById('card-number').value.trim();
             const expiryDate = document.getElementById('expiry-date').value.trim();
             const cvv = document.getElementById('cvv').value.trim();
             const cardName = document.getElementById('card-name').value.trim();

             console.log("Processing payment for cart:", cart);
             console.log("Payment details (NOT SECURELY HANDLED HERE):", { cardNumber, expiryDate, cvv, cardName });

             // Simulate successful payment (replace with actual gateway response handling)
             alert("Payment successful! Thank you for your order.");

             cart = [];
             saveCart();
             updateCartDisplay();

             paymentSection.classList.add('hidden');
             document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        } else {
             console.log("Payment form validation failed.");
             alert("Please fill out all required fields correctly.");
        }
    });
}

// Mobile menu toggle
if (mobileMenuToggle && siteNav) {
    mobileMenuToggle.addEventListener('click', () => {
        siteNav.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        const isExpanded = siteNav.classList.contains('active');
        icon.classList.toggle('fa-bars', !isExpanded);
        icon.classList.toggle('fa-times', isExpanded);
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when a link is clicked (for smooth scrolling)
    siteNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (siteNav.classList.contains('active')) {
                 siteNav.classList.remove('active');
                 const icon = mobileMenuToggle.querySelector('i');
                 icon.classList.remove('fa-times');
                 icon.classList.add('fa-bars');
                 mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// Contact form submission (Placeholder)
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (contactForm.checkValidity()) {
             console.log("Contact form submitted.");
             alert("Thank you for your message! We will get back to you soon.");
             contactForm.reset();
        } else {
            console.log("Contact form validation failed.");
        }
    });
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Get the header height dynamically
            const headerOffset = document.querySelector('.site-header').offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Handle the "Write a Review" placeholder button
const writeReviewBtn = document.querySelector('.write-review-btn');
if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent navigating to #
        alert("Thank you for your interest in writing a review! This feature requires a customer account and purchase verification. Clicking this button would Redirect you to a review submission page or form.");
    });
}


// --- Initial Load ---

document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference(); // Load theme preference first
    loadCart();
    renderProducts();
});