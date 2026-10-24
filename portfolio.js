'use strict';

const projects = [
  {
    "title": "Complex ideas, explained in an AI-made video",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/z75wz71KKz0",
    "description": "Complex ideas, explained in an AI-made video",
    "brand": "NRL"
  },
  {
    "title": "Exhibition day, cut into a film with a point of view",
    "category": "Highlights",
    "video": "https://youtu.be/_dcuEn4TNiM",
    "description": "Exhibition day, cut into a film with a point of view",
    "brand": "Emper"
  },
  {
    "title": "Exhibition moments that show the craft at its best",
    "category": "Highlights",
    "video": "https://youtu.be/Pr6DJHmH-zw",
    "description": "Exhibition moments that show the craft at its best",
    "brand": "Alpha Arts"
  },
  {
    "title": "Exhibition coverage that builds trust in a wellness brand",
    "category": "Highlights",
    "video": "https://youtu.be/qHdpoM1qa58",
    "description": "Exhibition coverage that builds trust in a wellness brand",
    "brand": "I-Remedies"
  },
  {
    "title": "Fragrance exhibition, covered from the stand to the crowd",
    "category": "Highlights",
    "video": "https://youtu.be/CykQ7cmosV8",
    "description": "Fragrance exhibition, covered from the stand to the crowd",
    "brand": "Kenz de Rasasi"
  },
  {
    "title": "Your exhibition stand, turned into a story",
    "category": "Highlights",
    "video": "https://youtu.be/FvZH7Wg7Y-U",
    "description": "Your exhibition stand, turned into a story",
    "brand": "Al Masaood"
  },
  {
    "title": "Corporate dinner, captured as a night worth remembering",
    "category": "Highlights",
    "video": "https://youtu.be/Mecq3Hjvk2w",
    "description": "Corporate dinner, captured as a night worth remembering",
    "brand": "CombiLift"
  },
  {
    "title": "Product launch, filmed so the reveal lands again online",
    "category": "Highlights",
    "video": "https://youtu.be/UdkRDUl_-9c",
    "description": "Product launch, filmed so the reveal lands again online",
    "brand": "Vivienne Sabo"
  },
  {
    "title": "AI product visuals for e-commerce, no studio needed",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/LXxnDw2XH3M",
    "description": "AI product visuals for e-commerce, no studio needed",
    "brand": "Fragrance study"
  },
  {
    "title": "Product page video, made with AI at catalogue scale",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/_Y2UQGPugXk",
    "description": "Product page video, made with AI at catalogue scale",
    "brand": "Fragrance story"
  },
  {
    "title": "Luxury CGI that makes the bottle the hero",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/-XoRdX4MGJ4",
    "description": "Luxury CGI that makes the bottle the hero",
    "brand": "Luxora"
  },
  {
    "title": "3D product video, short and made to stop the scroll",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/nfg0E2pQvQ8",
    "description": "3D product video, short and made to stop the scroll",
    "brand": "Nylaa"
  },
  {
    "title": "Exhibition day, cut into a reel people actually watch",
    "category": "Reels",
    "video": "https://youtube.com/shorts/2Tf0JE0u3pA?feature=share",
    "description": "Exhibition day, cut into a reel people actually watch",
    "brand": "Hayatna"
  },
  {
    "title": "Exhibition buzz, packed into a vertical reel",
    "category": "Reels",
    "video": "https://youtube.com/shorts/4h_ml2k2gL8?feature=share",
    "description": "Exhibition buzz, packed into a vertical reel",
    "brand": "House of Pops"
  },
  {
    "title": "Exhibition highlights, cut as a reel for Instagram",
    "category": "Reels",
    "video": "https://youtube.com/shorts/DsWOJwstTno?feature=share",
    "description": "Exhibition highlights, cut as a reel for Instagram",
    "brand": "KDR"
  },
  {
    "title": "A day at the exhibition, through the owner's eyes",
    "category": "Reels",
    "video": "https://youtube.com/shorts/HD4arC9fyco?feature=share",
    "description": "A day at the exhibition, through the owner's eyes",
    "brand": "Founder's Diary"
  },
  {
    "title": "Inside the practice, shown as a reel patients trust",
    "category": "Reels",
    "video": "https://youtube.com/shorts/_fsVwJUfR2E?feature=share",
    "description": "Inside the practice, shown as a reel patients trust",
    "brand": "Clinic"
  },
  {
    "title": "Store launch, captured so the doors open to a crowd",
    "category": "Highlights",
    "video": "https://youtu.be/ZsnbpzU47ZI",
    "description": "Store launch, captured so the doors open to a crowd",
    "brand": "Nicoli"
  },
  {
    "title": "Exhibition coverage that makes an industrial brand watchable",
    "category": "Highlights",
    "video": "https://youtu.be/-pUvmMgj9eM",
    "description": "Exhibition coverage that makes an industrial brand watchable",
    "brand": "National Feed"
  },
  {
    "title": "Scroll-stopping fashion, vertical-first",
    "category": "Reels",
    "video": "https://youtube.com/shorts/Hse6ee8_Ev8?feature=share",
    "description": "Scroll-stopping fashion, vertical-first",
    "brand": "Fashion portrait"
  },
  {
    "title": "Editorial style at reel speed",
    "category": "Reels",
    "video": "https://youtube.com/shorts/QB1P9u8cpec?feature=share",
    "description": "Editorial style at reel speed",
    "brand": "Fashion editorial"
  },
  {
    "title": "A fragrance launch with no physical shoot",
    "category": "AI, 3D & CGI",
    "video": "https://youtu.be/L44ugCS6ekY",
    "description": "A fragrance launch with no physical shoot",
    "brand": "Amber Rush"
  }
];

const modal = document.getElementById('modal');
const player = document.getElementById('player');

function openProject(index) {
  const project = projects[index];
  if (!project) return;
  const id = project.video.match(/(?:youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})(?:[?&#].*)?$/)?.[1];
  if (!id) return;

  const displayTitle = project.brand ? `${project.brand}: ${project.title}` : project.title;
  document.getElementById('title').textContent = displayTitle;
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
  document.getElementById('details').replaceChildren(category,youtubeLink,...(project.description !== project.title ? [description] : []));

  const iframe = document.createElement('iframe');
  iframe.title = displayTitle;
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

// Play the original montage on load and restart it whenever the header logo is pressed.
const stage = document.getElementById('logo-reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (stage) {
  function playLogoReveal() {
    stage.classList.remove('is-playing');
    if (reducedMotion.matches) return;
    // Commit the reset so another press restarts even a reveal already in progress.
    void stage.offsetWidth;
    stage.classList.add('is-playing');
  }
  stage.addEventListener('click',playLogoReveal);
  Promise.allSettled(Array.from(stage.querySelectorAll('img'),img => img.decode())).then(playLogoReveal);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) stage.classList.remove('is-playing');
  });
}
