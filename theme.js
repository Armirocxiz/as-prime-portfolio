"use strict";

(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const scene = document.getElementById('theme-scene');
  const status = document.getElementById('theme-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let desired = root.dataset.theme === 'light' ? 'light' : 'dark';
  let timers = [];
  let version = 0;

  function updateControl(theme) {
    toggle.setAttribute('aria-checked',String(theme === 'light'));
    toggle.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  }
  function applyTheme(theme, announce = true) {
    root.dataset.theme = theme;
    updateControl(theme);
    try { localStorage.setItem('as-prime-theme',theme); } catch (_) {}
    if (announce) status.textContent = theme === 'light' ? 'Light mode on' : 'Dark mode on';
  }
  function clearScene() {
    timers.forEach(clearTimeout);
    timers = [];
    scene.classList.remove('is-playing');
    scene.hidden = true;
    root.classList.remove('theme-changing');
    toggle.removeAttribute('aria-busy');
  }
  function schedule(callback, delay, token) {
    timers.push(setTimeout(() => { if (token === version) callback(); },delay));
  }
  function switchTheme() {
    desired = desired === 'dark' ? 'light' : 'dark';
    version += 1;
    const token = version;
    clearScene();
    if (desired === root.dataset.theme) { updateControl(desired); return; }
    if (reduced.matches) { applyTheme(desired); return; }

    const bounds = toggle.getBoundingClientRect();
    scene.hidden = false;
    scene.style.top = `${Math.max(0,bounds.top-8)}px`;
    const sceneBounds = scene.getBoundingClientRect();
    const scale = sceneBounds.width/360;
    const lampX = (bounds.left+bounds.width/2-sceneBounds.left)/scale;
    scene.style.setProperty('--lamp-offset',`${lampX-270}px`);
    scene.dataset.target = desired;
    root.classList.add('theme-changing');
    toggle.setAttribute('aria-busy','true');
    // Restart a previous visit without leaving an old timer or animation behind.
    void scene.offsetWidth;
    scene.classList.add('is-playing');
    schedule(() => applyTheme(desired),850,token);
    schedule(clearScene,1900,token);
  }

  toggle.hidden = false;
  updateControl(desired);
  toggle.addEventListener('click',switchTheme);
  reduced.addEventListener('change',() => {
    if (!reduced.matches) return;
    version += 1;
    clearScene();
    applyTheme(desired);
  });
})();
