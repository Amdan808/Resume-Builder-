(function() {
  'use strict';
  let activeEditor = null;

  const PROFICIENCY_LEVELS = [
    { value: 1, label: 'Beginner', description: 'Basic words and phrases' },
    { value: 2, label: 'Elementary', description: 'Simple conversations' },
    { value: 3, label: 'Intermediate', description: 'General topics' },
    { value: 4, label: 'Fluent', description: 'Professional proficiency' },
    { value: 5, label: 'Native', description: 'Native or bilingual' }
  ];

  function createMeterBarHTML(level) {
    const segments = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= level ? 'meter-segment-filled' : '';
      segments.push(`<span class="meter-segment ${filled}" data-segment="${i}"></span>`);
    }
    return `<div class="meter-bar" data-editable-proficiency="true" title="Click to change proficiency">${segments.join('')}</div>`;
  }

  function updateMeterBar(meterBar, level) {
    if (!meterBar) return;
    const segments = meterBar.querySelectorAll('.meter-segment');
    segments.forEach((seg, index) => {
      if (index < level) {
        seg.classList.add('meter-segment-filled');
      } else {
        seg.classList.remove('meter-segment-filled');
      }
    });
  }

  const SOCIAL_PLATFORMS = {
    github: {
      pattern: /github\.com\/([^\/\?]+)/i,
      iconPath: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z',
      name: 'GitHub'
    },
    linkedin: {
      pattern: /linkedin\.com\/in\/([^\/\?]+)/i,
      iconPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
      name: 'LinkedIn'
    },
    twitter: {
      pattern: /(?:twitter|x)\.com\/([^\/\?]+)/i,
      iconPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      name: 'X'
    },
    portfolio: {
      pattern: /^https?:\/\/([^\/]+)/i,
      iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
      name: 'Website'
    }
  };

  function renderResume(data) {
    const header = document.querySelector('header.header');
    const main = document.querySelector('#main-content');
    if (!header || !main) return;

    header.innerHTML = '';
    main.innerHTML = '';

    renderHeader(header, data.header);
    renderSummary(main, data.summary);
    renderSkills(main, data.skills);
    renderExperience(main, data.experience);
    renderEducation(main, data.education);
    renderTraining(main, data.training);
    renderLanguages(main, data.languages);
  }

  function renderHeader(container, headerData) {
    const h1 = document.createElement('h1');
    h1.id = 'name';
    h1.setAttribute('data-editable', 'text');
    h1.textContent = headerData.name;
    container.appendChild(h1);

    const address = document.createElement('address');
    address.className = 'address';

    headerData.contacts.forEach(contact => {
      const span = document.createElement('span');
      span.className = 'contact-item';

      if (contact.type === 'email') {
        const a = document.createElement('a');
        a.href = `mailto:${contact.value}`;
        a.setAttribute('data-editable', 'link');
        a.textContent = contact.value;
        span.appendChild(a);
      } else if (contact.type === 'phone') {
        const a = document.createElement('a');
        a.href = `tel:${contact.value.replace(/\s/g, '-')}`;
        a.setAttribute('data-editable', 'link');
        a.textContent = contact.value;
        span.appendChild(a);
      } else {

        span.setAttribute('data-editable', 'text');
        span.textContent = contact.value;
      }

      address.appendChild(span);
    });

    headerData.socials.forEach(social => {
      const platformConfig = SOCIAL_PLATFORMS[social.platform] || SOCIAL_PLATFORMS.portfolio;

      const span = document.createElement('span');
      span.className = 'contact-item social-item';
      span.innerHTML = `
        <a href="${escapeHtml(social.url)}"
           target="_blank"
           rel="noopener noreferrer"
           class="social-link"
           title="${escapeHtml(platformConfig.name)}"
           data-platform="${escapeHtml(platformConfig.name)}">
          ${platformConfig.icon}
          <span class="social-username">${escapeHtml(social.username)}</span>
        </a>
      `;
      address.appendChild(span);
    });

    container.appendChild(address);
  }

  function renderSummary(container, summaryText) {
    const section = document.createElement('section');

    const h2 = document.createElement('h2');
    h2.className = 'title';
    h2.textContent = 'Summary';
    section.appendChild(h2);

    const p = document.createElement('p');
    p.className = 'summary-paragraph';
    p.setAttribute('data-editable', 'multiline');
    p.textContent = summaryText;
    section.appendChild(p);

    container.appendChild(section);
  }

  function renderSkills(container, skillsData) {
    const section = document.createElement('section');

    const h2 = document.createElement('h2');
    h2.className = 'title';
    h2.textContent = 'Skills';
    section.appendChild(h2);

    const coreTech = document.createElement('div');
    coreTech.className = 'core-tech';

    skillsData.forEach((skillGroup, index) => {
      const skillSection = document.createElement('section');
      skillSection.className = index === 0 ? 'skills core' : 'skills tech';

      const h3 = document.createElement('h3');
      h3.setAttribute('data-editable', 'text');
      h3.textContent = skillGroup.category;
      skillSection.appendChild(h3);

      const ul = document.createElement('ul');
      ul.setAttribute('data-list', 'skills');

      skillGroup.items.forEach(item => {
        const li = document.createElement('li');
        li.setAttribute('data-editable', 'text');
        li.textContent = item;
        ul.appendChild(li);
      });

      skillSection.appendChild(ul);
      coreTech.appendChild(skillSection);
    });

    section.appendChild(coreTech);
    container.appendChild(section);
  }

  function renderExperience(container, experienceData) {
    const section = document.createElement('section');
    section.className = 'experience-container';
    section.setAttribute('data-list', 'experience');

    const h2 = document.createElement('h2');
    h2.className = 'title';
    h2.textContent = 'Experience';
    section.appendChild(h2);

    experienceData.forEach(job => {
      const article = document.createElement('article');
      article.innerHTML = `
        <div class="exp-detail">
          <div class="company-date italic">
            <p data-editable="text">${escapeHtml(job.company)}</p>
            <p class="meta">
              <time data-editable="text">${escapeHtml(job.startDate)}</time> -
              <time data-editable="text">${escapeHtml(job.endDate)}</time>
            </p>
          </div>
          <h3 data-editable="text">${escapeHtml(job.title)}</h3>
        </div>
        <ul class="experience" data-list="bullets">
          ${job.bullets.map(b => `<li data-editable="text">${escapeHtml(b)}</li>`).join('')}
        </ul>
      `;
      section.appendChild(article);
    });

    container.appendChild(section);
  }

  function renderEducation(container, educationData) {
    const section = document.createElement('section');
    section.setAttribute('data-list', 'education');

    const h2 = document.createElement('h2');
    h2.className = 'title';
    h2.textContent = 'Education';
    section.appendChild(h2);

    educationData.forEach(edu => {
      const article = document.createElement('article');
      article.className = 'education';
      const institutionP = edu.institution
        ? `<p data-editable="text" data-field="institution">${escapeHtml(edu.institution)}</p>`
        : '';
      article.innerHTML = `
        <h3 data-editable="text">${escapeHtml(edu.degree)}</h3>
        <div class="meta-wrapper italic">
          <p>
            <time data-editable="text">${escapeHtml(edu.startYear)}</time> -
            <time data-editable="text">${escapeHtml(edu.endYear)}</time>
          </p>
          ${institutionP}
          <p data-editable="text" data-field="location">${escapeHtml(edu.location)}</p>
        </div>
      `;
      section.appendChild(article);
    });

    container.appendChild(section);
  }

  function renderTraining(container, trainingData) {
    const section = document.createElement('section');
    section.className = 'coursework-container';

    const h2 = document.createElement('h2');
    h2.className = 'title';
    h2.textContent = 'Training';
    section.appendChild(h2);

    const article = document.createElement('article');
    const ul = document.createElement('ul');
    ul.setAttribute('data-list', 'training');

    trainingData.forEach(item => {
      const li = document.createElement('li');
      li.setAttribute('data-editable', 'text');
      li.textContent = item;
      ul.appendChild(li);
    });

    article.appendChild(ul);
    section.appendChild(article);
    container.appendChild(section);
  }

  function renderLanguages(container, languagesData) {
    const section = document.createElement('section');

    const h2 = document.createElement('h2');
    h2.className = 'title';
    h2.textContent = 'Languages';
    section.appendChild(h2);

    const ul = document.createElement('ul');
    ul.className = 'lang-layout';
    ul.setAttribute('data-list', 'languages');

    languagesData.forEach(lang => {
      const level = lang.level || 3;
      const proficiency = PROFICIENCY_LEVELS.find(p => p.value === level) || PROFICIENCY_LEVELS[2];
      const id = 'lang-' + String(lang.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const li = document.createElement('li');
      li.innerHTML = `
        <label for="${id}" data-editable="text">${escapeHtml(lang.name)}</label>
        <meter id="${id}" min="0" max="5" value="${level}" data-editable-proficiency="true"></meter>
        <span class="sr-only">${escapeHtml(lang.name)} — ${level} of 5</span>
        <p class="lang-description" data-editable-proficiency="true">${escapeHtml(proficiency.label)}</p>
      `;
      ul.appendChild(li);
    });

    section.appendChild(ul);
    container.appendChild(section);
  }

  const STORAGE_KEY = 'resume-builder:snapshot:v4';
  const STORAGE_VERSION = 4;
  let saveTimer = null;

  // Reverse lookup: platform display name (stored on the DOM) → config key
  const PLATFORM_NAME_TO_KEY = Object.fromEntries(
    Object.entries(SOCIAL_PLATFORMS).map(([key, cfg]) => [cfg.name, key])
  );

  /**
   * Read an element's text, ignoring injected UI controls (remove buttons).
   */
  function readText(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.list-remove-btn').forEach(btn => btn.remove());
    return clone.textContent.trim();
  }

  /**
   * Serialize the live DOM back into the resume JSON model.
   * Inverse of renderResume(); JSON is the source of truth and storage format.
   */
  function serializeResume() {
    const header = document.querySelector('header.header');
    const main = document.querySelector('#main-content');
    if (!header || !main) return null;

    // Header
    const name = readText(header.querySelector('#name'));

    const contacts = [];
    header.querySelectorAll('.address > .contact-item:not(.social-item)').forEach(item => {
      const email = item.querySelector('a[href^="mailto:"]');
      const phone = item.querySelector('a[href^="tel:"]');
      if (email) contacts.push({ type: 'email', value: readText(email) });
      else if (phone) contacts.push({ type: 'phone', value: readText(phone) });
      else contacts.push({ type: 'location', value: readText(item) });
    });

    const socials = [];
    header.querySelectorAll('.address .social-item').forEach(item => {
      const link = item.querySelector('.social-link');
      if (!link) return;
      const platformName = link.dataset.platform || 'Website';
      socials.push({
        platform: PLATFORM_NAME_TO_KEY[platformName] || 'portfolio',
        url: link.getAttribute('href') || '',
        username: readText(item.querySelector('.social-username'))
      });
    });

    // Summary
    const summary = readText(main.querySelector('.summary-paragraph'));

    // Skills
    const skills = [];
    main.querySelectorAll('.core-tech > section.skills').forEach(group => {
      skills.push({
        category: readText(group.querySelector('h3')),
        items: Array.from(group.querySelectorAll('ul[data-list="skills"] > li[data-editable]'))
          .map(readText)
      });
    });

    // Experience
    const experience = [];
    main.querySelectorAll('[data-list="experience"] > article').forEach(article => {
      const times = article.querySelectorAll('.meta time');
      experience.push({
        company: readText(article.querySelector('.company-date > p[data-editable]')),
        title: readText(article.querySelector('.exp-detail > h3')),
        startDate: readText(times[0]),
        endDate: readText(times[1]),
        bullets: Array.from(article.querySelectorAll('ul[data-list="bullets"] > li[data-editable]'))
          .map(readText)
      });
    });

    // Education
    const education = [];
    main.querySelectorAll('[data-list="education"] > article').forEach(article => {
      const times = article.querySelectorAll('.meta-wrapper time');
      education.push({
        degree: readText(article.querySelector('h3')),
        institution: readText(article.querySelector('[data-field="institution"]')),
        location: readText(article.querySelector('[data-field="location"]')),
        startYear: readText(times[0]),
        endYear: readText(times[1])
      });
    });

    // Training
    const training = Array.from(
      main.querySelectorAll('[data-list="training"] > li[data-editable]')
    ).map(readText);

    // Languages
    const languages = [];
    main.querySelectorAll('[data-list="languages"] > li:not(.list-add-wrapper)').forEach(li => {
      const meter = li.querySelector('meter');
      languages.push({
        name: readText(li.querySelector('label')),
        level: meter ? parseInt(meter.value, 10) : 3
      });
    });

    return {
      meta: { version: 1 },
      header: { name, contacts, socials },
      summary,
      skills,
      experience,
      education,
      training,
      languages
    };
  }

  function saveToStorage() {
    try {
      const data = serializeResume();
      if (!data) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  function scheduleSave() {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saveTimer = null;
      saveToStorage();
    }, 200);
  }

  /**
   * Load the saved resume data object from localStorage, or null if none/stale.
   */
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const snapshot = JSON.parse(stored);
      if (!snapshot || snapshot.version !== STORAGE_VERSION || !snapshot.data) return null;

      return snapshot.data;
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      return null;
    }
  }

  /**
   * Read the default resume data embedded in the page (#resume-data script tag).
   */
  function loadSeedData() {
    try {
      const el = document.getElementById('resume-data');
      if (!el) return null;
      return JSON.parse(el.textContent);
    } catch (e) {
      console.warn('Failed to parse seed resume data:', e);
      return null;
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
      return false;
    }
  }

  function init() {

    const data = loadFromStorage() || loadSeedData();
    if (data) renderResume(data);

    document.addEventListener('click', handleClick);

    document.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('title', 'Click to edit');
    });

    initListContainers();

    initSocialButton();

    initSocialRemoveButtons();

    initMeterBars();
  }

  function initListContainers() {
    document.querySelectorAll('[data-list]').forEach(container => {
      const existingWrapper = container.querySelector(':scope > .list-add-wrapper');
      if (!existingWrapper) {
        const addBtn = createAddButton(container.dataset.list, container.tagName);
        container.appendChild(addBtn);
      }
      const items = getListItems(container);
      items.forEach(item => addRemoveButton(item));
    });
  }

  function initSocialButton() {
    const address = document.querySelector('.address');
    if (!address) return;
    if (address.querySelector('.add-social-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'add-social-btn';
    btn.innerHTML = '<span>+</span> Social';
    btn.setAttribute('title', 'Add social media link');
    address.appendChild(btn);
  }

  function initSocialRemoveButtons() {
    document.querySelectorAll('.contact-item.social-item').forEach(item => {

      if (item.querySelector('.list-remove-btn')) return;

      const platformName = item.querySelector('.social-link')?.dataset.platform || 'social';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-remove-btn';
      btn.setAttribute('aria-label', `Remove ${platformName} link`);
      btn.innerHTML = '×';
      item.appendChild(btn);
    });
  }

  function initMeterBars() {
    document.querySelectorAll('[data-list="languages"] meter').forEach(meter => {

      if (meter.nextElementSibling && meter.nextElementSibling.classList.contains('meter-bar')) {
        return;
      }

      const level = parseInt(meter.value, 10) || 3;
      const meterBarHTML = createMeterBarHTML(level);

      meter.insertAdjacentHTML('afterend', meterBarHTML);

      meter.removeAttribute('data-editable-proficiency');
    });
  }

  function handleClick(e) {

    if (e.target.closest('.add-social-btn')) {
      e.preventDefault();
      promptForSocialLink();
      return;
    }

    const proficiencyElement = e.target.closest('[data-editable-proficiency]');
    if (proficiencyElement) {
      e.preventDefault();
      const langItem = proficiencyElement.closest('li');
      if (langItem) {
        const container = langItem.closest('[data-list="languages"]');
        showLanguageModal(langItem, container);
      }
      return;
    }

    if (e.target.closest('.list-add-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.list-add-btn');
      const container = btn.closest('[data-list]');
      if (container) {
        addListItem(container);
      }
      return;
    }

    if (e.target.closest('.list-remove-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.list-remove-btn');

      const socialItem = btn.closest('.social-item');
      if (socialItem && !btn.closest('[data-list]')) {
        socialItem.classList.add('removing');
        setTimeout(() => {
          socialItem.remove();
          scheduleSave();
        }, 200);
        return;
      }

      const item = btn.closest('[data-list] > li, [data-list] > article');
      if (item) {
        removeListItem(item);
      }
      return;
    }

    if (e.target.closest('.inline-edit-input, .inline-edit-textarea')) {
      return;
    }

    const editable = e.target.closest('[data-editable]');

    if (!editable && activeEditor) {
      saveAndClose(activeEditor);
      return;
    }

    if (!editable) return;

    if (editable.dataset.editing === 'true') return;

    if (e.target.tagName === 'A' && !e.target.closest('[data-editable="link"]')) {
      return;
    }

    if (activeEditor && activeEditor !== editable) {
      saveAndClose(activeEditor);
    }

    if (editable.tagName === 'A' || editable.tagName === 'LABEL') {
      e.preventDefault();
    }

    startEdit(editable);
  }

  function startEdit(element) {
    const type = element.dataset.editable;
    const currentText = getTextContent(element);

    element.dataset.editing = 'true';
    element.dataset.originalText = currentText;
    activeEditor = element;

    if (type === 'link' && element.tagName === 'A') {
      element.dataset.originalHref = element.getAttribute('href') || '';
    }

    const input = type === 'multiline'
      ? createTextarea(currentText, element)
      : createInput(currentText, element);

    const removeBtn = element.querySelector('.list-remove-btn');

    while (element.firstChild) {
      if (element.firstChild !== removeBtn) {
        element.removeChild(element.firstChild);
      } else {
        break;
      }
    }

    element.insertBefore(input, element.firstChild);
    input.focus();
    input.select();

    input.addEventListener('keydown', (e) => handleKeydown(e, element));
    input.addEventListener('blur', (e) => handleBlur(e, element));
  }

  function getTextContent(element) {

    const clone = element.cloneNode(true);
    const removeBtn = clone.querySelector('.list-remove-btn');
    if (removeBtn) removeBtn.remove();
    return clone.textContent.trim();
  }

  function createInput(value, parent) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'inline-edit-input';
    input.setAttribute('aria-label', `Edit ${parent.tagName.toLowerCase()}`);
    return input;
  }

  function createTextarea(value, parent) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.className = 'inline-edit-textarea';
    textarea.setAttribute('aria-label', `Edit ${parent.tagName.toLowerCase()}`);
    textarea.rows = Math.max(3, Math.ceil(value.length / 60));
    return textarea;
  }

  function handleKeydown(e, element) {
    const type = element.dataset.editable;

    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit(element);
    } else if (e.key === 'Enter') {
      if (type === 'multiline') {
        if (e.shiftKey || e.ctrlKey) {
          e.preventDefault();
          saveAndClose(element);
        }
      } else {
        e.preventDefault();
        saveAndClose(element);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const saved = saveAndClose(element);
      if (saved) {
        focusNextEditable(element, e.shiftKey);
      }
    }
  }

  function handleBlur(e, element) {
    setTimeout(() => {
      if (element.dataset.editing === 'true') {
        saveAndClose(element);
      }
    }, 150);
  }

  function saveAndClose(element) {
    if (element.dataset.editing !== 'true') return false;

    const input = element.querySelector('.inline-edit-input, .inline-edit-textarea');
    if (!input) return false;

    const newValue = input.value.trim();
    const originalText = element.dataset.originalText;
    const type = element.dataset.editable;

    const finalValue = newValue || originalText;

    const removeBtn = element.querySelector('.list-remove-btn');

    input.remove();

    element.insertBefore(document.createTextNode(finalValue), element.firstChild);

    if (removeBtn) {
      element.appendChild(removeBtn);
    }

    if (type === 'link' && element.tagName === 'A') {
      updateLinkHref(element, finalValue);
    }

    cleanup(element);

    scheduleSave();

    return true;
  }

  function cancelEdit(element) {
    const originalText = element.dataset.originalText;

    const removeBtn = element.querySelector('.list-remove-btn');
    const input = element.querySelector('.inline-edit-input, .inline-edit-textarea');

    if (input) input.remove();

    element.insertBefore(document.createTextNode(originalText), element.firstChild);

    if (removeBtn) {
      element.appendChild(removeBtn);
    }

    if (element.dataset.editable === 'link' && element.dataset.originalHref) {
      element.setAttribute('href', element.dataset.originalHref);
    }

    cleanup(element);
  }

  function cleanup(element) {
    delete element.dataset.editing;
    delete element.dataset.originalText;
    delete element.dataset.originalHref;

    if (activeEditor === element) {
      activeEditor = null;
    }
  }

  function updateLinkHref(link, text) {
    const originalHref = link.dataset.originalHref || '';

    if (originalHref.startsWith('mailto:')) {
      link.setAttribute('href', 'mailto:' + text.replace(/\s/g, ''));
    } else if (originalHref.startsWith('tel:')) {
      const cleanPhone = text.replace(/[^\d+\-\s]/g, '').replace(/\s+/g, '-');
      link.setAttribute('href', 'tel:' + cleanPhone);
    }
  }

  function focusNextEditable(current, reverse = false) {
    const editables = Array.from(document.querySelectorAll('[data-editable]'));
    const currentIndex = editables.indexOf(current);

    let nextIndex;
    if (reverse) {
      nextIndex = currentIndex <= 0 ? editables.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex >= editables.length - 1 ? 0 : currentIndex + 1;
    }

    const nextElement = editables[nextIndex];
    if (nextElement) {
      nextElement.click();
    }
  }

  function getListItems(container) {
    const listType = container.dataset.list;

    if (container.tagName === 'UL') {
      return Array.from(container.querySelectorAll(':scope > li:not(.list-add-wrapper)'));
    }

    return Array.from(container.querySelectorAll(':scope > article'));
  }

  function getListLabel(listType) {
    const labels = {
      skills: 'Skill',
      training: 'Course',
      experience: 'Job',
      education: 'Degree',
      languages: 'Language',
      bullets: 'Bullet'
    };
    return labels[listType] || 'Item';
  }

  function createAddButton(listType, containerTag) {

    const isListContainer = containerTag === 'UL' || containerTag === 'OL';
    const wrapper = document.createElement(isListContainer ? 'li' : 'div');
    wrapper.className = 'list-add-wrapper';

    const label = getListLabel(listType);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-add-btn';
    btn.setAttribute('aria-label', `Add ${label}`);
    btn.innerHTML = `<span class="list-add-icon">+</span> Add ${label}`;

    wrapper.appendChild(btn);
    return wrapper;
  }

  function addRemoveButton(item) {

    if (item.querySelector(':scope > .list-remove-btn')) return;

    const container = item.closest('[data-list]');
    const listType = container ? container.dataset.list : 'item';
    const label = getListLabel(listType);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-remove-btn';
    btn.setAttribute('aria-label', `Remove ${label}`);
    btn.setAttribute('title', `Remove ${label}`);
    btn.innerHTML = '×';

    item.style.position = 'relative';
    item.appendChild(btn);
  }

  function addListItem(container) {
    const listType = container.dataset.list;

    if (listType === 'languages') {
      showLanguageModal(null, container);
      return;
    }

    const addWrapper = container.querySelector(':scope > .list-add-wrapper');

    let newItem;

    switch (listType) {
      case 'skills':
      case 'training':
        newItem = createSkillItem();
        break;
      case 'bullets':
        newItem = createBulletItem();
        break;
      case 'experience':
        newItem = createExperienceItem();
        break;
      case 'education':
        newItem = createEducationItem();
        break;
      default:
        newItem = createSkillItem();
    }

    container.insertBefore(newItem, addWrapper);

    addRemoveButton(newItem);

    newItem.querySelectorAll('[data-list]').forEach(nestedContainer => {
      const nestedAddBtn = createAddButton(nestedContainer.dataset.list, nestedContainer.tagName);
      nestedContainer.appendChild(nestedAddBtn);

      getListItems(nestedContainer).forEach(item => addRemoveButton(item));
    });

    const firstEditable = newItem.querySelector('[data-editable]');
    if (firstEditable) {
      setTimeout(() => firstEditable.click(), 50);
    }

    scheduleSave();
  }

  function removeListItem(item) {
    const container = item.closest('[data-list]');
    const items = getListItems(container);

    if (items.length <= 1) {
      item.classList.add('shake');
      setTimeout(() => item.classList.remove('shake'), 500);
      return;
    }

    item.classList.add('removing');
    setTimeout(() => {
      item.remove();
      scheduleSave();
    }, 200);
  }

  function createSkillItem() {
    const li = document.createElement('li');
    li.setAttribute('data-editable', 'text');
    li.textContent = 'New skill or item';
    li.setAttribute('title', 'Click to edit');
    return li;
  }

  function createBulletItem() {
    const li = document.createElement('li');
    li.setAttribute('data-editable', 'text');
    li.textContent = 'Describe your responsibility or achievement';
    li.setAttribute('title', 'Click to edit');
    return li;
  }

  function createExperienceItem() {
    const article = document.createElement('article');
    article.innerHTML = `
      <div class="exp-detail">
        <div class="company-date italic">
          <p data-editable="text">Company Name</p>
          <p class="meta">
            <time data-editable="text">Start Date</time> -
            <time data-editable="text">End Date</time>
          </p>
        </div>
        <h3 data-editable="text">Job Title</h3>
      </div>
      <ul class="experience" data-list="bullets">
        <li data-editable="text">Describe your responsibility or achievement</li>
      </ul>
    `;

    article.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('title', 'Click to edit');
    });

    return article;
  }

  function createEducationItem() {
    const article = document.createElement('article');
    article.className = 'education';
    article.innerHTML = `
      <h3 data-editable="text">Degree or Program Name</h3>
      <div class="meta-wrapper italic">
        <p>
          <time data-editable="text">Start Year</time> -
          <time data-editable="text">End Year</time>
        </p>
        <p data-editable="text" data-field="institution">Institution Name</p>
        <p data-editable="text" data-field="location">Location</p>
      </div>
    `;

    article.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('title', 'Click to edit');
    });

    return article;
  }

  function createLanguageItem(name = 'Language', level = 3) {
    const li = document.createElement('li');
    const id = 'lang-' + Date.now();
    const proficiency = PROFICIENCY_LEVELS.find(p => p.value === level) || PROFICIENCY_LEVELS[2];

    li.innerHTML = `
      <label for="${id}" data-editable="text">${name}</label>
      <meter id="${id}" min="0" max="5" value="${level}"></meter>
      ${createMeterBarHTML(level)}
      <span class="sr-only">${name} — ${level} of 5</span>
      <p class="lang-description" data-editable-proficiency="true">${proficiency.label}</p>
    `;

    li.querySelector('label').setAttribute('title', 'Click to edit name');

    li.querySelector('.lang-description').setAttribute('title', 'Click to change proficiency');

    return li;
  }

  function showLanguageModal(existingItem, container) {
    const isEditing = existingItem !== null;

    let currentName = '';
    let currentLevel = 3;

    if (isEditing) {
      const label = existingItem.querySelector('label');
      const meter = existingItem.querySelector('meter');
      currentName = label ? label.textContent.trim() : '';
      currentLevel = meter ? parseInt(meter.value, 10) : 3;
    }

    const optionsHtml = PROFICIENCY_LEVELS.map(p => `
      <label class="lang-modal-option ${p.value === currentLevel ? 'selected' : ''}">
        <input type="radio" name="proficiency" value="${p.value}" ${p.value === currentLevel ? 'checked' : ''}>
        <span class="lang-modal-option-content">
          <span class="lang-modal-option-label">${p.label}</span>
          <span class="lang-modal-option-desc">${p.description}</span>
          ${createMeterBarHTML(p.value).replace('data-editable-proficiency="true"', '').replace('title="Click to change proficiency"', '')}
        </span>
      </label>
    `).join('');

    const backdrop = document.createElement('div');
    backdrop.className = 'social-modal-backdrop lang-modal-backdrop';
    backdrop.innerHTML = `
      <div class="social-modal lang-modal" role="dialog" aria-labelledby="lang-modal-title">
        <h3 id="lang-modal-title">${isEditing ? 'Edit Language' : 'Add Language'}</h3>
        <div class="lang-modal-field">
          <label for="lang-name-input" class="lang-modal-label">Language Name</label>
          <input
            type="text"
            id="lang-name-input"
            class="social-modal-input lang-modal-input"
            placeholder="e.g., Spanish, Mandarin, French"
            value="${currentName}"
          >
        </div>
        <div class="lang-modal-field">
          <span class="lang-modal-label">Proficiency Level</span>
          <div class="lang-modal-options">
            ${optionsHtml}
          </div>
        </div>
        <p class="social-modal-error" id="lang-modal-error" role="alert"></p>
        <div class="social-modal-actions">
          <button type="button" class="social-modal-btn cancel">Cancel</button>
          <button type="button" class="social-modal-btn submit">${isEditing ? 'Save' : 'Add'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const nameInput = backdrop.querySelector('#lang-name-input');
    const errorEl = backdrop.querySelector('#lang-modal-error');
    const cancelBtn = backdrop.querySelector('.social-modal-btn.cancel');
    const submitBtn = backdrop.querySelector('.social-modal-btn.submit');
    const optionLabels = backdrop.querySelectorAll('.lang-modal-option');

    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      nameInput.focus();
      nameInput.select();
    });

    function closeModal() {
      backdrop.classList.remove('visible');
      setTimeout(() => backdrop.remove(), 200);
    }

    function showError(message) {
      errorEl.textContent = message;
      nameInput.classList.add('error');
    }

    function clearError() {
      errorEl.textContent = '';
      nameInput.classList.remove('error');
    }

    optionLabels.forEach(label => {
      label.addEventListener('click', () => {
        optionLabels.forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
      });
    });

    function handleSubmit() {
      const name = nameInput.value.trim();
      const selectedRadio = backdrop.querySelector('input[name="proficiency"]:checked');
      const level = selectedRadio ? parseInt(selectedRadio.value, 10) : 3;

      if (!name) {
        showError('Please enter a language name');
        nameInput.focus();
        return;
      }

      if (isEditing) {

        updateLanguageItem(existingItem, name, level);
      } else {

        const newItem = createLanguageItem(name, level);
        const addWrapper = container.querySelector(':scope > .list-add-wrapper');
        container.insertBefore(newItem, addWrapper);
        addRemoveButton(newItem);
        scheduleSave();
      }

      closeModal();
    }

    cancelBtn.addEventListener('click', closeModal);
    submitBtn.addEventListener('click', handleSubmit);

    nameInput.addEventListener('input', clearError);

    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  function updateLanguageItem(item, name, level) {
    const proficiency = PROFICIENCY_LEVELS.find(p => p.value === level) || PROFICIENCY_LEVELS[2];

    const label = item.querySelector('label');
    const meter = item.querySelector('meter');
    const meterBar = item.querySelector('.meter-bar');
    const srOnly = item.querySelector('.sr-only');
    const description = item.querySelector('.lang-description');

    if (label) label.textContent = name;
    if (meter) meter.value = level;
    if (meterBar) updateMeterBar(meterBar, level);
    if (srOnly) srOnly.textContent = `${name} — ${level} of 5`;
    if (description) description.textContent = proficiency.label;

    scheduleSave();
  }

  function promptForSocialLink() {
    showSocialModal();
  }

  function showSocialModal() {

    const backdrop = document.createElement('div');
    backdrop.className = 'social-modal-backdrop';
    backdrop.innerHTML = `
      <div class="social-modal" role="dialog" aria-labelledby="social-modal-title">
        <h3 id="social-modal-title">Add Social Link</h3>
        <input
          type="url"
          class="social-modal-input"
          placeholder="https://github.com/username"
          aria-describedby="social-modal-hint social-modal-error"
        >
        <p class="social-modal-hint" id="social-modal-hint">GitHub, LinkedIn, X/Twitter, or any website</p>
        <p class="social-modal-error" id="social-modal-error" role="alert"></p>
        <div class="social-modal-actions">
          <button type="button" class="social-modal-btn cancel">Cancel</button>
          <button type="button" class="social-modal-btn submit">Add</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const input = backdrop.querySelector('.social-modal-input');
    const errorEl = backdrop.querySelector('.social-modal-error');
    const cancelBtn = backdrop.querySelector('.social-modal-btn.cancel');
    const submitBtn = backdrop.querySelector('.social-modal-btn.submit');

    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      input.focus();
    });

    function closeModal() {
      backdrop.classList.remove('visible');
      setTimeout(() => backdrop.remove(), 200);
    }

    function showError(message) {
      errorEl.textContent = message;
      input.classList.add('error');
      input.focus();
    }

    function clearError() {
      errorEl.textContent = '';
      input.classList.remove('error');
    }

    function handleSubmit() {
      const url = input.value.trim();

      if (!url) {
        showError('Please enter a URL');
        return;
      }

      if (!isValidUrl(url)) {
        showError('Please enter a valid URL (starting with http:// or https://)');
        return;
      }

      if (socialLinkExists(url)) {
        showError('This link has already been added');
        return;
      }

      const socialData = parseSocialUrl(url);
      createSocialLink(socialData);
      scheduleSave();
      closeModal();
    }

    cancelBtn.addEventListener('click', closeModal);
    submitBtn.addEventListener('click', handleSubmit);

    input.addEventListener('input', clearError);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }

  function socialLinkExists(url) {
    const existingLinks = document.querySelectorAll('.social-item .social-link');
    const normalizedUrl = normalizeUrl(url);

    for (const link of existingLinks) {
      if (normalizeUrl(link.href) === normalizedUrl) {
        return true;
      }
    }
    return false;
  }

  function normalizeUrl(url) {
    try {
      const parsed = new URL(url);

      return (parsed.host + parsed.pathname).toLowerCase().replace(/\/+$/, '');
    } catch {
      return url.toLowerCase().replace(/\/+$/, '');
    }
  }

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
  function parseSocialUrl(url) {
    for (const [key, platform] of Object.entries(SOCIAL_PLATFORMS)) {
      if (key === 'portfolio') continue;
      const match = url.match(platform.pattern);
      if (match) {
        return {
          platform: key,
          username: match[1],
          url: url,
          icon: platform.icon,
          name: platform.name
        };
      }
    }

    const domainMatch = url.match(SOCIAL_PLATFORMS.portfolio.pattern);
    const domain = domainMatch ? domainMatch[1].replace(/^www\./, '') : 'website';

    return {
      platform: 'portfolio',
      username: domain,
      url: url,
      icon: SOCIAL_PLATFORMS.portfolio.icon,
      name: 'Website'
    };
  }

  function createSocialLink(data) {
    const address = document.querySelector('.address');
    const addBtn = address.querySelector('.add-social-btn');

    if (!address || !addBtn) return;

    const span = document.createElement('span');
    span.className = 'contact-item social-item';
    span.innerHTML = `
      <a href="${escapeHtml(data.url)}"
         target="_blank"
         rel="noopener noreferrer"
         class="social-link"
         title="${escapeHtml(data.name)}"
         data-platform="${escapeHtml(data.name)}">
        ${data.icon}
        <span class="social-username">${escapeHtml(data.username)}</span>
      </a>
      <button type="button" class="list-remove-btn" aria-label="Remove ${escapeHtml(data.name)} link">×</button>
    `;

    address.insertBefore(span, addBtn);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
