document.addEventListener('DOMContentLoaded', () => {
  const views = document.querySelectorAll('[data-admin-view]');
  document.querySelectorAll('[data-admin-target]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-admin-target]').forEach(item => item.classList.toggle('active', item === button));
    views.forEach(view => view.hidden = view.dataset.adminView !== button.dataset.adminTarget);
    const title = document.querySelector('#admin-page-title');
    if (title) title.textContent = button.dataset.title;
  }));
  document.querySelectorAll('[data-admin-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.adminFilter;
    document.querySelectorAll('[data-admin-filter]').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('#article-rows tr').forEach(row => row.hidden = filter !== 'all' && row.dataset.status !== filter);
  }));
  document.querySelectorAll('[data-user-disable]').forEach(button => button.addEventListener('click', () => {
    const disabled = button.dataset.userDisable === 'true';
    button.dataset.userDisable = String(!disabled);
    button.textContent = disabled ? '启用' : '禁用';
    const status = button.closest('tr').querySelector('.status');
    status.textContent = disabled ? '已禁用' : '正常';
    status.classList.toggle('off', disabled);
  }));
  document.querySelectorAll('[data-reset-password]').forEach(button => button.addEventListener('click', () => {
    window.alert('原型演示：正式版本将在这里验证管理员身份，并为该用户设置临时密码。');
  }));
  const input = document.querySelector('#markdown-input');
  const preview = document.querySelector('#markdown-preview');
  const escape = text => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const inline = text => text.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  function renderMarkdown() {
    if (!input || !preview) return;
    const lines = escape(input.value).split('\n');
    let html = '', inCode = false, inList = false;
    for (const line of lines) {
      if (line.startsWith('```')) { html += inCode ? '</code></pre>' : '<pre><code>'; inCode = !inCode; continue; }
      if (inCode) { html += line + '\n'; continue; }
      if (line.startsWith('- ')) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inline(line.slice(2))}</li>`; continue; }
      if (inList) { html += '</ul>'; inList = false; }
      if (line.startsWith('# ')) html += `<h1>${inline(line.slice(2))}</h1>`;
      else if (line.startsWith('## ')) html += `<h2>${inline(line.slice(3))}</h2>`;
      else if (line.trim()) html += `<p>${inline(line)}</p>`;
    }
    if (inList) html += '</ul>'; if (inCode) html += '</code></pre>';
    preview.innerHTML = html;
    const count = document.querySelector('#word-count');
    if (count) count.textContent = `${input.value.length} 字符`;
  }
  input?.addEventListener('input', renderMarkdown);
  renderMarkdown();
  document.querySelector('#editor-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.querySelector('#editor-message');
    message.textContent = event.submitter?.value === 'publish' ? '发布交互验证通过（原型未保存数据）' : '草稿交互验证通过（原型未保存数据）';
    message.style.color = '#367b55';
  });
});

