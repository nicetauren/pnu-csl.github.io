// Shared chrome (topbar + footer) for CSLab subpages
(function(){
  // Theme: apply ASAP to avoid flash
  try {
    const t = localStorage.getItem('cslab-theme');
    if (t === 'dark') document.documentElement.setAttribute('data-theme','dark');
  } catch(e){}

  window.__cslabToggleTheme = function(){
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transition');
    if (next === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('cslab-theme', next); } catch(e){}
    clearTimeout(window.__cslabThemeTo);
    window.__cslabThemeTo = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 450);
  };

  window.__cslabThemeBtnHtml = `<button class="theme-toggle" type="button" aria-label="Toggle theme" onclick="__cslabToggleTheme()"><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button>`;

  const path = location.pathname.split('/').pop().toLowerCase();
  const nav = [
    {href:'index.html', num:'01', label:'Home'},
    {href:'members.html', num:'02', label:'Members'},
    {href:'research.html', num:'03', label:'Research'},
    {href:'projects.html', num:'04', label:'Projects'},
    {href:'publications.html', num:'05', label:'Publications'},
    {href:'photos.html', num:'06', label:'Photos'},
  ];

  const navHtml = nav.map(n => {
    const is = (path === n.href || (path === '' && n.href === 'index.html'));
    return `<a href="${n.href}"${is?' class="active"':''}><span class="num">${n.num}</span> ${n.label}</a>`;
  }).join('');

  const drawerNavHtml = nav.map(n => {
    const is = (path === n.href || (path === '' && n.href === 'index.html'));
    return `<a href="${n.href}"${is?' class="active"':''}><span class="num">${n.num}</span> ${n.label}</a>`;
  }).join('');

  const headerHtml = `
  <header class="topbar" data-screen-label="Header">
    <a class="brand" href="index.html" aria-label="CSLAB · Computer Security Laboratory">
      <img class="logo" src="assets/cslab-landscape.png" alt="CSLAB · Computer Security Laboratory" style="width:250px;object-fit:fill;height:76px"/>
    </a>
    <nav class="nav" aria-label="Primary">${navHtml}</nav>
    <div class="right">
      <a class="pill" href="index.html#recruit-open" style="cursor:pointer;text-decoration:none"><span class="dot"></span> 2026 연구원 모집 중</a>
      ${window.__cslabThemeBtnHtml}
      <button class="nav-toggle" type="button" aria-label="메뉴 열기" id="nav-toggle-btn" aria-controls="nav-drawer" aria-expanded="false">
        <svg class="burger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
  </header>
  <div class="nav-drawer" id="nav-drawer" role="dialog" aria-modal="true" aria-label="Site navigation">
    <div class="panel">
      <div class="panel-head">
        <span class="label">CSLab · Menu</span>
        <button class="close" type="button" aria-label="닫기" id="nav-close-btn">×</button>
      </div>
      <nav aria-label="Mobile primary">${drawerNavHtml}</nav>
      <div class="panel-foot">PNU · Computer Security Lab</div>
    </div>
  </div>`;

  const footerHtml = `
  <footer>
    <div class="row">
      <span>© 2026 Computer Security Lab, Pusan National University</span>
      <span>TEL 051-510-2874 · <a class="js-email" data-u="CSLAB" data-d="pnucslab.com" style="color:inherit;text-decoration:none"></a></span>
      <span><a href="#top">맨 위로 ↑</a></span>
    </div>
  </footer>`;

  function wireDrawer(){
    const tog = document.getElementById('nav-toggle-btn');
    const drw = document.getElementById('nav-drawer');
    const cls = document.getElementById('nav-close-btn');
    if(!tog || !drw) return;
    const open = () => { document.body.classList.add('nav-open'); tog.setAttribute('aria-expanded','true'); };
    const hide = () => { document.body.classList.remove('nav-open'); tog.setAttribute('aria-expanded','false'); };
    tog.addEventListener('click', () => document.body.classList.contains('nav-open') ? hide() : open());
    cls && cls.addEventListener('click', hide);
    drw.addEventListener('click', (e) => { if(e.target === drw) hide(); });
    drw.querySelectorAll('nav a').forEach(a => a.addEventListener('click', hide));
    document.addEventListener('keydown', (e) => { if(e.key==='Escape' && document.body.classList.contains('nav-open')) hide(); });
    window.addEventListener('resize', () => { if(window.innerWidth > 960 && document.body.classList.contains('nav-open')) hide(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const h = document.getElementById('site-header');
    const f = document.getElementById('site-footer');
    if(h) h.innerHTML = headerHtml;
    if(f) f.innerHTML = footerHtml;
    wireDrawer();
    wireEmails();
  });

  /* Email obfuscation decoder.
     Any element with class "js-email" + data-u (local part) + data-d (domain)
     gets its mailto href + visible text filled in at runtime.
     Avoids Cloudflare / GitHub email-auto-protection. */
  function wireEmails(){
    const AT = String.fromCharCode(64);
    document.querySelectorAll('.js-email').forEach(el => {
      const u = el.getAttribute('data-u');
      const d = el.getAttribute('data-d');
      if(!u || !d) return;
      const addr = u + AT + d;
      if(el.tagName === 'A'){
        el.setAttribute('href', 'mai' + 'lto:' + addr);
      }
      if(!el.textContent.trim()){
        el.textContent = addr;
      }
    });
  }
})();
