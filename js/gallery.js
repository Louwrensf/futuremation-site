// gallery.js — Loads images from manifest.txt and builds Cloudinary URLs

const CLOUDINARY_CONFIG = {
  cloudName: "dpzgcco2c",
  baseFolder: "futuremation",
  transformations: {
    gallery: "c_fill,w_900,h_500,q_80,f_auto",
    thumbnail: "c_thumb,w_450,h_300,q_auto",
    modal: "c_limit,w_1400,q_auto",
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

  const lower = filename.toLowerCase();
  if (
    lower.includes("manifest.txt") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".avi")
  ) {
    return null;
  }

  const transform = transformations[size] ? `${transformations[size]}/` : "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}${baseFolder}/${folder}/${encodeURIComponent(filename)}`;
}

async function loadManifestImages(folder, size = "gallery") {
  try {
    const res = await fetch(`assets/${folder}/manifest.txt?cache=${Date.now()}`);

    if (!res.ok) {
      console.warn(`Missing manifest for: ${folder}`);
      return [];
    }

    const text = await res.text();
    const images = text
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(filename => ({
        filename,
        original: buildCloudinaryUrl(folder, filename, "original"),
        gallery: buildCloudinaryUrl(folder, filename, "gallery"),
        thumbnail: buildCloudinaryUrl(folder, filename, "thumbnail"),
        modal: buildCloudinaryUrl(folder, filename, "modal"),
        category: folder
      }))
      .filter(img => img.original && img.gallery);

    return images;
  } catch (e) {
    console.error(`Error loading manifest for ${folder}:`, e);
    return [];
  }
}

/* ============================================================
   ⭐ CROSSFADE CAROUSEL (NEW)
============================================================ */
function createCarousel(category, images) {
  if (!images.length) return null;

  const section = document.createElement("div");
  section.className = "gallery-section compact";
  section.dataset.category = category.key;

  const title = document.createElement("div");
  title.className = "carousel-title";
  title.textContent = category.label;
  section.appendChild(title);

  const container = document.createElement("div");
  container.className = "carousel-container";
  container.dataset.currentIndex = "0";
  container.dataset.totalImages = images.length.toString();

  // Two stacked images
  const imgA = document.createElement("img");
  const imgB = document.createElement("img");

  imgA.className = "carousel-img visible";
  imgB.className = "carousel-img";

  imgA.src = images[0].gallery;
  imgA.dataset.modalUrl = images[0].modal;

  imgB.src = "";
  imgB.style.opacity = "0";

  // Modal open
  imgA.addEventListener("click", () => openGalleryModal(category.key, 0, images));
  imgB.addEventListener("click", () => openGalleryModal(category.key, 0, images));

  container.appendChild(imgA);
  container.appendChild(imgB);

  let currentIndex = 0;
  let visibleImg = "A";

  // ⭐ CROSSFADE function
  function crossfadeTo(index) {
    const next = images[index];

    if (visibleImg === "A") {
      imgB.src = next.gallery;
      imgB.dataset.modalUrl = next.modal;

      imgB.classList.add("visible");
      imgA.classList.remove("visible");

      visibleImg = "B";
    } else {
      imgA.src = next.gallery;
      imgA.dataset.modalUrl = next.modal;

      imgA.classList.add("visible");
      imgB.classList.remove("visible");

      visibleImg = "A";
    }

    container.dataset.currentIndex = index.toString();

    const counter = container.querySelector(".carousel-counter");
    if (counter) counter.textContent = `${index + 1} / ${images.length}`;
  }

  /* ⭐ AUTO-PLAY */
  let autoplay;
  function startAutoplay() {
    autoplay = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      crossfadeTo(currentIndex);
    }, 4000);
  }
  function stopAutoplay() {
    clearInterval(autoplay);
  }

  if (images.length > 1) startAutoplay();

  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);

  /* ⭐ Navigation Buttons */
  if (images.length > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.className = "carousel-btn left";
    prevBtn.innerHTML = "&#8592;";
    prevBtn.onclick = e => {
      e.stopPropagation();
      stopAutoplay();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      crossfadeTo(currentIndex);
      startAutoplay();
    };

    const nextBtn = document.createElement("button");
    nextBtn.className = "carousel-btn right";
    nextBtn.innerHTML = "&#8594;";
    nextBtn.onclick = e => {
      e.stopPropagation();
      stopAutoplay();
      currentIndex = (currentIndex + 1) % images.length;
      crossfadeTo(currentIndex);
      startAutoplay();
    };

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    const counter = document.createElement("div");
    counter.className = "carousel-counter";
    counter.textContent = `1 / ${images.length}`;
    container.appendChild(counter);
  }

  // Info badge
  const info = document.createElement("div");
  info.className = "carousel-info";
  info.textContent = `${images.length} image${images.length !== 1 ? "s" : ""}`;
  container.appendChild(info);

  section.appendChild(container);
  return section;
}

/* ============================================================
   MODAL SYSTEM (unchanged)
============================================================ */
let currentModalImages = [];
let currentModalIndex = 0;

function openGalleryModal(categoryKey, startIndex, images) {
  currentModalImages = images;
  currentModalIndex = startIndex;

  const modal = document.getElementById("galleryImageModal");
  const modalImg = document.getElementById("galleryModalImg");

  if (!modal) return;

  modalImg.src = images[startIndex].modal;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function initGalleryModal() {
  const modal = document.getElementById("galleryImageModal");
  const closeBtn = document.getElementById("closeGalleryModal");
  const prevBtn = document.getElementById("galleryModalLeft");
  const nextBtn = document.getElementById("galleryModalRight");
  const modalImg = document.getElementById("galleryModalImg");

  if (!modal) return;

  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  };
  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  prevBtn?.addEventListener("click", () => {
    if (!currentModalImages.length) return;
    currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex].modal;
  });

  nextBtn?.addEventListener("click", () => {
    if (!currentModalImages.length) return;
    currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex].modal;
  });
}

/* ============================================================
   GALLERY INIT
============================================================ */
export async function initGalleries() {
  const container = document.getElementById("galleries");
  if (!container) return;

  container.innerHTML = "<div>Loading galleries...</div>";
  initGalleryModal();

  const results = await Promise.all(
    galleryCategories.map(async cat => ({
      cat,
      images: await loadManifestImages(cat.key)
    }))
  );

  container.innerHTML = "";

  results.forEach(({ cat, images }) => {
    const carousel = createCarousel(cat, images);
    container.appendChild(carousel);
  });
}

/* ============================================================
   RECENT PROJECTS (unchanged)
============================================================ */
export async function initRecentProjects() {
  const grid = document.getElementById("recentProjectsGrid");
  if (!grid) return;

  grid.innerHTML = "<div>Loading projects...</div>";

  const results = await Promise.all(
    galleryCategories.map(async cat => ({
      cat,
      images: (await loadManifestImages(cat.key)).slice(0, 1)
    }))
  );

  grid.innerHTML = "";

  results.forEach(({ cat, images }) => {
    if (!images.length) return;

    const card = document.createElement("div");
    card.className = "project-card compact";
    card.dataset.category = cat.key;

    card.innerHTML = `
      <div class="project-carousel-title">${cat.label}</div>
      <img class="project-thumbnail" src="${images[0].thumbnail}" loading="lazy">
      <div class="project-image-count">${images.length} image${images.length !== 1 ? "s" : ""}</div>
    `;

    card.onclick = async () => {
      const allImages = await loadManifestImages(cat.key);
      if (allImages.length) openGalleryModal(cat.key, 0, allImages);
    };

    grid.appendChild(card);
  });
}

export { openGalleryModal, loadManifestImages };
