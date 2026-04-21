function fmtPrice(value, currency) {
  if (!Number.isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency || ''}`.trim();
  }
}

function fmtPct(value) {
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} %`;
}

function pctClass(value) {
  if (!Number.isFinite(value)) return 'neutral';
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function variationCell(label, pct) {
  return el('div', { class: `variation ${pctClass(pct)}` }, [
    el('span', { class: 'variation-label', text: label }),
    el('span', { class: 'variation-value', text: fmtPct(pct) }),
  ]);
}

function renderHeader(societe) {
  const logo = societe.logoUrl
    ? el('img', { class: 'logo', src: societe.logoUrl, alt: '', loading: 'lazy' })
    : el('div', { class: 'logo logo-placeholder', 'aria-hidden': 'true', text: societe.name.charAt(0) });
  return el('header', { class: 'card-header' }, [
    logo,
    el('div', { class: 'title' }, [
      el('h2', { class: 'name', text: societe.name }),
      el('span', { class: 'ticker', text: societe.ticker }),
    ]),
  ]);
}

function renderPriceRow(quote) {
  if (!quote || !quote.ok) {
    return el('div', { class: 'price-row error' }, [
      el('span', { class: 'price', text: 'Données indisponibles' }),
    ]);
  }
  return el('div', { class: 'price-row' }, [
    el('span', { class: 'price', text: fmtPrice(quote.price, quote.currency) }),
    el('span', { class: `day-pct ${pctClass(quote.dayPct)}`, text: fmtPct(quote.dayPct) }),
  ]);
}

function renderVariations(quote) {
  if (!quote || !quote.ok) return el('div', { class: 'variations variations-empty' });
  return el('div', { class: 'variations' }, [
    variationCell('Jour', quote.dayPct),
    variationCell('6 mois', quote.m6Pct),
    variationCell('1 an', quote.y1Pct),
    variationCell('5 ans', quote.y5Pct),
  ]);
}

function renderForumSection() {
  return el('section', { class: 'forum' }, [
    el('h3', { class: 'forum-title', text: 'Forum' }),
    el('ul', { class: 'forum-list', 'data-state': 'loading' }, [
      el('li', { class: 'forum-loading', text: 'Chargement des topics…' }),
    ]),
  ]);
}

export function renderCard(societe, quote) {
  const card = el('article', { class: 'card', 'data-code': societe.code }, [
    renderHeader(societe),
    renderPriceRow(quote),
    renderVariations(quote),
    renderForumSection(),
  ]);
  return card;
}

export function renderForumTopics(listNode, topics) {
  listNode.innerHTML = '';
  listNode.dataset.state = 'loaded';
  if (!topics.length) {
    listNode.appendChild(el('li', { class: 'forum-empty', text: 'Aucun topic récent.' }));
    return;
  }
  for (const topic of topics) {
    const link = el('a', { href: topic.linkUrl, target: '_blank', rel: 'noopener noreferrer', text: topic.title });
    const date = topic.date ? el('span', { class: 'forum-date', text: topic.date }) : null;
    listNode.appendChild(el('li', {}, [link, date].filter(Boolean)));
  }
}

export function renderForumError(listNode) {
  listNode.innerHTML = '';
  listNode.dataset.state = 'error';
  listNode.appendChild(el('li', { class: 'forum-empty', text: 'Impossible de charger les topics.' }));
}
