const uploadSection = document.getElementById('uploadSection');
const gallerySection = document.getElementById('gallerySection');
const gallery = document.getElementById('gallery');
const clock = document.getElementById('clock');

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  checkTimeAndShow();
}
setInterval(updateClock, 1000);

function saveName() {
  const name = document.getElementById('username').value.trim();
  if (name) {
    localStorage.setItem('wunsch_name', name);
    document.getElementById('nameInputContainer').style.display = 'none';
    checkTimeAndShow();
  }
}

// Für Tests: immer true (Upload jederzeit erlaubt)
function isWunschzeit() {
  return true;
}

function checkTimeAndShow() {
  const name = localStorage.getItem('wunsch_name');
  if (!name) return;

  const statusText = document.getElementById('uploadStatus');
  const photos = getPhotos();

  if (isWunschzeit()) {
    statusText.textContent = "Jetzt ist Wunschzeit – mach ein Bild!";
    uploadSection.style.display = 'block';
  } else {
    statusText.textContent = "Warten auf eine Wunschzeit wie 10:10, 11:11, 22:22...";
    uploadSection.style.display = 'block';
  }

  if (photos.length > 0) {
    gallerySection.style.display = 'block';
    showGallery();
  } else {
    gallerySection.style.display = 'none';
  }
}

function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!isWunschzeit()) {
    alert("Nur zu Wunschzeiten kannst du ein Foto posten!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Canvas zum Spiegeln horizontal
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);

      const mirroredDataUrl = canvas.toDataURL('image/png');

      const now = new Date();
      const entry = {
        src: mirroredDataUrl,
        time: now.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'}),
        timestamp: now.getTime()
      };

      const photos = getPhotos();
      photos.push(entry);
      localStorage.setItem("wunsch_photos", JSON.stringify(photos));
      showGallery();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  event.target.value = "";
}

function getPhotos() {
  const photos = JSON.parse(localStorage.getItem("wunsch_photos") || "[]");
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const filtered = photos.filter(p => now - p.timestamp < day);
  localStorage.setItem("wunsch_photos", JSON.stringify(filtered));
  return filtered;
}

function showGallery() {
  const photos = getPhotos();
  gallery.innerHTML = "";
  photos.forEach(p => {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item";

    const img = document.createElement("img");
    img.src = p.src;

    const stamp = document.createElement("div");
    stamp.className = "timestamp";
    stamp.textContent = p.time;

    wrapper.appendChild(img);
    wrapper.appendChild(stamp);
    gallery.appendChild(wrapper);
  });
}

window.onload = () => {
  const name = localStorage.getItem('wunsch_name');
  if (name) {
    document.getElementById('nameInputContainer').style.display = 'none';
    checkTimeAndShow();
  }
};