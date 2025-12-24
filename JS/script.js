/**
 * Resume Builder - Inline Edit System
 * 
 * Features:
 * - Inline text editing with data-editable attributes
 * - Add/remove list items with data-list containers
 * - Social media link support with smart username extraction
 * - Event delegation for performance
 * 
 * Supported edit types:
 * - data-editable="text"      → single-line input
 * - data-editable="multiline" → textarea
 * - data-editable="link"      → input that also updates href
 * 
 * List containers:
 * - data-list="skills|experience|education|training|languages"
 */

(function() {
  'use strict';

  // Track currently editing element to prevent conflicts
  let activeEditor = null;

  // ============================================
  // SOCIAL PLATFORM DEFINITIONS
  // ============================================

  const SOCIAL_PLATFORMS = {
    github: {
      pattern: /github\.com\/([^\/\?]+)/i,
      icon: '<svg viewBox="0 0 24 24" class="social-icon"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
      name: 'GitHub'
    },
    linkedin: {
      pattern: /linkedin\.com\/in\/([^\/\?]+)/i,
      icon: '<svg viewBox="0 0 24 24" class="social-icon"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
      name: 'LinkedIn'
    },
    twitter: {
      pattern: /(?:twitter|x)\.com\/([^\/\?]+)/i,
      icon: '<svg viewBox="0 0 24 24" class="social-icon"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      name: 'X'
    },
    portfolio: {
      pattern: /^https?:\/\/([^\/]+)/i,
      icon: '<svg viewBox="0 0 24 24" class="social-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      name: 'Website'
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Delegated click handler for edits and list controls
    document.addEventListener('click', handleClick);
    
    // Add visual hints for editable elements
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('title', 'Click to edit');
    });

    // Initialize list containers with add buttons
    initListContainers();

    // Initialize social link button in address
    initSocialButton();
  }

  /**
   * Add controls to list containers
   */
  function initListContainers() {
    document.querySelectorAll('[data-list]').forEach(container => {
      // Add the "add item" button at the end
      const addBtn = createAddButton(container.dataset.list);
      container.appendChild(addBtn);

      // Add remove buttons to existing items
      const items = getListItems(container);
      items.forEach(item => addRemoveButton(item));
    });
  }

  /**
   * Add "Add Social" button to the address section
   */
  function initSocialButton() {
    const address = document.querySelector('.address');
    if (!address) return;

    // Check if button already exists
    if (address.querySelector('.add-social-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'add-social-btn';
    btn.innerHTML = '<span>+</span> Social';
    btn.setAttribute('title', 'Add social media link');
    address.appendChild(btn);
  }

  // ============================================
  // EVENT HANDLING
  // ============================================

  function handleClick(e) {
    // Handle "Add Social" button clicks
    if (e.target.closest('.add-social-btn')) {
      e.preventDefault();
      promptForSocialLink();
      return;
    }

    // Handle add button clicks
    if (e.target.closest('.list-add-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.list-add-btn');
      const container = btn.closest('[data-list]');
      addListItem(container);
      return;
    }

    // Handle remove button clicks (both list items and social items)
    if (e.target.closest('.list-remove-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.list-remove-btn');
      
      // Check if it's a social item (not inside a data-list container)
      const socialItem = btn.closest('.social-item');
      if (socialItem && !btn.closest('[data-list]')) {
        socialItem.classList.add('removing');
        setTimeout(() => socialItem.remove(), 200);
        return;
      }
      
      // Regular list item
      const item = btn.closest('[data-list] > li, [data-list] > article');
      if (item) {
        removeListItem(item);
      }
      return;
    }

    // If clicking inside an active editor, let it handle itself
    if (e.target.closest('.inline-edit-input, .inline-edit-textarea')) {
      return;
    }

    // Find the editable element (if any)
    const editable = e.target.closest('[data-editable]');
    
    // If clicking outside any editable while one is active, save and close
    if (!editable && activeEditor) {
      saveAndClose(activeEditor);
      return;
    }

    // If no editable found, nothing to do
    if (!editable) return;

    // If this element is already being edited, let it be
    if (editable.dataset.editing === 'true') return;

    // If clicking a link inside an editable, let the link work
    if (e.target.tagName === 'A' && !e.target.closest('[data-editable="link"]')) {
      return;
    }

    // Close any existing editor first
    if (activeEditor && activeEditor !== editable) {
      saveAndClose(activeEditor);
    }

    // Prevent default for links and labels that are editable
    if (editable.tagName === 'A' || editable.tagName === 'LABEL') {
      e.preventDefault();
    }

    // Start editing
    startEdit(editable);
  }

  // ============================================
  // INLINE EDITING
  // ============================================

  function startEdit(element) {
    const type = element.dataset.editable;
    const currentText = getTextContent(element);
    
    element.dataset.editing = 'true';
    element.dataset.originalText = currentText;
    activeEditor = element;

    // Store original href for links
    if (type === 'link' && element.tagName === 'A') {
      element.dataset.originalHref = element.getAttribute('href') || '';
    }

    // Create appropriate input
    const input = type === 'multiline' 
      ? createTextarea(currentText, element)
      : createInput(currentText, element);

    // Preserve remove button if present
    const removeBtn = element.querySelector('.list-remove-btn');
    
    // Clear text content but keep remove button
    // Remove all child nodes except the remove button
    while (element.firstChild) {
      if (element.firstChild !== removeBtn) {
        element.removeChild(element.firstChild);
      } else {
        break;
      }
    }
    
    // Insert input at the beginning
    element.insertBefore(input, element.firstChild);
    input.focus();
    input.select();

    // Bind events
    input.addEventListener('keydown', (e) => handleKeydown(e, element));
    input.addEventListener('blur', (e) => handleBlur(e, element));
  }

  function getTextContent(element) {
    // Get text content excluding remove button text
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

    // Use original if empty (don't allow blank items via editing)
    const finalValue = newValue || originalText;

    // Preserve any non-input children (like remove buttons) before replacing content
    const removeBtn = element.querySelector('.list-remove-btn');
    
    // Remove the input element
    input.remove();
    
    // Set the text as first child (creates a text node)
    element.insertBefore(document.createTextNode(finalValue), element.firstChild);
    
    // If there was a remove button, make sure it's still at the end
    if (removeBtn) {
      element.appendChild(removeBtn);
    }

    if (type === 'link' && element.tagName === 'A') {
      updateLinkHref(element, finalValue);
    }

    cleanup(element);
    return true;
  }

  function cancelEdit(element) {
    const originalText = element.dataset.originalText;
    
    // Preserve remove button before restoring content
    const removeBtn = element.querySelector('.list-remove-btn');
    const input = element.querySelector('.inline-edit-input, .inline-edit-textarea');
    
    // Remove the input
    if (input) input.remove();
    
    // Add the original text back
    element.insertBefore(document.createTextNode(originalText), element.firstChild);
    
    // Re-add remove button if it existed
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

  // ============================================
  // LIST MANAGEMENT
  // ============================================

  /**
   * Get the direct list item children of a container
   */
  function getListItems(container) {
    const listType = container.dataset.list;
    
    // For UL containers, get LI children (excluding the add button wrapper)
    if (container.tagName === 'UL') {
      return Array.from(container.querySelectorAll(':scope > li:not(.list-add-wrapper)'));
    }
    
    // For section containers (experience, education), get article children
    return Array.from(container.querySelectorAll(':scope > article'));
  }

  /**
   * Get descriptive label for list type
   */
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

  /**
   * Create the "Add" button for a list
   */
  function createAddButton(listType) {
    const wrapper = document.createElement('li');
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

  /**
   * Add remove button to a list item
   */
  function addRemoveButton(item) {
    // Don't add if already has one
    if (item.querySelector(':scope > .list-remove-btn')) return;
    
    // Determine the item type from parent container
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

  /**
   * Add a new item to a list container
   */
  function addListItem(container) {
    const listType = container.dataset.list;
    const addWrapper = container.querySelector('.list-add-wrapper');
    
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
      case 'languages':
        newItem = createLanguageItem();
        break;
      default:
        newItem = createSkillItem();
    }
    
    // Insert before the add button
    container.insertBefore(newItem, addWrapper);
    
    // Add remove button to the new item
    addRemoveButton(newItem);
    
    // Initialize any nested data-list containers (e.g., bullets inside experience)
    newItem.querySelectorAll('[data-list]').forEach(nestedContainer => {
      const nestedAddBtn = createAddButton(nestedContainer.dataset.list);
      nestedContainer.appendChild(nestedAddBtn);
      
      // Add remove buttons to existing items in nested container
      getListItems(nestedContainer).forEach(item => addRemoveButton(item));
    });
    
    // Focus the first editable in the new item
    const firstEditable = newItem.querySelector('[data-editable]');
    if (firstEditable) {
      setTimeout(() => firstEditable.click(), 50);
    }
  }

  /**
   * Remove a list item with confirmation
   */
  function removeListItem(item) {
    const container = item.closest('[data-list]');
    const items = getListItems(container);
    
    // Don't allow removing the last item
    if (items.length <= 1) {
      item.classList.add('shake');
      setTimeout(() => item.classList.remove('shake'), 500);
      return;
    }
    
    // Animate out then remove
    item.classList.add('removing');
    setTimeout(() => {
      item.remove();
    }, 200);
  }

  // ============================================
  // ITEM TEMPLATES
  // ============================================

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
    
    // Add title hints to editables
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
        <p data-editable="text">Institution Name</p>
        <p data-editable="text">Location</p>
      </div>
    `;
    
    article.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('title', 'Click to edit');
    });
    
    return article;
  }

  function createLanguageItem() {
    const li = document.createElement('li');
    const id = 'lang-' + Date.now();
    li.innerHTML = `
      <label for="${id}" data-editable="text">Language</label>
      <meter id="${id}" min="0" max="5" value="3"></meter>
      <span class="sr-only">Language — 3 of 5</span>
      <p class="lang-description" data-editable="text">Proficiency</p>
    `;
    
    li.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('title', 'Click to edit');
    });
    
    return li;
  }

  // ============================================
  // SOCIAL LINKS
  // ============================================

  /**
   * Show modal to add a social media URL
   */
  function promptForSocialLink() {
    showSocialModal();
  }

  /**
   * Create and show the social link modal
   */
  function showSocialModal() {
    // Create backdrop
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

    // Show with animation
    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      input.focus();
    });

    // Close modal helper
    function closeModal() {
      backdrop.classList.remove('visible');
      setTimeout(() => backdrop.remove(), 200);
    }

    // Show error helper
    function showError(message) {
      errorEl.textContent = message;
      input.classList.add('error');
      input.focus();
    }

    // Clear error helper
    function clearError() {
      errorEl.textContent = '';
      input.classList.remove('error');
    }

    // Handle submit
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

      // Success - create the link and close
      const socialData = parseSocialUrl(url);
      createSocialLink(socialData);
      closeModal();
    }

    // Event listeners
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

    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }

  /**
   * Check if a social link with this URL already exists
   */
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

  /**
   * Normalize URL for comparison (remove trailing slashes, lowercase)
   */
  function normalizeUrl(url) {
    try {
      const parsed = new URL(url);
      // Lowercase host, remove trailing slash from pathname
      return (parsed.host + parsed.pathname).toLowerCase().replace(/\/+$/, '');
    } catch {
      return url.toLowerCase().replace(/\/+$/, '');
    }
  }

  /**
   * Check if string is a valid URL
   */
  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Parse a social URL and extract platform info and username
   */
  function parseSocialUrl(url) {
    // Try to match known platforms
    for (const [key, platform] of Object.entries(SOCIAL_PLATFORMS)) {
      if (key === 'portfolio') continue; // Skip generic fallback
      
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
    
    // Fallback to generic website/portfolio
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

  /**
   * Create and insert a social link element
   */
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
    
    // Insert before the add button
    address.insertBefore(span, addBtn);
  }

  /**
   * Escape HTML special characters
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // BOOTSTRAP
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
