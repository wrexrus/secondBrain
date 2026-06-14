document.addEventListener('DOMContentLoaded', () => {
  const createSaveBtn = document.getElementById('create-save-btn');
  const subOptions = document.getElementById('sub-options');
  const chevron = createSaveBtn.querySelector('.chevron');
  const loggedInView = document.getElementById('logged-in-view');
  const loggedOutView = document.getElementById('logged-out-view');

  // Check auth state
  chrome.storage.local.get(['token'], (result) => {
    if (result.token) {
      loggedInView.classList.remove('hidden');
      loggedOutView.classList.add('hidden');
    } else {
      loggedOutView.classList.remove('hidden');
      loggedInView.classList.add('hidden');
    }
  });

  // Login button click
  document.getElementById('open-login-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/login' });
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
