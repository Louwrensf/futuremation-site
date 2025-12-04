// gallery.js — Loads Cloudinary URLs from manifest.txt
// Updated with your actual Cloudinary configuration

const CLOUDINARY_CONFIG = {
  cloudName: "dpzgcco2c", // Your cloud name from the URLs
  transformations: {
    gallery: "c_fill,w_800,h_600,q_auto,f_auto", // For gallery display
    thumbnail: "c_thumb,w_400,h_300,q_auto", // For thumbnails
    modal: "c_limit,w_1200,q_auto" // For full-size modal view
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

// Helper to optimize Cloudinary URLs with transformations
function optimizeCloudinaryUrl(url, size = 'gallery') {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  
  const { transformations } = CLOUDINARY_CONFIG;
  
  // If URL already has transformations, replace them
  if (url.includes('/upload/') && url.includes('/v')) {
    const parts = url.split('/upload/');
    const afterUpload = parts[1];
    
    // Check if it has version string (v1764808507)
    if (afterUpload.match(/^v\d+\//)) {
      // Insert transformation before version
      const versionIndex = afterUpload.indexOf('/');
      const baseUrl = afterUpload.substring(versionIndex + 1);
      const version = afterUpload.substring(0, versionIndex + 1);
      
      return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformations[size]}/${version}${baseUrl}`;
    }
  }
  
  // Default: add transformation at the beginning
  return url.replace(
    `/upload/`,
    `/upload/${transformations[size]}/`
  );
}

async function loadManifestImages(folder, size = 'gallery') {
  try {
    // Use cache busting to ensure fresh manifests
    const res = await fetch(`assets/${folder}/manifest.txt?cache=${Date.now()}`);
    
    if (!res.ok) {
      console.warn(`Missing manifest for: ${folder}`);
      return [];
    }

    const text = await res.text();
    const urls = text.split("\n")
      .map(u => u.trim())
      .filter(Boolean)
      .map(url => ({
        thumbnail: optimizeCloudinaryUrl(url, 'thumbnail'),
        gallery: optimizeCloudinaryUrl(url, 'gallery'),
        modal: optimizeCloudinaryUrl(url, 'modal'),
        original: url,
        filename: url.split('/').pop(),
        category: folder
      }));

    return urls;
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
  img.alt = `${category.label} - Image 1`;
  img.dataset.modalUrl = images[0].modal;
  img.dataset.originalUrl = images[0].original;

  // Add click to open modal
  img.addEventListener('click', () => {
    openGalleryModal(category.key, 0, images);
  });

  container.appendChild(img);

  let currentIndex = 0;

  const leftBtn = document.createElement('button');
  leftBtn.className = 'carousel-btn left';
  leftBtn.innerHTML = '&#8592;';
  leftBtn.setAttribute('aria-label', 'Previous image');
  leftBtn.onclick = (ev) => {
    ev.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarouselImage(img, images[currentIndex], currentIndex);
    container.dataset.currentIndex = currentIndex.toString();
  };

  const rightBtn = document.createElement('button');
  rightBtn.className = 'carousel-btn right';
  rightBtn.innerHTML = '&#8594;';
  rightBtn.setAttribute('aria-label', 'Next image');
  rightBtn.onclick = (ev) => {
    ev.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
    updateCarouselImage(img, images[currentIndex], currentIndex);
    container.dataset.currentIndex = currentIndex.toString();
  };

  container.appendChild(leftBtn);
  container.appendChild(rightBtn);

  // Add image counter
  const counter = document.createElement('div');
  counter.className = 'carousel-counter';
  counter.textContent = `1 / ${images.length}`;
  container.appendChild(counter);

  // Update function
  function updateCarouselImage(imageElement, imageData, index) {
    imageElement.src = imageData.gallery;
    imageElement.alt = `${category.label} - Image ${index + 1}`;
    imageElement.dataset.modalUrl = imageData.modal;
    imageElement.dataset.originalUrl = imageData.original;
    counter.textContent = `${index + 1} / ${images.length}`;
    
    // Preload next image for smoother transitions
    const nextIndex = (index + 1) % images.length;
    preloadImage(images[nextIndex].gallery);
  }

  section.appendChild(title);
  section.appendChild(container);
  
  // Preload first few images
  preloadImage(images[1]?.gallery);
  preloadImage(images[2]?.gallery);
  
  return section;
}

// Preload images for smoother carousel
function preloadImage(url) {
  if (!url) return;
  const img = new Image();
  img.src = url;
}

// Gallery Modal System
let currentModalImages = [];
let currentModalIndex = 0;

function openGalleryModal(categoryKey, startIndex, images) {
  currentModalImages = images;
  currentModalIndex = startIndex;
  
  const modal = document.getElementById('galleryImageModal');
  const modalImg = document.getElementById('galleryModalImg');
  
  if (!modal || !modalImg) {
    console.error('Gallery modal elements not found');
    return;
  }
  
  modalImg.src = images[startIndex].modal;
  modalImg.alt = `${categoryKey} - Image ${startIndex + 1}`;
  modalImg.dataset.currentIndex = startIndex.toString();
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Preload adjacent images
  preloadImage(images[(startIndex + 1) % images.length]?.modal);
  preloadImage(images[(startIndex - 1 + images.length) % images.length]?.modal);
}

// Initialize gallery modal
function initGalleryModal() {
  const modal = document.getElementById('galleryImageModal');
  const closeBtn = document.getElementById('closeGalleryModal');
  const leftBtn = document.getElementById('galleryModalLeft');
  const rightBtn = document.getElementById('galleryModalRight');
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
  leftBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentModalImages.length === 0) return;
    
    currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex].modal;
    modalImg.alt = `${currentModalImages[currentModalIndex].category} - Image ${currentModalIndex + 1}`;
    modalImg.dataset.currentIndex = currentModalIndex.toString();
    
    // Preload next
    preloadImage(currentModalImages[(currentModalIndex + 1) % currentModalImages.length]?.modal);
  });
  
  rightBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentModalImages.length === 0) return;
    
    currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex].modal;
    modalImg.alt = `${currentModalImages[currentModalIndex].category} - Image ${currentModalIndex + 1}`;
    modalImg.dataset.currentIndex = currentModalIndex.toString();
    
    // Preload previous
    preloadImage(currentModalImages[(currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length]?.modal);
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') leftBtn?.click();
      if (e.key === 'ArrowRight') rightBtn?.click();
    }
  });
}

export async function initGalleries() {
  const container = document.getElementById('galleries');
  if (!container) return;

  container.innerHTML = "<div class='loading-galleries'>Loading galleries...</div>";
  
  // Initialize modal system
  initGalleryModal();

  // Load all categories
  const categoryPromises = galleryCategories.map(async cat => {
    const images = await loadManifestImages(cat.key);
    return { cat, images };
  });

  try {
    const results = await Promise.all(categoryPromises);
    container.innerHTML = "";
    
    results.forEach(({ cat, images }) => {
      if (images.length > 0) {
        const carousel = createCarousel(cat, images);
        container.appendChild(carousel);
      } else {
        // Show empty state
        const emptySection = document.createElement('div');
        emptySection.className = 'gallery-section empty';
        emptySection.innerHTML = `
          <div class="carousel-title">${cat.label}</div>
          <div class="empty-gallery">No images yet</div>
        `;
        container.appendChild(emptySection);
      }
    });
  } catch (error) {
    console.error('Error loading galleries:', error);
    container.innerHTML = '<div class="error-loading">Error loading galleries. Please refresh.</div>';
  }
}

export async function initRecentProjects() {
  const grid = document.getElementById('recentProjectsGrid');
  if (!grid) return;

  grid.innerHTML = "<div class='loading-projects'>Loading projects...</div>";

  try {
    // Get first image from each category
    const categoryPromises = galleryCategories.map(async cat => {
      const images = await loadManifestImages(cat.key, 'thumbnail');
      return { cat, images: images.slice(0, 1) }; // Just first image
    });

    const results = await Promise.all(categoryPromises);
    grid.innerHTML = "";

    results.forEach(({ cat, images }) => {
      if (images.length > 0) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.category = cat.key;
        
        // Store all images for modal
        card.dataset.categoryImages = JSON.stringify(
          images.map(img => ({ modal: img.modal, original: img.original }))
        );

        card.innerHTML = `
          <div class="project-carousel-title">${cat.label}</div>
          <img src="${images[0].thumbnail}" 
               loading="lazy" 
               alt="${cat.label}"
               class="project-thumbnail">
          <div class="project-image-count">${images.length} image${images.length !== 1 ? 's' : ''}</div>
        `;

        // Make card clickable to open modal with first image
        card.addEventListener('click', async () => {
          const allImages = await loadManifestImages(cat.key);
          if (allImages.length > 0) {
            openGalleryModal(cat.key, 0, allImages);
          }
        });

        grid.appendChild(card);
      }
    });
    
    // If no projects loaded
    if (grid.children.length === 0) {
      grid.innerHTML = '<div class="no-projects">No projects available yet.</div>';
    }
  } catch (error) {
    console.error('Error loading recent projects:', error);
    grid.innerHTML = '<div class="error-loading">Error loading projects.</div>';
  }
}

// Export for use in main.js
export { openGalleryModal, loadManifestImages };
