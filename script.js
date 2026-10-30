const get = () => JSON.parse(localStorage.getItem("cart") || "[]");
const save = c => { localStorage.setItem("cart", JSON.stringify(c)); count(); };
function count() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = get().reduce((s, i) => s + i.qty, 0);
}
document.querySelectorAll(".add").forEach(b => b.onclick = () => {
  const c = get(), id = +b.dataset.id, f = c.find(i => i.id === id);
  if (f) f.qty++; else c.push({ id, name: b.dataset.name, price: +b.dataset.price, qty: 1 });
  save(c);
  b.textContent = "Added";
  setTimeout(() => b.textContent = "Add to Cart", 1000);
});
const box = document.getElementById("order-items");
function render() {
  const c = get();
  document.getElementById("total").textContent = c.reduce((s, i) => s + i.price * i.qty, 0);
  box.innerHTML = c.length
    ? c.map((i, x) => `<div class="row"><span>${i.name} x ${i.qty}</span><span>Rs ${i.price * i.qty} <button class="x" onclick="rm(${x})">Remove</button></span></div>`).join("")
    : "<p>Your cart is empty. <a href='/'>Start shopping</a></p>";
}
function rm(x) { const c = get(); c.splice(x, 1); save(c); render(); }
if (box) render();
const form = document.getElementById("order-form");
if (form) form.onsubmit = async e => {
  e.preventDefault();
  const c = get();
  if (!c.length) return alert("Your cart is empty.");
  const d = Object.fromEntries(new FormData(form));
  d.items = c.map(i => ({ id: i.id, qty: i.qty }));
  const r = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
  const j = await r.json();
  if (!j.ok) return alert(j.error);
  localStorage.removeItem("cart");
  document.getElementById("order-page").innerHTML = `<div class="done"><h2>Thank you!</h2><p>Order #${j.order_id} received. Total: Rs ${j.total}. We will call you to confirm.</p><a class="btn" href="/">Back to shop</a></div>`;
  count();
};
const rform = document.getElementById("review-form");
if (rform) rform.onsubmit = async e => {
  e.preventDefault();
  const r = await fetch("/api/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(rform))) });
  const j = await r.json();
  if (j.ok) location.reload(); else alert(j.error);
};
count();