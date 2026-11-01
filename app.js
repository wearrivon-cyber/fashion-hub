// app.js replaces app.py (backend) so the website can run on GitHub Pages
const WHATSAPP = "923032891324"; // apna WhatsApp number (92 se shuru, bina + aur bina 0)

const PRODUCTS = [
  { id: 1, name: "Hop earings", price: 1000, image: "hop earings.jpeg" },
  { id: 2, name: "Heart locket", price: 1500, image: "heart locket.jpeg" },
  { id: 3, name: "Pearl Breslet", price: 2000, image: "pearl breslet.jpeg" },
  { id: 4, name: "Gold Ring", price: 1500, image: "gold ring.jpeg" },
  { id: 5, name: "Chain Set", price: 2900, image: "chain set.jpeg" },
  { id: 6, name: "Jhumka", price: 2400, image: "jhumka.jpeg" },
];
const SEED_REVIEWS = [
  { name: "Ayesha K.", rating: 5, comment: "Beautiful earrings, exactly like the pictures. Delivery was quick!" },
  { name: "Sana R.", rating: 5, comment: "The necklace looks so elegant. Got many compliments." },
  { name: "Hira M.", rating: 4, comment: "Lovely packaging and good quality for the price." },
];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const get = () => JSON.parse(localStorage.getItem("cart") || "[]");
const save = c => { localStorage.setItem("cart", JSON.stringify(c)); count(); };
const count = () => { const e = $("cart-count"); if (e) e.textContent = get().reduce((s, i) => s + i.qty, 0); };
const loadReviews = () => JSON.parse(localStorage.getItem("reviews") || "null") || SEED_REVIEWS;

// header and footer (same on every page)
$("nav").innerHTML = `<header class="nav"><a class="logo" href="index.html">Fashion Hub</a>
<nav><a href="index.html#shop">Shop</a><a href="faq.html">FAQ</a><a href="order.html">Cart (<span id="cart-count">0</span>)</a></nav></header>`;
$("foot").innerHTML = `<footer><p>Fashion Hub, jewelry made to be noticed.</p>
<p><a href="faq.html">FAQ</a> &nbsp; <a href="privacy.html">Privacy Policy</a> &nbsp; Instagram: @fashionhub</p></footer>`;

// home page: products
if ($("products")) {
  $("products").innerHTML = PRODUCTS.map(p => `<div class="card">
    <div class="img" style="background-image:url('static/images/${encodeURI(p.image)}')"></div>
    <h3>${p.name}</h3><p class="price">Rs ${p.price}</p>
    <button class="btn add" data-id="${p.id}">Add to Cart</button></div>`).join("");
  document.querySelectorAll(".add").forEach(b => b.onclick = () => {
    const c = get(), id = +b.dataset.id, f = c.find(i => i.id === id);
    if (f) f.qty++; else { const p = PRODUCTS.find(x => x.id === id); c.push({ id, name: p.name, price: p.price, qty: 1 }); }
    save(c); b.textContent = "Added"; setTimeout(() => b.textContent = "Add to Cart", 1000);
  });
}

// home page: reviews
if ($("reviews-list")) {
  $("reviews-list").innerHTML = loadReviews().slice().reverse().map(r => `<div class="card review">
    <p class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</p><p>${esc(r.comment)}</p><h3>${esc(r.name)}</h3></div>`).join("");
  $("review-form").onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target)), r = loadReviews();
    r.push({ name: d.name.trim().slice(0, 40), rating: +d.rating, comment: d.comment.trim().slice(0, 300) });
    localStorage.setItem("reviews", JSON.stringify(r));
    location.reload();
  };
}

// order page
const box = $("order-items");
function render() {
  const c = get();
  $("total").textContent = c.reduce((s, i) => s + i.price * i.qty, 0);
  box.innerHTML = c.length
    ? c.map((i, x) => `<div class="row"><span>${i.name} x ${i.qty}</span><span>Rs ${i.price * i.qty} <button class="x" onclick="rm(${x})">x</button></span></div>`).join("")
    : "<p>Your cart is empty. <a href='index.html#shop'>Start shopping</a></p>";
}
function rm(x) { const c = get(); c.splice(x, 1); save(c); render(); }
if (box) {
  render();
  $("order-form").onsubmit = e => {
    e.preventDefault();
    const c = get();
    if (!c.length) return alert("Your cart is empty.");
    const d = Object.fromEntries(new FormData(e.target));
    const total = c.reduce((s, i) => s + i.price * i.qty, 0), id = Date.now().toString().slice(-8);
    const text = `New order #${id} - Fashion Hub\n` + c.map(i => `${i.name} x ${i.qty} = Rs ${i.price * i.qty}`).join("\n") +
      `\nTotal: Rs ${total}\nPayment: Cash on Delivery\nName: ${d.name}\nPhone: ${d.phone}\nAddress: ${d.address}`;
    const link = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push({ id, ...d, items: c, total });
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.removeItem("cart"); count();
    $("order-page").innerHTML = `<div class="done"><h2>Thank you!</h2><p>Order #${id} is ready. Total: Rs ${total}.<br>Tap the button to send your order to us on WhatsApp.</p><a class="btn" href="${link}" target="_blank">Send order on WhatsApp</a></div>`;
    window.open(link, "_blank");
  };
}
count();
