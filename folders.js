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
const compactFolders = window.matchMedia('(max-width:650px), (max-height:700px)');
const collectionHomes = new Map();
const folderPanels = new Map();
let openFolder = null;
const motionAnimate = window.Motion?.animate;
folderBrowser.dataset.motionEngine = motionAnimate ? 'motion' : 'native';
let activeAnimations = [];
let transitionVersion = 0;
let closingFolder = null;
let finishPendingClose = null;
const folderExit = document.createElement('button');
folderExit.type = 'button';
folderExit.className = 'folder-exit';
folderExit.textContent = 'Back to portfolio ×';
folderExit.addEventListener('click', () => closeCollection({scroll:true}));
folderBrowser.prepend(folderExit);

function clearPanelStyles(panel) {
  ['height', 'padding-top', 'padding-bottom', 'opacity'].forEach(property => panel.style.removeProperty(property));
}

function cancelFolderAnimations() {
  collectionStrips.forEach(strip => strip.cancel());
  activeAnimations.forEach(animation => animation.cancel());
  activeAnimations = [];
  folderPanels.forEach(clearPanelStyles);
  folderStack.querySelectorAll('.tile, .photo-card').forEach(card => {
    card.style.removeProperty('opacity');
    card.style.removeProperty('transform');
  });
}

function folderPositions() {
  return new Map(folderButtons.map(button => [button.dataset.collection, button.closest('.folder-shell').getBoundingClientRect()]));
}

function unfoldFolders(before, selected) {
  if (folderMotion.matches) return;
  folderButtons.forEach(button => {
    const shell = button.closest('.folder-shell');
    const from = before.get(button.dataset.collection);
    const to = shell.getBoundingClientRect();
    if (!from || !to.width) return;
    const active = button.dataset.collection === selected;
    const transform = `translate(${from.left-to.left}px,${from.top-to.top}px) scaleX(${from.width/to.width})`;
    const start = {transform,transformOrigin:'top left'};
    const end = {transform:'translate(0,0) scaleX(1)',transformOrigin:'top left'};
    if (active) {
      start.clipPath = `inset(-32px -12px ${Math.max(0,to.height-from.height)}px -12px)`;
      end.clipPath = 'inset(-32px -12px -24px -12px)';
    }
    const controls = shell.animate([start,end], {duration:selected ? 520 : 400,easing:'cubic-bezier(.22,1,.36,1)'});
    activeAnimations.push({cancel:() => controls.cancel()});
    controls.finished.catch(() => {});
  });
}

function revealProjects(panel, version) {
  if (!motionAnimate || folderMotion.matches) return;
  const cards = Array.from(panel.querySelectorAll('.tile:not([hidden]), .photo-card:not([hidden])')).slice(0,9);
  const controls = motionAnimate(cards, { opacity:[0,1], y:[10,0] }, {
    type:'tween', duration:.28, delay:window.Motion.stagger(.025, {startDelay:.16}), ease:[.2,.7,.2,1]
  });
  activeAnimations.push({ cancel:() => controls.cancel() });
  Promise.resolve(controls).then(() => {
    if (version !== transitionVersion) return;
    cards.forEach(card => { card.style.removeProperty('opacity'); card.style.removeProperty('transform'); });
  }).catch(() => {});
}

// Every item stays accessible in a single-height, touch-scrollable film strip.
const collectionStrips = [];
const obscuredContent = Array.from(document.querySelectorAll('main > section:not(#work), #work > :not(#folder-browser), footer'));
function syncCabinetFocus() {
  const active = compactFolders.matches && folderStack.classList.contains('has-open');
  obscuredContent.forEach(element => { element.inert = active; });
}
collectionSections.forEach(section => {
  const grid = section.querySelector('.project-grid, .photo-grid');
  const cards = Array.from(grid.children);
  const controls = document.createElement('div');
  controls.className = 'folder-pager';
  const previous = document.createElement('button');
  const next = document.createElement('button');
  previous.type = next.type = 'button';
  previous.textContent = '←';
  next.textContent = '→';
  previous.setAttribute('aria-label','Previous project');
  next.setAttribute('aria-label','Next project');
  const status = document.createElement('span');
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  const hint = document.createElement('span');
  hint.className = 'folder-swipe-hint';
  hint.textContent = 'Swipe to explore';
  controls.append(previous,status,hint,next);
  section.append(controls);
  const startFor = index => Math.min(grid.scrollWidth-grid.clientWidth, Math.max(0,cards[index].offsetLeft-cards[0].offsetLeft));
  const nearestIndex = () => cards.reduce((closest,card,index) => Math.abs(startFor(index)-grid.scrollLeft) < Math.abs(startFor(closest)-grid.scrollLeft) ? index : closest,0);
  let frame = 0;
  let destination = null;
  let gesture = null;
  let suppressClick = false;
  const update = () => {
    const index = nearestIndex();
    status.textContent = `${index+1} / ${cards.length}`;
    previous.disabled = index === 0;
    next.disabled = index === cards.length-1;
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    destination = null;
    grid.classList.remove('is-dragging','is-settling');
  };
  const goTo = index => {
    stop();
    const target = Math.max(0,Math.min(cards.length-1,index));
    const from = grid.scrollLeft;
    const to = startFor(target);
    if (folderMotion.matches || Math.abs(to-from) < 1) {
      grid.scrollLeft = to;
      update();
      return;
    }
    destination = target;
    grid.classList.add('is-settling');
    const started = performance.now();
    const duration = Math.min(260,160+Math.abs(to-from)*.25);
    const tick = now => {
      const progress = Math.min(1,(now-started)/duration);
      grid.scrollLeft = from+(to-from)*(1-Math.pow(1-progress,3));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else { stop(); grid.scrollLeft = to; update(); }
    };
    frame = requestAnimationFrame(tick);
  };
  previous.addEventListener('click', () => goTo((destination ?? nearestIndex())-1));
  next.addEventListener('click', () => goTo((destination ?? nearestIndex())+1));
  grid.addEventListener('scroll',update,{passive:true});
  grid.addEventListener('pointerdown', event => {
    if (!compactFolders.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    stop();
    suppressClick = false;
    gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastTime:performance.now(),velocity:0,start:grid.scrollLeft,index:nearestIndex(),dragged:false};
  }, {passive:true});
  grid.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX-gesture.x;
    const dy = event.clientY-gesture.y;
    if (!gesture.dragged) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)*1.15) return;
      gesture.dragged = true;
      grid.classList.add('is-dragging');
      try { grid.setPointerCapture(event.pointerId); } catch (_) { /* Synthetic QA events have no active browser pointer. */ }
    }
    event.preventDefault();
    const now = performance.now();
    gesture.velocity = (event.clientX-gesture.lastX)/Math.max(1,now-gesture.lastTime);
    gesture.lastX = event.clientX;
    gesture.lastTime = now;
    grid.scrollLeft = gesture.start-dx;
  }, {passive:false});
  const release = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const ended = gesture;
    gesture = null;
    if (!ended.dragged) return;
    suppressClick = true;
    const distance = ended.x-event.clientX;
    const velocity = performance.now()-ended.lastTime < 100 ? -ended.velocity : 0;
    const advance = event.type !== 'pointercancel' && (Math.abs(distance) >= 24 || (Math.abs(distance) >= 8 && Math.abs(velocity) > .22));
    const direction = Math.sign(distance || velocity);
    goTo(advance ? ended.index+direction : ended.index);
  };
  grid.addEventListener('pointerup',release);
  grid.addEventListener('pointercancel',release);
  grid.addEventListener('lostpointercapture', event => {
    if (!gesture || !gesture.dragged || gesture.id !== event.pointerId) return;
    const index = gesture.index;
    gesture = null;
    suppressClick = true;
    goTo(index);
  });
  grid.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, true);
  grid.addEventListener('dragstart', event => { if (compactFolders.matches) event.preventDefault(); });
  grid.addEventListener('keydown', event => {
    if (!compactFolders.matches || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const index = Math.max(0,Math.min(cards.length-1,(destination ?? nearestIndex())+(event.key === 'ArrowRight' ? 1 : -1)));
    goTo(index);
    cards[index].focus({preventScroll:true});
  });
  collectionStrips.push({section,grid,cards,update,cancel:() => { gesture = null; stop(); }});
  update();
});
function syncCompactFolders() {
  syncCabinetFocus();
  collectionStrips.forEach(({section,cards,update}) => {
    if (section.matches('[data-photo-gallery]')) {
      const expanded = section.querySelector('.gallery-toggle').getAttribute('aria-expanded') === 'true';
      cards.forEach((card,index) => {card.hidden = !compactFolders.matches && !expanded && index >= featuredPhotoCount;});
    }
    update();
  });
}
compactFolders.addEventListener('change', () => {
  cancelFolderAnimations();
  if (finishPendingClose) finishPendingClose();
  syncCompactFolders();
});
syncCompactFolders();

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
  syncCabinetFocus();
  document.getElementById('catalog').hidden = true;
  collectionTools.hidden = true;
}

function showCollection(id, { scroll = false, focus = true, updateUrl = true } = {}) {
  const before = folderPositions();
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
    syncCabinetFocus();
    button.closest('.folder-shell').classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    if (focus) button.focus({ preventScroll:true });
  }
  collectionToggle.textContent = id === 'all' ? 'Close film archive ↑' : 'View all 22 films ↗';
  collectionToggle.setAttribute('aria-expanded', String(id === 'all'));
  if (updateUrl) history.replaceState(null, '', id === 'all' ? '#all-films' : `#${id}`);
  if (!compactFolders.matches && !scroll && sourceButton && sourceTop >= 83) {
    window.scrollBy({ top:sourceButton.getBoundingClientRect().top - sourceTop, behavior:'instant' });
  }
  if (compactFolders.matches && id !== 'all') {
    // The touch cabinet is an in-screen viewer; retain the page's scroll position.
  } else if (scroll) {
    const anchor = id === 'all' ? collectionTools : folderPanels.get(id).closest('.folder-shell');
    anchor.scrollIntoView({ behavior:folderMotion.matches ? 'auto' : 'smooth', block:'start' });
  }
  if (id !== 'all' && !folderMotion.matches) {
    const panel = folderPanels.get(id);
    unfoldFolders(before,id);
    const controls = panel.animate([{opacity:0},{opacity:1}],{duration:280,delay:120,fill:'backwards',easing:'ease-out'});
    activeAnimations.push({cancel:() => controls.cancel()});
    controls.finished.catch(() => {});
    revealProjects(panel,transitionVersion);
  }
}

function closeCollection({ scroll = false, focus = true, updateUrl = true, animate = true } = {}) {
  const before = folderPositions();
  const previousId = openFolder || closingFolder;
  const previous = folderButtons.find(button => button.dataset.collection === previousId);
  const sourceTop = previous?.getBoundingClientRect().top;
  const panel = folderPanels.get(previousId);
  const from = panel && !panel.hidden ? panel.getBoundingClientRect() : null;
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
    if (!compactFolders.matches && !scroll && previous && sourceTop >= 83) {
      window.scrollBy({ top:previous.getBoundingClientRect().top - sourceTop, behavior:'instant' });
    } else if (!compactFolders.matches && !scroll && focus && previous && sourceTop < 83) {
      previous.scrollIntoView({ behavior:'instant', block:'center' });
    }
    if (scroll) document.getElementById('work').scrollIntoView({ behavior:folderMotion.matches ? 'auto' : 'smooth', block:'start' });
    if (from && animate && !scroll) unfoldFolders(before,null);
  };
  if (from && animate && !scroll && !folderMotion.matches) {
    closingFolder = previousId;
    finishPendingClose = finish;
    const shell = panel.closest('.folder-shell');
    const clip = Math.max(0,shell.getBoundingClientRect().height-(compactFolders.matches ? 64 : 90));
    const fold = shell.animate([{clipPath:'inset(-32px -12px -24px -12px)'},{clipPath:`inset(-32px -12px ${clip}px -12px)`}],{duration:260,easing:'cubic-bezier(.4,0,.8,1)',fill:'forwards'});
    const fade = panel.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'});
    activeAnimations.push({cancel:() => fold.cancel()},{cancel:() => fade.cancel()});
    fold.finished.then(finish).catch(() => {});
  } else finish();
}

// A quick touch opens; a deliberate hold peeks without blocking page scrolling.
let touchPreview = null;
let touchPreviewTimer = null;
let heldFolder = null;
function cancelTouchPreview() {
  clearTimeout(touchPreviewTimer);
  touchPreviewTimer = null;
  touchPreview = null;
}
function endTouchPreview(event) {
  if (!touchPreview || event.pointerId !== touchPreview.pointerId) return;
  if (event.type === 'pointercancel' || Math.hypot(event.clientX-touchPreview.x,event.clientY-touchPreview.y) > 12) {
    if (heldFolder) heldFolder.classList.remove('is-previewing');
    heldFolder = null;
    cancelTouchPreview();
  } else if (event.type === 'pointerup') cancelTouchPreview();
}
window.addEventListener('pointermove', endTouchPreview, {passive:true});
window.addEventListener('pointerup', endTouchPreview, {passive:true});
window.addEventListener('pointercancel', endTouchPreview, {passive:true});

folderButtons.forEach(button => {
  button.addEventListener('pointerenter', () => {
    if (!folderHover.matches || folderStack.classList.contains('has-open')) return;
    folderButtons.forEach(folder => folder.classList.toggle('is-previewing', folder === button));
  });
  button.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') button.classList.remove('is-previewing');
  });
  button.addEventListener('pointerdown', event => {
    if (!['touch','pen'].includes(event.pointerType) || folderStack.classList.contains('has-open')) return;
    cancelTouchPreview();
    heldFolder = null;
    touchPreview = {pointerId:event.pointerId,x:event.clientX,y:event.clientY};
    touchPreviewTimer = setTimeout(() => {
      if (!touchPreview) return;
      heldFolder = button;
      folderButtons.forEach(folder => folder.classList.toggle('is-previewing', folder === button));
    }, 320);
  }, {passive:true});
  button.addEventListener('contextmenu', event => {
    if (heldFolder === button) event.preventDefault();
  });
  button.addEventListener('click', event => {
    cancelTouchPreview();
    if (heldFolder === button && event.detail !== 0) {
      heldFolder = null;
      return;
    }
    heldFolder = null;
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
  if (target === 'contact') {
    link.addEventListener('click', () => closeCollection({focus:false,animate:false,updateUrl:false}));
    return;
  }
  if (!['work', ...collectionSections.map(section => section.id)].includes(target)) return;
  link.addEventListener('click', event => {
    event.preventDefault();
    if (target === 'work') closeCollection({scroll:true,focus:false});
    else showCollection(target, {scroll:true});
  });
});

document.querySelector('header .logo').addEventListener('click', () => closeCollection({focus:false,animate:false,updateUrl:false}));

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
