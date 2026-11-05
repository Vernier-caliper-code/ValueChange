const shared = {
  logo: '<img src="/assets/icon.png" alt="ValuePass 标志" width="37" height="37">',
  nav: [
    ['首页', '/'], ['AI全栈', '/articles.html'], ['AI工具', '/tools.html'],
    ['经验分享', '/insights.html'], ['商品', '/products.html'], ['关于我', '/about.html']
  ]
};

function brand() {
  return `<a class="brand" href="/" aria-label="ValuePass 首页">${shared.logo}<span><span class="brand-name">Value<span>Pass</span></span><span class="brand-sub">BUILD · SHARE · GROW</span></span></a>`;
}

function currentKey() {
  const path = location.pathname;
  if (path.includes('article') || path === '/articles.html') return '/articles.html';
  if (path.includes('tool')) return '/tools.html';
  if (path.includes('insight')) return '/insights.html';
  if (path.includes('product')) return '/products.html';
  if (path.includes('about')) return '/about.html';
  return '/';
}

function header() {
  const key = currentKey();
  const links = shared.nav.map(([label, href]) => `<a href="${href}" ${key === href ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  return `<a class="skip-link" href="#main">跳到主要内容</a><header class="site-header"><div class="container header-inner">${brand()}<nav class="site-nav" aria-label="主导航">${links}</nav><div class="header-actions"><a class="login-link" href="/auth.html">登录 / 注册</a><a class="button header-cta" href="/products.html">看看我的作品 <span class="arrow">↗</span></a></div><button class="menu-toggle" type="button" aria-label="打开导航菜单" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span></button></div></header><nav class="mobile-nav" id="mobile-nav" aria-label="手机导航">${links}<a class="mobile-login" href="/auth.html">登录 / 注册 <span class="arrow">↗</span></a></nav>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-top"><div><a class="brand" href="/">${shared.logo}<span><span class="brand-name">Value<span>Pass</span></span></span></a><p>记录构建的过程，分享真正有用的经验。</p></div><div class="footer-links"><a href="/articles.html">读一篇文章</a><a href="/tools.html">发现好工具</a><a href="/about.html#contact">联系我</a></div></div><div class="footer-bottom"><span>© 2026 ValuePass · 本站为交互原型，内容均为演示</span><span class="mono">LESS HYPE. MORE BUILDING.</span></div></div></footer>`;
}

function dialog() {
  return `<div class="dialog-backdrop" id="wechat-dialog" role="dialog" aria-modal="true" aria-labelledby="wechat-title" aria-describedby="wechat-description"><div class="dialog"><button class="dialog-close" type="button" aria-label="关闭微信咨询窗口" data-close-dialog>×</button><div class="eyebrow no-line" style="justify-content:center">LET'S TALK</div><h2 id="wechat-title">聊聊你的想法</h2><p id="wechat-description">对这件商品感兴趣？扫码添加微信，备注「ValuePass」。</p><div class="qr-wrap"><div class="qr-placeholder" role="img" aria-label="微信二维码占位图，上线前替换为站长真实二维码"><span>微信二维码<br>占位图<br>上线前替换</span></div></div><div class="dialog-note">微信号：<strong>YourWeChatID</strong>（演示占位）<br>本站不直接售卖商品，具体事宜请微信沟通。</div><button class="button secondary small" type="button" data-close-dialog>我先再看看</button></div></div>`;
}

function toast(message) {
  let node = document.querySelector('.toast');
  if (!node) { node = document.createElement('div'); node.className = 'toast'; node.setAttribute('role', 'status'); document.body.append(node); }
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => node.classList.remove('show'), 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  const headerTarget = document.querySelector('[data-site-header]');
  const footerTarget = document.querySelector('[data-site-footer]');
  if (headerTarget) headerTarget.innerHTML = header();
  if (footerTarget) footerTarget.innerHTML = footer();
  if (document.querySelector('[data-wechat-dialog]')) document.body.insertAdjacentHTML('beforeend', dialog());

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  menuButton?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
  });

  const modal = document.querySelector('#wechat-dialog');
  const closeButton = modal?.querySelector('.dialog-close');
  let previousFocus;
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    previousFocus?.focus();
  };
  document.querySelectorAll('[data-open-wechat]').forEach(button => button.addEventListener('click', () => {
    previousFocus = button;
    modal?.classList.add('open');
    document.body.classList.add('modal-open');
    closeButton?.focus();
  }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', closeModal));
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeModal(); mobileNav?.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); }
    if (event.key === 'Tab' && modal?.classList.contains('open')) {
      const controls = [...modal.querySelectorAll('button, a[href]')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  document.querySelectorAll('[data-copy-wechat]').forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('YourWeChatID'); toast('演示微信号已复制：YourWeChatID'); }
    catch { toast('演示微信号：YourWeChatID'); }
  }));

  const mainImage = document.querySelector('[data-gallery-main]');
  document.querySelectorAll('[data-gallery-image]').forEach(button => button.addEventListener('click', () => {
    if (!mainImage) return;
    mainImage.src = button.dataset.galleryImage;
    mainImage.alt = button.dataset.galleryAlt;
    document.querySelectorAll('[data-gallery-image]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
  }));

  const authForm = document.querySelector('#auth-form');
  const tabs = document.querySelectorAll('[data-auth-mode]');
  let authMode = 'login';
  function setAuthMode(mode) {
    authMode = mode;
    tabs.forEach(tab => { const active = tab.dataset.authMode === mode; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
    document.querySelector('#confirm-group').hidden = mode === 'login';
    document.querySelector('#auth-title').textContent = mode === 'login' ? '欢迎回来' : '创建你的账号';
    document.querySelector('#auth-description').textContent = mode === 'login' ? '登录 ValuePass，继续你的探索。' : '注册一个账号，为以后的更多可能做好准备。';
    document.querySelector('#auth-submit').textContent = mode === 'login' ? '登录' : '注册并登录';
    document.querySelector('#auth-switch-copy').innerHTML = mode === 'login' ? '还没有账号？<a href="#" data-switch-register>立即注册</a>' : '已经有账号了？<a href="#" data-switch-login>直接登录</a>';
    document.querySelector('#auth-switch-copy a').addEventListener('click', event => { event.preventDefault(); setAuthMode(mode === 'login' ? 'register' : 'login'); });
    document.querySelector('#auth-error').classList.remove('visible');
  }
  tabs.forEach(tab => tab.addEventListener('click', () => setAuthMode(tab.dataset.authMode)));
  document.querySelector('#auth-switch-copy a')?.addEventListener('click', event => { event.preventDefault(); setAuthMode('register'); });
  authForm?.addEventListener('submit', event => {
    event.preventDefault();
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value;
    const confirm = document.querySelector('#confirm-password').value;
    const error = document.querySelector('#auth-error');
    let message = '';
    if (!username) message = '请输入账号。';
    else if (password.length < 8) message = '密码至少需要 8 位字符。';
    else if (authMode === 'register' && password !== confirm) message = '两次输入的密码不一致，请重新确认。';
    if (message) { error.textContent = message; error.classList.add('visible'); return; }
    error.classList.remove('visible');
    toast(authMode === 'login' ? '登录交互验证通过（原型不连接真实账号）' : '注册交互验证通过（原型不保存账号）');
  });
});
