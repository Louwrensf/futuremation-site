// js/services.js — SIMPLE CARD BUTTON VERSION (NO TABS)

export const SERVICES = [
  { key: "roofing", title: "Roofing", icon: "fa-house-damage", desc: "New roofs, repairs, waterproofing, inspections." },
  { key: "building", title: "Building", icon: "fa-building", desc: "New homes, extensions, slabs, foundations." },
  { key: "renovations", title: "Renovations", icon: "fa-tools", desc: "Bathrooms, kitchens, full interior remodeling." },
  { key: "cupboards_kitchens", title: "Cupboards & Kitchens", icon: "fa-kitchen-set", desc: "Cabinetry, BICs, kitchen renovations." },
  { key: "painting", title: "Painting", icon: "fa-paint-roller", desc: "Interior & exterior painting & coatings." },
  { key: "awnings", title: "Awnings", icon: "fa-umbrella-beach", desc: "Patio covers, carports, shade structures." },
  { key: "waterproofing", title: "Waterproofing", icon: "fa-tint", desc: "Torch-on, balcony sealing, damp-proofing." },
  { key: "ceilings", title: "Ceilings & Drywall", icon: "fa-border-all", desc: "Ceilings, drywall partitions, PVC ceilings." },
  { key: "tiling", title: "Tiling & Flooring", icon: "fa-th", desc: "Floor & wall tiles, vinyl, laminate." },
  { key: "paving", title: "Paving & Retaining Walls", icon: "fa-road", desc: "Driveways, pathways, retaining walls." },
  { key: "plumbing", title: "Plumbing", icon: "fa-faucet", desc: "Leaks, geysers, drainage, installations." },
  { key: "electrical", title: "Electrical", icon: "fa-bolt", desc: "Lighting, DB boards, rewiring." },
  { key: "logcabins", title: "Log Cabins", icon: "fa-campground", desc: "Cabins, cottages, timber structures." },
  { key: "newbuilding", title: "New Building", icon: "fa-house", desc: "Flats, cottages, full project builds." },
  { key: "gutters", title: "Gutters & Downpipes", icon: "fa-water", desc: "Seamless gutters, downpipes, stormwater." }
];

// Expose globally so quote-tool.js can read it
window.SERVICES = SERVICES;

export function initServices() {
  const container = document.getElementById("servicesContainer");
  if (!container) return;

  container.innerHTML = "";

  SERVICES.forEach((svc) => {
    const card = document.createElement("div");
    card.className = "service-button open-quote-modal";
    card.dataset.quote = svc.title; // send title to popup

    card.innerHTML = `
      <div class="service-button-icon">
        <i class="fas ${svc.icon}"></i>
      </div>
      <div class="service-button-info">
        <h3>${svc.title}</h3>
        <p>${svc.desc}</p>
      </div>
    `;

    container.appendChild(card);
  });
}
