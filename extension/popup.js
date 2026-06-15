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

  // Check auth state
  chrome.storage.local.get(['token', 'user'], (result) => {
    if (result.token) {
      loggedInView.classList.remove('hidden');
      loggedOutView.classList.add('hidden');
      
      profileIcon.classList.add('active');
      loggedInText.textContent = getInitials(result.user?.name);
      loggedInText.classList.remove('hidden');
      loggedOutIcon.classList.add('hidden');
    } else {
      loggedOutView.classList.remove('hidden');
      loggedInView.classList.add('hidden');
      
      profileIcon.classList.remove('active');
      loggedOutIcon.classList.remove('hidden');
      loggedInText.classList.add('hidden');
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

  // Mock UI events
  document.getElementById('save-website-btn').addEventListener('click', () => {
    console.log("Saving Website...");
    alert("Save Website clicked! (UI Only)");
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
