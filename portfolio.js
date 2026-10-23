'use strict';

const projects = [
  { title: 'NRL — AI Explainer Video', category: 'AI, 3D & CGI', video: 'https://youtu.be/z75wz71KKz0' },
  { title: 'Emper — Highlights', category: 'Highlights', video: 'https://youtu.be/_dcuEn4TNiM' },
  { title: 'Alpha Arts — Highlights', category: 'Highlights', video: 'https://youtu.be/Pr6DJHmH-zw' },
  { title: 'I-Remedies — Highlights', category: 'Highlights', video: 'https://youtu.be/qHdpoM1qa58' },
  { title: 'Kenz de Rasasi — Highlights', category: 'Highlights', video: 'https://youtu.be/CykQ7cmosV8' },
  { title: 'Al Masaood — Highlights', category: 'Highlights', video: 'https://youtu.be/FvZH7Wg7Y-U' },
  { title: 'CombiLift — Highlights', category: 'Highlights', video: 'https://youtu.be/Mecq3Hjvk2w' },
  { title: 'Vivienne Sabo — Highlights', category: 'Highlights', video: 'https://youtu.be/UdkRDUl_-9c' },
  { title: 'Product AI Video 01', category: 'AI, 3D & CGI', video: 'https://youtu.be/LXxnDw2XH3M' },
  { title: 'Product AI Video 02', category: 'AI, 3D & CGI', video: 'https://youtu.be/_Y2UQGPugXk' },
  { title: 'Luxora CGI', category: 'AI, 3D & CGI', video: 'https://youtu.be/-XoRdX4MGJ4' },
  { title: 'Nylaa 3D', category: 'AI, 3D & CGI', video: 'https://youtu.be/nfg0E2pQvQ8' },
  { title: 'Hayatna', category: 'Reels', video: 'https://youtube.com/shorts/2Tf0JE0u3pA?feature=share' },
  { title: 'House of Pops', category: 'Reels', video: 'https://youtube.com/shorts/4h_ml2k2gL8?feature=share' },
  { title: 'KDR Reel', category: 'Reels', video: 'https://youtube.com/shorts/DsWOJwstTno?feature=share' },
  { title: "Founder's Diary", category: 'Reels', video: 'https://youtube.com/shorts/HD4arC9fyco?feature=share' },
  { title: 'Clinic', category: 'Reels', video: 'https://youtube.com/shorts/_fsVwJUfR2E?feature=share' },
  {title: 'Nicoli', category: 'Highlights', video: 'https://youtu.be/ZsnbpzU47ZI'},
  {title: 'National Feed', category: 'Highlights', video: 'https://youtu.be/-pUvmMgj9eM'},
  {title: 'Fashion Reel', category: 'Reels', video: 'https://youtube.com/shorts/Hse6ee8_Ev8?feature=share'},
  {title: 'Fashion Reel', category: 'Reels', video: 'https://youtube.com/shorts/QB1P9u8cpec?feature=share'},
  {title: 'Amber Rush', category: 'AI, 3D & CGI', video: 'https://youtu.be/L44ugCS6ekY'}
];

const modal = document.getElementById('modal');
const player = document.getElementById('player');

function openProject(index) {
  const project = projects[index];
  if (!project) return;
  const id = project.video.match(/(?:youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})(?:[?&#].*)?$/)?.[1];
  if (!id) return;

  document.getElementById('title').textContent = project.title;
  const category = document.createElement('span');
  category.textContent = project.category;
  const youtubeLink = document.createElement('a');
  youtubeLink.href = project.video;
  youtubeLink.target = '_blank';
  youtubeLink.rel = 'noopener noreferrer';
  youtubeLink.textContent = 'Watch on YouTube ↗';
  document.getElementById('details').replaceChildren(category, youtubeLink);

  const iframe = document.createElement('iframe');
  iframe.title = project.title;
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  player.replaceChildren(iframe);
  modal.classList.toggle('modal-reel', project.category === 'Reels');
  modal.showModal();
}

modal.querySelector('.close').addEventListener('click', () => modal.close());
modal.addEventListener('close', () => player.replaceChildren());
modal.addEventListener('click', event => {
  if (event.target !== modal) return;
  const bounds = modal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) modal.close();
});
document.querySelectorAll('.tile').forEach(tile => {
  tile.addEventListener('click', () => openProject(Number(tile.dataset.index)));
  tile.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProject(Number(tile.dataset.index));
    }
  });
});

const stage = document.getElementById('logo-reveal');
const replay = document.getElementById('replay-reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function playReveal() {
  stage.classList.remove('is-playing');
  if (reducedMotion.matches) return;
  // Flush the finished sequence so replay starts from the first frame.
  void stage.offsetWidth;
  stage.classList.add('is-playing');
}
replay.hidden = false;
replay.addEventListener('click', playReveal);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) stage.classList.remove('is-playing');
});
// Decode local imagery first. With JavaScript disabled, the original logo remains visible.
Promise.allSettled(Array.from(stage.querySelectorAll('img'), img => img.decode())).then(playReveal);
