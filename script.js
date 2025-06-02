const uploadSection = document.getElementById('uploadSection');
const gallerySection = document.getElementById('gallerySection');
const gallery = document.getElementById('gallery');
const clock = document.getElementById('clock');

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  checkTimeAndShow();
}
setInterval(updateClock, 1000);

function saveName() {
  const name = document.getElementById('username').value.trim();
  if (name) {
    localStorage.setItem('wish_name', name);
    document.getElementById('nameInputContainer').style.display = 'none';
    checkTimeAndShow();
  }
}

function isWunschzeit() {
  return true;
}

function checkTimeAndShow() {
  const name = localStorage.getItem('wish_name');
  if (!name) return;

  const statusText = document.getElementById('uploadStatus');
  const photos = getPhotos();

  if (isWishTime()) {
    statusText.textContent = "It's wish time – take a photo now!";
    uploadSection.style.display = 'block';
  } else {
    statusText.textContent = "Waiting for a wish time like 11:11 or 22:22...";
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

  if (!isWishTime()) {
    alert("You can only post at a wish time!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      requestAnimationFrame(() => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // flip horizontally
        ctx.drawImage(img, 0, 0);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const now = new Date();
          const entry = {
            src: dataUrl,
            time: now.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            timestamp: now.getTime()
          };

          const photos = getPhotos();
          photos.push(entry);
          localStorage.setItem("wish_photos", JSON.stringify(photos));
          showGallery();
        } catch (err) {
          alert("Something went wrong with the image.");
          console.error(err);
        }
      });
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
  event.target.value = ""; // reset
}

function getPhotos() {
  const photos = JSON.parse(localStorage.getItem("wish_photos") || "[]");
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const filtered = photos.filter((p) => now - p.timestamp < day);
  localStorage.setItem("wish_photos", JSON.stringify(filtered));
  return filtered;
}

function showGallery() {
  const photos = getPhotos();
  gallery.innerHTML = "";
  photos.forEach((p) => {
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
  const name = localStorage.getItem('wish_name');
  if (name) {
    document.getElementById('nameInputContainer').style.display = 'none';
    checkTimeAndShow();
  }
};