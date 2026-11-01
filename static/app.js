// app.js: GitHub par backend ki jagah. Cart, orders aur reviews yahan handle hote hain.
const WHATSAPP = "923000000000"; // apna WhatsApp number (92 se shuru, bina + aur bina 0)

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const get = () => JSON.parse(localStorage.getItem("cart") || "[]");
const save = c => { localStorage.setItem("cart", JSON.stringify(c)); count(); };
const count = () => { const e = $("cart-count"); if (e) e.textContent = get().reduce((s, i) => s + i.qty, 0); };

// Add to Cart buttons
document.querySelectorAll(".add").forEach(b => b.onclick = () => {
  const c = get(), id = +b.dataset.id, f = c.find(i => i.id === id);
  if (f) f.qty++; else c.push({ id, name: b.dataset.name, price: +b.dataset.price, qty: 1 });
  save(c);
  b.textContent = "Added";
  setTimeout(() => b.textContent = "Add to Cart", 1000);
});

// Reviews (browser mein save hote hain)
const rform = $("review-form");
if (rform) {
  const grid = document.querySelector("#reviews .grid");
  const saved = JSON.parse(localStorage.getItem("reviews") || "null");
  if (saved && grid) {
    grid.innerHTML = saved.slice().reverse().map(r => `<div class="card review">
      <p class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</p><p>${esc(r.comment)}</p><h3>${esc(r.name)}</h3></div>`).join("");
  }
  rform.onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(rform));
    let list = saved;
    if (!list) list = [...document.querySelectorAll("#reviews .review")].reverse().map(el => ({
      name: el.querySelector("h3").textContent, rating: (el.querySelector(".stars").textContent.match(/★/g) || []).length, comment: el.querySelector("p:nth-of-type(2)").textContent }));
    list.push({ name: d.name.trim().slice(0, 40), rating: +d.rating, comment: d.comment.trim().slice(0, 300) });
    localStorage.setItem("reviews", JSON.stringify(list));
    location.reload();
  };
}

// Order page
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
