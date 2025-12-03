// js/quote-tool.js — Two-step confirm system
// Step 1: Validate + Upload → Step 2: Send WhatsApp

const UPLOAD_ENDPOINT = "https://fm-upload-server.onrender.com/api/upload";
const WHATSAPP_NUMBER = "27734236523";

let quoteModal, modalContainer, formEl, fileInput, thumbsRow, feedbackEl, submitBtn;

/* ------------------ OPEN MODAL ------------------ */
export function openQuoteModal(preselected = "") {
  quoteModal = document.getElementById("quoteModal");
  modalContainer = document.getElementById("quoteToolContainer");

  renderUI(preselected);
  showModal();
  attachHandlers(preselected);
}

/* ------------------ RENDER UI ------------------ */
function renderUI(service) {
  modalContainer.innerHTML = `
    <div class="modal-content request-modal">
      <div class="modal-header">
        <h2>Request a Service</h2>
        <button class="close-modal">&times;</button>
      </div>

      <form id="serviceRequestForm" class="service-request-form">

        <div class="form-grid">

          <label>
            <span class="field-label">Full name</span>
            <input type="text" name="clientName" required>
          </label>

          <label>
            <span class="field-label">Address / Suburb</span>
            <input type="text" name="clientAddress" required>
          </label>

          <label>
            <span class="field-label">Service</span>
            <select id="serviceSelected" name="serviceSelected" required></select>
          </label>

          <label class="file-label">
            <span class="field-label">Upload photos (up to 10)</span>
            <input type="file" id="requestFiles" accept="image/*" multiple>
          </label>

          <label style="grid-column:1/-1">
            <span class="field-label">Describe what you need</span>
            <textarea name="clientMessage" required rows="4"></textarea>
          </label>

        </div>

        <div id="thumbsRow" class="thumb-row"></div>

        <div class="request-actions">
          <button type="submit" class="btn btn-accent" id="requestSubmit">Submit Request</button>
          <button type="button" id="requestCancel" class="btn">Cancel</button>
        </div>

        <div id="requestFeedback" class="request-feedback"></div>

      </form>
    </div>
  `;

  populateServiceOptions(service);
}

/* ----------- SERVICE OPTIONS ---------------- */
function populateServiceOptions(preselected) {
  const sel = modalContainer.querySelector("#serviceSelected");

  sel.innerHTML = `<option value="">Select a Service</option>`;

  if (window.SERVICES) {
    window.SERVICES.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.title;
      opt.textContent = s.title;
      sel.appendChild(opt);
    });
  }

  if (preselected) {
    const match = [...sel.options].find(o =>
      o.value.toLowerCase().includes(preselected.toLowerCase())
    );
    if (match) match.selected = true;
  }
}

/* ------------------ SHOW MODAL ------------------ */
function showModal() {
  quoteModal.style.display = "flex";
  document.body.style.overflow = "hidden";

  formEl = modalContainer.querySelector("#serviceRequestForm");
  fileInput = modalContainer.querySelector("#requestFiles");
  thumbsRow = modalContainer.querySelector("#thumbsRow");
  feedbackEl = modalContainer.querySelector("#requestFeedback");
  submitBtn = modalContainer.querySelector("#requestSubmit");
}

/* ------------------ HIDE MODAL ------------------ */
function hideModal() {
  quoteModal.style.display = "none";
  document.body.style.overflow = "auto";
}

/* ------------------ HANDLERS ------------------ */
function attachHandlers() {
  modalContainer.querySelector(".close-modal").onclick = hideModal;
  modalContainer.querySelector("#requestCancel").onclick = hideModal;

  fileInput.onchange = e => {
    const files = [...e.target.files].slice(0, 10);
    renderThumbs(files);
  };

  /* ------------ FULL TWO-STEP SUBMIT ------------ */

  let uploadedMessage = "";
  let step = 1; // 1 = upload, 2 = send WhatsApp

  formEl.onsubmit = async ev => {
    ev.preventDefault();

    const name = formEl.elements.clientName.value.trim();
    const addr = formEl.elements.clientAddress.value.trim();
    const serv = formEl.elements.serviceSelected.value.trim();
    const msg = formEl.elements.clientMessage.value.trim();
    const files = [...fileInput.files].slice(0, 10);

    if (!name || !serv || !msg) {
      feedbackEl.textContent = "Please fill all required fields.";
      return;
    }

    /* STEP 1 — Upload */
    if (step === 1) {
      submitBtn.textContent = "Uploading...";
      submitBtn.disabled = true;

      let urls = [];

      if (files.length) {
        try {
          const fd = new FormData();
          files.forEach(f => fd.append("files", f));
          const r = await fetch(UPLOAD_ENDPOINT, { method: "POST", body: fd });
          const j = await r.json();
          if (j.success) urls = j.imageUrls;
        } catch (e) { console.error(e); }
      }

      uploadedMessage =
        `New Service Request\n` +
        `Name: ${name}\n` +
        `Address: ${addr}\n` +
        `Service: ${serv}\n` +
        `Description: ${msg}`;

      if (urls.length) uploadedMessage += `\n\nImages:\n${urls.join("\n")}`;

      step = 2;
      submitBtn.textContent = "Send via WhatsApp";
      submitBtn.disabled = false;
      feedbackEl.textContent = "Ready to send!";
      return;
    }

    /* STEP 2 — Send */
    if (step === 2) {
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(uploadedMessage)}`;
      window.open(waUrl, "_blank");

      feedbackEl.textContent = "Opening WhatsApp...";
      setTimeout(hideModal, 1300);

      step = 1;
      return;
    }
  };
}

/* ---------------------- HELPERS ---------------------- */
function renderThumbs(files) {
  thumbsRow.innerHTML = "";
  files.forEach(file => {
    const img = document.createElement("img");
    img.className = "thumb";
    const reader = new FileReader();
    reader.onload = e => (img.src = e.target.result);
    reader.readAsDataURL(file);
    thumbsRow.appendChild(img);
  });
}
