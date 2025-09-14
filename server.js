// File: server.js
// Belize Merch — Single-file store with categories (Express + Stripe)

const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require("stripe")(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
}

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(bodyParser.json());
app.use("/img", express.static(path.join(__dirname, "public", "img")));
app.use("/static", express.static(path.join(__dirname, "public")));

// ----- Assets -----
const ASSETS = {
  flag: "/img/flag-belize.png",
  belizeit: "/img/belizeit-logo.png",
  crest: "/img/belize-1981-crest.png",
  hand: "/img/belize-handprint.png",
};

// ----- Catalog -----
const PRODUCTS = [
  {
    id: "belize-belizeit-handprint",
    sku: "BLZ-001",
    category: "T-Shirts",
    name: "You Better Belize It / Handprint Back",
    description: "Premium ringspun cotton. Unisex fit.",
    price: 2499,
    currency: "usd",
    sizes: ["S", "M", "L", "XL", "2XL"],
    color: "Black",
    images: ["/img/belize-tee-1-front.png", "/img/belize-tee-1-back.png"],
  },
  {
    id: "belize-independence-crest",
    sku: "BLZ-002",
    category: "T-Shirts",
    name: "Mini Crest Front / Independence Back",
    description: "Soft cotton tee. Unisex fit.",
    price: 2499,
    currency: "usd",
    sizes: ["S", "M", "L", "XL", "2XL"],
    color: "Charcoal",
    images: ["/img/belize-tee-2-front.png", "/img/belize-tee-2-back.png"],
  },
  // New ladies tees
  {
    id: "belize-ladies-blessed-pink",
    sku: "BLZ-003",
    category: "T-Shirts",
    name: "Belize, Blessed & Beautiful (Pink)",
    description: "Soft cotton tee. Relaxed unisex fit.",
    price: 2499,
    currency: "usd",
    sizes: ["S", "M", "L", "XL", "2XL"],
    color: "White",
    images: ["/img/belize-ladies-1.png"],
  },
  {
    id: "belize-ladies-blessed-rasta",
    sku: "BLZ-004",
    category: "T-Shirts",
    name: "Belize, Blessed & Beautiful (Rasta)",
    description: "Soft cotton tee. Relaxed unisex fit.",
    price: 2499,
    currency: "usd",
    sizes: ["S", "M", "L", "XL", "2XL"],
    color: "White",
    images: ["/img/belize-ladies-2.png"],
  },
  {
    id: "belize-ladies-barbie",
    sku: "BLZ-005",
    category: "T-Shirts",
    name: "Belizian Barbie",
    description: "Soft cotton tee. Relaxed unisex fit.",
    price: 2499,
    currency: "usd",
    sizes: ["S", "M", "L", "XL", "2XL"],
    color: "White",
    images: ["/img/belize-ladies-3.png"],
  },
];

// ----- HTML -----
function htmlPage({ origin }) {
  const stripeEnabled = Boolean(stripe);
  const CATS = ["T-Shirts", "Hoodies", "Hats", "Accessories"];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Belize Merch — Independence Day Tees</title>
<link rel="icon" type="image/png" href="${ASSETS.flag}">
<meta property="og:image" content="${ASSETS.crest}"/>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
:root{--bz-blue:#003F87;--bz-red:#D52B1E;--bz-white:#fff;--bz-green:#0B7A2B}
body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
.title{font-family:'Bebas Neue',Inter,system-ui,sans-serif;letter-spacing:.02em}
.flag-stripes{background:linear-gradient(90deg,var(--bz-red) 0 33%,var(--bz-white) 33% 66%,var(--bz-blue) 66%)}
.hero-bg{position:relative;background:
  radial-gradient(1200px 600px at 10% -10%, rgba(213,43,30,.20), transparent 60%),
  radial-gradient(1000px 600px at 110% 10%, rgba(0,63,135,.20), transparent 60%),
  linear-gradient(135deg,#0f172a 0%, #0b1a3a 100%);}
.glow{box-shadow:0 10px 30px rgba(0,0,0,.2)}
.flipwrap{position:relative}
.flipwrap img{position:absolute;inset:0;object-fit:cover;width:100%;height:100%;transition:opacity .35s ease}
.flipwrap img.back{opacity:0}
.flipwrap:hover img.back{opacity:1}
.flipwrap:hover img.front{opacity:0}
.watermark{position:absolute;inset:auto -5% -40% auto;opacity:.08;pointer-events:none;transform:rotate(-8deg);}
@keyframes confetti-fall{to{transform:translateY(120vh) rotate(720deg);opacity:0}}
.confetti{position:fixed;top:-10px;width:10px;height:14px;opacity:.9;pointer-events:none;animation:confetti-fall 1.6s linear forwards}
.cat{display:flex;align-items:center;justify-content:center;border-radius:1rem;padding:.75rem 1rem;}
.cat-active{background:#fff;color:#0f172a;box-shadow:0 10px 30px rgba(0,0,0,.12)}
.cat-inactive{background:rgba(255,255,255,.08);color:#fff;outline:1px solid rgba(255,255,255,.2)}
</style>
</head>
<body class="bg-slate-50">
  <div class="flag-stripes h-1 w-full"></div>

  <header class="bg-slate-900 text-white">
    <div class="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="${ASSETS.belizeit}" alt="Better Belize It" class="w-9 h-9 object-contain"/>
        <h1 class="title text-3xl">Better Belize It</h1>
      </div>
      <nav class="hidden sm:flex gap-6 text-sm text-white/80">
        <a href="#shop" class="hover:text-white">Shop</a>
        <a href="#sizes" class="hover:text-white">Sizes</a>
        <a href="#faq" class="hover:text-white">FAQ</a>
      </nav>
      <button id="openCart" class="relative px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 glow">Cart
        <span id="cartCount" class="ml-2 inline-block bg-slate-900 text-white rounded-full px-2 text-sm">0</span>
      </button>
    </div>
  </header>

  <section class="hero-bg">
    <div class="max-w-6xl mx-auto px-4 py-12 md:py-16 text-white relative">
      <img src="${ASSETS.flag}" alt="Belize flag" class="absolute right-0 top-0 h-full opacity-10 hidden md:block"/>
      <div class="grid md:grid-cols-2 gap-8 items-center relative">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-xs">🇧🇿 Sept 21 — Independence Day</div>
          <h2 class="title text-5xl md:text-6xl mt-4 leading-tight">Belize Independence Merch</h2>
          <p class="mt-3 text-white/80 max-w-prose">Limited-run designs printed on soft ringspun cotton. Built for the jump-up, perfect year-round.</p>
          <div class="mt-6 flex gap-3">
            <a href="#shop" class="rounded-2xl bg-white text-slate-900 px-5 py-3 font-semibold glow">Shop Now</a>
            <a href="#faq" class="rounded-2xl ring-1 ring-white/40 px-5 py-3 font-semibold">Learn More</a>
          </div>
        </div>
        <div class="hidden md:block relative">
          <img src="${ASSETS.crest}" alt="Belize crest graphic" class="w-full max-w-md mx-auto glow rounded-3xl"/>
          <img src="${ASSETS.hand}" alt="Belize handprint" class="watermark w-64"/>
        </div>
      </div>

      <div class="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3" id="catTabs"></div>
    </div>
  </section>

  <main id="shop" class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-6 rounded-2xl p-5 bg-white shadow flex items-center justify-between flex-wrap gap-3">
      <p class="text-slate-700">Secure checkout via Stripe. Ships worldwide.</p>
      <div class="flex items-center gap-2 text-sm"><span class="w-3 h-3 bg-[var(--bz-green)] rounded-full"></span> In stock & ready to ship</div>
    </div>

    <section id="grid" class="grid gap-6 md:grid-cols-2"></section>

    <section id="checkout" class="mt-10 grid md:grid-cols-2 gap-6">
      <form id="checkoutForm" class="bg-white rounded-2xl shadow p-6 space-y-4 relative">
        <img src="${ASSETS.belizeit}" alt="Belize It" class="absolute right-4 top-4 w-16 opacity-20"/>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Checkout</h3>
          <span class="text-xs px-2 py-1 rounded-full bg-slate-100">Stripe</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="col-span-2">Email<input required type="email" name="email" class="mt-1 w-full border rounded-xl px-3 py-2"></label>
          <label>First name<input required name="firstName" class="mt-1 w-full border rounded-xl px-3 py-2"></label>
          <label>Last name<input required name="lastName" class="mt-1 w-full border rounded-xl px-3 py-2"></label>
          <label class="col-span-2">Address<input required name="line1" class="mt-1 w-full border rounded-xl px-3 py-2"></label>
          <label>City<input required name="city" class="mt-1 w-full border rounded-xl px-3 py-2"></label>
          <label>State/Region<input name="state" class="mt-1 w-full border rounded-xl px-3 py-2"></label>
          <label>Postal Code<input name="postal_code" class="mt-1 w-full border rounded-xl px-3 py-2"></label>
          <label>Country<select name="country" class="mt-1 w-full border rounded-xl px-3 py-2">
            <option value="US">United States</option>
            <option value="BZ">Belize</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="MX">Mexico</option>
          </select></label>
        </div>
        <div>
          <label class="font-medium">Shipping</label>
          <div class="mt-2 grid sm:grid-cols-3 gap-2">
            <label class="flex items-center gap-2 border rounded-xl px-3 py-2"><input type="radio" name="ship" value="pickup" checked>Local pickup (free)</label>
            <label class="flex items-center gap-2 border rounded-xl px-3 py-2"><input type="radio" name="ship" value="domestic">Domestic</label>
            <label class="flex items-center gap-2 border rounded-xl px-3 py-2"><input type="radio" name="ship" value="intl">International</label>
          </div>
        </div>
        <button id="checkoutBtn" class="w-full rounded-xl bg-slate-900 text-white py-3 disabled:opacity-50">Checkout${stripeEnabled ? "" : " (Stripe key missing)"}</button>
        <p class="text-xs text-slate-500">Test card: 4242 4242 4242 4242</p>
      </form>

      <div class="bg-white rounded-2xl shadow p-6 relative">
        <img src="${ASSETS.hand}" alt="Handprint" class="absolute -left-6 -top-8 w-28 opacity-10 rotate-[-10deg]"/>
        <h3 class="text-lg font-semibold mb-3">Cart</h3>
        <div id="cartEmpty" class="text-slate-500">Your cart is empty.</div>
        <ul id="cartItems" class="divide-y hidden"></ul>
        <div id="totals" class="hidden mt-4 text-right space-y-1">
          <div>Subtotal: <span id="subtotal" class="font-semibold"></span></div>
          <div>Shipping: <span id="shipping" class="font-semibold"></span></div>
          <div class="text-lg">Total: <span id="total" class="font-bold"></span></div>
        </div>
      </div>
    </section>

    <section id="gallery" class="mt-16">
      <h3 class="text-lg font-semibold mb-3">Gallery</h3>
      <div class="grid sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl shadow p-4 flex items-center justify-center"><img src="${ASSETS.crest}" class="max-h-44" alt="1981 crest"/></div>
        <div class="bg-white rounded-2xl shadow p-4 flex items-center justify-center"><img src="${ASSETS.hand}" class="max-h-44" alt="Handprint"/></div>
        <div class="bg-white rounded-2xl shadow p-4 flex items-center justify-center"><img src="${ASSETS.belizeit}" class="max-h-44" alt="Belize It"/></div>
      </div>
    </section>

    <section id="sizes" class="mt-16 bg-white rounded-2xl shadow p-6">
      <h3 class="text-lg font-semibold">Size Guide</h3>
      <p class="text-sm text-slate-600">Unisex tees run true-to-size. If between sizes, order up for a relaxed fit.</p>
      <div class="mt-3 grid sm:grid-cols-5 gap-2 text-sm">
        <div class="p-3 rounded-xl bg-slate-50">S — 34–36" chest</div>
        <div class="p-3 rounded-xl bg-slate-50">M — 38–40" chest</div>
        <div class="p-3 rounded-xl bg-slate-50">L — 42–44" chest</div>
        <div class="p-3 rounded-xl bg-slate-50">XL — 46–48" chest</div>
        <div class="p-3 rounded-xl bg-slate-50">2XL — 50–52" chest</div>
      </div>
    </section>

    <section id="faq" class="mt-16 bg-white rounded-2xl shadow p-6">
      <h3 class="text-lg font-semibold">FAQ</h3>
      <ul class="mt-2 space-y-2 text-sm text-slate-700">
        <li><span class="font-medium">Do you ship to Belize?</span> Yes — choose International and enter your address.</li>
        <li><span class="font-medium">How long will it take?</span> Domestic 3–7 business days; International 7–21 days.</li>
        <li><span class="font-medium">Care instructions?</span> Cold wash, inside-out. Tumble dry low.</li>
      </ul>
    </section>
  </main>

  <footer class="mt-10">
    <div class="flag-stripes h-1"></div>
    <div class="max-w-6xl mx-auto px-4 py-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
      <span>© Belize Merch</span>
      <span>Built with Stripe • Made with ❤️ in Belize</span>
    </div>
  </footer>

  <script>
    const PRODUCTS = ${JSON.stringify(PRODUCTS)};
    const CATEGORIES = ${JSON.stringify(["T-Shirts","Hoodies","Hats","Accessories"])};
    var activeCat = 'T-Shirts';

    const fmtCurrency = (cents) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
    function shootConfetti(x, y){ const colors=['#D52B1E','#003F87','#ffffff','#0B7A2B']; for(let i=0;i<24;i++){ const s=document.createElement('span'); s.className='confetti'; s.style.left=(x+(Math.random()*60-30))+'px'; s.style.background=colors[i%colors.length]; s.style.transform='translateY(0) rotate(0deg)'; s.style.animationDelay=(Math.random()*0.1)+'s'; s.style.animationDuration=(1.1+Math.random()*0.8)+'s'; document.body.appendChild(s); setTimeout(()=> s.remove(), 2200); }}

    const grid=document.getElementById('grid');
    const tabs=document.getElementById('catTabs');

    function categoryCounts(){
      const counts = Object.fromEntries(CATEGORIES.map(function(c){return [c,0]}));
      PRODUCTS.forEach(function(p){ if(counts[p.category]!==undefined) counts[p.category]++; });
      return counts;
    }

    function renderTabs(){
      const counts = categoryCounts();
      tabs.innerHTML = CATEGORIES.map(function(cat){
        return '<button data-cat=\"'+cat+'\" class=\"cat '+(cat===activeCat? 'cat-active' : 'cat-inactive')+'\">'
             +   '<div class=\"flex items-center gap-2\">'
             +     '<span>'+cat+'</span>'
             +     '<span class=\"text-xs px-2 py-0.5 rounded-full bg-black/10\">'+(counts[cat]||0)+'</span>'
             +   '</div>'
             + '</button>';
      }).join('');
      tabs.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          activeCat=b.getAttribute('data-cat'); renderTabs(); renderGrid(); window.location.hash='shop';
        });
      });
    }

    function productCard(p){
      var id='card-'+p.id; var back=(p.images[1]||p.images[0]);
      return ''+
      '<div class=\"bg-white rounded-2xl shadow overflow-hidden glow\">'+
        '<div class=\"relative aspect-square\">'+
          '<div class=\"flipwrap w-full h-full\">'+
            '<img src=\"'+p.images[0]+'\" alt=\"'+p.name+' front\" class=\"front rounded-none\">'+
            '<img src=\"'+back+'\" alt=\"'+p.name+' back\" class=\"back rounded-none\">'+
          '</div>'+
          '<div class=\"absolute top-3 left-3 text-xs font-semibold text-white px-2 py-1 rounded-full\" style=\"background:linear-gradient(90deg,#D52B1E,#003F87)\">'+p.category.toUpperCase()+'</div>'+
        '</div>'+
        '<div class=\"p-4 space-y-2\">'+
          '<h3 class=\"font-semibold\">'+p.name+'</h3>'+
          '<p class=\"text-sm text-slate-500\">'+p.description+'</p>'+
          '<div class=\"flex items-center justify-between\">'+
            '<div class=\"font-bold\">'+fmtCurrency(p.price)+'</div>'+
            '<button data-id=\"'+p.id+'\" class=\"addBtn rounded-xl bg-slate-900 text-white px-4 py-2\">Add</button>'+
          '</div>'+
          '<div class=\"mt-2 grid grid-cols-3 gap-2\">'+
            '<select id=\"'+id+'-size\" class=\"border rounded-xl px-2 py-2\">'+p.sizes.map(function(s){return '<option value=\"'+s+'\">'+s+'</option>'}).join('')+'</select>'+
            '<input id=\"'+id+'-qty\" type=\"number\" min=\"1\" value=\"1\" class=\"border rounded-xl px-2 py-2\">'+
            '<select id=\"'+id+'-variant\" class=\"border rounded-xl px-2 py-2\"><option value=\"'+p.color+'\">'+p.color+'</option></select>'+
          '</div>'+
        '</div>'+
      '</div>';
    }

    function renderGrid(){
      var items = PRODUCTS.filter(function(p){ return p.category === activeCat; });
      grid.innerHTML = items.length ? items.map(productCard).join('') :
        '<div class=\"col-span-full text-center text-slate-500 bg-white rounded-2xl shadow p-8\">No products in '+activeCat+' yet.</div>';

      document.querySelectorAll('.addBtn').forEach(function(btn){
        btn.addEventListener('click', function(e){
          var id=btn.getAttribute('data-id');
          var p=PRODUCTS.find(function(x){return x.id===id});
          var rootId='card-'+id;
          var size=document.getElementById(rootId+'-size').value;
          var qty=Math.max(1,parseInt(document.getElementById(rootId+'-qty').value||'1',10));
          var color=document.getElementById(rootId+'-variant').value;
          var existing=cart.find(function(i){return i.id===id && i.size===size && i.color===color});
          if(existing) existing.qty+=qty; else cart.push(Object.assign({},p,{size:size,color:color,qty:qty}));
          renderCart(); shootConfetti(e.clientX, e.clientY);
          window.scrollTo({ top: document.getElementById('checkout').offsetTop-20, behavior:'smooth' });
        });
      });
    }

    // Cart state
    const cart=[]; const cartCount=document.getElementById('cartCount');
    const cartItems=document.getElementById('cartItems');
    const cartEmpty=document.getElementById('cartEmpty');
    const totals=document.getElementById('totals');
    const subtotalEl=document.getElementById('subtotal');
    const shippingEl=document.getElementById('shipping');
    const totalEl=document.getElementById('total');

    function recalc(){
      const sub=cart.reduce(function(s,i){return s+i.price*i.qty},0);
      subtotalEl.textContent=fmtCurrency(sub);
      const shipTier=document.querySelector('input[name="ship"]:checked').value;
      const ship=shipTier==='pickup'?0:shipTier==='domestic'?599:1299;
      shippingEl.textContent=fmtCurrency(ship);
      totalEl.textContent=fmtCurrency(sub+ship);
      cartCount.textContent=cart.reduce(function(s,i){return s+i.qty},0);
      if(cart.length){cartEmpty.classList.add('hidden');cartItems.classList.remove('hidden');totals.classList.remove('hidden');}
      else{cartEmpty.classList.remove('hidden');cartItems.classList.add('hidden');totals.classList.add('hidden');}
    }
    function renderCart(){
      cartItems.innerHTML=cart.map(function(i,idx){
        return '<li class=\"py-3 flex items-center gap-3\">'+
          '<img src=\"'+i.images[0]+'\" class=\"w-16 h-16 object-cover rounded-lg\" alt=\"'+i.name+'\">'+
          '<div class=\"flex-1\">'+
            '<div class=\"font-medium\">'+i.name+'</div>'+
            '<div class=\"text-xs text-slate-500\">Size '+i.size+' · '+i.color+'</div>'+
            '<div class=\"text-sm\">'+fmtCurrency(i.price)+' × '+
              '<input data-idx=\"'+idx+'\" class=\"qty border rounded w-14 text-right px-1 py-0.5 ml-1\" type=\"number\" min=\"1\" value=\"'+i.qty+'\">'+
            '</div>'+
          '</div>'+
          '<button data-idx=\"'+idx+'\" class=\"remove text-slate-500 hover:text-red-600\">Remove</button>'+
        '</li>';
      }).join('');
      recalc();
    }

    cartItems.addEventListener('input',function(e){
      if(e.target.classList.contains('qty')){
        const idx=Number(e.target.getAttribute('data-idx'));
        cart[idx].qty=Math.max(1,parseInt(e.target.value||'1',10));
        recalc();
      }
    });
    cartItems.addEventListener('click',function(e){
      if(e.target.classList.contains('remove')){
        const idx=Number(e.target.getAttribute('data-idx'));
        cart.splice(idx,1); renderCart();
      }
    });

    document.querySelectorAll('input[name="ship"]').forEach(function(r){ r.addEventListener('change', recalc) });

    // initial render
    renderTabs(); renderGrid();

    const checkoutBtn=document.getElementById('checkoutBtn');
    const form=document.getElementById('checkoutForm');
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      if (!${Boolean(stripe)}) { alert('Stripe secret key missing on server.'); return; }
      if(!cart.length){ alert('Cart is empty'); return; }
      checkoutBtn.disabled=true;
      const data=Object.fromEntries(new FormData(form));
      const shipTier=document.querySelector('input[name="ship"]:checked').value;
      try{
        const res = await fetch('/create-checkout-session',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            cart: cart.map(function(i){ return { id:i.id, qty:i.qty, size:i.size, color:i.color }; }),
            customer:{ email:data.email, name: (data.firstName+' '+data.lastName) },
            shipping:{ address:{ line1:data.line1, city:data.city, state:data.state, postal_code:data.postal_code, country:data.country } },
            shippingTier: shipTier
          })
        });
        const payload = await res.json();
        if(payload.error) throw new Error(payload.error);
        window.location.href = payload.url;
      } catch(err){ alert('Checkout failed: ' + err.message) }
      finally { checkoutBtn.disabled=false }
    });
  </script>
</body>
</html>`;
}

// ----- Routes -----
app.get("/", (req, res) => {
  const origin = `${req.protocol}://${req.get("host")}`;
  res.type("html").send(htmlPage({ origin }));
});

app.get("/success", (req, res) => {
  res.type("html").send(`<!doctype html><html><head><meta charset='utf-8'><script src='https://cdn.tailwindcss.com'></script><style>:root{--bz-blue:#003F87;--bz-red:#D52B1E;--bz-white:#fff}.flag{background:linear-gradient(90deg,var(--bz-red) 0 33%,var(--bz-white) 33% 66%,var(--bz-blue) 66%)}</style></head>
  <body class='min-h-screen grid place-items-center bg-slate-50'>
    <div class='bg-white rounded-2xl shadow p-10 text-center max-w-md'>
      <div class='flag h-1 w-full rounded mb-4'></div>
      <h1 class='text-2xl font-bold mb-2'>Thank you! 🎉</h1>
      <p class='text-slate-600 mb-6'>Your order was received. A receipt has been emailed to you.</p>
      <a href='/' class='inline-block rounded-xl bg-slate-900 text-white px-4 py-2'>Back to store</a>
    </div>
  </body></html>`);
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    const origin = `${req.protocol}://${req.get("host")}`;

    const { cart, customer } = req.body || {};
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart required" });
    }

    const line_items = cart.map((ci) => {
      const p = PRODUCTS.find((x) => x.id === ci.id);
      if (!p) throw new Error(`Unknown product: ${ci.id}`);
      const qty = Math.max(1, Number(ci.qty || 1));
      return {
        price_data: {
          currency: p.currency,
          unit_amount: p.price,
          product_data: {
            name: p.name,
            description: `${p.description} — Size ${ci.size} — ${ci.color}`,
            metadata: { sku: p.sku, product_id: p.id, size: ci.size, color: ci.color, category: p.category },
            images: p.images.map((src) => origin + src),
          },
        },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: customer?.email,
      shipping_options: [
        { shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: 0, currency: "usd" }, display_name: "Local pickup",
          delivery_estimate: { minimum: { unit: "business_day", value: 0 }, maximum: { unit: "business_day", value: 2 } } } },
        { shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: 599, currency: "usd" }, display_name: "Domestic",
          delivery_estimate: { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 7 } } } },
        { shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: 1299, currency: "usd" }, display_name: "International",
          delivery_estimate: { minimum: { unit: "business_day", value: 7 }, maximum: { unit: "business_day", value: 21 } } } },
      ],
      shipping_address_collection: { allowed_countries: ["US", "BZ", "CA", "GB", "MX"] },
      success_url: origin + "/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/",
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Belize Merch server at http://localhost:${PORT}`);
  const imgDir = path.join(__dirname, "public", "img");
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
  console.log("Expected assets in ./public/img:");
  [
    ASSETS.flag, ASSETS.belizeit, ASSETS.crest, ASSETS.hand,
    "/img/belize-ladies-1.png","/img/belize-ladies-2.png","/img/belize-ladies-3.png",
    "/img/belize-tee-1-front.png","/img/belize-tee-1-back.png",
    "/img/belize-tee-2-front.png","/img/belize-tee-2-back.png",
  ].forEach(f => console.log("  " + f));
});
