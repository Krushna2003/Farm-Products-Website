/* ============================
   script.js - cart + print bill
   - quantity tracking
   - printable invoice with:
     website name, date & day, items (name, qty, price, total),
     subtotal, GST, grand total
   - cart clears AFTER printing
   ============================ */

const GST_RATE = 0.05; // 5% GST - change this value if needed (e.g. 0.12 for 12%)

/* --- state --- */
let allProducts = [];
let cart = []; // items: { id, name, price, qty, image }

/* --- fetch products --- */
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    displayProducts(products);
  })
  .catch(err => {
    console.error("Error fetching products:", err);
    document.getElementById("product-list").innerHTML =
      "<p style='color:red; text-align:center;'>Failed to load products 😢</p>";
  });

/* --- render product cards --- */
function displayProducts(products) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image || ''}" alt="${escapeHtml(p.name)}">
      <h3>${escapeHtml(p.name)}</h3>
      <p>Price: $${Number(p.price).toFixed(2)}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

/* --- utility: escape HTML for safety in inserted strings --- */
function escapeHtml(text) {
  if (!text && text !== 0) return '';
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* --- add to cart (increment qty if exists) --- */
function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const found = cart.find(item => item.id === id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      qty: 1,
      image: product.image || ''
    });
  }
  updateCart();
}

/* --- update cart sidebar UI --- */
function updateCart() {
  document.getElementById("cart-count").textContent = cart.reduce((s, it) => s + it.qty, 0);

  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  let subtotal = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-row";

      const left = document.createElement("div");
      left.className = "left";
      left.innerHTML = `<strong>${escapeHtml(item.name)}</strong>
                        <span class="qty-badge">x ${item.qty}</span>`;

      const right = document.createElement("div");
      right.className = "right";
      const lineTotal = item.qty * item.price;
      right.innerHTML = `$${item.price.toFixed(2)} <br/><small>$${lineTotal.toFixed(2)}</small>`;

      row.appendChild(left);
      row.appendChild(right);
      cartItems.appendChild(row);

      subtotal += lineTotal;
    });
  }

  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  document.getElementById("cartSubtotal").textContent = subtotal.toFixed(2);
  document.getElementById("cartGST").textContent = gst.toFixed(2);
  document.getElementById("cartTotal").textContent = total.toFixed(2);
  document.getElementById("gstPercent").textContent = (GST_RATE * 100).toFixed(0);
}

/* --- search functionality --- */
document.getElementById("search").addEventListener("keyup", function () {
  const text = this.value.toLowerCase();
  const filtered = allProducts.filter(p => p.name.toLowerCase().includes(text));
  displayProducts(filtered);
});

/* --- open/close cart sidebar --- */
document.getElementById("openCart").onclick = (e) => {
  e.preventDefault();
  document.getElementById("cartSidebar").classList.add("open");
};
document.getElementById("closeCart").onclick = () => {
  document.getElementById("cartSidebar").classList.remove("open");
};

/* --- build printable bill HTML and print --- */
document.getElementById("checkoutBtn").onclick = () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // build bill header
  const siteName = "Farmer Shop";
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formattedDate = now.toLocaleString('en-IN', dateOptions);

  let subtotal = 0;
  let rowsHtml = '';

  cart.forEach(item => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    rowsHtml += `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">$${item.price.toFixed(2)}</td>
        <td style="text-align:right">$${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  const gst = subtotal * GST_RATE;
  const grandTotal = subtotal + gst;

  const billHTML = `
    <div class="bill-header">
      <h1>${escapeHtml(siteName)}</h1>
      <div class="bill-meta">
        <div>Printed on: ${escapeHtml(formattedDate)}</div>
      </div>
    </div>

    <table class="bill-table">
      <thead>
        <tr>
          <th>Product Name</th>
          <th style="text-align:center">Quantity</th>
          <th style="text-align:right">Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div style="margin-top:10px; text-align:right;">
      <div>Subtotal: $${subtotal.toFixed(2)}</div>
      <div>GST (${(GST_RATE*100).toFixed(0)}%): $${gst.toFixed(2)}</div>
      <div style="font-weight:700; margin-top:6px;">Grand Total: $${grandTotal.toFixed(2)}</div>
    </div>

    <div style="margin-top:20px;">
      <small>Thank you for shopping with ${escapeHtml(siteName)}.</small>
    </div>
  `;

  // inject into print area and show print dialog
  const printArea = document.getElementById("printArea");
  printArea.innerHTML = billHTML;

  // ensure print area is visible for the print media query, then call print
  window.print();

  // after printing, clear cart and update UI
  cart = [];
  updateCart();
  document.getElementById("cartSidebar").classList.remove("open");

  // clear print area content
  printArea.innerHTML = '';
};
