/* js/main.js
   Implements many DOM events: mouse, keyboard, form, window, touch.
*/

const menuData = [
  {id:1, title:"Cosmic Latte", desc:"Silky espresso with oat milk", price:3.5, story:"A warm hug in a cup."},
  {id:2, title:"Meteor Muffin", desc:"Blueberry muffin with crumble top", price:2.75, story:"Baked on a starlit morning."},
  {id:3, title:"Galaxy Burger", desc:"Double patty with signature sauce", price:6.5, story:"A bold orbit of flavor."},
  {id:4, title:"Solar Salad", desc:"Quinoa, beet, avocado & citrus", price:4.25, story:"Freshness that brightens the day."},
  {id:5, title:"Nebula Smoothie", desc:"Mixed berries & banana boost", price:3.95, story:"A swirl of vibrant goodness."}
];

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart(){ 
  localStorage.setItem('cart', JSON.stringify(cart)); 
  updateCartCount(); 
}

function updateCartCount(){
  const el = document.getElementById('cart-count');
  if(el) el.textContent = cart.reduce((s,i)=>s+i.qty,0);
}

function showToast(message, timeout=1800){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = message; t.style.display='block';
  clearTimeout(t._h);
  t._h = setTimeout(()=> t.style.display='none', timeout);
}

// =======================
// Menu rendering
// =======================
function renderMenu(filter=""){
  const menu = document.getElementById('menu');
  if(!menu) return;
  menu.innerHTML = "";
  menuData.filter(m=> 
      m.title.toLowerCase().includes(filter.toLowerCase()) || 
      m.desc.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach(item=>{
      const card = document.createElement('article');
      card.className='card';
      card.tabIndex = 0;
      card.innerHTML = `
        <h4 class="title">${item.title}</h4>
        <p class="desc">${item.desc}</p>
        <div class="price">$${item.price.toFixed(2)}</div>
        <div class="actions">
          <button class="btn btn-primary add-btn" data-id="${item.id}">Add</button>
          <button class="btn btn-outline more-btn" data-id="${item.id}">Details</button>
        </div>
      `;

      // mouse events
      card.addEventListener('mouseover', ()=> {
        const s = document.getElementById('story-text');
        if(s) s.textContent = item.story;
      });
      card.addEventListener('mouseout', ()=> {
        const s = document.getElementById('story-text');
        if(s) s.textContent = "Orbit Cafe began as a tiny stall on a rainy evening — hover on any item to reveal its little tale.";
      });
      card.addEventListener('dblclick', ()=> { 
        addToCart(item.id,2); 
        showToast('Added 2 via double-click'); 
      });
      card.addEventListener('contextmenu', (e)=> { 
        e.preventDefault(); 
        showToast('Right-click menu disabled for demo'); 
      });

      // touch events
      card.addEventListener('touchstart', ()=> { 
        card.classList.add('touched'); 
        showToast('Touched'); 
      });
      card.addEventListener('touchend', ()=> { 
        card.classList.remove('touched'); 
      });

      // button handlers
      card.querySelector('.add-btn').addEventListener('click', () => addToCart(item.id));
      card.querySelector('.more-btn').addEventListener('click', () => {
        showToast(item.title + ": " + item.story);
      });

      menu.appendChild(card);
    });
}

// =======================
// Cart handling
// =======================
function addToCart(id, qty=1){
  const item = menuData.find(m=>m.id==id);
  if(!item) return;
  const existing = cart.find(c=>c.id==id);
  if(existing) existing.qty += qty;
  else cart.push({id:id, title:item.title, price:item.price, qty:qty});
  saveCart();
  showToast(`${item.title} added`);
}

function renderCartPage(){
  const container = document.getElementById('cart-list');
  if(!container) return;
  container.innerHTML = "";
  if(cart.length===0) {
    container.innerHTML = "<p>Your cart is empty. Go add tasty things!</p>";
    return;
  }
  cart.forEach(ci=>{
    const el = document.createElement('div'); 
    el.className='cart-item';
    el.innerHTML = `
      <div>
        <strong>${ci.title}</strong> 
        <div style="color:var(--muted)">${ci.qty} × $${ci.price.toFixed(2)}</div>
      </div>
      <div>
        <button class="btn btn-outline dec" data-id="${ci.id}">-</button>
        <button class="btn btn-outline inc" data-id="${ci.id}">+</button>
        <button class="btn btn-primary rem" data-id="${ci.id}">Remove</button>
      </div>`;
    container.appendChild(el);
  });

  // attach handlers
  container.querySelectorAll('.inc').forEach(b=> b.addEventListener('click', e=>{
    const id = Number(e.target.dataset.id); 
    const it = cart.find(x=>x.id===id); 
    if(it){ it.qty++; saveCart(); renderCartPage(); }
  }));
  container.querySelectorAll('.dec').forEach(b=> b.addEventListener('click', e=>{
    const id = Number(e.target.dataset.id); 
    const it = cart.find(x=>x.id===id); 
    if(it){ it.qty = Math.max(1, it.qty-1); saveCart(); renderCartPage(); }
  }));
  container.querySelectorAll('.rem').forEach(b=> b.addEventListener('click', e=>{
    const id = Number(e.target.dataset.id); 
    cart = cart.filter(x=>x.id!==id); 
    saveCart(); 
    renderCartPage();
  }));
}

// =======================
// Checkout
// =======================
function setupCheckout(){
  const form = document.getElementById('checkout-form');
  if(!form) return;
  const fullname = form.querySelector('#fullname');
  const contact = form.querySelector('#contact');
  const payment = form.querySelector('#payment');

  fullname.addEventListener('input', ()=> { fullname.setCustomValidity(''); });
  payment.addEventListener('change', ()=> { 
    if(payment.value==='') 
      payment.setCustomValidity('Please choose payment method'); 
    else 
      payment.setCustomValidity(''); 
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    const modal = document.getElementById('order-modal');
    const sum = cart.reduce((s,i)=>s + i.qty * i.price, 0);
    document.getElementById('order-summary').textContent = 
      `Thank you ${fullname.value}. Order total: $${sum.toFixed(2)}.`;
    if(modal){ modal.hidden = false; }
    cart = []; saveCart(); renderCartPage();
  });
}

// =======================
// Modal controls
// =======================
function setupModal() {
  const modal = document.getElementById('order-modal');
  const closeBtn = document.getElementById('close-modal');
  if (!modal || !closeBtn) return;

  // Close modal on button click
  closeBtn.addEventListener('click', () => {
    modal.hidden = true;
  });

  // Close modal when clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.hidden = true;
  });
}

// Example: open modal with JS
function openModal(summaryText) {
  const modal = document.getElementById('order-modal');
  const summary = document.getElementById('order-summary');
  summary.textContent = summaryText; // update content
  modal.hidden = false;
}

// =======================
// Keyboard + Search + Theme
// =======================
function setupKeyboard(){
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'g'){ 
      const s = document.getElementById('search'); 
      if(s){ s.focus(); e.preventDefault(); showToast('Search focused (g)'); } 
    }
    if(e.key === 'a'){ window.location.href = 'cart.html'; }
  });
}

function setupSearch(){
  const s = document.getElementById('search');
  if(!s) return;
  s.addEventListener('input', (e)=> { renderMenu(e.target.value); });
}

function setupThemeToggle(){
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  const apply = (t)=> { 
    document.documentElement.setAttribute('data-theme', t); 
    btn.textContent = t==='dark' ? '☀️' : '🌙'; 
    localStorage.setItem('theme', t); 
  };
  const current = localStorage.getItem('theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  apply(current);
  btn.addEventListener('click', ()=> {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
  });
}

function setupFocusStyles(){
  document.addEventListener('keydown', (e)=> {
    if(e.key === 'Tab') document.body.classList.add('show-focus');
  });
}

// =======================
// Init
// =======================
function init(){
  renderMenu();
  updateCartCount();
  setupThemeToggle();
  setupKeyboard();
  setupSearch();
  setupFocusStyles();

  if(document.getElementById('cart-list')){
    renderCartPage(); 
    setupCheckout(); 
  }

  // ✅ Always setup modal (fixes your issue)
  setupModal();
}

document.addEventListener("DOMContentLoaded", init);
