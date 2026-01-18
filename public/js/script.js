document.addEventListener("DOMContentLoaded", () => {

  // ⚙️ CẤU HÌNH VIETNIX S3 - ĐÃ FIX
  const VIETNIX_S3_BASE = "https://s3.vn-hcm-1.vietnix.cloud/songs";

  /* ===============================
     ANIMATION LOGO
  =============================== */
  document.querySelectorAll(".logo123").forEach(logo => {
    const text = logo.textContent.trim();
    logo.textContent = "";

    [...text].forEach(ch => {
      const span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0" : ch;
      logo.appendChild(span);
    });

    const letters = logo.querySelectorAll("span");
    let i = 0;
    setInterval(() => {
      letters.forEach(s => {
        s.style.transform = "scale(1)";
        s.style.color = "red";
      });
      letters[i].style.transform = "scale(1.6)";
      letters[i].style.color = "orange";
      i = (i + 1) % letters.length;
    }, 300);
  });

  /* ===============================
     HOME – HIỂN THỊ PLAYLIST
  =============================== */
  const videosContainer = document.querySelector(".videos");

  if (videosContainer) {
    Promise.all([
      fetch("/data/playlists.json").then(r => r.json()),
      fetch("/data/songs.json").then(r => r.json())
    ])
    .then(([plData, songData]) => {
      videosContainer.innerHTML = "";

      plData.playlists.forEach(pl => {
        const playlistSongs =
          songData.playlists.find(p => p.id === pl.id)?.songs || [];

        const card = document.createElement("div");
        card.className = "video-card";
        card.innerHTML = `
          <img class="thumbnail" src="${pl.thumbnail}">
          <div class="video-info">
            <div class="title">${pl.title}</div>
            <div class="channel">${playlistSongs.length} bài hát</div>
          </div>
        `;

        card.onclick = () => {
          window.location.href = `/index?playlist=${pl.id}`;
        };

        videosContainer.appendChild(card);
      });
    })
    .catch(err => console.error("Lỗi load playlist:", err));
  }

  /* ===============================
     PLAYLIST PAGE - VIETNIX S3
  =============================== */
  const playlistEl = document.getElementById("playlist");
  const videoWrapper = document.getElementById("videoWrapper");
  const videoPlayer = document.getElementById("videoPlayer");
  const videoSrc = document.getElementById("videoSrc");

  if (!playlistEl) return;

  const params = new URLSearchParams(window.location.search);
  const playlistId = params.get("playlist");

  fetch("/data/songs.json")
    .then(r => r.json())
    .then(data => {
      const playlist = data.playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      renderPlaylist(playlist.songs);
      restoreLastSong();
    })
    .catch(err => {
      console.error("Lỗi load songs.json:", err);
      alert("Không thể tải danh sách bài hát");
    });

  function renderPlaylist(songs) {
    playlistEl.innerHTML = "";

    songs.forEach(song => {
      const id = `song-${playlistId}-${song.id}`;
      
      // ✅ Lấy tên file: "/video/QC.mp4" -> "QC.mp4"
      const fileName = song.videoUrl.split('/').pop();
      
      // ✅ Tạo URL Vietnix S3: https://s3.vn-hcm-1.vietnix.cloud/songs/QC.mp4
      const s3Url = `${VIETNIX_S3_BASE}/${fileName}`;

      playlistEl.insertAdjacentHTML("beforeend", `
        <input type="radio" name="track" id="${id}"
               data-video="${s3Url}"
               data-title="${song.title}">
        <label for="${id}" class="track">
          <img class="thumb" src="${song.thumbnail}">
          <div class="meta">
            <div class="title">${song.title}</div>
            <div class="artist">${song.author || ""}</div>
          </div>
        </label>
      `);
    });

    bindPlayerEvents();
  }

  function bindPlayerEvents() {
    document.querySelectorAll('input[name="track"]').forEach(input => {
      input.addEventListener("change", () => {
        loadAndPlayVideo(input);
      });
    });
  }

  function loadAndPlayVideo(input) {
    const videoUrl = input.dataset.video;
    const title = input.dataset.title;
    
    console.log(`📹 Loading: ${title}`);
    console.log(`🔗 URL: ${videoUrl}`);
    
    // ✅ Dừng video hiện tại trước khi load video mới
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoSrc.removeAttribute('src');
    
    videoWrapper.style.display = "block";
    videoPlayer.style.opacity = "0.5";
    
    // ✅ Đợi một chút để đảm bảo video cũ đã dừng hẳn
    setTimeout(() => {
      // ✅ Chỉ load metadata trước, video sẽ stream khi play
      videoPlayer.preload = "none"; // Thay đổi từ "metadata" thành "none"
      videoSrc.src = videoUrl;
      videoPlayer.load();
      
      // ✅ Hiển thị % loading
      let loadingText = document.createElement('div');
      loadingText.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-size:20px;background:rgba(0,0,0,0.7);padding:20px;border-radius:10px;';
      loadingText.textContent = 'Đang tải...';
      videoWrapper.appendChild(loadingText);
      
      // ✅ Theo dõi tiến trình tải
      videoPlayer.addEventListener('progress', function onProgress() {
        if (videoPlayer.buffered.length > 0) {
          const buffered = videoPlayer.buffered.end(0);
          const duration = videoPlayer.duration;
          const percent = Math.round((buffered / duration) * 100);
          loadingText.textContent = `Đang tải... ${percent}%`;
        }
      });
      
      // ✅ Ẩn loading khi có thể play
      videoPlayer.addEventListener('canplay', function onCanPlay() {
        if (loadingText && loadingText.parentNode) {
          loadingText.remove();
        }
      }, { once: true });
      
      // ✅ Chỉ play khi đã load xong metadata
      videoPlayer.addEventListener("loadedmetadata", function onMetadata() {
        console.log(`✅ Video ready: ${Math.round(videoPlayer.duration)}s`);
        videoPlayer.style.opacity = "1";
        
        // ✅ Play sau khi metadata đã sẵn sàng
        const playPromise = videoPlayer.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("▶️ Playing...");
              localStorage.setItem("currentSong", input.id);
            })
            .catch(err => {
              console.error("Play prevented:", err);
              if (err.name === "NotAllowedError") {
                console.log("ℹ️ Autoplay blocked - Click play button");
              }
            });
        }
        
        videoPlayer.removeEventListener("loadedmetadata", onMetadata);
      });
      
      videoPlayer.addEventListener("error", function onError(e) {
        console.error("❌ Video error:", e);
        
        let errorMsg = "Không thể tải video";
        if (videoPlayer.error) {
          switch(videoPlayer.error.code) {
            case 1: errorMsg = "Tải video bị hủy"; break;
            case 2: errorMsg = "Lỗi mạng khi tải video"; break;
            case 3: errorMsg = "Video bị lỗi hoặc không hỗ trợ"; break;
            case 4: errorMsg = "Video không tồn tại hoặc bị chặn (CORS)"; break;
          }
        }
        
        alert(`${errorMsg}\n\nURL: ${videoUrl}\n\nKiểm tra Console (F12) để biết chi tiết`);
        
        videoPlayer.style.opacity = "1";
        videoPlayer.removeEventListener("error", onError);
      }, { once: true });
      
    }, 100); // Đợi 100ms để đảm bảo video cũ đã clear
  }

  function restoreLastSong() {
    const saved = localStorage.getItem("currentSong");
    if (!saved) return;

    const input = document.getElementById(saved);
    if (input) {
      input.checked = true;
      console.log("💾 Restored last song");
    }
  }

  /* ===============================
     HOME BUTTON
  =============================== */
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "/home";
    });
  }

  // ✅ PRECONNECT để tăng tốc load
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = "https://s3.vn-hcm-1.vietnix.cloud";
  document.head.appendChild(link);

});