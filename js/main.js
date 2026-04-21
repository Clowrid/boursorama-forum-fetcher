import * as api from './api.js';
import { renderCard, renderForumTopics, renderForumError } from './render.js';

const container = document.getElementById('cards');

function showError(message) {
  container.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'app-error';
  p.textContent = message;
  container.appendChild(p);
}

async function loadForum(code, card) {
  const listNode = card.querySelector('.forum-list');
  try {
    const topics = await api.getForum(code);
    renderForumTopics(listNode, topics);
  } catch {
    renderForumError(listNode);
  }
}

async function main() {
  let societes, quotes;
  try {
    [societes, quotes] = await Promise.all([api.getSocietes(), api.getQuotes()]);
  } catch (err) {
    showError(`Erreur de chargement : ${err.message}`);
    container.setAttribute('aria-busy', 'false');
    return;
  }

  const quoteByCode = new Map(quotes.map((q) => [q.code, q]));
  container.innerHTML = '';

  for (const societe of societes) {
    const card = renderCard(societe, quoteByCode.get(societe.code));
    container.appendChild(card);
    loadForum(societe.code, card);
  }

  container.setAttribute('aria-busy', 'false');
}

main();
