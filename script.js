const uploadSection = document.getElementById('uploadSection');
const gallerySection = document.getElementById('gallerySection');
const gallery = document.getElementById('gallery');
const clock = document.getElementById('clock');

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('de-DE');
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

function isWunschzeit() {
  const now = new Date();
  return now.getHours() === now.getMinutes();
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
    statusText.textContent = "Warten auf eine Wunschzeit wie 11:11, 22:22...";
    uploadSection.style.display = 'block';
  }

  if (photos.length > 0) {
    gallerySection.style.display = 'block';
    showGallery();
  }
}

function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file || !isWunschzeit()) {
    alert("Nur zu einer Wunschzeit kannst du ein Foto posten!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const now = new Date();
    const entry = {
      src: dataUrl,
      time: now.toLocaleTimeString('de-DE'),
      timestamp: now.getTime()
    };

    const photos = getPhotos();
    photos.push(entry);
    localStorage.setItem("wunsch_photos", JSON.stringify(photos));
    showGallery();
  };
  reader.readAsDataURL(file);
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