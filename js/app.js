const storeLinks = {
  yagaStore: "https://www.instagram.com/ncosmeticsbynaquueda/",
  contact: "https://www.instagram.com/ncosmeticsbynaquueda/",
  purchase: "https://www.instagram.com/ncosmeticsbynaquueda/"
};

// Premium high-res editable product photography array assignments
const products = [
  {
    id: "nude-bomb-gloss",
    name: "Signature Bomb Nude Gloss",
    category: "Lip Gloss Finishes",
    price: 240,
    images: [
      "https://images.unsplash.com/photo-1617422275558-e5f6163026b4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80" // Secondary angle slot
    ],
    buyUrl: storeLinks.yagaStore,
    description: "The crown jewel of our collection. A high-reflectance glass finish that cushions lips in comfortable warm nude hues.",
    specs: ["Vitamin E infused", "Non-sticky shine layer", "Long-lasting weightless cushion", "Vanilla orchid scent"]
  },
  {
    id: "hydrating-lip-oil",
    name: "Rose Infused Treatment Elixir",
    category: "Nourishing Lip Oils",
    price: 260,
    images: [
      "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1599733589046-10c005739ef9?auto=format&fit=crop&w=900&q=80" // Swatch/packaging detail slot
    ],
    buyUrl: storeLinks.yagaStore,
    description: "Deep skin barrier conditioning layer that shifts with your natural pH level to form a bespoke blush finish.",
    specs: ["Pure botanical oil base", "Protects against dehydration", "Satin tint glow look", "Dermatologically checked"]
  },
  {
    id: "diamond-shimmer-coat",
    name: "Glow Dust Metallic Top-Coat",
    category: "Shimmer Toppers",
    price: 280,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=900&q=80"
    ],
    buyUrl: storeLinks.yagaStore,
    description: "Finely milled mineral diamond dust suspended in a high-gloss base. Wear alone or stack over your favorite lip liner.",
    specs: ["Reflective mineral particles", "Zero grit texture comfort", "Plumping finish illusion", "Vegan formulation"]
  }
];

const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0
});

const state = {
  cart: JSON.parse(localStorage.getItem("ncosmeticsCart") || "[]"),
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
  localStorage.setItem("ncosmeticsCart", JSON.stringify(state.cart));
}

function formatPrice(value) {
  return currency.format(value).replace("ZAR", "R");
}

function renderCategories() {
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

function renderProducts() {
  let visible = products.filter(p => {
    const textMatch = [p.name, p.category, p.description].join(" ").toLowerCase().includes(state.search.toLowerCase());
    const catMatch = state.category === "all" || p.category === state.category;
    return textMatch && catMatch;
  });

  if (state.sort === "price-low") visible.sort((a,b) => a.price - b.price);
  else if (state.sort === "price-high") visible.sort((a,b) => b.price - a.price);
  else if (state.sort === "name") visible.sort((a,b) => a.name.localeCompare(b.name));

  if (!visible.length) {
    productGrid.innerHTML = '<div class="empty-state"><h3>No items found in this drop.</h3></div>';
    return;
  }

  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <button class="product-media" type="button" data-view-product="${product.id}">
        <img src="${product.images[0]}" id="main-img-${product.id}" alt="${product.name}">
      </button>
      
      <div class="image-slots-row">
        <img class="slot-thumb" src="${product.images[0]}" onclick="document.getElementById('main-img-${product.id}').src='${product.images[0]}'" alt="View 1">
        <img class="slot-thumb" src="${product.images[1] || product.images[0]}" onclick="document.getElementById('main-img-${product.id}').src='${product.images[1] || product.images[0]}'" alt="View 2">
      </div>

      <div class="product-copy">
        <h3>${product.name}</h3>
        <p>${product.category}</p>
        <strong class="product-price">${formatPrice(product.price)}</strong>
        <div class="product-actions">
          <button class="pill-button small" type="button" data-add-to-cart="${product.id}">Add to bag</button>
          <button class="ghost-button" type="button" data-view-product="${product.id}">Details</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const count = state.cart.length;
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = count);

  if (!count) {
    cartItems.innerHTML = '<p style="text-align:center; color:var(--color-fog);">Your shopping bag is completely empty.</p>';
  } else {
    cartItems.innerHTML = state.cart.map(item => {
      const p = products.find(prod => prod.id === item.id);
      if (!p) return "";
      return `
        <article class="cart-item">
          <img src="${p.images[0]}" alt="${p.name}">
          <div>
            <h4 style="margin:0; font-size:14px;">${p.name}</h4>
            <p style="margin:4px 0 0 0; font-weight:bold;">${formatPrice(p.price)}</p>
          </div>
          <button class="remove-x" type="button" data-remove="${p.id}">&times;</button>
        </article>
      `;
    }).join("");
  }

  const total = state.cart.reduce((acc, item) => acc + (products.find(p => p.id === item.id)?.price || 0), 0);
  cartTotal.textContent = formatPrice(total);
  purchaseButton.href = storeLinks.purchase;
  purchaseButton.classList.toggle("disabled", !count);
  saveCart();
}

function addToCart(id) {
  if (!state.cart.some(item => item.id === id)) state.cart.push({ id });
  renderCart();
  cartPanel.classList.add("open");
  document.body.classList.add("cart-open");
}

function showProduct(id, idx = 0) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  state.activeProductId = id;
  state.activeImageIndex = idx;

  productDetail.innerHTML = `
    <article class="product-detail">
      <div class="gallery">
        <img src="${product.images[idx]}" alt="${product.name}">
        <div class="gallery-controls">
          <button type="button" onclick="changeImage(-1)">‹</button>
          <span>${idx + 1} / ${product.images.length}</span>
          <button type="button" onclick="changeImage(1)">›</button>
        </div>
      </div>
      <div>
        <p class="eyebrow">${product.category}</p>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <ul class="spec-list">${product.specs.map(s => `<li>${s}</li>`).join("")}</ul>
        <strong class="product-price">${formatPrice(product.price)}</strong>
        <button class="pill-button" type="button" data-add-to-cart="${product.id}">Add to bag</button>
      </div>
    </article>
  `;
  if (!productDialog.open) productDialog.showModal();
  document.body.classList.add("dialog-open");
}

window.changeImage = function(step) {
  const p = products.find(prod => prod.id === state.activeProductId);
  if (!p) return;
  let nextIdx = (state.activeImageIndex + step + p.images.length) % p.images.length;
  showProduct(p.id, nextIdx);
};

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add-to-cart]");
  const view = event.target.closest("[data-view-product]");
  const rem = event.target.closest("[data-remove]");

  if (add) addToCart(add.dataset.addToCart);
  if (view) showProduct(view.dataset.viewProduct);
  if (rem) {
    state.cart = state.cart.filter(i => i.id !== rem.dataset.remove);
    renderCart();
  }
});

document.querySelector("[data-open-search]").addEventListener("click", () => {
  document.querySelector("#store").scrollIntoView({ behavior: "smooth" });
  searchInput.focus();
});

document.querySelectorAll("[data-open-cart]").forEach(b => b.addEventListener("click", () => {
  cartPanel.classList.add("open");
  document.body.classList.add("cart-open");
}));

document.querySelectorAll("[data-close-cart]").forEach(b => b.addEventListener("click", () => {
  cartPanel.classList.remove("open");
  document.body.classList.remove("cart-open");
}));

document.querySelector("[data-close-product]").addEventListener("click", () => {
  productDialog.close();
  document.body.classList.remove("dialog-open");
});

searchInput.addEventListener("input", e => { state.search = e.target.value; renderProducts(); });
categoryFilter.addEventListener("change", e => { state.category = e.target.value; renderProducts(); });
sortFilter.addEventListener("change", e => { state.sort = e.target.value; renderProducts(); });

document.querySelector(".nav-toggle").addEventListener("click", e => {
  const isOpen = document.querySelector("#primary-nav").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

renderCategories();
renderProducts();
renderCart();
