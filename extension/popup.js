document.addEventListener('DOMContentLoaded', () => {
  // Custom Toast Function for the Extension
  const showToast = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'absolute';
    toast.style.top = '10px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    toast.style.background = isError ? 'rgba(239, 68, 68, 0.9)' : 'rgba(74, 222, 128, 0.9)';
    toast.style.color = '#fff';
    toast.style.padding = '8px 16px';
    toast.style.borderRadius = '20px';
    toast.style.fontSize = '0.85rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';
    toast.style.zIndex = '1000';
    toast.style.pointerEvents = 'none';
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2500);
  };

  const createSaveBtn = document.getElementById('create-save-btn');
  const subOptions = document.getElementById('sub-options');
  const chevron = createSaveBtn.querySelector('.chevron');
  const loggedInView = document.getElementById('logged-in-view');
  const loggedOutView = document.getElementById('logged-out-view');
  
  const profileIcon = document.getElementById('profile-icon');
  const loggedOutIcon = document.getElementById('logged-out-icon');
  const loggedInText = document.getElementById('logged-in-text');

  const getInitials = (name) => {
    if (!name) return 'X';
    return name.substring(0, 1).toUpperCase();
  };

  const saveFormView = document.getElementById('save-form-view');
  const saveUrlInput = document.getElementById('save-url');
  const cancelSaveBtn = document.getElementById('cancel-save-btn');
  const submitSaveBtn = document.getElementById('submit-save-btn');

  // Function to decode JWT and check if it's expired
  const isTokenExpired = (token) => {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = JSON.parse(atob(payloadBase64));
      // JWT exp is in seconds, Date.now() is in milliseconds
      return (decodedJson.exp * 1000) < Date.now();
    } catch (e) {
      return true; // If we can't parse it, consider it invalid/expired
    }
  };

  const withToken = (callback) => {
    chrome.storage.local.get(['token'], (result) => {
      if (result.token && !isTokenExpired(result.token)) {
        callback(result.token);
      } else if (result.token) {
        // Token exists but is expired. Clean up storage and show logged out state.
        chrome.storage.local.remove(['token', 'user']);
        setLoggedOutState();
      }
    });
  };

  const setLoggedOutState = () => {
    loggedOutView.classList.remove('hidden');
    loggedInView.classList.add('hidden');
    saveFormView.classList.add('hidden');
    
    profileIcon.classList.remove('active');
    loggedOutIcon.classList.remove('hidden');
    loggedInText.classList.add('hidden');
  };

  // Check auth state
  chrome.storage.local.get(['token', 'user'], (result) => {
    if (result.token) {
      if (isTokenExpired(result.token)) {
        // Token exists but is expired. Clean up storage and show logged out state.
        chrome.storage.local.remove(['token', 'user']);
        setLoggedOutState();
      } else {
        // Token is valid
        loggedInView.classList.remove('hidden');
        loggedOutView.classList.add('hidden');
        saveFormView.classList.add('hidden');
        
        profileIcon.classList.add('active');
        loggedInText.textContent = getInitials(result.user?.name);
        loggedInText.classList.remove('hidden');
        loggedOutIcon.classList.add('hidden');
      }
    } else {
      setLoggedOutState();
    }
  });

  // Login button click
  document.getElementById('open-login-btn').addEventListener('click', () => {
    // imp: Check if tab is already open to avoid duplicate tabs (UX improvement)
    chrome.tabs.query({ url: "http://localhost:5173/*" }, (tabs) => {
      if (tabs.length > 0) {
        // Tab exists, switch to it and navigate to login
        chrome.tabs.update(tabs[0].id, { active: true, url: 'http://localhost:5173/login' });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        // Tab does not exist, create a brand new one
        chrome.tabs.create({ url: 'http://localhost:5173/login' });
      }
    });
  });

  // Logic to toggle the dropdown
  createSaveBtn.addEventListener('click', () => {
    subOptions.classList.toggle('show');
    chevron.classList.toggle('open');
  });

  let cachedMetadata = [];
  const fetchMetadataForDropdown = (token) => {
    fetch('http://localhost:5000/api/websites/metadata', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      cachedMetadata = data.metadata || [];
      // Populate categories immediately
      categoryDatalist.innerHTML = '';
      cachedMetadata.forEach(meta => {
        const option = document.createElement('option');
        option.value = meta.category;
        categoryDatalist.appendChild(option);
      });
    })
    .catch(err => console.error('Error fetching metadata for dropdown:', err));
  };

  const categoryInput = document.getElementById('save-category');
  const categoryDatalist = document.getElementById('category-options');
  const subCategoryInput = document.getElementById('save-subcategory');
  const subCategoryDatalist = document.getElementById('subcategory-options');

  // When category changes, populate the subcategory datalist
  categoryInput.addEventListener('input', (e) => {
    const selectedCategory = e.target.value.toLowerCase();
    subCategoryDatalist.innerHTML = ''; 
    const catMeta = cachedMetadata.find(m => m.category.toLowerCase() === selectedCategory);
    if (catMeta && catMeta.subCategories) {
      catMeta.subCategories.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        subCategoryDatalist.appendChild(option);
      });
    }
  });

  let currentSaveMode = 'website';
  let currentImageDataUrl = null;

  // Show Save Form
  document.getElementById('save-website-btn').addEventListener('click', () => {
    currentSaveMode = 'website';
    document.getElementById('url-group').classList.remove('hidden');
    document.getElementById('image-preview-group').classList.add('hidden');
    loggedInView.classList.add('hidden');
    saveFormView.classList.remove('hidden');

    withToken((token) => {
      fetchMetadataForDropdown(token);
    });

    // Auto-fill the URL of the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        saveUrlInput.value = tabs[0].url;
      }
    });
  });

  // Show Save Form for Video
  document.getElementById('create-video-btn').addEventListener('click', () => {
    currentSaveMode = 'video';
    document.getElementById('url-group').classList.remove('hidden');
    document.getElementById('image-preview-group').classList.add('hidden');
    loggedInView.classList.add('hidden');
    saveFormView.classList.remove('hidden');

    withToken((token) => {
      fetchMetadataForDropdown(token);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        saveUrlInput.value = tabs[0].url;
        
        // Auto-fill video title for YouTube
        if (tabs[0].url.includes('youtube.com/watch') || tabs[0].url.includes('youtu.be/') || tabs[0].url.includes('youtube.com/shorts/')) {
          let title = tabs[0].title;
          if (title.endsWith(' - YouTube')) {
            title = title.substring(0, title.length - 10);
          }
          document.getElementById('save-content').value = title;
        } else if (tabs[0].url.includes('instagram.com/')) {
          let title = tabs[0].title;
          if (title.endsWith(' - Instagram')) {
            title = title.substring(0, title.length - 12);
          }
          document.getElementById('save-content').value = title;
        }
      }
    });
  });

  // Cancel Save Form
  cancelSaveBtn.addEventListener('click', () => {
    saveFormView.classList.add('hidden');
    loggedInView.classList.remove('hidden');
    document.getElementById('save-category').value = "";
    document.getElementById('save-subcategory').value = "";
    document.getElementById('save-content').value = "";
  });

  // Submit Save Form
  submitSaveBtn.addEventListener('click', () => {
    const url = saveUrlInput.value;
    const categoryInput = document.getElementById('save-category');
    const category = categoryInput.value.trim();
    const subCategory = document.getElementById('save-subcategory').value.trim();
    const content = document.getElementById('save-content').value;

    if (!category) {
      categoryInput.focus();
      // Optional: Add a quick red flash to indicate error
      categoryInput.style.borderColor = "#ef4444";
      setTimeout(() => categoryInput.style.borderColor = "", 1500);
      return;
    }

    if (currentSaveMode === 'image' && !currentImageDataUrl) {
      showToast("Screenshot not ready yet!", true);
      return;
    }

    // Disable button to prevent double submission
    submitSaveBtn.disabled = true;
    submitSaveBtn.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite; margin-right: 6px; display: inline-block; vertical-align: middle;">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
      </svg>
      Saving...
    `;
    
    // Add keyframes if not exists
    if (!document.getElementById('spinner-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-style';
      style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }

    withToken((token) => {

      let endpoint = 'http://localhost:5000/api/websites/save';
      let payload = { url, category, subCategory, content };
      
      if (currentSaveMode === 'video') {
        payload.type = 'video';
      }

      if (currentSaveMode === 'image') {
        endpoint = 'http://localhost:5000/api/websites/save-media';
        payload.image = currentImageDataUrl;
      }

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        // Quick UI feedback before closing/resetting
        submitSaveBtn.textContent = "Saved!";
        submitSaveBtn.style.backgroundColor = "#22c55e"; // Success green
        
        setTimeout(() => {
          submitSaveBtn.textContent = "Save";
          submitSaveBtn.style.backgroundColor = "";
          submitSaveBtn.disabled = false;
          saveFormView.classList.add('hidden');
          loggedInView.classList.remove('hidden');
          categoryInput.value = "";
          document.getElementById('save-subcategory').value = "";
          document.getElementById('save-content').value = "";

          // Notify ALL open Synapse React tabs to refresh their categories
          chrome.tabs.query({ url: "*://localhost:5173/*" }, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { type: "REFRESH_CATEGORIES" });
            });
          });
        }, 1000);
      })
      .catch(error => {
        console.error('Error saving website:', error);
        submitSaveBtn.textContent = "Error!";
        submitSaveBtn.style.backgroundColor = "#ef4444"; // Error red
        
        setTimeout(() => {
          submitSaveBtn.textContent = "Save";
          submitSaveBtn.style.backgroundColor = "";
          submitSaveBtn.disabled = false;
        }, 2000);
      });
    });
  });

  document.getElementById('create-image-btn').addEventListener('click', () => {
    currentSaveMode = 'image';
    document.getElementById('url-group').classList.add('hidden');
    document.getElementById('image-preview-group').classList.remove('hidden');
    loggedInView.classList.add('hidden');
    saveFormView.classList.remove('hidden');

    withToken((token) => {
      fetchMetadataForDropdown(token);
    });

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        showToast("Failed to capture screen.", true);
        return;
      }
      currentImageDataUrl = dataUrl;
      document.getElementById('screenshot-preview').src = dataUrl;
    });
  });

});
