(() => {
  'use strict';
  const list = document.getElementById('publicationList');
  const selectedButton = document.getElementById('viewSelected');
  const allButton = document.getElementById('viewFull');
  const search = document.getElementById('pubSearch');
  const count = document.getElementById('resultCount');
  const dialog = document.getElementById('bibDialog');
  const copyButton = document.getElementById('bibCopy');
  let view = 'selected';
  let lastBibTrigger = null;
  const all = [...PUBLICATIONS.conference, ...PUBLICATIONS.journal];
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain = s => String(s || '').replace(/<[^>]*>/g, '');
  function renderPaper(p) {
    const url = p.pdf || p.code;
    const title = url ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(p.title)}</a>` : escape(p.title);
    const authors = escape(plain(p.authors)).replace(/Xiantao Hu/g,'<strong>Xiantao Hu</strong>');
    const venue = escape(plain(p.venue)).replace(/\b(Highlight|Oral)\b/g,'<span class="distinction">$1</span>');
    const actions = [['Paper',p.pdf],['Code',p.code]].filter(([,u])=>u).map(([label,url])=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    if(p.bibtex) actions.push(`<button type="button" data-bib="${all.indexOf(p)}">BibTeX</button>`);
    return `<article class="publication"><h3 class="paper-title">${title}</h3><p class="authors">${authors}</p><p class="venue">${venue}</p>${actions.length ? `<p class="paper-links">${actions.join('<span aria-hidden="true"> / </span>')}</p>` : ''}</article>`;
  }
  function matches(p, q) {
    return !q || [p.title, plain(p.authors), plain(p.venue), p.year].join(' ').toLowerCase().includes(q);
  }
  function render() {
    const q = search.value.trim().toLowerCase();
    const filtered = all.filter(p => (view === 'all' || p.selected) && matches(p,q));
    selectedButton.setAttribute('aria-pressed', String(view === 'selected'));
    allButton.setAttribute('aria-pressed', String(view === 'all'));
    count.textContent = `${filtered.length} ${view === 'selected' ? 'selected ' : ''}${filtered.length === 1 ? 'publication' : 'publications'}${q ? ' matching your search' : ''}`;
    if (!filtered.length) {
      list.innerHTML = '<p class="empty-state">No publications found. Try a different title, author, venue, or year.</p>';
      return;
    }
    list.innerHTML = [...filtered].sort((a,b)=>b.year-a.year).map(renderPaper).join('');
  }
  selectedButton.addEventListener('click',()=>{view='selected';render();});
  allButton.addEventListener('click',()=>{view='all';render();});
  search.addEventListener('input',render);
  list.addEventListener('click',event=>{
    const button = event.target.closest('[data-bib]');
    if(!button) return;
    const paper = all[Number(button.dataset.bib)];
    lastBibTrigger = button;
    document.getElementById('bibTitle').textContent = paper.title;
    document.getElementById('bibText').textContent = paper.bibtex;
    copyButton.textContent = 'Copy';
    dialog.showModal();
  });
  document.getElementById('bibClose').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>lastBibTrigger?.focus());
  copyButton.addEventListener('click', async()=>{
    try {
      await navigator.clipboard.writeText(document.getElementById('bibText').textContent);
      copyButton.textContent = 'Copied!';
    } catch {
      copyButton.textContent = 'Select text to copy';
    }
  });
  render();
  document.querySelector('.publication-controls').hidden = false;
})();
