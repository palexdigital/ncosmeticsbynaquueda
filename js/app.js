const storeLinks = {
  yagaStore: "#",
  contact: "#",
  defaultContact: "#",
  purchase: "#"
};

const imageLibrary = {
  highShine: [
    "https://images.unsplash.com/photo-1617422275558-e5f6163026b4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80"
  ],
  lipOil: [
    "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1599733589046-10c005739ef9?auto=format&fit=crop&w=900&q=80"
  ],
  shimmer: [
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=900&q=80"
  ]
};

const products = [
  {
    id: "crystal-clear",
    name: "Glass Tint Crystal Clear",
    category: "High-Shine Gloss",
    price: 220,
    images: imageLibrary.highShine,
    buyUrl: storeLinks.yagaStore,
    description: "The ultimate hyper-reflective high-shine sheer experience.",
    specs: ["Infused with Rosehip Extract", "Non-sticky comfort feel", "Hypoallergenic", "Long-wear mirror finish"]
  },
  {
    id: "rose-elixir",
    name: "Revitalizing Rose Elixir Oil",
    category: "Nourishing Lip Oil",
    price: 250,
    images: imageLibrary.lipOil,
    buyUrl: storeLinks.yagaStore,
    description: "Deep conditioning treatment with a lovely blushing pink tint.",
    specs: ["Organic Pure Jojoba Base", "Intense skin cell repair", "Natural light scent", "Satin glow effect"]
  },
  {
    id: "golden-dust",
    name: "Golden Dust Diamond Shimmer",
    category: "Shimmer Topper",
    price: 240,
    images: imageLibrary.shimmer,
    buyUrl: storeLinks.yagaStore,
    description: "Multi-dimensional gold micro-pearls that reflect incoming lighting elegantly.",
    specs: ["Reflective glass mineral beads", "Wear alone or as top coat", "Vanilla infused balm balm", "Comfort cloud applicator"]
  },
  {
    id: "velvet-mauve",
    name: "Velvet Mauve Plumping Balm",
    category: "High-Shine Gloss",
    price: 260,
    images: imageLibrary.highShine,
    buyUrl: storeLinks.yagaStore,
    description: "A gorgeous deep warm tint with deep structural plumping hydration.",
    specs: ["Peptide enriched serum base", "Slight tingling sensation", "Sober elegant tone", "Moisture locking shield"]
  }
];

const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0
});

const state = {
  cart: JSON.parse(localStorage.getItem("luxeglowCart") || "[]"),
  search: "",
  category: "all",
  sort: "featured",
  activeProductId: null,
  activeImageIndex: 0
};

const productGrid = document.querySelector("#productGrid");
const categoryFilter = document.querySelector("#categoryFilter");
const searchInput = document.querySelector("#searchInput");
const sortFilter = document.querySelector("#sortFilter");
const cartPanel = document.querySelector("[data-cart-panel]");
const cartItems = document.querySelector("[data-cart-items]");
const cartTotal = document.querySelector("[data-cart-total]");
const purchaseButton = document.querySelector("[data-purchase-button]");
const productDialog = document.querySelector("[data-product-dialog]");
const productDetail = document.querySelector("[data-product-detail]");

function saveCart() {
  localStorage.setItem("luxeglowCart", JSON.stringify(state.cart));
}

function formatPrice(value) {
  return currency.format(value).replace("ZAR", "R");
}

function primaryImage(product) {
  return product.images[0];
}

function getCartProduct(item) {
  return products.find((product) => product.id === item.id);
}

function cartTotalValue() {
  return state.cart.reduce((total, item) => {
    const product = getCartProduct(item);
    return product ? total + product.price : total;
  }, 0);
}

function renderCategories() {
  const categories = [...new Set(products.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

function renderProducts() {
  let visibleProducts = products.filter((product) => {
    const matchesSearch = [product.name, product.category, product.description].join(" ").toLowerCase().includes(state.search.toLowerCase());
    const matchesCategory = state.category === "all" || product.category === state.category;
    return matchesSearch && matchesCategory;
  });

  visibleProducts = [...visibleProducts].sort((a, b) => {
    if (state.sort === "price-low") return a.price - b.price;
    if (state.sort === "price-high") return b.price - a.price;
    if (state.sort === "name") return a.name.localeCompare(b.name);
    return products.indexOf(a) - products.indexOf(b);
  });

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<div class="empty-state"><h3>No products found.</h3><p>Try a different search query or filter finish.</p></div>';
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <button class="product-media" type="button" data-view-product="${product.id}" aria-label="View ${product.name} details">
        <img src="${primaryImage(product)}" alt="${product.name}">
        <span class="save-dot" aria-hidden="true">&#9825;</span>
      </button>
      <div class="product-copy">
        <h3>${product.name}</h3>
        <p>${product.category}</p>
        <strong class="product-price">${formatPrice(product.price)}</strong>
        <div class="product-actions">
          <button class="pill-button small" type="button" data-add-to-cart="${product.id}">Add to bag</button>
          <a class="pill-button small" href="${product.buyUrl}">Buy</a>
          <button class="ghost-button" type="button" data-view-product="${product.id}">Details</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const count = state.cart.length;
  document.querySelectorAll("[data-cart-count]").forEach((item) => {
    item.textContent = count;
  });

  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="empty-state"><h3>Your bag is empty.</h3><p>Select products from our catalog grid.</p></div>';
  } else {
    cartItems.innerHTML = state.cart.map((item) => {
      const product = getCartProduct(item);
      if (!product) return "";
      return `
        <article class="cart-item">
          <img src="${primaryImage(product)}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p>${formatPrice(product.price)}</p>
            <a href="${product.buyUrl}">View item link</a>
          </div>
          <button class="remove-x" type="button" data-remove="${product.id}" aria-label="Remove ${product.name}">&times;</button>
        </article>
      `;
    }).join("");
  }

  cartTotal.textContent = formatPrice(cartTotalValue());
  purchaseButton.href = storeLinks.purchase;
  purchaseButton.classList.toggle("disabled", !state.cart.length);
  saveCart();
}

function addToCart(id) {
  if (!state.cart.some((item) => item.id === id)) {
    state.cart.push({ id });
  }
  renderCart();
  openCart();
}

function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

function changeProductImage(amount) {
  const product = products.find((item) => item.id === state.activeProductId);
  if (!product) return;
  state.activeImageIndex = (state.activeImageIndex + amount + product.images.length) % product.images.length;
  showProduct(product.id, state.activeImageIndex);
}

function showProduct(id, imageIndex = 0) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  state.activeProductId = id;
  state.activeImageIndex = imageIndex;
  productDetail.innerHTML = `
    <article class="product-detail">
      <div class="gallery">
        <img src="${product.images[imageIndex]}" alt="${product.name}">
        <div class="gallery-controls">
          <button type="button" data-gallery-prev aria-label="Previous photo">&#8249;</button>
          <span>${imageIndex + 1} / ${product.images.length}</span>
          <button type="button" data-gallery-next aria-label="Next photo">&#8250;</button>
        </div>
      </div>
      <div>
        <p class="eyebrow dark">${product.category}</p>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <ul class="spec-list">
          ${product.specs.map((spec) => `<li>${spec}</li>`).join("")}
        </ul>
        <strong class="product-price">${formatPrice(product.price)}</strong>
        <div class="product-actions">
          <button class="pill-button" type="button" data-add-to-cart="${product.id}">Add to bag</button>
          <a class="pill-button" href="${product.buyUrl}">Buy item</a>
        </div>
      </div>
    </article>
  `;
  if (!productDialog.open) productDialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeProductDialog() {
  productDialog.close();
  document.body.classList.remove("dialog-open");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  const viewButton = event.target.closest("[data-view-product]");
  const removeButton = event.target.closest("[data-remove]");
  const previousButton = event.target.closest("[data-gallery-prev]");
  const nextButton = event.target.closest("[data-gallery-next]");

  if (addButton) addToCart(addButton.dataset.addToCart);
  if (viewButton) showProduct(viewButton.dataset.viewProduct);
  if (previousButton) changeProductImage(-1);
  if (nextButton) changeProductImage(1);
  if (removeButton) {
    state.cart = state.cart.filter((item) => item.id !== removeButton.dataset.remove);
    renderCart();
  }
});

document.querySelector("[data-open-search]").addEventListener("click", () => {
  document.querySelector("#store").scrollIntoView({ behavior: "smooth" });
  searchInput.focus();
});

document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));
document.querySelector("[data-close-product]").addEventListener("click", closeProductDialog);

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

categoryFilter.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

sortFilter.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

document.querySelector(".nav-toggle").addEventListener("click", (event) => {
  const navLinks = document.querySelector("#primary-nav");
  const isOpen = navLinks.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    if (productDialog.open) closeProductDialog();
  }
});

renderCategories();
renderProducts();
renderCart();
