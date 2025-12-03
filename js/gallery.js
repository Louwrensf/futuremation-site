// gallery.js — Loads Cloudinary URLs from manifest.txt inside assets/<category>/manifest.txt
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

async function loadManifestImages(folder) {
  try {
    const res = await fetch(`assets/${folder}/manifest.txt?cache=${Date.now()}`);

    if (!res.ok) {
      console.warn("Missing manifest:", folder);
      return [];
    }

    const text = await res.text();
    const urls = text.split("\n").map(u => u.trim()).filter(Boolean);

    return urls.map(url => ({
      url,
      filename: url.split('/').pop()
    }));
  } catch (e) {
    console.error("Manifest error:", e);
    return [];
  }
}

function createCarousel(category, images) {
  if (!images.length) return null;

  const section = document.createElement('div');
  section.className = 'gallery-section';

  const title = document.createElement('div');
  title.className = 'carousel-title';
  title.textContent = category.label;

  const container = document.createElement('div');
  container.className = 'carousel-container';

  const img = document.createElement('img');
  img.src = images[0].url;
  img.loading = "lazy";

  container.appendChild(img);

  let index = 0;

  const left = document.createElement('button');
  left.className = 'carousel-btn left';
  left.innerHTML = '&#8592;';
  left.onclick = ev => {
    ev.stopPropagation();
    index = (index - 1 + images.length) % images.length;
    img.src = images[index].url;
  };

  const right = document.createElement('button');
  right.className = 'carousel-btn right';
  right.innerHTML = '&#8594;';
  right.onclick = ev => {
    ev.stopPropagation();
    index = (index + 1) % images.length;
    img.src = images[index].url;
  };

  container.appendChild(left);
  container.appendChild(right);

  section.appendChild(title);
  section.appendChild(container);
  return section;
}

export async function initGalleries() {
  const container = document.getElementById('galleries');
  if (!container) return;

  container.innerHTML = "";

  for (const cat of galleryCategories) {
    const images = await loadManifestImages(cat.key);
    const carousel = createCarousel(cat, images);
    if (carousel) container.appendChild(carousel);
  }
}

export async function initRecentProjects() {
  const grid = document.getElementById('recentProjectsGrid');
  if (!grid) return;

  grid.innerHTML = "";

  for (const cat of galleryCategories) {
    const images = await loadManifestImages(cat.key);
    if (!images.length) continue;

    const card = document.createElement('div');
    card.className = 'project-card';

    card.innerHTML = `
      <div class="project-carousel-title">${cat.label}</div>
      <img src="${images[0].url}" loading="lazy">
    `;

    grid.appendChild(card);
  }
}
