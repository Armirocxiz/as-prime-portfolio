'use strict';

// Keep the original media nodes and their viewer listeners when opening a folder.
const folderBrowser = document.getElementById('folder-browser');
const folderStack = folderBrowser.querySelector('.folder-stack');
const folderButtons = Array.from(document.querySelectorAll('.work-folder'));
const filmSections = Array.from(document.querySelectorAll('#catalog > .section'));
const photoSections = Array.from(document.querySelectorAll('[data-photo-gallery]'));
const collectionSections = [...filmSections, ...photoSections];
const collectionToggle = document.getElementById('collection-toggle');
const collectionTools = document.getElementById('collection-tools');
const folderClose = document.getElementById('folder-close');
const folderMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const folderHover = window.matchMedia('(hover:hover) and (pointer:fine)');
const collectionHomes = new Map();
const folderPanels = new Map();
let openFolder = null;
let folderAnimation = null;

collectionSections.forEach(section => {
  const home = document.createComment(`Collection home: ${section.id}`);
  section.before(home);
  collectionHomes.set(section, home);
});

folderButtons.forEach((button, index) => {
  const shell = document.createElement('div');
  shell.className = 'folder-shell';
  shell.style.setProperty('--order', index);
  button.before(shell);
  shell.append(button);
  const panel = document.createElement('div');
  panel.className = 'folder-content';
  panel.id = `folder-content-${button.dataset.collection}`;
  panel.hidden = true;
  button.setAttribute('aria-controls', panel.id);
  shell.append(panel);
  folderPanels.set(button.dataset.collection, panel);
});

function resetFolders() {
  folderAnimation?.cancel();
  collectionSections.forEach(section => {
    collectionHomes.get(section).after(section);
    section.hidden = true;
  });
  folderPanels.forEach(panel => { panel.hidden = true; });
  folderButtons.forEach(button => {
    button.closest('.folder-shell').classList.remove('is-open');
    button.classList.remove('is-previewing');
    button.setAttribute('aria-expanded', 'false');
    button.querySelector('.folder-arrow').textContent = '↗';
  });
  folderStack.classList.remove('has-open');
  document.getElementById('catalog').hidden = true;
  collectionTools.hidden = true;
}

function showCollection(id, { scroll = false, focus = true, updateUrl = true } = {}) {
  const target = collectionSections.find(section => section.id === id);
  if (!target && id !== 'all') return;
  const sourceButton = folderButtons.find(button => button.dataset.collection === id);
  const sourceTop = sourceButton?.getBoundingClientRect().top;
  resetFolders();
  openFolder = id;
  if (id === 'all') {
    filmSections.forEach(section => { section.hidden = false; });
    document.getElementById('catalog').hidden = false;
    collectionTools.hidden = false;
    document.getElementById('collection-label').textContent = 'All 22 films / The complete film archive';
  } else {
    const button = folderButtons.find(folder => folder.dataset.collection === id);
    const panel = folderPanels.get(id);
    panel.replaceChildren(target);
    target.hidden = false;
    panel.hidden = false;
    folderStack.classList.add('has-open');
    button.closest('.folder-shell').classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('.folder-arrow').textContent = '−';
    if (focus) button.focus({ preventScroll:true });
    // Animate the folder's real height so the other folders move down with it.
    if (!folderMotion.matches) {
      const style = getComputedStyle(panel);
      folderAnimation = panel.animate([
        { height:'0px', paddingTop:'0px', paddingBottom:'0px', opacity:0 },
        { height:`${panel.getBoundingClientRect().height}px`, paddingTop:style.paddingTop, paddingBottom:style.paddingBottom, opacity:1 }
      ], { duration:480, easing:'cubic-bezier(.2,.75,.2,1)' });
    }
  }
  collectionToggle.textContent = id === 'all' ? 'Close film archive ↑' : 'View all 22 films ↗';
  collectionToggle.setAttribute('aria-expanded', String(id === 'all'));
  if (updateUrl) history.replaceState(null, '', id === 'all' ? '#all-films' : `#${id}`);
  if (!scroll && sourceButton && sourceTop >= 83) {
    window.scrollBy({ top:sourceButton.getBoundingClientRect().top - sourceTop, behavior:'instant' });
  }
  if (scroll) {
    const anchor = id === 'all' ? collectionTools : folderPanels.get(id).closest('.folder-shell');
    anchor.scrollIntoView({ behavior:folderMotion.matches ? 'auto' : 'smooth', block:'start' });
  }
}

function closeCollection({ scroll = false, focus = true, updateUrl = true } = {}) {
  const previous = folderButtons.find(button => button.dataset.collection === openFolder);
  const sourceTop = previous?.getBoundingClientRect().top;
  resetFolders();
  openFolder = null;
  collectionToggle.textContent = 'View all 22 films ↗';
  collectionToggle.setAttribute('aria-expanded', 'false');
  if (updateUrl) history.replaceState(null, '', '#work');
  if (focus) (previous || folderButtons[0]).focus({ preventScroll:true });
  else folderButtons[0].classList.add('is-previewing');
  if (!scroll && previous && sourceTop >= 83) {
    window.scrollBy({ top:previous.getBoundingClientRect().top - sourceTop, behavior:'instant' });
  } else if (!scroll && focus && previous && sourceTop < 83) {
    previous.scrollIntoView({ behavior:'instant', block:'center' });
  }
  if (scroll) document.getElementById('work').scrollIntoView({ behavior:folderMotion.matches ? 'auto' : 'smooth', block:'start' });
}

folderButtons.forEach(button => {
  button.addEventListener('pointerenter', () => {
    if (!folderHover.matches || folderStack.classList.contains('has-open')) return;
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
    if (Object.hasOwn(keys, event.key)) {
      event.preventDefault();
      folderButtons[keys[event.key]].focus();
    }
  });
});
folderStack.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !openFolder || document.querySelector('dialog[open]')) return;
  event.preventDefault();
  closeCollection();
});
collectionToggle.addEventListener('click', () => {
  if (openFolder === 'all') closeCollection({scroll:true});
  else showCollection('all', {scroll:true});
});
folderClose.addEventListener('click', () => closeCollection({scroll:true}));

document.querySelectorAll('header nav a').forEach(link => {
  const target = link.getAttribute('href').slice(1);
  if (!['work', ...collectionSections.map(section => section.id)].includes(target)) return;
  link.addEventListener('click', event => {
    event.preventDefault();
    if (target === 'work') closeCollection({scroll:true,focus:false});
    else showCollection(target, {scroll:true});
  });
});

// Without JavaScript the original full portfolio remains visible.
document.querySelectorAll('#catalog .tile').forEach(tile => { tile.hidden = false; });
resetFolders();
document.getElementById('collection-status').textContent = '22 films · 31 photographs';
collectionToggle.hidden = false;
folderBrowser.hidden = false;
document.body.classList.add('folders-ready');
folderButtons[0].classList.add('is-previewing');
const initialFolder = location.hash.slice(1);
if (initialFolder === 'all-films' || collectionSections.some(section => section.id === initialFolder)) {
  showCollection(initialFolder === 'all-films' ? 'all' : initialFolder, {focus:false,updateUrl:false});
}

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  const target = hash === 'all-films' ? 'all' : hash;
  if (target === 'all' || collectionSections.some(section => section.id === target)) {
    if (openFolder !== target) showCollection(target, {focus:false,updateUrl:false});
  } else if ((!hash || hash === 'work') && openFolder !== null) {
    closeCollection({focus:false,updateUrl:false});
  }
});
