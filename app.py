from flask import Flask, render_template, request, jsonify
import csv, os, json
from datetime import datetime

app = Flask(__name__)

PRODUCTS = [
    {"id": 1, "name": "Hop earings", "price": 1000, "image": "hop earings.jpeg"},
    {"id": 2, "name": "Heart necklace", "price": 1500, "image": "heart necklace.jpeg"},
    {"id": 3, "name": "Pearl Breslet", "price": 2000, "image": "pearl breslet.jpeg"},
    {"id": 4, "name": "Gold Ring", "price": 1500, "image": "gold ring.jpeg"},
    {"id": 5, "name": "Chain Set", "price": 2900, "image": "chain set.jpeg"},
    {"id": 6, "name": "Jhumka", "price": 2400, "image": "jhumka.jpeg"},
]

SEED_REVIEWS = [
    {"name": "Ayesha K.", "rating": 5, "comment": "Beautiful earrings, exactly like the pictures. Delivery was quick!"},
    {"name": "Sana R.", "rating": 5, "comment": "The necklace looks so elegant. Got many compliments."},
    {"name": "Hira M.", "rating": 4, "comment": "Lovely packaging and good quality for the price."},
]

def load_reviews():
    if os.path.exists("reviews.json"):
        with open("reviews.json", encoding="utf-8") as f:
            return json.load(f)
    return SEED_REVIEWS

@app.route("/")
def home():
    return render_template("index.html", products=PRODUCTS, reviews=load_reviews()[::-1])

@app.route("/faq")
def faq():
    return render_template("faq.html")

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

@app.route("/order")
def order():
    return render_template("order.html")

@app.route("/api/review", methods=["POST"])
def api_review():
    d = request.get_json(silent=True) or {}
    name, comment = d.get("name", "").strip()[:40], d.get("comment", "").strip()[:300]
    try:
        rating = int(d.get("rating", 5))
    except ValueError:
        rating = 5
    if not (name and comment) or not 1 <= rating <= 5:
        return jsonify(ok=False, error="Please enter your name, rating and review.")
    reviews = load_reviews()
    reviews.append({"name": name, "rating": rating, "comment": comment})
    with open("reviews.json", "w", encoding="utf-8") as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)
    return jsonify(ok=True)

@app.route("/api/order", methods=["POST"])
def api_order():
    d = request.get_json(silent=True) or {}
    name, phone, address = d.get("name", "").strip(), d.get("phone", "").strip(), d.get("address", "").strip()
    if not (name and phone and address and d.get("items")):
        return jsonify(ok=False, error="Please fill all fields.")
    prices = {p["id"]: p["price"] for p in PRODUCTS}
    total = sum(prices.get(i["id"], 0) * int(i["qty"]) for i in d["items"])
    order_id = datetime.now().strftime("%y%m%d%H%M%S")
    new = not os.path.exists("orders.csv")
    with open("orders.csv", "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["order_id", "time", "name", "phone", "address", "items", "total"])
        w.writerow([order_id, datetime.now().isoformat(), name, phone, address, d["items"], total])
    return jsonify(ok=True, order_id=order_id, total=total)

if __name__ == "__main__":
    app.run(debug=True)