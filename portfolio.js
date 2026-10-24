'use strict';

const projects = [
  {
    "title": "NRL",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/z75wz71KKz0",
    "description": "An AI-led explainer film."
  },
  {
    "title": "Emper",
    "category": "Highlights",
    "video": "https://youtu.be/_dcuEn4TNiM",
    "description": "Exhibition highlights for Emper."
  },
  {
    "title": "Alpha Arts",
    "category": "Highlights",
    "video": "https://youtu.be/Pr6DJHmH-zw",
    "description": "Exhibition highlights for Alpha Arts."
  },
  {
    "title": "I-Remedies",
    "category": "Highlights",
    "video": "https://youtu.be/qHdpoM1qa58",
    "description": "Exhibition highlights for I-Remedies."
  },
  {
    "title": "Kenz de Rasasi",
    "category": "Highlights",
    "video": "https://youtu.be/CykQ7cmosV8",
    "description": "Fragrance, people and exhibition moments."
  },
  {
    "title": "Al Masaood",
    "category": "Highlights",
    "video": "https://youtu.be/FvZH7Wg7Y-U",
    "description": "The exhibition stand, team and visitors."
  },
  {
    "title": "CombiLift",
    "category": "Highlights",
    "video": "https://youtu.be/Mecq3Hjvk2w",
    "description": "Exhibition highlights for CombiLift."
  },
  {
    "title": "Vivienne Sabo",
    "category": "Highlights",
    "video": "https://youtu.be/UdkRDUl_-9c",
    "description": "Exhibition highlights for Vivienne Sabo."
  },
  {
    "title": "Fragrance study",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/LXxnDw2XH3M",
    "description": "An AI-led fragrance product study."
  },
  {
    "title": "Fragrance story",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/_Y2UQGPugXk",
    "description": "An AI-led fragrance product story."
  },
  {
    "title": "Luxora",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/-XoRdX4MGJ4",
    "description": "A CGI fragrance product film."
  },
  {
    "title": "Nylaa",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/nfg0E2pQvQ8",
    "description": "A 3D fragrance product film."
  },
  {
    "title": "Hayatna",
    "category": "Reels",
    "video": "https://youtube.com/shorts/2Tf0JE0u3pA?feature=share",
    "description": "Brand moments in a vertical edit."
  },
  {
    "title": "House of Pops",
    "category": "Reels",
    "video": "https://youtube.com/shorts/4h_ml2k2gL8?feature=share",
    "description": "Food and lifestyle in a vertical edit."
  },
  {
    "title": "KDR",
    "category": "Reels",
    "video": "https://youtube.com/shorts/DsWOJwstTno?feature=share",
    "description": "A vertical brand reel."
  },
  {
    "title": "Founder's Diary",
    "category": "Reels",
    "video": "https://youtube.com/shorts/HD4arC9fyco?feature=share",
    "description": "A founder story, made for social."
  },
  {
    "title": "Clinic",
    "category": "Reels",
    "video": "https://youtube.com/shorts/_fsVwJUfR2E?feature=share",
    "description": "A clinic reel, made for social."
  },
  {
    "title": "Nicoli",
    "category": "Highlights",
    "video": "https://youtu.be/ZsnbpzU47ZI",
    "description": "Fashion and accessories in focus."
  },
  {
    "title": "National Feed",
    "category": "Highlights",
    "video": "https://youtu.be/-pUvmMgj9eM",
    "description": "Exhibition highlights for National Feed."
  },
  {
    "title": "Fashion portrait",
    "category": "Reels",
    "video": "https://youtube.com/shorts/Hse6ee8_Ev8?feature=share",
    "description": "A fashion portrait in motion."
  },
  {
    "title": "Fashion editorial",
    "category": "Reels",
    "video": "https://youtube.com/shorts/QB1P9u8cpec?feature=share",
    "description": "A vertical fashion editorial."
  },
  {
    "title": "Amber Rush",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/L44ugCS6ekY",
    "description": "A CGI fragrance product film."
  }
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
  const description = document.createElement('p');
  description.className = 'project-description';
  description.textContent = project.description;
  document.getElementById('details').replaceChildren(category, youtubeLink, description);

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

// The original logo montage now plays once in the compact header mark.
const stage = document.getElementById('logo-reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (stage) {
  Promise.allSettled(Array.from(stage.querySelectorAll('img'),img => img.decode())).then(() => {
    if (!reducedMotion.matches) stage.classList.add('is-playing');
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) stage.classList.remove('is-playing');
  });
}
