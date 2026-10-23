'use strict';

const photoModal = document.getElementById('photo-modal');
const fullPhoto = document.getElementById('photo-full');
const photoCount = document.getElementById('photo-count');
const photoModalTitle = document.getElementById('photo-modal-title');
const featuredPhotoCount = 8;
let activePhotos = [];
let activePhoto = 0;

function displayPhoto(index) {
  if (!activePhotos.length) return;
  activePhoto = (index + activePhotos.length) % activePhotos.length;
  const source = activePhotos[activePhoto].querySelector('img');
  fullPhoto.alt = source.alt;
  fullPhoto.src = source.src;
  photoCount.textContent = `${activePhoto + 1} / ${activePhotos.length}`;
}

document.querySelectorAll('[data-photo-gallery]').forEach(gallery => {
  const cards = Array.from(gallery.querySelectorAll('.photo-card'));
  const toggle = gallery.querySelector('.gallery-toggle');
  cards.forEach((card, index) => {
    card.hidden = index >= featuredPhotoCount;
    card.addEventListener('click', () => {
      activePhotos = cards;
      photoModalTitle.textContent = gallery.dataset.galleryTitle;
      displayPhoto(index);
      photoModal.showModal();
    });
  });
  toggle.hidden = cards.length <= featuredPhotoCount;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'SHOW FEWER PHOTOS ↑' : `VIEW ALL ${cards.length} PHOTOS ↗`;
    cards.forEach((card, index) => { card.hidden = !expanded && index >= featuredPhotoCount; });
    if (!expanded) toggle.scrollIntoView({ block: 'nearest' });
  });
});

document.getElementById('photo-close').addEventListener('click', () => photoModal.close());
document.getElementById('photo-prev').addEventListener('click', () => displayPhoto(activePhoto - 1));
document.getElementById('photo-next').addEventListener('click', () => displayPhoto(activePhoto + 1));
photoModal.addEventListener('close', () => fullPhoto.removeAttribute('src'));
photoModal.addEventListener('click', event => {
  if (event.target !== photoModal) return;
  const bounds = photoModal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoModal.close();
});
document.addEventListener('keydown', event => {
  if (!photoModal.open) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    displayPhoto(activePhoto + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
