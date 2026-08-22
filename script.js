// Theme toggle (dark / light-beige), persisted where storage is available, shared across pages
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t){
  html.setAttribute('data-theme', t);
  if(themeToggle){
    themeToggle.textContent = t === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', t === 'light' ? '#f6efe0' : '#07070b');
  try{ localStorage.setItem('rashid-theme', t); }catch(e){}
}
let startTheme = 'light'; // light mode is the default on first visit
try{
  const saved = localStorage.getItem('rashid-theme');
  if(saved){ startTheme = saved; } // a returning visitor's toggle choice always wins
}catch(e){}
applyTheme(startTheme);
if(themeToggle){
  themeToggle.addEventListener('click', ()=>{
    applyTheme(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });
}

// Rotating quotes (home page only)
const quoteEl = document.getElementById('quoteText');
if(quoteEl){
  const quotes = [
    "Jack of all trades, master of none — but oftentimes better than a master of one.",
    "Piracy is not over.",
    "Culture shouldn't exist only for those who can afford it."
  ];
  const dotsEl = document.getElementById('quoteDots');
  let qi = 0;
  quoteEl.textContent = quotes[0];
  if(dotsEl) dotsEl.innerHTML = quotes.map((_,i)=>`<span class="${i===0?'active':''}"></span>`).join('');
  function showQuote(i){
    quoteEl.classList.add('fade');
    setTimeout(()=>{
      qi = i;
      quoteEl.textContent = quotes[qi];
      quoteEl.classList.remove('fade');
      if(dotsEl) [...dotsEl.children].forEach((d,idx)=>d.classList.toggle('active', idx===qi));
    }, 400);
  }
  setInterval(()=>showQuote((qi+1) % quotes.length), 5000);
}

// Hero letter-by-letter reveal (home page only)
const title = document.getElementById('heroTitle');
if(title){
  const text = [
    {t:"Rashid ", grad:false},
    {t:"Ahmad.", grad:true}
  ];
  let delay = 0;
  text.forEach(part=>{
    [...part.t].forEach(ch=>{
      const el = document.createElement('span');
      el.className = 'letter' + (part.grad ? ' grad':'') + (ch === ' ' ? ' space' : '');
      el.style.animationDelay = delay + 's';
      el.textContent = ch;
      title.appendChild(el);
      delay += 0.035;
    });
  });
}

// Marquee ticker content (home page only)
const tickerEl = document.getElementById('ticker');
if(tickerEl){
  const skills = ["HTML5","CSS3","JavaScript","Node.js","Python","Pandas","MySQL","KYC Compliance","Data Entry","Excel","Git/GitHub","AI Workflows","REST APIs","Quality Assurance"];
  tickerEl.innerHTML = [...skills, ...skills].map(s=>`<span>${s}</span>`).join('');
}

// Scroll progress bar
const progress = document.getElementById('progress');
if(progress){
  window.addEventListener('scroll', ()=>{
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = pct + '%';
  });
}

// Cursor glow (desktop only)
const glow = document.getElementById('glow');
if(glow){
  window.addEventListener('pointermove', (e)=>{
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// Scroll reveal — exposed as a function so dynamically-added cards (blog posts) can hook in too
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:.12});
function observeReveals(root=document){
  root.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}
observeReveals();

// Mobile menu toggle
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if(burger && mobileMenu){
  burger.addEventListener('click', ()=>{
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
}

// Tilt effect on cards (skip on touch / reduced motion) — also exposed for dynamically-added cards
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
function attachTilt(root=document){
  if(prefersReduced || !isFine) return;
  root.querySelectorAll('.card:not([data-tilt-bound])').forEach(card=>{
    card.setAttribute('data-tilt-bound', '1');
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - .5;
      const y = (e.clientY - r.top)/r.height - .5;
      card.style.transform = `perspective(700px) rotateX(${y*-7}deg) rotateY(${x*7}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)'; });
  });
}
attachTilt();

// Share buttons — works for both the homepage blog cards and the in-page blog modal,
// since it's delegated on document rather than bound to elements that exist at load time.
function runShare(btn){
  const platform = btn.dataset.platform;
  const url = btn.dataset.url || window.location.href;
  const text = btn.dataset.text || document.title;
  const enc = encodeURIComponent;
  const intents = {
    fb: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    x: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
    wa: `https://wa.me/?text=${enc(text + ' ' + url)}`
  };
  if(intents[platform]){
    window.open(intents[platform], '_blank', 'noopener,width=600,height=500');
    return;
  }
  // Instagram has no public web share intent — copy the link instead
  const original = btn.textContent;
  navigator.clipboard?.writeText(url).then(()=>{
    btn.classList.add('copied');
    btn.textContent = '✓';
    setTimeout(()=>{ btn.classList.remove('copied'); btn.textContent = original; }, 1400);
  }).catch(()=>{});
}
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.share-btn');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  runShare(btn);
});

// ---------- Blog system: load blogs.json, render cards, and the in-page blog modal ----------
let BLOGS = [];
const blogGrid = document.getElementById('blogGrid');
const blogModal = document.getElementById('blogModal');

function shareRowHTML(id, title, url){
  // Order matches the requested set: Instagram, Facebook, WhatsApp, X
  return `
    <button class="share-btn ig" data-platform="ig" data-url="${url}" data-text="${title}" aria-label="Copy link to share on Instagram">ig</button>
    <button class="share-btn fb" data-platform="fb" data-url="${url}" data-text="${title}" aria-label="Share on Facebook">f</button>
    <button class="share-btn wa" data-platform="wa" data-url="${url}" data-text="${title}" aria-label="Share on WhatsApp">w</button>
    <button class="share-btn x" data-platform="x" data-url="${url}" data-text="${title}" aria-label="Share on X">X</button>
  `;
}

function likeState(id){
  let liked = false, likes = 0;
  try{
    liked = localStorage.getItem(`liked-${id}`) === '1';
    const stored = localStorage.getItem(`likes-${id}`);
    likes = stored !== null ? parseInt(stored, 10) : null;
  }catch(e){}
  return { liked, likes };
}

function renderBlogCards(){
  if(!blogGrid) return;
  blogGrid.innerHTML = BLOGS.map(post=>{
    const url = window.location.origin + window.location.pathname + post.sharePath;
    return `
    <div class="card blog-card reveal" data-blog-id="${post.id}" style="cursor:pointer;">
      <span class="blog-date mono">${post.category} · ${post.date}</span>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <span class="arrow-link">Read post</span>
      <div class="share-row">${shareRowHTML(post.id, post.title, url)}</div>
    </div>`;
  }).join('');

  // Clicking anywhere on the card (but not a share button) opens the full blog in-page
  blogGrid.querySelectorAll('.blog-card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.share-btn')) return;
      openBlogModal(card.dataset.blogId);
    });
  });

  // Hook the newly-created cards into the reveal-on-scroll and tilt systems
  observeReveals(blogGrid);
  attachTilt(blogGrid);
}

function openBlogModal(id){
  const post = BLOGS.find(p=>p.id === id);
  if(!post || !blogModal) return;
  const url = window.location.origin + window.location.pathname + post.sharePath;

  document.getElementById('blogModalMeta').textContent = `${post.category} · ${post.date}`;
  document.getElementById('blogModalTitle').textContent = post.title;
  document.getElementById('blogModalBody').innerHTML = post.content.map(p=>`<p>${p}</p>`).join('');
  document.getElementById('blogModalShare').innerHTML = shareRowHTML(post.id, post.title, url);

  const { liked, likes } = likeState(post.id);
  const baseLikes = likes !== null ? likes : post.likes;
  const likeBtn = document.getElementById('likeBtn');
  likeBtn.dataset.blogId = post.id;
  likeBtn.dataset.baseLikes = post.likes;
  likeBtn.classList.toggle('liked', liked);
  likeBtn.setAttribute('aria-pressed', liked);
  document.getElementById('likeCount').textContent = baseLikes;

  document.getElementById('supportBtn').dataset.fromBlog = post.id;
  history.replaceState(null, '', post.sharePath);
  blogModal.classList.add('open');
  blogModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeBlogModal(){
  if(!blogModal) return;
  blogModal.classList.remove('open');
  blogModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  history.replaceState(null, '', window.location.pathname);
}

if(blogGrid){
  fetch('blogs.json')
    .then(res=>res.json())
    .then(data=>{ BLOGS = data; renderBlogCards(); })
    .catch(()=>{
      // Fetch fails when the page is opened directly as a file:// URL — needs to be served over http(s).
      blogGrid.innerHTML = '<p class="mono" style="color:var(--muted);">Couldn\'t load blog posts — this page needs to be served over http(s) (e.g. GitHub Pages or a local server) for blogs.json to load.</p>';
    });

  document.getElementById('blogModalClose')?.addEventListener('click', closeBlogModal);
  blogModal?.addEventListener('click', (e)=>{ if(e.target === blogModal) closeBlogModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeBlogModal(); });

  document.getElementById('likeBtn')?.addEventListener('click', ()=>{
    const btn = document.getElementById('likeBtn');
    const id = btn.dataset.blogId;
    const nowLiked = !btn.classList.contains('liked');
    const base = parseInt(btn.dataset.baseLikes, 10);
    const countEl = document.getElementById('likeCount');
    const newCount = base + (nowLiked ? 1 : 0);
    btn.classList.toggle('liked', nowLiked);
    btn.setAttribute('aria-pressed', nowLiked);
    countEl.textContent = newCount;
    try{
      localStorage.setItem(`liked-${id}`, nowLiked ? '1' : '0');
      localStorage.setItem(`likes-${id}`, newCount);
    }catch(e){}
  });
}

// ---------- Support Rash: amount picker -> UPI payment screen ----------
const supportModal = document.getElementById('supportModal');
const paymentModal = document.getElementById('paymentModal');
const UPI_ID = 'rashidahmad@upi'; // placeholder — replace with the real UPI ID
const PAYEE_NAME = 'Rashid Ahmad';

if(supportModal && paymentModal){
  let selectedAmount = null;

  function updateContinueState(){
    const btn = document.getElementById('continueBtn');
    btn.disabled = !selectedAmount || selectedAmount <= 0;
  }

  document.getElementById('supportBtn')?.addEventListener('click', ()=>{
    selectedAmount = null;
    document.querySelectorAll('.amount-chip').forEach(c=>c.classList.remove('active'));
    document.getElementById('customAmount').value = '';
    updateContinueState();
    supportModal.classList.add('open');
    supportModal.setAttribute('aria-hidden', 'false');
  });

  document.querySelectorAll('.amount-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('.amount-chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('customAmount').value = '';
      selectedAmount = parseInt(chip.dataset.amount, 10);
      updateContinueState();
    });
  });

  document.getElementById('customAmount')?.addEventListener('input', (e)=>{
    document.querySelectorAll('.amount-chip').forEach(c=>c.classList.remove('active'));
    const v = parseInt(e.target.value, 10);
    selectedAmount = (v && v > 0) ? v : null;
    updateContinueState();
  });

  function closeSupportModal(){
    supportModal.classList.remove('open');
    supportModal.setAttribute('aria-hidden', 'true');
  }
  function closePaymentModal(){
    paymentModal.classList.remove('open');
    paymentModal.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('supportModalClose')?.addEventListener('click', closeSupportModal);
  supportModal.addEventListener('click', (e)=>{ if(e.target === supportModal) closeSupportModal(); });
  document.getElementById('paymentModalClose')?.addEventListener('click', closePaymentModal);
  paymentModal.addEventListener('click', (e)=>{ if(e.target === paymentModal) closePaymentModal(); });

  document.getElementById('continueBtn')?.addEventListener('click', ()=>{
    if(!selectedAmount) return;
    closeSupportModal();

    const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent('Support for Rash')}`;
    document.getElementById('payAmount').textContent = `₹${selectedAmount}`;
    document.getElementById('upiIdText').textContent = UPI_ID;
    document.getElementById('openUpiBtn').href = upiLink;

    const qrWrap = document.getElementById('qrWrap');
    qrWrap.innerHTML = '';
    if(window.QRCode){
      new QRCode(qrWrap, { text: upiLink, width: 160, height: 160, colorDark: '#0a0a0f', colorLight: '#ffffff' });
    }else{
      qrWrap.innerHTML = '<p class="mono" style="color:var(--muted); font-size:.8rem;">QR code library failed to load — use "Open in UPI App" instead.</p>';
    }

    paymentModal.classList.add('open');
    paymentModal.setAttribute('aria-hidden', 'false');
  });

  document.getElementById('copyUpiBtn')?.addEventListener('click', ()=>{
    const btn = document.getElementById('copyUpiBtn');
    navigator.clipboard?.writeText(UPI_ID).then(()=>{
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(()=>{ btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1400);
    }).catch(()=>{});
  });
}

// ---------- Newsletter (client-side only — wire up a real endpoint, e.g. Mailchimp/ConvertKit, to actually collect emails) ----------
document.querySelectorAll('.newsletter-form').forEach(form=>{
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const status = form.parentElement.querySelector('.newsletter-status');
    const email = form.querySelector('input[type="email"]').value;
    if(status){ status.textContent = `Thanks — ${email} is on the list.`; }
    form.reset();
  });
});

// ---------- Gallery: swap a broken placeholder image for a styled "add image" tile ----------
document.querySelectorAll('.gallery-item img').forEach(img=>{
  img.addEventListener('error', ()=>{
    img.closest('.gallery-item')?.classList.add('gallery-item--empty');
  }, { once:true });
});
