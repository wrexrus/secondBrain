document.addEventListener('DOMContentLoaded', () => {
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
      cachedMetadata = data;
    })
    .catch(err => console.error('Error fetching metadata for dropdown:', err));
  };

  const categoryInput = document.getElementById('save-category');
  const categoryDatalist = document.getElementById('category-options');
  const subCategoryInput = document.getElementById('save-subcategory');
  const subCategoryDatalist = document.getElementById('subcategory-options');

  categoryInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    categoryDatalist.innerHTML = ''; 
    
    if (val.length > 0) {
      cachedMetadata.forEach(meta => {
        if (meta.category.toLowerCase().startsWith(val)) {
          const option = document.createElement('option');
          option.value = meta.category;
          categoryDatalist.appendChild(option);
        }
      });
    }
  });

  subCategoryInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    subCategoryDatalist.innerHTML = ''; 
    
    if (val.length > 0 && categoryInput.value) {
      const catMeta = cachedMetadata.find(m => m.category.toLowerCase() === categoryInput.value.toLowerCase());
      if (catMeta && catMeta.subCategories) {
        catMeta.subCategories.forEach(sub => {
          if (sub.toLowerCase().startsWith(val)) {
            const option = document.createElement('option');
            option.value = sub;
            subCategoryDatalist.appendChild(option);
          }
        });
      }
    }
  });

  // Show Save Form
  document.getElementById('save-website-btn').addEventListener('click', () => {
    loggedInView.classList.add('hidden');
    saveFormView.classList.remove('hidden');

    chrome.storage.local.get(['token'], (result) => {
      if (result.token) {
        fetchMetadataForDropdown(result.token);
      }
    });

    // Auto-fill the URL of the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        saveUrlInput.value = tabs[0].url;
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

    console.log("Saving Website Data:", { url, category, subCategory, content });
    
    // Disable button to prevent double submission
    submitSaveBtn.disabled = true;
    submitSaveBtn.textContent = "Saving...";

    chrome.storage.local.get(['token'], (result) => {
      if (!result.token) return;

      fetch('http://localhost:5000/api/websites/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`
        },
        body: JSON.stringify({ url, category, subCategory, content })
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
    console.log("Create Image clicked");
    alert("Create Image clicked! (UI Only)");
  });

  document.getElementById('create-video-btn').addEventListener('click', () => {
    console.log("Create Video clicked");
    alert("Create Video clicked! (UI Only)");
  });
});
