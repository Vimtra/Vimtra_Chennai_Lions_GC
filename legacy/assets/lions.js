/* ============================================================
   VIMTRA CHENNAI LIONS GC — shared runtime
   - Tailwind config
   - Loading screen
   - Navbar + footer injection (auto-replaces existing header/footer)
   - AOS init (Nice And Slow)
   - Lucide icons
   - AE-style text animations via IntersectionObserver
   - Cart badge (reads localStorage 'lions_cart')
============================================================ */
(function(){
  'use strict';

  /* ---------- 0. Tailwind theme extension (runs immediately) ---------- */
  if (window.tailwind && window.tailwind.config) {
    window.tailwind.config = {
      theme: {
        extend: {
          colors: {
            crimson:{600:'#C4202A',700:'#B11C25',800:'#A8181F',900:'#871119'},
            cream:{50:'#FBF9F4',100:'#F4F0E8'},
            gold:{400:'#E6C57E',500:'#C39A52',deep:'#3A1A06'},
            ink:'#1A1513',muted:'#6B635C'
          },
          fontFamily:{sora:['Sora','sans-serif'],manrope:['Manrope','sans-serif']}
        }
      }
    };
  }

  /* ---------- 1. NAV CONFIG ---------- */
  const NAV_ITEMS = [
    {href:'index.html',                      label:'Home',         icon:'home'},
    {href:'the-club.html',                   label:'The Club',     icon:'castle'},
    {href:'the-pride.html',                  label:'The Pride',    icon:'users-round'},
    {href:'players.html',                    label:'Players',      icon:'flag'},
    {href:'fixtures.html',                   label:'Fixtures',     icon:'calendar-days'},
    {href:'scores.html',                     label:'Scores',       icon:'activity'},
    {href:'leaderboards.html',               label:'Leaderboards', icon:'trophy'},
    {href:'news.html',                       label:'News',         icon:'newspaper'},
    {href:'gallery.html',                    label:'Gallery',      icon:'image'},
    {href:'shop.html',                       label:'Shop',         icon:'shopping-bag'},
    {href:'partners.html',                   label:'Partners',     icon:'handshake'},
    {href:'contact.html',                    label:'Contact',      icon:'send'},
    {href:'profile.html',                    label:'Profile',      icon:'user-round'}
  ];
  // Pages visible inline on desktop (rest live in the hamburger overlay)
  const PRIMARY_NAV = ['the-club.html','players.html','fixtures.html','news.html','shop.html'];

  const currentPath = (location.pathname.split('/').pop() || '').toLowerCase();
  function isActive(href){
    return decodeURIComponent(href).toLowerCase() === decodeURIComponent(currentPath).toLowerCase();
  }

  /* ---------- 2. LOADING SCREEN (inject ASAP) ---------- */
  function injectLoader(){
    if (document.getElementById('lions-loader')) return;
    const word = 'VIMTRA CHENNAI LIONS';
    const wordHTML = word.split(' ').map((w,i)=>
      `<span class="w"><span style="animation-delay:${i*120}ms">${w}</span></span>`
    ).join('');
    const loader = document.createElement('div');
    loader.id = 'lions-loader';
    loader.innerHTML = `
      <div class="loader-ring delay"></div>
      <div class="loader-ring"></div>
      <img src="assets/logo-lion.png" alt="" class="loader-logo">
      <div class="loader-wordmark">${wordHTML}</div>
      <div class="loader-tag">GOLF&nbsp;CLUB&nbsp;·&nbsp;GC</div>
      <div class="loader-bar"></div>
    `;
    (document.body || document.documentElement).prepend(loader);
  }
  // Run loader injection on DOM ready
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectLoader);
  } else { injectLoader(); }

  function hideLoader(){
    const l = document.getElementById('lions-loader');
    if (!l) return;
    setTimeout(()=>l.classList.add('is-leaving'), 700);
    setTimeout(()=>l.remove(), 1700);
  }
  window.addEventListener('load', hideLoader);

  /* ---------- 3. CART BADGE ---------- */
  function getCart(){
    try { return JSON.parse(localStorage.getItem('lions_cart')||'[]'); }
    catch(e){ return []; }
  }
  function cartCount(){ return getCart().reduce((s,i)=>s+(i.qty||0),0); }

  /* ---------- 4. NAVBAR ---------- */
  function buildHeader(){
    const cartN = cartCount();
    const cartBadge = cartN > 0 ? `<span class="cart-badge">${cartN}</span>` : '';
    const primaryLinks = NAV_ITEMS.filter(n=>PRIMARY_NAV.includes(n.href))
      .map(n=>`<a class="nav-link ${isActive(n.href)?'is-active':''}" href="${n.href}">${n.label}</a>`)
      .join('');

    return `
      <header class="lions-header">
        <nav class="max-w-[1280px] mx-auto px-5 md:px-8 py-3 flex items-center gap-3 md:gap-5">
          <a href="index.html" class="flex items-center gap-3 no-underline group">
            <img src="assets/logo-lion.png" alt="Vimtra Chennai Lions GC"
                 class="h-[42px] w-[42px] object-contain bg-white rounded-[10px] p-1 shadow-lg
                        transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105"/>
            <span class="flex flex-col leading-tight">
              <span class="font-sora font-extrabold text-[14px] tracking-[0.15em] text-white">VIMTRA CHENNAI LIONS</span>
              <span class="font-manrope font-semibold text-[9.5px] tracking-[0.46em] text-[#E9CB8E]">GOLF&nbsp;CLUB&nbsp;·&nbsp;GC</span>
            </span>
          </a>
          <div class="flex-1"></div>
          <div class="hidden lg:flex items-center gap-7">
            ${primaryLinks}
          </div>
          <a class="cta-gold hidden md:inline-flex press" href="contact.html">
            <i data-lucide="send" class="w-[14px] h-[14px]"></i> LET'S TALK
          </a>
          <a class="icon-btn press" href="cart.html" aria-label="Cart">
            <i data-lucide="shopping-bag"></i>${cartBadge}
          </a>
          <a class="icon-btn press ${currentPath==='profile.html'?'!bg-[#1A1513]':''}" href="profile.html" aria-label="Profile">
            <i data-lucide="user-round"></i>
          </a>
          <button class="icon-btn press" id="lions-menu-btn" aria-label="Menu">
            <i data-lucide="menu"></i>
          </button>
        </nav>
      </header>
    `;
  }

  function buildOverlay(){
    const items = NAV_ITEMS.map((n,i)=>
      `<a href="${n.href}" style="animation-delay:${80 + i*55}ms" class="${isActive(n.href)?'text-[#E9CB8E]':''}">
        <i data-lucide="${n.icon}" class="inline-block w-5 h-5 mr-3 align-middle opacity-70"></i>${n.label}
      </a>`
    ).join('');
    return `
      <div class="lions-overlay" id="lions-overlay">
        <button class="overlay-close press" id="lions-menu-close" aria-label="Close">
          <i data-lucide="x"></i>
        </button>
        <div class="menu-list">${items}</div>
        <div class="overlay-meta">© 2026 · VIMTRA CHENNAI LIONS · GC</div>
      </div>
    `;
  }

  /* ---------- 5. FOOTER ---------- */
  function buildFooter(){
    return `
      <footer class="lions-footer">
        <div class="ft-grid">
          <div class="ft-col">
            <a href="index.html" class="flex items-center gap-3 no-underline">
              <img src="assets/logo-lion.png" alt="" class="h-12 w-12 object-contain bg-white rounded-[11px] p-1.5 tilt"/>
              <span class="flex flex-col leading-tight">
                <span class="font-sora font-extrabold text-[16px] tracking-[0.12em] text-white">VIMTRA CHENNAI LIONS</span>
                <span class="font-manrope font-semibold text-[10px] tracking-[0.4em] text-[#E9CB8E]">GOLF&nbsp;CLUB&nbsp;·&nbsp;GC</span>
              </span>
            </a>
            <p class="mt-5 text-[13.5px] leading-[1.65] text-white/70 font-manrope max-w-[300px]">
              Official IGPL franchise representing Tamil Nadu. Long-term build, full-throated pride.
            </p>
            <div class="ft-socials">
              <a href="#" aria-label="Instagram"><i data-lucide="instagram"></i></a>
              <a href="#" aria-label="X"><i data-lucide="twitter"></i></a>
              <a href="#" aria-label="YouTube"><i data-lucide="youtube"></i></a>
              <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin"></i></a>
              <a href="#" aria-label="Facebook"><i data-lucide="facebook"></i></a>
            </div>
          </div>
          <div class="ft-col">
            <h4>The Club</h4>
            <a href="the-club.html"><i data-lucide="chevron-right"></i><span>About the Club</span></a>
            <a href="the-pride.html"><i data-lucide="chevron-right"></i><span>The Pride</span></a>
            <a href="players.html"><i data-lucide="chevron-right"></i><span>Players</span></a>
            <a href="partners.html"><i data-lucide="chevron-right"></i><span>Partners</span></a>
            <a href="contact.html"><i data-lucide="chevron-right"></i><span>Contact</span></a>
          </div>
          <div class="ft-col">
            <h4>The Game</h4>
            <a href="fixtures.html"><i data-lucide="chevron-right"></i><span>Fixtures</span></a>
            <a href="scores.html"><i data-lucide="chevron-right"></i><span>Live Scores</span></a>
            <a href="leaderboards.html"><i data-lucide="chevron-right"></i><span>Leaderboards</span></a>
            <a href="news.html"><i data-lucide="chevron-right"></i><span>News &amp; Notebook</span></a>
            <a href="gallery.html"><i data-lucide="chevron-right"></i><span>Gallery</span></a>
          </div>
          <div class="ft-col">
            <h4>Stay In Touch</h4>
            <a href="mailto:pride@vimtrachennailions.gc"><i data-lucide="mail" style="opacity:1;margin-right:0;"></i><span>pride@vimtrachennailions.gc</span></a>
            <a href="mailto:partners@vimtrachennailions.gc"><i data-lucide="mail" style="opacity:1;margin-right:0;"></i><span>partners@vimtrachennailions.gc</span></a>
            <a href="#"><i data-lucide="map-pin" style="opacity:1;margin-right:0;"></i><span>Anna Salai, Teynampet · Chennai</span></a>
            <a class="cta-gold ft-cta press" href="contact.html">
              <i data-lucide="send" class="w-[14px] h-[14px]"></i> LET'S TALK
            </a>
          </div>
        </div>
        <div class="ft-bottom">
          <span>© 2026 Vimtra Chennai Lions GC. Official IGPL Franchise.</span>
          <span class="ae-shimmer font-sora font-bold tracking-widest">TEE OFF · PLAY PRO</span>
        </div>
      </footer>
    `;
  }

  /* ---------- 6. MOUNT — replace any existing header/footer ---------- */
  function mountChrome(){
    // remove any pre-existing header/footer/overlay from the page
    document.querySelectorAll('body > header, header.lions-header').forEach(n=>n.remove());
    document.querySelectorAll('body > footer, footer.lions-footer').forEach(n=>n.remove());
    document.querySelectorAll('#navOverlay, .lions-overlay').forEach(n=>n.remove());

    // inject header at top of body (after loader)
    const headerHTML = buildHeader();
    const overlayHTML = buildOverlay();
    const footerHTML = buildFooter();

    const headerEl = document.createElement('div');
    headerEl.innerHTML = headerHTML + overlayHTML;
    const loader = document.getElementById('lions-loader');
    if (loader && loader.nextSibling){
      Array.from(headerEl.children).forEach(c=>document.body.insertBefore(c, loader.nextSibling));
    } else {
      Array.from(headerEl.children).forEach(c=>document.body.prepend(c));
    }

    const footerEl = document.createElement('div');
    footerEl.innerHTML = footerHTML;
    Array.from(footerEl.children).forEach(c=>document.body.appendChild(c));

    // wire menu toggle
    const overlay = document.getElementById('lions-overlay');
    document.getElementById('lions-menu-btn').addEventListener('click',()=>overlay.classList.add('is-open'));
    document.getElementById('lions-menu-close').addEventListener('click',()=>overlay.classList.remove('is-open'));
    overlay.addEventListener('click',e=>{ if(e.target===overlay) overlay.classList.remove('is-open'); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') overlay.classList.remove('is-open'); });

    if (window.lucide && lucide.createIcons) lucide.createIcons();
  }

  /* ---------- 7. AE-STYLE TEXT ANIMATIONS ---------- */
  function splitTextElements(){
    document.querySelectorAll('[data-ae="mask"]').forEach(el=>{
      if (el.dataset.aeDone) return;
      const txt = el.textContent.trim();
      el.innerHTML = `<span class="ae-mask"><span class="ae-mask-inner">${txt}</span></span>`;
      el.dataset.aeDone='1';
    });
    document.querySelectorAll('[data-ae="words"]').forEach(el=>{
      if (el.dataset.aeDone) return;
      const words = el.textContent.trim().split(/\s+/);
      el.classList.add('ae-words');
      el.innerHTML = words.map((w,i)=>
        `<span class="ae-word"><span style="transition-delay:${i*90}ms">${w}</span></span>`
      ).join(' ');
      el.dataset.aeDone='1';
    });
    document.querySelectorAll('[data-ae="chars"]').forEach(el=>{
      if (el.dataset.aeDone) return;
      const txt = el.textContent;
      el.classList.add('ae-chars');
      el.innerHTML = [...txt].map((c,i)=>
        `<span class="ae-char" style="transition-delay:${i*35}ms">${c===' '?'&nbsp;':c}</span>`
      ).join('');
      el.dataset.aeDone='1';
    });
  }

  function observeAE(){
    const targets = document.querySelectorAll('[data-ae], .ae-blur, .ae-drift, .card-fade');
    if (!('IntersectionObserver' in window)){
      targets.forEach(t=>t.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if (e.isIntersecting){
          // small lead-in delay for a calmer After-Effects rhythm
          setTimeout(()=>e.target.classList.add('is-in'),
                     parseInt(e.target.dataset.aeDelay||'0',10));
          io.unobserve(e.target);
        }
      });
    },{threshold:0.18, rootMargin:'0px 0px -60px 0px'});
    targets.forEach(t=>io.observe(t));
  }

  /* ---------- 8. AOS — Nice And Slow ---------- */
  function initAOS(){
    if (window.AOS){
      AOS.init({
        duration: 1400,
        easing: 'ease-out-quart',
        once: true,
        offset: 100,
        delay: 0,
        anchorPlacement:'top-bottom'
      });
      setTimeout(()=>{ try{ AOS.refreshHard(); }catch(e){} }, 400);
    } else {
      // fallback if AOS missed
      const s = document.createElement('style');
      s.textContent='[data-aos]{opacity:1!important;transform:none!important;}';
      document.head.appendChild(s);
    }
  }

  /* ---------- 9. Smooth ripple on .press buttons ---------- */
  function pressRipples(){
    document.addEventListener('click',e=>{
      const t = e.target.closest('.press, .cta-gold');
      if (!t) return;
      const rect = t.getBoundingClientRect();
      const r = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.2;
      r.style.cssText = `position:absolute;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,.35);pointer-events:none;transform:scale(0);transition:transform .6s ease-out,opacity .8s ease-out;opacity:1;`;
      const prevPos = getComputedStyle(t).position;
      if (prevPos==='static') t.style.position='relative';
      t.style.overflow='hidden';
      t.appendChild(r);
      requestAnimationFrame(()=>{r.style.transform='scale(1)';r.style.opacity='0';});
      setTimeout(()=>r.remove(),800);
    });
  }

  /* ---------- 10. BOOT ---------- */
  function boot(){
    mountChrome();
    splitTextElements();
    observeAE();
    initAOS();
    pressRipples();
    // re-render lucide icons after any later injection
    if (window.lucide && lucide.createIcons) lucide.createIcons();
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  // Expose a tiny refresh hook
  window.Lions = { refresh: boot, cartCount, hideLoader };
})();
