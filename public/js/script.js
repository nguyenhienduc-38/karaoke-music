document.addEventListener("DOMContentLoaded", () => {

  const VIETNIX_S3_BASE = "https://s3.vn-hcm-1.vietnix.cloud/songs";
  const VIETNIX_S3_DANCE = "https://s3.vn-hcm-1.vietnix.cloud/dance";
  const VIETNIX_S3_TUTORIAL = "https://s3.vn-hcm-1.vietnix.cloud/dancetutorial";

  /* ===============================
     MOBILE MENU TOGGLE
  =============================== */
  const menuToggle = document.getElementById('menuToggle');
  const sidebarMenu = document.getElementById('sidebarMenu');

  if (menuToggle && sidebarMenu) {
    menuToggle.addEventListener('click', () => {
      sidebarMenu.classList.toggle('active');
    });

    sidebarMenu.addEventListener('click', (e) => {
      if (e.target === sidebarMenu && window.innerWidth <= 900) {
        sidebarMenu.classList.remove('active');
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.name === 'track' && window.innerWidth <= 900) {
        setTimeout(() => {
          sidebarMenu.classList.remove('active');
        }, 300);
      }
    });
  }

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
     HOME PAGE - HIỂN THỊ 4 CATEGORIES
  =============================== */
  const categoriesContainer = document.querySelector(".categories-container");

  if (categoriesContainer) {
    categoriesContainer.innerHTML = '<div class="loading">Đang tải danh mục...</div>';

    fetch("/data/categories.json")
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log("✅ Categories loaded:", data);
        if (!data.categories || !Array.isArray(data.categories)) {
          throw new Error("Invalid data format");
        }
        renderCategories(data.categories);
      })
      .catch(error => {
        console.error("❌ Lỗi load categories:", error);
        categoriesContainer.innerHTML = `
          <div class="loading" style="color: #ff4444;">
            ⚠️ Không thể tải danh mục<br>
            <span style="font-size: 14px; opacity: 0.8;">${error.message}</span>
          </div>
        `;
      });
  }

  function renderCategories(categories) {
    categoriesContainer.innerHTML = "";

    categories.forEach(category => {
      const card = document.createElement("div");
      card.className = "category-card";
      
      card.innerHTML = `
        <img class="category-thumbnail" src="${category.thumbnail}" alt="${category.title}">
        <div class="category-info">
          <div class="category-title">${category.title}</div>
        </div>
      `;

      card.onclick = () => {
        console.log(`📂 Clicked: ${category.id} (${category.type})`);
        
        if (category.id === 'nhac-kara') {
          // Chuyển đến trang music-k.html để chọn playlist
          console.log(`→ Redirecting to: /karaokemusic`);
          window.location.href = '/karaokemusic';
        } else if (category.type === 'page') {
          // Chuyển đến trang đặc biệt
          console.log(`→ Redirecting to: ${category.page}`);
          window.location.href = category.page;
        }
      };

      categoriesContainer.appendChild(card);
    });

    console.log(`✅ Rendered ${categories.length} categories`);
  }

  /* ===============================
     MUSIC-K.HTML - HIỂN THỊ PLAYLISTS
  =============================== */
  const videosContainer = document.querySelector(".videos");

  if (videosContainer) {
    console.log("📂 Loading playlists for music-k page...");

    fetch("/data/playlists.json")
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log("✅ Playlists loaded:", data);
        if (!data.playlists || !Array.isArray(data.playlists)) {
          throw new Error("Invalid playlists data format");
        }
        renderPlaylists(data.playlists);
      })
      .catch(error => {
        console.error("❌ Lỗi load playlists:", error);
        videosContainer.innerHTML = `
          <div style="color: #ff4444; padding: 20px; text-align: center; grid-column: 1/-1;">
            ⚠️ Không thể tải danh sách playlist<br>
            <span style="font-size: 12px; opacity: 0.8;">${error.message}</span>
          </div>
        `;
      });
  }

  function renderPlaylists(playlists) {
    videosContainer.innerHTML = "";

    playlists.forEach(playlist => {
      const card = document.createElement("div");
      card.className = "video-card";
      
      card.innerHTML = `
        <img class="thumbnail" src="${playlist.thumbnail}" alt="${playlist.title}">
        <div class="video-info">
          <div class="title">${playlist.title}</div>
          <div class="channel">Playlist</div>
        </div>
      `;

      card.onclick = () => {
        console.log(`📋 Selected playlist: ${playlist.id}`);
        // Chuyển đến trang karaoke với playlist ID
        window.location.href = `/karaoke?playlist=${playlist.id}`;
      };

      videosContainer.appendChild(card);
    });

    console.log(`✅ Rendered ${playlists.length} playlists`);
  }

  /* ===============================
     KARAOKE-TT.HTML - TẢI SONGS TỪ PLAYLIST
  =============================== */
  const playlistEl = document.getElementById("playlist");
  const videoWrapper = document.getElementById("videoWrapper");
  const videoPlayer = document.getElementById("videoPlayer");
  const videoSrc = document.getElementById("videoSrc");

  if (playlistEl) {
    const params = new URLSearchParams(window.location.search);
    const playlistId = params.get("playlist");

    if (!playlistId) {
      console.warn("⚠️ No playlist ID in URL");
      playlistEl.innerHTML = `
        <div style="color: #ff4444; padding: 20px; text-align: center;">
          ⚠️ Không có playlist được chọn
        </div>
      `;
      return;
    }

    console.log(`📂 Loading playlist: ${playlistId}`);

    fetch("/data/songs.json")
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const playlist = data.playlists.find(p => p.id === playlistId);
        
        if (!playlist) {
          throw new Error(`Playlist not found: ${playlistId}`);
        }

        console.log(`✅ Playlist found: ${playlist.title}`);
        console.log(`🎵 Songs count: ${playlist.songs.length}`);

        renderPlaylist(playlist.songs);
        restoreLastSong();
      })
      .catch(error => {
        console.error("❌ Error loading playlist songs:", error);
        playlistEl.innerHTML = `
          <div style="color: #ff4444; padding: 20px; text-align: center;">
            ⚠️ Không thể tải danh sách bài hát<br>
            <span style="font-size: 12px;">${error.message}</span>
          </div>
        `;
      });
  }

  function renderPlaylist(songs) {
    playlistEl.innerHTML = "";

    songs.forEach((song, index) => {
      const uniqueId = `song-${song.id}`;

      const fileName = song.videoUrl.split('/').pop();
      const s3Url = `${VIETNIX_S3_BASE}/${fileName}`;

      playlistEl.insertAdjacentHTML("beforeend", `
        <input type="radio" name="track" id="${uniqueId}"
               data-video="${s3Url}"
               data-title="${song.title}"
               ${index === 0 ? 'checked' : ''}>
        <label for="${uniqueId}" class="track">
          <img class="thumb" src="${song.thumbnail}">
          <div class="meta">
            <div class="title">${song.title}</div>
            <div class="artist">${song.author || ""}</div>
          </div>
        </label>
      `);
    });

    console.log(`✅ Rendered ${songs.length} songs`);
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

    // Lưu lựa chọn hiện tại
    localStorage.setItem("currentSong", input.id);

    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoSrc.removeAttribute('src');

    setTimeout(() => {
      videoWrapper.style.display = "flex";
      
      // Thêm loading indicator
      videoPlayer.style.opacity = "0.5";
      const loadingText = document.createElement('div');
      loadingText.textContent = 'Đang tải video...';
      loadingText.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #d4af37;
        font-size: 18px;
        font-weight: 700;
        text-align: center;
        z-index: 1000;
        background: rgba(0,0,0,0.8);
        padding: 20px 40px;
        border-radius: 10px;
        border: 2px solid #d4af37;
      `;
      videoWrapper.appendChild(loadingText);

      videoSrc.src = videoUrl;
      videoPlayer.load();

      videoPlayer.addEventListener("loadedmetadata", function onLoad() {
        console.log(`✅ Video loaded: ${title} - Ready to play`);
        videoPlayer.style.opacity = "1";
        if (loadingText && loadingText.parentNode) {
          loadingText.remove();
        }
        
        // Auto play
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("▶️ Playing..."))
            .catch(err => console.warn("⚠️ Autoplay blocked:", err));
        }
        
        videoPlayer.removeEventListener("loadedmetadata", onLoad);
      });

      videoPlayer.addEventListener("error", function onError(e) {
        console.error("❌ Video error:", e);
        
        let errorMsg = "Không thể tải video";
        
        if (videoPlayer.error) {
          switch(videoPlayer.error.code) {
            case 1: errorMsg = "Video tải bị hủy"; break;
            case 2: errorMsg = "Lỗi mạng khi tải video"; break;
            case 3: errorMsg = "Video bị lỗi hoặc không hỗ trợ"; break;
            case 4: errorMsg = "Video không tồn tại hoặc bị chặn (CORS)"; break;
          }
        }

        alert(`${errorMsg}\n\nURL: ${videoUrl}\n\nKiểm tra Console (F12) để biết chi tiết`);
        videoPlayer.style.opacity = "1";
        if (loadingText && loadingText.parentNode) {
          loadingText.remove();
        }
        videoPlayer.removeEventListener("error", onError);
      }, { once: true });

    }, 100);
  }

  function restoreLastSong() {
    const saved = localStorage.getItem("currentSong");
    if (!saved) return;

    const input = document.getElementById(saved);
    if (input) {
      input.checked = true;
      console.log("💾 Restored last song");

      const videoUrl = input.dataset.video;
      const title = input.dataset.title;

      console.log(`📹 Restoring: ${title}`);

      videoWrapper.style.display = "flex";
      videoSrc.src = videoUrl;
      videoPlayer.load();

      videoPlayer.addEventListener("loadedmetadata", function onRestore() {
        console.log(`✅ Video restored: ${title} - Ready to play`);
        videoPlayer.removeEventListener("loadedmetadata", onRestore);
      });
    }
  }

  /* ===============================
     DANCE.HTML - TẢI DANCE DATA
  =============================== */
  const danceList = document.getElementById("danceList");

  if (danceList) {
    console.log("📂 Loading dance.json...");
    
    fetch("/data/dance.json")
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log("✅ Dance data loaded:", data);
        if (!data.dance || !Array.isArray(data.dance)) {
          throw new Error("Invalid dance data format");
        }
        renderDanceList(data.dance);
      })
      .catch(error => {
        console.error("❌ Lỗi load dance.json:", error);
        danceList.innerHTML = `
          <div style="color: #ff4444; padding: 20px; text-align: center;">
            ⚠️ Không thể tải danh sách vũ điệu<br>
            <span style="font-size: 12px; opacity: 0.8;">${error.message}</span>
          </div>
        `;
      });
  }

  function renderDanceList(dances) {
    danceList.innerHTML = "";

    dances.forEach((dance, index) => {
      const id = `dance-${dance.id}`;

      // Sử dụng S3 DANCE bucket
      let videoUrl = '';
      if (dance.videoUrl) {
        videoUrl = `${VIETNIX_S3_DANCE}/${dance.videoUrl}`;
      }

      danceList.insertAdjacentHTML("beforeend", `
        <input type="radio" name="track" id="${id}"
               data-video="${videoUrl}"
               data-title="${dance.title}"
               ${index === 0 ? 'checked' : ''}>
        <label for="${id}" class="track">
          <img class="thumb" src="${dance.thumbnail}">
          <div class="meta">
            <div class="title">${dance.title}</div>
          </div>
        </label>
      `);
    });

    console.log(`✅ Rendered ${dances.length} dance items`);
    bindPlayerEvents();
  }

  /* ===============================
     DANCE-TUTORIAL.HTML - TẢI TUTORIAL DATA  
  =============================== */
  // Sử dụng danceList vì cả 2 trang có cùng ID
  if (window.location.pathname.includes('dance-tutorial') && danceList) {
    console.log("📂 Loading dance-tutorial.json...");
    
    fetch("/data/dance-tutorial.json")
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log("✅ Dance tutorial data loaded:", data);
        if (!data["dance-tutorial"] || !Array.isArray(data["dance-tutorial"])) {
          throw new Error("Invalid dance-tutorial data format");
        }
        renderTutorialList(data["dance-tutorial"]);
      })
      .catch(error => {
        console.error("❌ Lỗi load dance-tutorial.json:", error);
        danceList.innerHTML = `
          <div style="color: #ff4444; padding: 20px; text-align: center;">
            ⚠️ Không thể tải danh sách hướng dẫn<br>
            <span style="font-size: 12px; opacity: 0.8;">${error.message}</span>
          </div>
        `;
      });
  }

  function renderTutorialList(tutorials) {
    danceList.innerHTML = "";

    tutorials.forEach((tutorial, index) => {
      const id = `tutorial-${tutorial.id}`;

      // Sử dụng S3 TUTORIAL bucket
      let videoUrl = '';
      if (tutorial.videoUrl) {
        videoUrl = `${VIETNIX_S3_TUTORIAL}/${tutorial.videoUrl}`;
      }

      danceList.insertAdjacentHTML("beforeend", `
        <input type="radio" name="track" id="${id}"
               data-video="${videoUrl}"
               data-title="${tutorial.title}"
               ${index === 0 ? 'checked' : ''}>
        <label for="${id}" class="track">
          <img class="thumb" src="${tutorial.thumbnail}">
          <div class="meta">
            <div class="title">${tutorial.title}</div>
          </div>
        </label>
      `);
    });

    console.log(`✅ Rendered ${tutorials.length} tutorial items`);
    bindPlayerEvents();
  }

  /* ===============================
     HOME BUTTON - TRỞ VỀ TRANG CHỦ
  =============================== */
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      console.log("🏠 Going home...");
      window.location.href = "/index";
    });
  }

  /* ===============================
     PRECONNECT TO S3
  =============================== */
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = "https://s3.vn-hcm-1.vietnix.cloud";
  document.head.appendChild(link);

  /* ===============================
     ERROR HANDLING FOR IMAGES
  =============================== */
  document.addEventListener("error", (e) => {
    if (e.target.tagName === "IMG") {
      console.error("❌ Failed to load image:", e.target.src);
      e.target.style.background = "linear-gradient(145deg, #1e3a1e 0%, #152815 100%)";
    }
  }, true);

});