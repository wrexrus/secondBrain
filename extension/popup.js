document.addEventListener('DOMContentLoaded', () => {
  const createSaveBtn = document.getElementById('create-save-btn');
  const subOptions = document.getElementById('sub-options');
  const chevron = createSaveBtn.querySelector('.chevron');

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
