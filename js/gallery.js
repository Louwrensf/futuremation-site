// gallery.js — Loads images from manifest.txt and builds Cloudinary URLs
// Step 1: Configuration - Set your Cloudinary details here
const CLOUDINARY_CONFIG = {
  cloudName: "dpzgcco2c", // ← YOUR Cloudinary cloud name
  baseFolder: "futuremation", // ← Your folder name in Cloudinary
  transformations: {
    gallery: "c_fill,w_800,h_600,q_auto,f_auto", // For gallery display
    thumbnail: "c_thumb,w_400,h_300,q_auto", // For thumbnails
    modal: "c_limit,w_1200,q_auto", // For full-size modal view
    original: "" // No transformations
  }
};

// Step 2: Define your gallery categories
const galleryCategories = [
  { key: 'roofing', label: 'Roofing Projects' },
  { key: 'building', label: 'Building Projects' },
  { key: 'painting', label: 'Painting Projects' },
  { key: 'awnings', label: 'Awnings Projects' },
  { key: 'renovations', label: 'Renovations Projects' },
  { key: 'cupboards_kitchens', label: 'Cupboards & Kitchens' },
  { key: 'all-projects', label: 'All Projects' }
];

// Step 3: Function to build Cloudinary URL from filename
function buildCloudinaryUrl(folder, filename, size = 'gallery') {
  const { cloudName, baseFolder, transformations } = CLOUDINARY_CONFIG;
  
  // Step 3a: Skip non-image files
  const lowerFilename = filename.toLowerCase();
  const isImage = lowerFilename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
  const isVideo = lowerFilename.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/);
  const isManifest = lowerFilename.includes('manifest.txt');
  
  if (isVideo || isManifest || !isImage) {
    console.log(`Skipping non-image file: ${filename}`);
    return null;
  }
  
  // Step 3b: Build the Cloudinary URL
  const transform = transformations[size] ? `${transformations[size]}/` : '';
  
  // URL pattern: https://res.cloudinary.com/CLOUD_NAME/image/upload/TRANSFORMATIONS/BASE_FOLDER/FOLDER/FILENAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}${baseFolder}/${folder}/${encodeURIComponent(filename)}`;
}

// Step 4: Load images from manifest.txt
async function loadManifestImages(folder, size = 'gallery') {
  console.log(`Loading manifest for: ${folder}`);
  
  try {
    // Step 4a: Fetch the manifest.txt file
    const manifestUrl = `assets/${folder}/manifest.txt?cache=${Date.now()}`;
    console.log(`Fetching: ${manifestUrl}`);
    
    const res = await fetch(manifestUrl);
    
    if (!res.ok) {
      console.warn(`❌ Manifest not found: assets/${folder}/manifest.txt`);
      return [];
    }

    // Step 4b: Read and parse the file
    const text = await res.text();
    console.log(`✅ Manifest loaded for ${folder}, ${text.length} characters`);
    
    // Step 4c: Split into lines and process each filename
    const lines = text.split("\n");
    console.log(`Found ${lines.length} lines in manifest`);
    
    const images = [];
    
    for (const line of lines) {
      const filename = line.trim();
      
      // Skip empty lines
      if (!filename) continue;
      
      console.log(`Processing: ${filename}`);
      
      // Step 4d: Build URLs for this file
      const originalUrl = buildCloudinaryUrl(folder, filename, 'original');
      const galleryUrl = buildCloudinaryUrl(folder, filename, 'gallery');
      const thumbnailUrl = buildCloudinaryUrl(folder, filename, 'thumbnail');
      const modalUrl = buildCloudinaryUrl(folder, filename, 'modal');
      
      // Step 4e: Only add if it's a valid image
      if (originalUrl && galleryUrl) {
        images.push({
          filename,
          original: originalUrl,
          gallery: galleryUrl,
          thumbnail: thumbnailUrl,
          modal: modalUrl,
          category: folder
        });
        console.log(`✓ Added: ${filename}`);
      } else {
        console.log(`✗ Skipped: ${filename} (not a valid image)`);
      }
    }
    
    console.log(`Total images for ${folder}: ${images.length}`);
    return images;
    
  } catch (error) {
    console.error(`🚨 Error loading manifest for ${folder}:`, error);
    return [];
  }
}

// Step 5: Create a carousel for a category
function createCarousel(category, images) {
  if (!images.length) {
    console.log(`No images for ${category.label}`);
    return null;
  }

  console.log(`Creating carousel for ${category.label} with ${images.length} images`);

  // Step 5a: Create the section container
  const section = document.createElement('div');
  section.className = 'gallery-section';
  section.dataset.category = category.key;

  // Step 5b: Add title
  const title = document.createElement('div');
  title.className = 'carousel-title';
  title.textContent = category.label;
  section.appendChild(title);

  // Step 5c: Create carousel container
  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.dataset.currentIndex = '0';
  container.dataset.totalImages = images.length.toString();

  // Step 5d: Create the main image
  const img = document.createElement('img');
  img.src = images[0].gallery;
  img.loading = "lazy";
  img.alt = `${category.label} - ${images[0].filename}`;
  img.dataset.modalUrl = images[0].modal;
  img.dataset.originalUrl = images[0].original;
  img.style.cursor = 'pointer';

  // Step 5e: Click to open modal
  img.addEventListener('click', () => {
    console.log(`Opening modal for ${category.label}, image 0`);
    openGalleryModal(category.key, 0, images);
  });

  container.appendChild(img);

  // Step 5f: Add navigation buttons (if more than 1 image)
  if (images.length > 1) {
    let currentIndex = 0;

    // Previous button
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
      console.log(`Carousel ${category.label}: Show image ${currentIndex + 1}/${images.length}`);
    };

    // Next button
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
      console.log(`Carousel ${category.label}: Show image ${currentIndex + 1}/${images.length}`);
    };

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    // Step 5g: Add image counter
    const counter = document.createElement('div');
    counter.className = 'carousel-counter';
    counter.textContent = `1 / ${images.length}`;
    container.appendChild(counter);
  }

  // Step 5h: Add image count info
  const info = document.createElement('div');
  info.className = 'carousel-info';
  info.textContent = `${images.length} image${images.length !== 1 ? 's' : ''}`;
  container.appendChild(info);

  section.appendChild(container);
  return section;
}

// Step 6: Gallery Modal System
let currentModalImages = [];
let currentModalIndex = 0;

function openGalleryModal(categoryKey, startIndex, images) {
  console.log(`Opening modal for ${categoryKey}, starting at index ${startIndex}`);
  
  currentModalImages = images;
  currentModalIndex = startIndex;
  
  const modal = document.getElementById('galleryImageModal');
  const modalImg = document.getElementById('galleryModalImg');
  
  if (!modal || !modalImg) {
    console.error('❌ Gallery modal elements not found in HTML');
    return;
  }
  
  // Step 6a: Set the modal image
  modalImg.src = images[startIndex].modal;
  modalImg.alt = `${categoryKey} - ${images[startIndex].filename}`;
  modalImg.dataset.currentIndex = startIndex.toString();
  
  // Step 6b: Show the modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  console.log(`Modal opened with image: ${images[startIndex].filename}`);
}

// Step 7: Initialize the gallery modal
function initGalleryModal() {
  console.log('Initializing gallery modal...');
  
  const modal = document.getElementById('galleryImageModal');
  const closeBtn = document.getElementById('closeGalleryModal');
  const prevBtn = document.getElementById('galleryModalLeft');
  const nextBtn = document.getElementById('galleryModalRight');
  const modalImg = document.getElementById('galleryModalImg');
  
  if (!modal) {
    console.warn('❌ Gallery modal not found in HTML');
    return;
  }

  // Step 7a: Close modal function
  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    console.log('Modal closed');
  };

  // Step 7b: Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Step 7c: Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Step 7d: Navigation buttons
  if (prevBtn && modalImg) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentModalImages.length === 0) return;
      
      currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
      modalImg.src = currentModalImages[currentModalIndex].modal;
      modalImg.alt = `${currentModalImages[currentModalIndex].category} - ${currentModalImages[currentModalIndex].filename}`;
      modalImg.dataset.currentIndex = currentModalIndex.toString();
      
      console.log(`Modal: Show image ${currentModalIndex + 1}/${currentModalImages.length}`);
    });
  }

  if (nextBtn && modalImg) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentModalImages.length === 0) return;
      
      currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
      modalImg.src = currentModalImages[currentModalIndex].modal;
      modalImg.alt = `${currentModalImages[currentModalIndex].category} - ${currentModalImages[currentModalIndex].filename}`;
      modalImg.dataset.currentIndex = currentModalIndex.toString();
      
      console.log(`Modal: Show image ${currentModalIndex + 1}/${currentModalImages.length}`);
    });
  }

  // Step 7e: Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft' && prevBtn) {
        prevBtn.click();
      } else if (e.key === 'ArrowRight' && nextBtn) {
        nextBtn.click();
      }
    }
  });
  
  console.log('✅ Gallery modal initialized');
}

// Step 8: Main function to initialize galleries
export async function initGalleries() {
  console.log('=== INITIALIZING GALLERIES ===');
  
  const container = document.getElementById('galleries');
  if (!container) {
    console.error('❌ Gallery container not found (#galleries)');
    return;
  }

  container.innerHTML = "<div class='loading-galleries'>🔄 Loading galleries...</div>";
  
  // Step 8a: Initialize modal system
  initGalleryModal();

  try {
    // Step 8b: Load all categories
    const categoryPromises = galleryCategories.map(async cat => {
      console.log(`Loading category: ${cat.label}`);
      const images = await loadManifestImages(cat.key);
      return { cat, images };
    });

    const results = await Promise.all(categoryPromises);
    console.log('All categories loaded');
    
    // Step 8c: Clear loading message
    container.innerHTML = "";
    
    // Step 8d: Create galleries for each category
    let hasAnyImages = false;
    
    for (const { cat, images } of results) {
      if (images.length > 0) {
        hasAnyImages = true;
        const carousel = createCarousel(cat, images);
        if (carousel) {
          container.appendChild(carousel);
          console.log(`✅ Added gallery for ${cat.label}`);
        }
      } else {
        console.log(`⚠️ No images for ${cat.label}`);
        
        // Show empty state
        const emptySection = document.createElement('div');
        emptySection.className = 'gallery-section empty';
        emptySection.innerHTML = `
          <div class="carousel-title">${cat.label}</div>
          <div class="empty-gallery">No images yet</div>
        `;
        container.appendChild(emptySection);
      }
    }
    
    // Step 8e: Handle no images case
    if (!hasAnyImages) {
      container.innerHTML = `
        <div class="no-galleries-message">
          <h3>📷 No Galleries Available</h3>
          <p>Check that:</p>
          <ul>
            <li>manifest.txt files exist in each assets/ folder</li>
            <li>manifest files contain image filenames (like "image.jpg")</li>
            <li>Check browser console for errors</li>
          </ul>
        </div>
      `;
      console.warn('⚠️ No galleries loaded - check manifest files');
    }
    
  } catch (error) {
    console.error('🚨 Critical error loading galleries:', error);
    container.innerHTML = `
      <div class="error-loading">
        <h3>❌ Error Loading Galleries</h3>
        <p>${error.message}</p>
        <p>Check browser console for details.</p>
      </div>
    `;
  }
  
  console.log('=== GALLERIES INITIALIZED ===');
}

// Step 9: Initialize recent projects
export async function initRecentProjects() {
  console.log('=== INITIALIZING RECENT PROJECTS ===');
  
  const grid = document.getElementById('recentProjectsGrid');
  if (!grid) {
    console.error('❌ Recent projects grid not found (#recentProjectsGrid)');
    return;
  }

  grid.innerHTML = "<div class='loading-projects'>🔄 Loading projects...</div>";

  try {
    // Step 9a: Load first image from each category
    const categoryPromises = galleryCategories.map(async cat => {
      const images = await loadManifestImages(cat.key, 'thumbnail');
      return { cat, images: images.slice(0, 1) }; // Just first image
    });

    const results = await Promise.all(categoryPromises);
    console.log('Recent projects data loaded');
    
    // Step 9b: Clear loading
    grid.innerHTML = "";
    
    // Step 9c: Create project cards
    let hasProjects = false;
    
    for (const { cat, images } of results) {
      if (images.length > 0) {
        hasProjects = true;
        
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.category = cat.key;
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
          <div class="project-carousel-title">${cat.label}</div>
          <img src="${images[0].thumbnail}" 
               loading="lazy" 
               alt="${cat.label}"
               class="project-thumbnail">
          <div class="project-image-count">${images.length} image${images.length !== 1 ? 's' : ''}</div>
        `;

        // Step 9d: Make card clickable
        card.addEventListener('click', async () => {
          console.log(`Clicked ${cat.label} project card`);
          const allImages = await loadManifestImages(cat.key);
          if (allImages.length > 0) {
            openGalleryModal(cat.key, 0, allImages);
          }
        });

        grid.appendChild(card);
        console.log(`✅ Added project card for ${cat.label}`);
      }
    }
    
    // Step 9e: Handle no projects case
    if (!hasProjects) {
      grid.innerHTML = `
        <div class="no-projects">
          <h3>📋 No Projects Yet</h3>
          <p>Add images to your manifest files to see projects here.</p>
        </div>
      `;
      console.warn('⚠️ No projects loaded');
    }
    
  } catch (error) {
    console.error('🚨 Error loading recent projects:', error);
    grid.innerHTML = `
      <div class="error-loading">
        <h3>❌ Error Loading Projects</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
  
  console.log('=== RECENT PROJECTS INITIALIZED ===');
}

// Step 10: Debug function (optional - use in browser console)
export async function debugManifests() {
  console.log('🔍 === DEBUGGING MANIFEST FILES ===');
  console.log('Checking each assets/ folder for manifest.txt...');
  
  for (const cat of galleryCategories) {
    try {
      const res = await fetch(`assets/${cat.key}/manifest.txt`);
      
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n').filter(l => l.trim());
        
        console.log(`✅ ${cat.key}: Found, ${lines.length} files listed`);
        
        if (lines.length > 0) {
          // Check first few files
          const firstFiles = lines.slice(0, 3);
          console.log(`   First files: ${firstFiles.join(', ')}`);
          
          // Test Cloudinary URL for first file
          if (firstFiles[0]) {
            const testUrl = buildCloudinaryUrl(cat.key, firstFiles[0], 'thumbnail');
            console.log(`   Test URL: ${testUrl}`);
            
            // Check if URL loads
            const img = new Image();
            img.onload = () => console.log(`   ✓ Test image loads OK`);
            img.onerror = () => console.log(`   ✗ Test image failed to load`);
            img.src = testUrl;
          }
        }
      } else {
        console.log(`❌ ${cat.key}: Manifest not found (404)`);
      }
    } catch (error) {
      console.log(`❌ ${cat.key}: Error - ${error.message}`);
    }
  }
  
  console.log('=== DEBUG COMPLETE ===');
}

// Export for use in main.js
export { openGalleryModal, loadManifestImages, debugManifests };
