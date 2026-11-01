# main.py: app.py ki jagah. Yeh aapke templates se GitHub ke liye static website ("site" folder) banata hai.
# Chalane ke liye: python main.py
import os, re, shutil
from urllib.parse import quote
from jinja2 import Environment, FileSystemLoader

PRODUCTS = [
    {"id": 1, "name": "Hop earings", "price": 1000, "image": "hop earings.jpeg"},
    {"id": 2, "name": "Heart locket", "price": 1500, "image": "heart locket.jpeg"},
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

env = Environment(loader=FileSystemLoader("templates"))
env.globals["url_for"] = lambda endpoint, filename="": "static/" + filename

def fix_links(html):
    # images ke naam mein space ho to bhi chalay
    html = re.sub(r"url\(/static/images/([^)]*)\)",
                  lambda m: "url('static/images/%s')" % quote(m.group(1).strip("'\"")), html)
    html = html.replace('"/static/', '"static/')
    html = html.replace("static/script.js", "static/app.js")
    html = html.replace('href="/#', 'href="index.html#').replace('href="/"', 'href="index.html"')
    for page in ("faq", "privacy", "order"):
        html = html.replace('href="/%s"' % page, 'href="%s.html"' % page)
    return html

OUT = "site"
shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree("static", OUT + "/static")
shutil.copy("app.js", OUT + "/static/app.js")

pages = {
    "index.html": dict(products=PRODUCTS, reviews=SEED_REVIEWS[::-1]),
    "faq.html": {},
    "privacy.html": {},
    "order.html": {},
}
for name, ctx in pages.items():
    html = env.get_template(name).render(**ctx)
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(fix_links(html))
    print("Banaya:", OUT + "/" + name)
print("Done! 'site' folder ki saari files GitHub par upload karein.")
