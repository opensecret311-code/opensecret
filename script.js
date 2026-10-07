const PRODUCTS=[{"id": 2, "name": "Creed Aventus", "prices": {"6 ml": 150, "10 ml": 250, "20 ml": 450, "30 ml": 600, "50 ml": "Call/SMS for price"}, "tags": "Fresh \u2022 Fruity \u2022 Powerful", "images": ["assets/product-2-1.jpg", "assets/product-2-2.jpg", "assets/product-2-3.jpg"]}, {"id": 4, "name": "Versace Eros", "prices": {"6 ml": 150, "10 ml": 250, "20 ml": 450, "30 ml": 600, "50 ml": "Call/SMS for price"}, "tags": "Fresh \u2022 Citrus \u2022 Seductive", "images": ["assets/product-4-1.jpg", "assets/product-4-2.jpg", "assets/product-4-3.jpg"]}, {"id": 10, "name": "Dior Sauvage", "prices": {"6 ml": 140, "10 ml": 230, "20 ml": 420, "30 ml": 550, "50 ml": "Call/SMS for price"}, "tags": "Fresh \u2022 Spicy \u2022 Iconic", "images": ["assets/product-10-1.jpg", "assets/product-10-2.jpg", "assets/product-10-3.jpg"]}];
const SOCIAL={facebook:'https://www.facebook.com/opensecret311',instagram:'#',tiktok:'https://www.tiktok.com/@opensecret311',youtube:'https://www.youtube.com/@OpenSecret311',whatsapp:'https://api.whatsapp.com/send?phone=8801581906311'};
const WA_NUMBER='8801581906311';
const DELIVERY_FEE={inside:70,outside:120};
let deliveryLocation=null;

/* ---- cart load (safe: bad JSON or removed products won't crash the site) ---- */
let cart=[];
try{cart=JSON.parse(localStorage.getItem('openSecretCart')||'[]')}catch(e){cart=[]}
cart=cart.filter(x=>PRODUCTS.some(p=>p.id===x.id));

const money=n=>'৳ '+Number(n).toLocaleString('en-BD');
const getProduct=id=>PRODUCTS.find(p=>p.id===id);
const getPrice=x=>{const p=getProduct(x.id);return p?p.prices[x.size]:x.price};
function save(){localStorage.setItem('openSecretCart',JSON.stringify(cart));renderCart()}

function setLocation(loc){
  deliveryLocation=loc;
  document.getElementById('locInside').classList.toggle('active',loc==='inside');
  document.getElementById('locOutside').classList.toggle('active',loc==='outside');
  clearError();
  renderCart();
}
function changeQty(key,delta){const x=cart.find(i=>i.key===key);if(!x)return;x.qty+=delta;if(x.qty<=0)cart=cart.filter(i=>i.key!==key);save()}
function removeItem(key){cart=cart.filter(i=>i.key!==key);save()}

function renderCart(){
  const box=document.getElementById('cartItems');if(!box)return;
  const count=cart.reduce((a,x)=>a+x.qty,0);
  document.getElementById('cartCount').textContent=count;
  document.getElementById('cartTitle').textContent=count;
  const orderBtn=document.getElementById('orderBtn');
  const feeEl=document.getElementById('deliveryFee');
  const fee=deliveryLocation?DELIVERY_FEE[deliveryLocation]:0;

  if(!cart.length){
    box.innerHTML='<div class="empty">Your cart is empty.<br><br><a class="btn" href="#shop" onclick="closeCart()">Shop fragrances</a></div>';
    document.getElementById('subtotal').textContent='৳ 0';
    feeEl.textContent=deliveryLocation?money(fee):'Select location';
    document.getElementById('total').textContent=deliveryLocation?money(fee):'৳ 0';
    orderBtn.disabled=true;orderBtn.textContent='Cart is empty';
    return;
  }

  let subtotal=0;
  box.innerHTML=cart.map(x=>{
    const p=getProduct(x.id);const price=getPrice(x);
    const line=typeof price==='number'?price*x.qty:0;subtotal+=line;
    return `<div class="cart-item"><img src="${p.images[0]}" alt="${p.name}"><div><h4>${p.name}</h4><small>${x.size} · ${typeof price==='number'?money(price):'Price on request'}</small><div class="qty"><button onclick="changeQty('${x.key}',-1)">−</button><b>${x.qty}</b><button onclick="changeQty('${x.key}',1)">+</button></div></div><button class="remove" onclick="removeItem('${x.key}')">⌫</button></div>`;
  }).join('');

  document.getElementById('subtotal').textContent=money(subtotal);
  feeEl.textContent=deliveryLocation?money(fee):'Select location';
  document.getElementById('total').textContent=money(subtotal+fee);
  orderBtn.disabled=false;orderBtn.textContent='Order on WhatsApp';
}

function openCart(){document.getElementById('cart').classList.add('open');document.getElementById('overlay').classList.add('open');renderCart()}
function closeCart(){document.getElementById('cart').classList.remove('open');document.getElementById('overlay').classList.remove('open')}

/* ---- checkout form ---- */
function clearError(){
  const e=document.getElementById('formError');if(e)e.textContent='';
  ['fName','fPhone','fAddress'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('invalid')});
}
function showError(msg,fieldId){
  document.getElementById('formError').textContent=msg;
  if(fieldId){const f=document.getElementById(fieldId);f.classList.add('invalid');const inp=f.querySelector('input,textarea');if(inp)inp.focus()}
}
function normalizePhone(v){return v.replace(/[\s\-()]/g,'')}
function validPhone(v){return /^(\+?88)?01[3-9]\d{8}$/.test(normalizePhone(v))}

function orderCartWhatsApp(){
  clearError();
  if(!cart.length){showError('Your cart is empty.');return}
  const name=document.getElementById('custName').value.trim();
  const phone=document.getElementById('custPhone').value.trim();
  const address=document.getElementById('custAddress').value.trim();

  if(!deliveryLocation){showError('Please select Inside Dhaka or Outside Dhaka.');return}
  if(name.length<2){showError('Please enter your name.','fName');return}
  if(!validPhone(phone)){showError('Please enter a valid phone number (e.g. 01XXXXXXXXX).','fPhone');return}
  if(address.length<8){showError('Please enter your full delivery address.','fAddress');return}

  // price on request items can't be ordered automatically
  if(cart.some(x=>typeof getPrice(x)!=='number')){showError('Remove the "Call/SMS for price" item or contact us for its price.');return}

  const fee=DELIVERY_FEE[deliveryLocation];
  const locLabel=deliveryLocation==='inside'?'Inside Dhaka':'Outside Dhaka';
  let subtotal=0;
  const lines=cart.map((x,i)=>{
    const p=getProduct(x.id);const price=getPrice(x);const line=price*x.qty;subtotal+=line;
    return `${i+1}. ${p.name} — ${x.size} — Qty: ${x.qty} — ${money(line)}`;
  });
  const msg=[
    'Hi OPEN SECRET, I want to place an order:','',
    ...lines,'',
    `Subtotal: ${money(subtotal)}`,
    `Delivery (${locLabel}): ${money(fee)}`,
    `Total: ${money(subtotal+fee)}`,'',
    '--- Customer Details ---',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Delivery Location: ${locLabel}`,
    `Address: ${address}`,'',
    'Please confirm my order.'
  ].join('\n');
  window.location.href='https://api.whatsapp.com/send?phone='+WA_NUMBER+'&text='+encodeURIComponent(msg);
}

/* ---- social ---- */
function setupSocial(){document.querySelectorAll('[data-social]').forEach(a=>{const k=a.dataset.social;if(SOCIAL[k]&&SOCIAL[k]!=='#')a.href=SOCIAL[k];else if(k==='whatsapp')a.href=SOCIAL.whatsapp;a.target='_blank'})}

/* ---- product cards: image, name and button all go to the product page (size selection there) ---- */
function renderProducts(){
  const el=document.getElementById('products');
  el.innerHTML=PRODUCTS.map(p=>{
    if(p.comingSoon){
      return `<article class="card coming-soon"><div class="card-img"><img src="${p.images[0]}" alt="${p.name}"><div class="soon-badge">Coming Soon</div></div><div class="card-body"><h3>${p.name}</h3><div class="tags">${p.tags}</div><div class="card-row"><div><span class="from">Launching Soon</span></div></div></div></article>`;
    }
    const url=`product.html?id=${p.id}`;
    return `<article class="card"><a href="${url}"><div class="card-img"><img src="${p.images[0]}" alt="${p.name}"></div></a><div class="card-body"><h3><a href="${url}">${p.name}</a></h3><div class="tags">${p.tags}</div><div class="card-row"><div><span class="from">From </span><span class="price">${money(p.prices['6 ml'])}</span></div><a class="choose" href="${url}">Select size</a></div></div></article>`;
  }).join('');
}

renderProducts();renderCart();setupSocial();
// coming back from the product page after "Add to Cart": open the cart automatically
if(sessionStorage.getItem('openCartNow')){sessionStorage.removeItem('openCartNow');openCart()}
