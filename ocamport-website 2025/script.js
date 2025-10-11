/*
   - Uses localStorage keys:
     'cart' => array of items {name, price, img}
     'profile' => {name,email,bio}
     'businesses' => array of businesses {name,cat,desc,img,contract}
*/

/* Helper functions */
function getCart() {
  var raw = localStorage.getItem('cart');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch(e) { return []; }
}
function saveCart(arr) {
  localStorage.setItem('cart', JSON.stringify(arr));
}

/* Add product to cart (called from onclick in HTML) */
function addToCart(name, price, img) {
  var cart = getCart();
  cart.push({ name: name, price: price, img: img });
  saveCart(cart);
  alert(name + ' added to cart');
  renderCartArea(); // update cart page if open
}

/* Render cart (used by cart.html) */
function renderCartArea() {
  var area = document.getElementById('cartArea');
  if (!area) return;
  var cart = getCart();
  if (cart.length === 0) {
    area.innerHTML = '<p>Your cart is empty. <a href="index.html">Shop now</a></p>';
    return;
  }
  var html = '';
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    var it = cart[i];
    total += Number(it.price);
    html += '<div class="cart-item">';
    html += '<img class="cart-thumb" src="' + (it.img || 'images/download.jpg') + '">';
    html += '<div style="flex:1;"><strong>' + it.name + '</strong><div>₱' + Number(it.price).toFixed(2) + '</div></div>';
    html += '<div><button onclick="removeFromCart(' + i + ')">Remove</button></div>';
    html += '</div>';
  }
  html += '<div style="text-align:right; margin-top:8px;"><strong>Total: ₱' + total.toFixed(2) + '</strong></div>';
  area.innerHTML = html;
}

/* remove one item by index */
function removeFromCart(index) {
  var cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartArea();
}

/* clear cart */
function clearCart() {
  if (!confirm('Clear the cart?')) return;
  localStorage.removeItem('cart');
  renderCartArea();
}

/* fake checkout */
function checkout() {
  alert('Checkout is a demo. This would normally go to payment page.');
}

/* Simple search (client-side) */
function simpleSearch() {
  var q = document.getElementById('searchInput');
  if (!q) return;
  var term = q.value.toLowerCase();
  var cards = document.getElementsByClassName('card');
  for (var i = 0; i < cards.length; i++) {
    var strong = cards[i].getElementsByTagName('strong')[0];
    var name = strong ? strong.textContent.toLowerCase() : '';
    cards[i].style.display = name.indexOf(term) !== -1 ? 'block' : 'none';
  }
}

/* Profile: save and load */
function saveProfile() {
  var name = document.getElementById('nameField');
  var email = document.getElementById('emailField');
  var bio = document.getElementById('bioField');
  var obj = { name: (name ? name.value : ''), email: (email ? email.value : ''), bio: (bio ? bio.value : '') };
  localStorage.setItem('profile', JSON.stringify(obj));
  alert('Profile saved');
}
function loadProfile() {
  var raw = localStorage.getItem('profile');
  if (!raw) return;
  try {
    var p = JSON.parse(raw);
    if (document.getElementById('nameField')) document.getElementById('nameField').value = p.name || '';
    if (document.getElementById('emailField')) document.getElementById('emailField').value = p.email || '';
    if (document.getElementById('bioField')) document.getElementById('bioField').value = p.bio || '';
  } catch(e) { /* ignore */ }
}

/* Businesses */
function getBusinesses() {
  var raw = localStorage.getItem('businesses');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch(e) { return []; }
}
function saveBusinesses(arr) {
  localStorage.setItem('businesses', JSON.stringify(arr));
}

// Open a business contract
function viewContract(index) {
  const businesses = getBusinesses();
  if (!businesses[index]) return;

  // Save the selected contract temporarily
  localStorage.setItem('currentContract', JSON.stringify(businesses[index]));

  // Redirect to contract.html
  window.location.href = 'contract.html';
}

// Load contract details on contract.html
function loadContract() {
  const raw = localStorage.getItem('currentContract');
  if (!raw) return;
  const biz = JSON.parse(raw);

  const title = document.getElementById('contractTitle');
  const text = document.getElementById('contractText');

  if (title) title.textContent = biz.name + ' — Contract';
  if (text) {
    text.textContent =
      biz.contract ||
      'No detailed contract text available for this business.';
  }
}

// Simulated "Agree & Invest" button
function agreeToContract() {
  const raw = localStorage.getItem('currentContract');
  if (!raw) {
    alert('No contract selected.');
    return;
  }

  const biz = JSON.parse(raw);
  alert(`You have successfully agreed to invest in "${biz.name}"!`);
}


/* create business from business.html fields */
function createBusiness() {
  const nameField = document.getElementById('bizName');
  if (!nameField || !nameField.value.trim()) {
    alert('Business name required');
    return;
  }

  const name = nameField.value.trim();
  const cat = document.getElementById('bizCat') ? document.getElementById('bizCat').value.trim() : '';
  const desc = document.getElementById('bizDesc') ? document.getElementById('bizDesc').value.trim() : '';
  const img = document.getElementById('bizImg') ? document.getElementById('bizImg').value.trim() : '';
  const contract = `Sample contract for ${name}. This is a demo agreement.`;

  // Save business list
  const businesses = getBusinesses();
  businesses.push({ name, cat, desc, img, contract });
  saveBusinesses(businesses);

  // Auto-save to Shop Profile
  localStorage.setItem('shopName', name);
  localStorage.setItem('shopDesc', desc || `Welcome to ${name}!`);
  localStorage.setItem('shopLogo', img || '');
  localStorage.setItem('shopBanner', img || '');
  alert(`Business "${name}" created and linked to your shop profile!`);

  // Reset form
  nameField.value = '';
  if (document.getElementById('bizCat')) document.getElementById('bizCat').value = '';
  if (document.getElementById('bizDesc')) document.getElementById('bizDesc').value = '';
  if (document.getElementById('bizImg')) document.getElementById('bizImg').value = '';

  renderBusinesses();
}

/* render businesses (used by invest and business pages) */
function renderBusinesses() {
  var area = document.getElementById('bizArea') || document.getElementById('investArea');
  if (!area) return;
  var arr = getBusinesses();
  if (arr.length === 0) {
    // create defaults if none (only on first view)
    arr = [
      { name: 'Cafe Verde', cat: 'Food', desc: 'Cozy coffee shop using local beans.', img: 'images/alden.jpeg', contract: 'Sample contract for Cafe Verde.' },
      { name: 'TechLeaf Gadgets', cat: 'Electronics', desc: 'Affordable phone accessories.', img: 'images/download.jpg', contract: 'Sample contract for TechLeaf.' }
    ];
    saveBusinesses(arr);
  }
  var html = '';
  for (var i = 0; i < arr.length; i++) {
    var b = arr[i];
    html += '<div class="biz-card">';
    if (b.img) html += '<img src="' + b.img + '">';
    html += '<h4>' + b.name + '</h4>';
    html += '<div style="color:#2ecc40; font-weight:700; margin-bottom:6px;">' + (b.cat || '') + '</div>';
    html += '<div style="font-size:0.95rem;">' + (b.desc || '') + '</div>';
    html += '<div style="margin-top:8px;"><button onclick="viewContract(' + i + ')">View Contract</button> ';
    html += '<button onclick="removeBusiness(' + i + ')">Remove</button></div>';
    html += '</div>';
  }
  area.innerHTML = html;
}

function loadInvestPage() {
  const area = document.getElementById("investArea");
  if (!area) return;

  const businesses = getBusinesses();
  if (!businesses || businesses.length === 0) {
    // fallback demo data
    var demo = [
      {
        name: "Cafe Verde",
        desc: "Cozy local coffee shop offering premium drinks.",
        img: "images/alden.jpeg",
        contract: "This contract outlines investment in Cafe Verde."
      },
      {
        name: "TechLeaf Gadgets",
        desc: "Affordable and reliable tech accessories.",
        img: "images/download.jpg",
        contract: "This contract outlines investment in TechLeaf Gadgets."
      },
      {
        name: "Golden Accessories",
        desc: "Trendy gold jewelry and lifestyle pieces.",
        img: "images/gold chain.jpeg",
        contract: "This contract outlines investment in Golden Accessories."
      }
    ];
    localStorage.setItem("businesses", JSON.stringify(demo));
  }

  const arr = getBusinesses();
  let html = "";
  arr.forEach((b, i) => {
    html += `
      <div class="biz-card">
        <img src="${b.img}" alt="${b.name}">
        <h4>${b.name}</h4>
        <p>${b.desc}</p>
        <button onclick="viewContract(${i})">View Contract</button>
      </div>
    `;
  });

  area.innerHTML = html;
}


/* remove business by index */
function removeBusiness(index) {
  var arr = getBusinesses();
  if (!confirm('Remove business "' + (arr[index] ? arr[index].name : '') + '"?')) return;
  arr.splice(index, 1);
  saveBusinesses(arr);
  renderBusinesses();
}

/* clear all businesses */
function clearBusinesses() {
  if (!confirm('Clear all businesses?')) return;
  localStorage.removeItem('businesses');
  renderBusinesses();
}

/* contract view */
function viewContract(index) {
  var arr = getBusinesses();
  var box = document.getElementById('contractBox');
  var title = document.getElementById('contractTitle');
  var text = document.getElementById('contractText');
  if (!arr[index]) return;
  if (title) title.textContent = arr[index].name + ' — Contract';
  if (text) text.textContent = arr[index].contract || 'No contract available';
  if (box) box.className = 'contract-box'; // show
}
function closeContract() {
  var box = document.getElementById('contractBox');
  if (box) box.className = 'contract-box hidden';
}

/* === INVEST & CONTRACT helpers (paste at end of script.js) === */

/* ensures there's at least some businesses stored */
function ensureBusinesses() {
  var arr = getBusinesses();
  if (!arr || arr.length === 0) {
    arr = [
      { name: 'Cafe Verde', desc: 'Cozy local coffee shop offering premium drinks.', img: 'images/alden.jpeg', contract: 'Investment contract for Cafe Verde: revenue share 10%...' },
      { name: 'TechLeaf Gadgets', desc: 'Affordable and reliable tech accessories.', img: 'images/download.jpg', contract: 'Investment contract for TechLeaf: equity share 5%...' },
      { name: 'Golden Accessories', desc: 'Trendy gold jewelry and lifestyle pieces.', img: 'images/gold chain.jpeg', contract: 'Investment contract for Golden Accessories: profit share 8%...' }
    ];
    saveBusinesses(arr);
  }
  return arr;
}

/* render invest page cards into the element with id="investArea" */
function loadInvestPage() {
  var area = document.getElementById('investArea');
  if (!area) return;
  var arr = ensureBusinesses();
  var html = '';
  for (var i = 0; i < arr.length; i++) {
    var b = arr[i];
    var img = b.img || 'images/download.jpg';
    html += '<div class="biz-card">';
    html += '<img src="' + img + '" alt="' + (b.name||'') + '">';
    html += '<h4>' + (b.name || '') + '</h4>';
    html += '<p>' + (b.desc || '') + '</p>';
    html += '<button onclick="viewContract(' + i + ')">View Contract</button>';
    html += '</div>';
  }
  area.innerHTML = html;
}

function addSampleProducts() {
  const area = document.getElementById('productGrid');
  if (!area) return;

  const sampleProducts = [
    { name: 'Iced Latte', price: 120, img: 'images/alden.jpeg' },
    { name: 'Matcha Smoothie', price: 99, img: 'images/download.jpg' },
    { name: 'Reusable Cup', price: 150, img: 'images/gold chain.jpeg' },
    { name: 'Canvas Tote Bag', price: 180, img: 'images/download.jpg' }
  ];

  let html = '';
  sampleProducts.forEach(p => {
    html += `
      <div class="product-card">
        <img src="${p.img}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>₱${p.price}</p>
      </div>
    `;
  });

  area.innerHTML = html;
}


/* called when user clicks View Contract; saves selected business and redirects */
function viewContract(index) {
  var arr = getBusinesses();
  if (!arr || !arr[index]) {
    alert('Business not found.');
    return;
  }
  localStorage.setItem('currentContract', JSON.stringify(arr[index]));
  // make sure contract.html exists in same folder
  window.location.href = 'contract.html';
}

/* load contract.html content from localStorage.currentContract */
function loadContract() {
  var raw = localStorage.getItem('currentContract');
  if (!raw) return;
  try {
    var biz = JSON.parse(raw);
    var t = document.getElementById('contractTitle');
    var txt = document.getElementById('contractText');
    if (t) t.textContent = (biz.name || 'Business') + ' — Contract';
    if (txt) txt.textContent = biz.contract || biz.desc || 'No contract text available.';
  } catch (e) {
    console.error('loadContract error', e);
  }
}

/* Unified DOMContentLoaded loader — safer than overwriting window.onload */
document.addEventListener('DOMContentLoaded', function () {
  try { if (document.getElementById('investArea')) loadInvestPage(); } catch(e){ console.error(e); }
  try { if (document.getElementById('contractSection')) loadContract(); } catch(e){ console.error(e); }

  // keep existing page-specific initializers but do not override other code:
  try { if (document.getElementById('cartArea')) renderCartArea(); } catch(e){ /* ignore */ }
  try { if (document.getElementById('profile-section')) { loadProfile(); loadProfileImage(); } } catch(e){ /* ignore */ }
  try { if (document.getElementById('business-section')) { loadBusiness(); loadBusinessImage(); } } catch(e){ /* ignore */ }
  try { if (document.getElementById('shopProfile')) loadShopProfile(); } catch(e){ /* ignore */ }
});
