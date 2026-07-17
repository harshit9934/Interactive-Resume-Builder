(function () {
  "use strict";

  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */
  const state = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    skills: [],
    education: [], // { id, school, degree, years }
    experience: [], // { id, company, role, duration, description }
  };

  let rowId = 0;
  const nextId = () => "row_" + ++rowId;

  /* ---------------------------------------------------------
     ELEMENT REFERENCES
     --------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);

  const fullNameInput = $("#fullName");
  const emailInput = $("#email");
  const phoneInput = $("#phone");
  const locationInput = $("#location");
  const summaryInput = $("#summary");
  const skillInput = $("#skillInput");
  const tagList = $("#tagList");

  const educationList = $("#educationList");
  const experienceList = $("#experienceList");
  const educationTemplate = $("#educationRowTemplate");
  const experienceTemplate = $("#experienceRowTemplate");

  const addEducationBtn = $("#addEducation");
  const addExperienceBtn = $("#addExperience");
  const clearFormBtn = $("#clearForm");
  const downloadPdfBtn = $("#downloadPdf");

  // Preview elements
  const pName = $("#pName");
  const pContact = $("#pContact");
  const pSummary = $("#pSummary");
  const pSummarySection = $("#pSummarySection");
  const pSkills = $("#pSkills");
  const pSkillsSection = $("#pSkillsSection");
  const pExperience = $("#pExperience");
  const pExperienceSection = $("#pExperienceSection");
  const pEducation = $("#pEducation");
  const pEducationSection = $("#pEducationSection");
  const pPlaceholder = $("#pPlaceholder");

  const sealProgress = $("#sealProgress");
  const sealPercent = $("#sealPercent");
  const sealLabel = $("#sealLabel");
  const seal = $("#seal");

  const SEAL_CIRCUMFERENCE = 2 * Math.PI * 52; // matches r=52 in svg

  /* ---------------------------------------------------------
     RENDER: PREVIEW
     --------------------------------------------------------- */
  function renderPreview() {
    const hasName = state.fullName.trim().length > 0;
    pName.textContent = hasName ? state.fullName.trim() : "Your Name";

    const contactParts = [state.email, state.phone, state.location].filter(
      Boolean,
    );
    pContact.textContent = contactParts.length
      ? contactParts.join(" · ")
      : "email · phone · location";

    // Summary
    const hasSummary = state.summary.trim().length > 0;
    pSummarySection.hidden = !hasSummary;
    pSummary.textContent = state.summary.trim();

    // Skills
    const hasSkills = state.skills.length > 0;
    pSkillsSection.hidden = !hasSkills;
    pSkills.innerHTML = "";
    state.skills.forEach((skill) => {
      const pill = document.createElement("span");
      pill.className = "resume__skill-pill";
      pill.textContent = skill;
      pSkills.appendChild(pill);
    });

    // Experience
    const filledExperience = state.experience.filter(
      (e) =>
        e.company.trim() ||
        e.role.trim() ||
        e.duration.trim() ||
        e.description.trim(),
    );
    pExperienceSection.hidden = filledExperience.length === 0;
    pExperience.innerHTML = "";
    filledExperience.forEach((exp) => {
      const entry = document.createElement("div");
      entry.className = "resume__entry";
      entry.innerHTML = `
        <div class="resume__entry-top">
          <span class="resume__entry-title">${escapeHtml(exp.role) || "Role"}${exp.company ? " — " + escapeHtml(exp.company) : ""}</span>
          <span class="resume__entry-meta">${escapeHtml(exp.duration)}</span>
        </div>
        ${exp.description ? `<p class="resume__entry-desc">${escapeHtml(exp.description)}</p>` : ""}
      `;
      pExperience.appendChild(entry);
    });

    // Education
    const filledEducation = state.education.filter(
      (e) => e.school.trim() || e.degree.trim() || e.years.trim(),
    );
    pEducationSection.hidden = filledEducation.length === 0;
    pEducation.innerHTML = "";
    filledEducation.forEach((edu) => {
      const entry = document.createElement("div");
      entry.className = "resume__entry";
      entry.innerHTML = `
        <div class="resume__entry-top">
          <span class="resume__entry-title">${escapeHtml(edu.school) || "School"}</span>
          <span class="resume__entry-meta">${escapeHtml(edu.years)}</span>
        </div>
        ${edu.degree ? `<p class="resume__entry-sub">${escapeHtml(edu.degree)}</p>` : ""}
      `;
      pEducation.appendChild(entry);
    });

    // Placeholder — show only if literally everything is empty
    const anythingFilled =
      hasName ||
      contactParts.length ||
      hasSummary ||
      hasSkills ||
      filledExperience.length ||
      filledEducation.length;
    pPlaceholder.hidden = anythingFilled;
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------
     PROGRESS SEAL
     --------------------------------------------------------- */
  function renderProgress() {
    // Weighted checklist of "meaningful completion" signals
    const checks = [
      state.fullName.trim().length > 0,
      state.email.trim().length > 0,
      state.phone.trim().length > 0,
      state.summary.trim().length > 0,
      state.skills.length > 0,
      state.education.some((e) => e.school.trim() || e.degree.trim()),
      state.experience.some((e) => e.company.trim() || e.role.trim()),
    ];
    const total = checks.length;
    const done = checks.filter(Boolean).length;
    const pct = Math.round((done / total) * 100);

    const offset = SEAL_CIRCUMFERENCE - (pct / 100) * SEAL_CIRCUMFERENCE;
    sealProgress.style.strokeDashoffset = offset;
    sealPercent.textContent = pct + "%";

    if (pct === 100) {
      sealLabel.textContent = "READY";
      seal.classList.add("seal--complete");
    } else if (pct === 0) {
      sealLabel.textContent = "DRAFT";
      seal.classList.remove("seal--complete");
    } else {
      sealLabel.textContent = "IN PROGRESS";
      seal.classList.remove("seal--complete");
    }
  }

  function update() {
    renderPreview();
    renderProgress();
  }

  /* ---------------------------------------------------------
     BASIC FIELD BINDINGS
     --------------------------------------------------------- */
  fullNameInput.addEventListener("input", (e) => {
    state.fullName = e.target.value;
    update();
  });
  emailInput.addEventListener("input", (e) => {
    state.email = e.target.value;
    update();
  });
  phoneInput.addEventListener("input", (e) => {
    state.phone = e.target.value;
    update();
  });
  locationInput.addEventListener("input", (e) => {
    state.location = e.target.value;
    update();
  });
  summaryInput.addEventListener("input", (e) => {
    state.summary = e.target.value;
    update();
  });

  /* ---------------------------------------------------------
     SKILLS (tag input)
     --------------------------------------------------------- */
  skillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = skillInput.value.trim().replace(/,$/, "");
      if (value && !state.skills.includes(value)) {
        state.skills.push(value);
        renderTags();
        update();
      }
      skillInput.value = "";
    }
  });

  function renderTags() {
    tagList.innerHTML = "";
    state.skills.forEach((skill, index) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.innerHTML = `<span>${escapeHtml(skill)}</span>`;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", `Remove ${skill}`);
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        state.skills.splice(index, 1);
        renderTags();
        update();
      });
      tag.appendChild(removeBtn);
      tagList.appendChild(tag);
    });
  }

  /* ---------------------------------------------------------
     DYNAMIC ROWS — EDUCATION
     --------------------------------------------------------- */
  function addEducationRow(prefill) {
    const id = nextId();
    const data = { id, school: "", degree: "", years: "", ...prefill };
    state.education.push(data);

    const node = educationTemplate.content.cloneNode(true);
    const rowEl = node.querySelector("[data-row]");
    rowEl.dataset.id = id;

    rowEl.querySelectorAll("[data-field]").forEach((input) => {
      const field = input.dataset.field;
      input.value = data[field];
      input.addEventListener("input", () => {
        const record = state.education.find((r) => r.id === id);
        record[field] = input.value;
        update();
      });
    });

    rowEl.querySelector("[data-remove]").addEventListener("click", () => {
      state.education = state.education.filter((r) => r.id !== id);
      rowEl.remove();
      update();
    });

    educationList.appendChild(node);
    update();
  }

  /* ---------------------------------------------------------
     DYNAMIC ROWS — EXPERIENCE
     --------------------------------------------------------- */
  function addExperienceRow(prefill) {
    const id = nextId();
    const data = {
      id,
      company: "",
      role: "",
      duration: "",
      description: "",
      ...prefill,
    };
    state.experience.push(data);

    const node = experienceTemplate.content.cloneNode(true);
    const rowEl = node.querySelector("[data-row]");
    rowEl.dataset.id = id;

    rowEl.querySelectorAll("[data-field]").forEach((input) => {
      const field = input.dataset.field;
      input.value = data[field];
      input.addEventListener("input", () => {
        const record = state.experience.find((r) => r.id === id);
        record[field] = input.value;
        update();
      });
    });

    rowEl.querySelector("[data-remove]").addEventListener("click", () => {
      state.experience = state.experience.filter((r) => r.id !== id);
      rowEl.remove();
      update();
    });

    experienceList.appendChild(node);
    update();
  }

  addEducationBtn.addEventListener("click", () => addEducationRow());
  addExperienceBtn.addEventListener("click", () => addExperienceRow());

  /* ---------------------------------------------------------
     CLEAR FORM
     --------------------------------------------------------- */
  clearFormBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Clear the entire form? This cannot be undone.",
    );
    if (!confirmed) return;

    state.fullName = "";
    state.email = "";
    state.phone = "";
    state.location = "";
    state.summary = "";
    state.skills = [];
    state.education = [];
    state.experience = [];

    fullNameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
    locationInput.value = "";
    summaryInput.value = "";
    skillInput.value = "";
    tagList.innerHTML = "";
    educationList.innerHTML = "";
    experienceList.innerHTML = "";

    update();
  });

  /* ---------------------------------------------------------
     DOWNLOAD AS PDF (browser print → Save as PDF)
     --------------------------------------------------------- */
  downloadPdfBtn.addEventListener("click", () => {
    window.print();
  });

  /* ---------------------------------------------------------
     INITIAL STATE — one empty row each, so the form isn't bare
     --------------------------------------------------------- */
  addEducationRow();
  addExperienceRow();
  update();
})();
