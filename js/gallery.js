// gallery.js — Loads local images from manifests inside assets/<category>/manifest.txt
// Exports: initGalleries(), initRecentProjects()

const galleryCategories = [
  { key: 'roofing', label: 'Roofing Projects' },
  { key: 'building', label: 'Building Projects' },
  { key: 'painting', label: 'Painting Projects' },
  { key: 'awnings', label: 'Awnings Projects' },
  { key: 'renovations', label: 'Renovations Projects' },
  { key: 'cupboards_kitchens', label: 'Cupboards & Kitchens' },
  { key: 'all-projects', label: 'All Projects' }
];

// Load filenames from manifest.txt inside each category folder
async function loadManifestImages(folder) {
  try {
    const res = await fetch(`assets/${folder}/manifest.txt`);
    if (!res.ok) {
      console.warn(`Manifest not found for ${folder}`);
      return [];
    }
    const text = await res.text();
    const files = text.split('\n').map(f => f.trim()).filter(Boolean);
    return files.map(filename => ({ url: `assets/${folder}/${filename}`, filename }));
  } catch (err) {
    console.error("Error loading manifest for", folder, err);
    return [];
  }
}

// Create small carousel element
function createCarousel(category, images) {
  const section = document.createElement('div');
  section.className = 'gallery-section';

  const title = document.createElement('div');
  title.className = 'carousel-title';
  title.textContent = category.label;
  section.appendChild(title);

  const container = document.createElement('div');
  container.className = 'carousel-container';

  const img = document.createElement('img');
  img.src = images[0]?.url || '';
  img.alt = category.label;
  img.loading = 'lazy';

  container.appendChild(img);

  let index = 0;

  const left = document.createElement('button');
  left.className = 'carousel-btn left';
  left.innerHTML = '&#8592;';
  left.onclick = ev => {
    ev.stopPropagation();
    if (!images.length) return;
    index = (index - 1 + images.length) % images.length;
    img.src = images[index].url;
  };

  const right = document.createElement('button');
  right.className = 'carousel-btn right';
  right.innerHTML = '&#8594;';
  right.onclick = ev => {
    ev.stopPropagation();
    if (!images.length) return;
    index = (index + 1) % images.length;
    img.src = images[index].url;
  };

  container.appendChild(left);
  container.appendChild(right);

  container.addEventListener('click', () => openModal(images, index));

  section.appendChild(container);
  return section;
}

// Modal logic
let modalState = { images: [], index: 0 };
function openModal(images, index) {
  modalState = { images, index };
  const modal = document.getElementById('galleryImageModal');
  const img = document.getElementById('galleryModalImg');
  img.src = images[index].url;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  const modal = document.getElementById('galleryImageModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('closeGalleryModal')?.addEventListener('click', closeModal);
document.getElementById('galleryModalLeft')?.addEventListener('click', () => {
  if (!modalState.images.length) return;
  modalState.index = (modalState.index - 1 + modalState.images.length) % modalState.images.length;
  document.getElementById('galleryModalImg').src = modalState.images[modalState.index].url;
});
document.getElementById('galleryModalRight')?.addEventListener('click', () => {
  if (!modalState.images.length) return;
  modalState.index = (modalState.index + 1) % modalState.images.length;
  document.getElementById('galleryModalImg').src = modalState.images[modalState.index].url;
});
document.getElementById('galleryImageModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });

// Exports
export async function initGalleries() {
  const container = document.getElementById('galleries');
  if (!container) return;
  container.innerHTML = '';
  for (const cat of galleryCategories) {
    const images = await loadManifestImages(cat.key);
    if (!images.length) continue;
    const el = createCarousel(cat, images);
    container.appendChild(el);
  }
}

export async function initRecentProjects() {
  const grid = document.getElementById('recentProjectsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const cat of galleryCategories) {
    const images = await loadManifestImages(cat.key);
    if (!images.length) continue;
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `<div class="project-carousel-title">${cat.label}</div><img loading="lazy" src="${images[0].url}" alt="${cat.label}">`;
    card.onclick = () => openModal(images, 0);
    grid.appendChild(card);
  }
}
