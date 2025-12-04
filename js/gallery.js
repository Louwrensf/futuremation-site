// gallery.js — Loads images from manifest.txt and builds Cloudinary URLs
// Fixed: No duplicate exports

const CLOUDINARY_CONFIG = {
  cloudName: "dpzgcco2c",
  baseFolder: "futuremation",
  transformations: {
    gallery: "c_fill,w_800,h_600,q_auto,f_auto",
    thumbnail: "c_thumb,w_400,h_300,q_auto",
    modal: "c_limit,w_1200,q_auto",
    original: ""
  }
};

const galleryCategories = [
  { key: 'roofing', label: 'Roofing Projects' },
  { key: 'building', label: 'Building Projects' },
  { key: 'painting', label: 'Painting Projects' },
  { key: 'awnings', label: 'Awnings Projects' },
  { key: 'renovations', label: 'Renovations Projects' },
  { key: 'cupboards_kitchens', label: 'Cupboards & Kitchens' },
  { key: 'all-projects', label: 'All Projects' }
];

// Build Cloudinary URL from filename
function buildCloudinaryUrl(folder, filename, size = 'gallery') {
  const { cloudName, baseFolder, transformations } = CLOUDINARY_CONFIG;
  
  // Skip non-image files
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('manifest.txt') || 
      lowerFilename.endsWith('.mp4') ||
      lowerFilename.endsWith('.mov') ||
      lowerFilename.endsWith('.avi')) {
    return null;
  }
  
  // For images, build the URL
  const transform = transformations[size] ? `${transformations[size]}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}${baseFolder}/${folder}/${encodeURIComponent(filename)}`;
}

async function loadManifestImages(folder, size = 'gallery') {
  try {
    const res = await fetch(`assets/${folder}/manifest.txt?cache=${Date.now()}`);
    
    if (!res.ok) {
      console.warn(`Missing manifest for: ${folder}`);
      return [];
    }

    const text = await res.text();
    
    // Filter and process filenames
    const images = text.split("\n")
      .map(filename => filename.trim())
      .filter(filename => {
        if (!filename) return false;
        
        const lower = filename.toLowerCase();
        const isImage = lower.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
        const isManifest = lower.includes('manifest.txt');
        const isVideo = lower.match(/\.(mp4|mov|avi|wmv|flv)$/);
        
        return isImage && !isManifest && !isVideo;
      })
      .map(filename => {
        const originalUrl = buildCloudinaryUrl(folder, filename, 'original');
        const galleryUrl = buildCloudinaryUrl(folder, filename, 'gallery');
        const thumbnailUrl = buildCloudinaryUrl(folder, filename, 'thumbnail');
        const modalUrl = buildCloudinaryUrl(folder, filename, 'modal');
        
        return {
          filename,
          original: originalUrl,
          gallery: galleryUrl,
          thumbnail: thumbnailUrl,
          modal: modalUrl,
          category: folder
        };
      })
      .filter(img => img.original && img.gallery);

    return images;
  } catch (e) {
    console.error(`Error loading manifest for ${folder}:`, e);
    return [];
  }
}

function createCarousel(category, images) {
  if (!images.length) return null;

  const section = document.createElement('div');
  section.className = 'gallery-section';
  section.dataset.category = category.key;

  const title = document.createElement('div');
  title.className = 'carousel-title';
  title.textContent = category.label;

  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.dataset.currentIndex = '0';
  container.dataset.totalImages = images.length.toString();

  const img = document.createElement('img');
  img.src = images[0].gallery;
  img.loading = "lazy";
  img.alt = `${category.label} - ${images[0].filename}`;
  img.dataset.modalUrl = images[0].modal;
  img.dataset.originalUrl = images[0].original;
  img.style.cursor = 'pointer';

  // Click to open modal
  img.addEventListener('click', () => {
    openGalleryModal(category.key, 0, images);
  });

  container.appendChild(img);

  // Add navigation if more than 1 image
  if (images.length > 1) {
    let currentIndex = 0;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn left';
    prevBtn.innerHTML = '&#8592;';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.onclick = (ev) => {
      ev.stopPropagation();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      img.src = images[currentIndex].gallery;
      img.alt = `${category.label} - ${images[currentIndex].filename}`;
      img.dataset.modalUrl = images[currentIndex].modal;
      img.dataset.originalUrl = images[currentIndex].original;
      container.dataset.currentIndex = currentIndex.toString();
    };

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn right';
    nextBtn.innerHTML = '&#8594;';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.onclick = (ev) => {
      ev.stopPropagation();
      currentIndex = (currentIndex + 1) % images.length;
      img.src = images[currentIndex].gallery;
      img.alt = `${category.label} - ${images[currentIndex].filename}`;
      img.dataset.modalUrl = images[currentIndex].modal;
      img.dataset.originalUrl = images[currentIndex].original;
      container.dataset.currentIndex = currentIndex.toString();
    };

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    // Add image counter
    const counter = document.createElement('div');
    counter.className = 'carousel-counter';
    counter.textContent = `1 / ${images.length}`;
    container.appendChild(counter);
  }

  // Add image count
  const info = document.createElement('div');
  info.className = 'carousel-info';
  info.textContent = `${images.length} image${images.length !== 1 ? 's' : ''}`;
  container.appendChild(info);

  section.appendChild(title);
  section.appendChild(container);
  
  return section;
}

// Gallery Modal System
let currentModalImages = [];
let currentModalIndex = 0;

function openGalleryModal(categoryKey, startIndex, images) {
  currentModalImages = images;
  currentModalIndex = startIndex;
  
  const modal = document.getElementById('galleryImageModal');
  const modalImg = document.getElementById('galleryModalImg');
  
  if (!modal || !modalImg) return;
  
  modalImg.src = images[startIndex].modal;
  modalImg.alt = `${categoryKey} - ${images[startIndex].filename}`;
  modalImg.dataset.currentIndex = startIndex.toString();
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Initialize gallery modal
function initGalleryModal() {
  const modal = document.getElementById('galleryImageModal');
  const closeBtn = document.getElementById('closeGalleryModal');
  const prevBtn = document.getElementById('galleryModalLeft');
  const nextBtn = document.getElementById('galleryModalRight');
  const modalImg = document.getElementById('galleryModalImg');
  
  if (!modal) return;
  
  // Close modal
  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  };
  
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Navigation
  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentModalImages.length === 0) return;
    
    currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex].modal;
    modalImg.alt = `${currentModalImages[currentModalIndex].category} - ${currentModalImages[currentModalIndex].filename}`;
    modalImg.dataset.currentIndex = currentModalIndex.toString();
  });
  
  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentModalImages.length === 0) return;
    
    currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex].modal;
    modalImg.alt = `${currentModalImages[currentModalIndex].category} - ${currentModalImages[currentModalIndex].filename}`;
    modalImg.dataset.currentIndex = currentModalIndex.toString();
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevBtn?.click();
      if (e.key === 'ArrowRight') nextBtn?.click();
    }
  });
}

export async function initGalleries() {
  const container = document.getElementById('galleries');
  if (!container) return;

  container.innerHTML = "<div class='loading-galleries'>Loading galleries...</div>";
  
  initGalleryModal();

  try {
    const categoryPromises = galleryCategories.map(async cat => {
      const images = await loadManifestImages(cat.key);
      return { cat, images };
    });

    const results = await Promise.all(categoryPromises);
    container.innerHTML = "";
    
    let hasAnyImages = false;
    
    results.forEach(({ cat, images }) => {
      if (images.length > 0) {
        hasAnyImages = true;
        const carousel = createCarousel(cat, images);
        container.appendChild(carousel);
      } else {
        const emptySection = document.createElement('div');
        emptySection.className = 'gallery-section empty';
        emptySection.innerHTML = `
          <div class="carousel-title">${cat.label}</div>
          <div class="empty-gallery">No images available yet</div>
        `;
        container.appendChild(emptySection);
      }
    });
    
    if (!hasAnyImages) {
      container.innerHTML = `
        <div class="no-galleries-message">
          <h3>No Galleries Available</h3>
          <p>Check that manifest.txt files exist in each assets/ folder.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading galleries:', error);
    container.innerHTML = `
      <div class="error-loading">
        <h3>Error Loading Galleries</h3>
        <p>Check browser console for details.</p>
      </div>
    `;
  }
}

export async function initRecentProjects() {
  const grid = document.getElementById('recentProjectsGrid');
  if (!grid) return;

  grid.innerHTML = "<div class='loading-projects'>Loading projects...</div>";

  try {
    const categoryPromises = galleryCategories.map(async cat => {
      const images = await loadManifestImages(cat.key, 'thumbnail');
      return { cat, images: images.slice(0, 1) };
    });

    const results = await Promise.all(categoryPromises);
    grid.innerHTML = "";

    let hasProjects = false;
    
    results.forEach(({ cat, images }) => {
      if (images.length > 0) {
        hasProjects = true;
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.category = cat.key;
        
        card.innerHTML = `
          <div class="project-carousel-title">${cat.label}</div>
          <img src="${images[0].thumbnail}" 
               loading="lazy" 
               alt="${cat.label}"
               class="project-thumbnail">
          <div class="project-image-count">${images.length} image${images.length !== 1 ? 's' : ''}</div>
        `;

        card.addEventListener('click', async () => {
          const allImages = await loadManifestImages(cat.key);
          if (allImages.length > 0) {
            openGalleryModal(cat.key, 0, allImages);
          }
        });

        grid.appendChild(card);
      }
    });
    
    if (!hasProjects) {
      grid.innerHTML = `
        <div class="no-projects">
          <h3>No Projects Yet</h3>
          <p>Projects will appear here once images are added.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading recent projects:', error);
    grid.innerHTML = `
      <div class="error-loading">
        <h3>Error Loading Projects</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Debug function - ONLY ONE EXPORT STATEMENT AT THE END
export { openGalleryModal, loadManifestImages };
