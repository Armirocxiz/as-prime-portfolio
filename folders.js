'use strict';

// The cabinet is progressive enhancement; without JS all work stays readable.
const folderBrowser = document.getElementById('folder-browser');
const folderButtons = Array.from(document.querySelectorAll('.work-folder'));
const filmSections = Array.from(document.querySelectorAll('#catalog > .section'));
const photoSections = Array.from(document.querySelectorAll('[data-photo-gallery]'));
const collectionSections = [...filmSections, ...photoSections];
const collectionToggle = document.getElementById('collection-toggle');
const collectionTools = document.getElementById('collection-tools');
const folderClose = document.getElementById('folder-close');
const folderMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const folderHover = window.matchMedia('(hover:hover) and (pointer:fine)');
let openFolder = null;

function showCollection(id, { scroll = true, focus = true, updateUrl = true } = {}) {
  const target = collectionSections.find(section => section.id === id);
  if (!target && id !== 'all') return;
  openFolder = id;
  folderButtons.forEach(button => {
    button.classList.remove('is-previewing');
    button.setAttribute('aria-expanded', String(button.dataset.collection === id));
  });
  collectionSections.forEach(section => {
    section.hidden = id === 'all' ? !filmSections.includes(section) : section !== target;
  });
  document.getElementById('catalog').hidden = id !== 'all' && !filmSections.includes(target);
  collectionTools.hidden = false;
  document.getElementById('collection-label').textContent = id === 'all'
    ? 'All 22 films / The complete film archive'
    : folderButtons.find(button => button.dataset.collection === id).querySelector('.folder-name').textContent + ' / ' + (filmSections.includes(target) ? target.querySelectorAll('.tile').length + ' films' : target.querySelectorAll('.photo-card').length + ' photographs');
  collectionToggle.textContent = id === 'all' ? 'Close film archive ↑' : 'View all 22 films ↗';
  collectionToggle.setAttribute('aria-expanded', String(id === 'all'));
  if (updateUrl) history.replaceState(null, '', id === 'all' ? '#all-films' : `#${id}`);
  const heading = id === 'all' ? filmSections[0].querySelector('h3') : target.querySelector('h3, h2');
  heading.setAttribute('tabindex', '-1');
  if (focus) heading.focus({ preventScroll:true });
  if (scroll) heading.scrollIntoView({ behavior:folderMotion.matches ? 'auto' : 'smooth', block:'start' });
}

function closeCollection({ scroll = true, focus = true, updateUrl = true } = {}) {
  const previous = folderButtons.find(button => button.dataset.collection === openFolder);
  openFolder = null;
  collectionSections.forEach(section => { section.hidden = true; });
  document.getElementById('catalog').hidden = true;
  collectionTools.hidden = true;
  folderButtons.forEach(button => { button.setAttribute('aria-expanded', 'false'); button.classList.remove('is-previewing'); });
  collectionToggle.textContent = 'View all 22 films ↗';
  collectionToggle.setAttribute('aria-expanded','false');
  if (updateUrl) history.replaceState(null, '', '#work');
  if (focus) (previous || folderButtons[0]).focus({ preventScroll:true });
  else folderButtons[0].classList.add('is-previewing');
  if (scroll) document.getElementById('work').scrollIntoView({ behavior:folderMotion.matches ? 'auto' : 'smooth', block:'start' });
}

folderButtons.forEach(button => {
  button.addEventListener('pointerenter', () => {
    if (!folderHover.matches) return;
    folderButtons.forEach(folder => folder.classList.toggle('is-previewing', folder === button));
  });
  button.addEventListener('pointerleave', () => { button.classList.remove('is-previewing'); });
  button.addEventListener('click', () => {
    if (openFolder === button.dataset.collection) closeCollection();
    else showCollection(button.dataset.collection);
  });
  button.addEventListener('keydown', event => {
    const index = folderButtons.indexOf(button);
    const keys = { ArrowDown:(index+1)%folderButtons.length, ArrowUp:(index+folderButtons.length-1)%folderButtons.length, Home:0, End:folderButtons.length-1 };
    if (event.key in keys) { event.preventDefault(); folderButtons[keys[event.key]].focus(); }
    if (event.key === 'Escape') { event.preventDefault(); closeCollection({scroll:false,focus:false}); }
  });
});
collectionToggle.addEventListener('click', () => {
  if (openFolder === 'all') closeCollection();
  else showCollection('all');
});
folderClose.addEventListener('click', () => closeCollection());

document.querySelectorAll('header nav a').forEach(link => {
  const target = link.getAttribute('href').slice(1);
  if (!['work', ...collectionSections.map(section => section.id)].includes(target)) return;
  link.addEventListener('click', event => {
    event.preventDefault();
    if (target === 'work') closeCollection({focus:false});
    else showCollection(target);
  });
});

// Every film in a chosen folder is available; photography retains its view-more controls.
document.querySelectorAll('#catalog .tile').forEach(tile => { tile.hidden = false; });
collectionSections.forEach(section => { section.hidden = true; });
document.getElementById('catalog').hidden = true;
document.getElementById('collection-status').textContent = '22 films · 31 photographs';
collectionToggle.hidden = false;
folderBrowser.hidden = false;
document.body.classList.add('folders-ready');
folderButtons[0].classList.add('is-previewing');
const initialFolder = location.hash.slice(1);
if (initialFolder === 'all-films' || collectionSections.some(section => section.id === initialFolder)) {
  showCollection(initialFolder === 'all-films' ? 'all' : initialFolder, {scroll:false,focus:false,updateUrl:false});
}

// Keep direct links and browser navigation in step with the visible folder.
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  const target = hash === 'all-films' ? 'all' : hash;
  if (target === 'all' || collectionSections.some(section => section.id === target)) {
    if (openFolder !== target) showCollection(target, {scroll:false,focus:false,updateUrl:false});
  } else if ((!hash || hash === 'work') && openFolder !== null) {
    closeCollection({scroll:false,focus:false,updateUrl:false});
  }
});
