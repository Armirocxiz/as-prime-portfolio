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
const motionAnimate = window.Motion?.animate;
folderBrowser.dataset.motionEngine = motionAnimate ? 'motion' : 'native';
let activeAnimations = [];
let transitionVersion = 0;
let closingFolder = null;
let finishPendingClose = null;

function clearPanelStyles(panel) {
  ['height', 'padding-top', 'padding-bottom', 'opacity'].forEach(property => panel.style.removeProperty(property));
}

function cancelFolderAnimations() {
  activeAnimations.forEach(animation => animation.cancel());
  activeAnimations = [];
  folderPanels.forEach(clearPanelStyles);
  folderStack.querySelectorAll('.tile, .photo-card').forEach(card => {
    card.style.removeProperty('opacity');
    card.style.removeProperty('transform');
  });
}

function panelMetrics(panel) {
  const style = getComputedStyle(panel);
  return { height:panel.getBoundingClientRect().height, paddingTop:parseFloat(style.paddingTop), paddingBottom:parseFloat(style.paddingBottom), opacity:parseFloat(style.opacity) };
}

function animatePanel(panel, expanding, from = null) {
  const metrics = from || panelMetrics(panel);
  const values = expanding
    ? { height:[0,metrics.height], paddingTop:[0,metrics.paddingTop], paddingBottom:[0,metrics.paddingBottom], opacity:[0,1] }
    : { height:[metrics.height,0], paddingTop:[metrics.paddingTop,0], paddingBottom:[metrics.paddingBottom,0], opacity:[metrics.opacity,0] };
  let animation;
  if (motionAnimate) {
    const controls = motionAnimate(panel, values, {
      type:'spring', visualDuration:expanding ? .38 : .26, bounce:0,
      opacity:{ type:'tween', duration:expanding ? .22 : .16, ease:'easeOut' }
    });
    animation = { cancel:() => controls.cancel(), finished:Promise.resolve(controls) };
  } else {
    // Folder browsing remains usable if the animation runtime cannot load.
    const controls = panel.animate([
      Object.fromEntries(Object.entries(values).map(([key,value]) => [key,key === 'opacity' ? value[0] : `${value[0]}px`])),
      Object.fromEntries(Object.entries(values).map(([key,value]) => [key,key === 'opacity' ? value[1] : `${value[1]}px`]))
    ], { duration:expanding ? 420 : 280, easing:'cubic-bezier(.2,.75,.2,1)' });
    animation = { cancel:() => controls.cancel(), finished:controls.finished };
  }
  activeAnimations.push(animation);
  return animation;
}

function revealProjects(panel, version) {
  if (!motionAnimate || folderMotion.matches) return;
  const cards = Array.from(panel.querySelectorAll('.tile:not([hidden]), .photo-card:not([hidden])')).slice(0,9);
  const controls = motionAnimate(cards, { opacity:[0,1], y:[10,0] }, {
    type:'tween', duration:.26, delay:window.Motion.stagger(.025, {startDelay:.08}), ease:[.2,.7,.2,1]
  });
  activeAnimations.push({ cancel:() => controls.cancel() });
  Promise.resolve(controls).then(() => {
    if (version !== transitionVersion) return;
    cards.forEach(card => { card.style.removeProperty('opacity'); card.style.removeProperty('transform'); });
  }).catch(() => {});
}

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
  button.id = `folder-trigger-${button.dataset.collection}`;
  button.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'region');
  const name = button.querySelector('.folder-name');
  name.id = `folder-name-${button.dataset.collection}`;
  panel.setAttribute('aria-labelledby', name.id);
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox','0 0 24 24');
  icon.setAttribute('fill','none');
  icon.setAttribute('stroke','currentColor');
  icon.setAttribute('stroke-width','1.5');
  ['M5 12h14','M12 5v14'].forEach((line,index) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',line);
    if (index) path.classList.add('folder-icon-vertical');
    icon.append(path);
  });
  button.querySelector('.folder-arrow').replaceChildren(icon);
  shell.append(panel);
  folderPanels.set(button.dataset.collection, panel);
});

function resetFolders() {
  transitionVersion += 1;
  cancelFolderAnimations();
  closingFolder = null;
  finishPendingClose = null;
  collectionSections.forEach(section => {
    collectionHomes.get(section).after(section);
    section.hidden = true;
  });
  folderPanels.forEach(panel => { panel.hidden = true; panel.inert = false; panel.removeAttribute('aria-hidden'); });
  folderButtons.forEach(button => {
    button.closest('.folder-shell').classList.remove('is-open');
    button.classList.remove('is-previewing');
    button.setAttribute('aria-expanded', 'false');
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
    if (focus) button.focus({ preventScroll:true });
    if (!folderMotion.matches) {
      const version = transitionVersion;
      const animation = animatePanel(panel, true);
      revealProjects(panel, version);
      animation.finished.then(() => {
        if (version === transitionVersion && openFolder === id) clearPanelStyles(panel);
      }).catch(() => {});
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

function closeCollection({ scroll = false, focus = true, updateUrl = true, animate = true } = {}) {
  const previousId = openFolder || closingFolder;
  const previous = folderButtons.find(button => button.dataset.collection === previousId);
  const sourceTop = previous?.getBoundingClientRect().top;
  const panel = folderPanels.get(previousId);
  const from = panel && !panel.hidden ? panelMetrics(panel) : null;
  transitionVersion += 1;
  const version = transitionVersion;
  cancelFolderAnimations();
  // Semantic state changes immediately, even if an exit animation is interrupted.
  openFolder = null;
  if (previous) previous.setAttribute('aria-expanded','false');
  if (panel) { panel.inert = true; panel.setAttribute('aria-hidden','true'); }
  collectionToggle.textContent = 'View all 22 films ↗';
  collectionToggle.setAttribute('aria-expanded','false');
  if (updateUrl) history.replaceState(null, '', '#work');
  const finish = () => {
    if (version !== transitionVersion) return;
    resetFolders();
    if (focus) (previous || folderButtons[0]).focus({ preventScroll:true });
    else folderButtons[0].classList.add('is-previewing');
    if (!scroll && previous && sourceTop >= 83) {
      window.scrollBy({ top:previous.getBoundingClientRect().top - sourceTop, behavior:'instant' });
    } else if (!scroll && focus && previous && sourceTop < 83) {
      previous.scrollIntoView({ behavior:'instant', block:'center' });
    }
    if (scroll) document.getElementById('work').scrollIntoView({ behavior:folderMotion.matches ? 'auto' : 'smooth', block:'start' });
  };
  if (from && animate && !scroll && !folderMotion.matches) {
    closingFolder = previousId;
    finishPendingClose = finish;
    animatePanel(panel, false, from).finished.then(finish).catch(() => {});
  } else finish();
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

folderMotion.addEventListener('change', () => {
  if (!folderMotion.matches) return;
  const finish = finishPendingClose;
  cancelFolderAnimations();
  if (finish) finish();
});
