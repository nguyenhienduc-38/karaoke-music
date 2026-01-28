document.addEventListener("DOMContentLoaded", () => {

  const VIETNIX_S3_BASE = "https://s3.vn-hcm-1.vietnix.cloud/songs";
  const VIETNIX_S3_DANCE = "https://s3.vn-hcm-1.vietnix.cloud/dance";
  const VIETNIX_S3_TUTORIAL = "https://s3.vn-hcm-1.vietnix.cloud/dancetutorial";
  const VIETNIX_S3_MUSIC = "https://s3.vn-hcm-1.vietnix.cloud/music";

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
     ANIMATION LOGO - DISABLED (Để giảm lag)
  =============================== */
  // Animation đã được tắt để tối ưu performance

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
          console.log(`→ Redirecting to: /karaokemusic`);
          window.location.href = '/karaokemusic';
        } else if (category.id === 'nhac-tt') {
          console.log(`→ Redirecting to: /music`);
          window.location.href = '/music';
        } else if (category.type === 'page' || category.page) {
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

  if (videosContainer && window.location.pathname === '/karaokemusic') {
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
        window.location.href = `/karaoke?playlist=${playlist.id}`;
      };

      videosContainer.appendChild(card);
    });

    console.log(`✅ Rendered ${playlists.length} playlists`);
  }

  /* ===============================
     MUSIC.HTML - HIỂN THỊ PLAYLISTS NHẠC CÓ LỜI
  =============================== */
  if (videosContainer && window.location.pathname === '/music' && !window.location.search) {
    console.log("📂 Loading music playlists for music page...");

    fetch("/data/playlists-music.json")
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log("✅ Music playlists loaded:", data);
        if (!data.playlists || !Array.isArray(data.playlists)) {
          throw new Error("Invalid music playlists data format");
        }
        renderMusicPlaylists(data.playlists);
      })
      .catch(error => {
        console.error("❌ Lỗi load playlists-music.json:", error);
        videosContainer.innerHTML = `
          <div style="color: #ff4444; padding: 20px; text-align: center; grid-column: 1/-1;">
            ⚠️ Không thể tải danh sách playlist nhạc có lời<br>
            <span style="font-size: 12px; opacity: 0.8;">${error.message}</span>
          </div>
        `;
      });
  }

  function renderMusicPlaylists(playlists) {
    videosContainer.innerHTML = "";

    playlists.forEach(playlist => {
      const card = document.createElement("div");
      card.className = "video-card";
      
      card.innerHTML = `
        <img class="thumbnail" src="${playlist.thumbnail}" alt="${playlist.title}">
        <div class="video-info">
          <div class="title">${playlist.title}</div>
          <div class="channel">♪ Playlist</div>
        </div>
      `;

      card.onclick = () => {
        console.log(`🎵 Selected music playlist: ${playlist.id}`);
        window.location.href = `/musicplayer?playlist=${playlist.id}`;
      };

      videosContainer.appendChild(card);
    });

    console.log(`✅ Rendered ${playlists.length} music playlists`);
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
    } else {
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
  }

  function renderPlaylist(songs) {
    playlistEl.innerHTML = "";

    songs.forEach((song, index) => {
      const uniqueId = `song-${song.id}`;

      const fileName = song.videoUrl.split('/').pop();
      const videoUrl = `${VIETNIX_S3_BASE}/${fileName}`;

      playlistEl.insertAdjacentHTML("beforeend", `
        <input type="radio" name="track" id="${uniqueId}"
               data-video="${videoUrl}"
               data-title="${song.title}"
               ${index === 0 ? 'checked' : ''}>
        <label for="${uniqueId}" class="track">
          <img class="thumb" src="${song.thumbnail}">
          <div class="meta">
            <div class="title">${song.title}</div>
            <div class="artist">${song.author}</div>
          </div>
        </label>
      `);
    });

    console.log(`✅ Rendered ${songs.length} songs`);
    bindPlayerEvents();
  }

  function bindPlayerEvents() {
    document.querySelectorAll('input[name="track"]').forEach(input => {
      input.addEventListener("change", function () {
        if (this.checked) {
          const title = this.dataset.title;
          const videoUrl = this.dataset.video;

          console.log(`🎵 Selected: ${title}`);
          console.log(`📹 URL: ${videoUrl}`);

          localStorage.setItem("currentSong", this.id);
          loadAndPlayVideo(title, videoUrl);
        }
      });
    });

    const firstTrack = document.querySelector('input[name="track"]:checked');
    if (firstTrack) {
      const title = firstTrack.dataset.title;
      const videoUrl = firstTrack.dataset.video;
      console.log(`🎵 Auto-loading first track: ${title}`);
      loadAndPlayVideo(title, videoUrl);
    }
  }

  function loadAndPlayVideo(title, videoUrl) {
    console.log(`📺 Loading video: ${title}`);
    videoWrapper.style.display = "flex";
    videoPlayer.style.opacity = "0.5";

    setTimeout(() => {
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
     MUSICQD.HTML - TẢI MUSIC PLAYER
  =============================== */
  const musicPlaylist = document.getElementById("musicPlaylist");
  
  if (musicPlaylist) {
    const params = new URLSearchParams(window.location.search);
    const playlistId = params.get("playlist");

    if (!playlistId) {
      console.warn("⚠️ No playlist ID in URL");
      musicPlaylist.innerHTML = `
        <div style="color: #ff4444; padding: 20px; text-align: center;">
          ⚠️ Không có playlist được chọn
        </div>
      `;
    } else {
      console.log(`📂 Loading music playlist: ${playlistId}`);

      fetch("/data/songs-music.json")
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          const playlist = data.playlists.find(p => p.id === playlistId);
          
          if (!playlist) {
            throw new Error(`Playlist not found: ${playlistId}`);
          }

          console.log(`✅ Music playlist found: ${playlist.title}`);
          console.log(`🎵 Songs count: ${playlist.songs.length}`);

          renderMusicPlaylist(playlist.songs);
          restoreLastMusic();
        })
        .catch(error => {
          console.error("❌ Error loading music playlist:", error);
          musicPlaylist.innerHTML = `
            <div style="color: #ff4444; padding: 20px; text-align: center;">
              ⚠️ Không thể tải danh sách bài hát<br>
              <span style="font-size: 12px;">${error.message}</span>
            </div>
          `;
        });
    }
  }

  function renderMusicPlaylist(songs) {
    musicPlaylist.innerHTML = "";

    songs.forEach((song, index) => {
      const uniqueId = `music-${song.id}`;
      const fileName = song.videoUrl.split('/').pop();
      const videoUrl = `${VIETNIX_S3_MUSIC}/${fileName}`;
      
      const isFirst = index === 0;

      musicPlaylist.insertAdjacentHTML("beforeend", `
        <input type="radio" name="track" id="${uniqueId}"
               data-video="${videoUrl}"
               data-title="${song.title}"
               ${isFirst ? 'checked' : ''}>
        <label for="${uniqueId}" class="track">
          <img class="thumb" src="${song.thumbnail}">
          <div class="meta">
            <div class="title">${song.title}</div>
            <div class="artist">${song.author}</div>
          </div>
        </label>
      `);
    });

    console.log(`✅ Rendered ${songs.length} music items`);
    bindPlayerEvents();
  }

  function restoreLastMusic() {
    const saved = localStorage.getItem("currentMusic");
    if (!saved) return;

    const input = document.getElementById(saved);
    if (input) {
      input.checked = true;
      console.log("💾 Restored last music");

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

  if (danceList && !window.location.pathname.includes('dance-tutorial')) {
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
     HOME/BACK BUTTON
  =============================== */
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    const currentPath = window.location.pathname;
    
    // Các trang player thì nút home thành nút back
    if (currentPath === '/karaoke' || currentPath === '/musicplayer' || 
        currentPath === '/dance-tutorial') {
      
      // Thay đổi icon và text thành Back
      const icon = homeBtn.querySelector('i');
      const text = homeBtn.querySelector('.btn-text');
      if (icon) icon.className = 'fas fa-arrow-left';
      if (text) text.textContent = 'Quay lại';
      
      // Click thì quay về trang trước
      homeBtn.addEventListener("click", () => {
        console.log("⬅️ Going back...");
        window.history.back();
      });
    } else {
      // Các trang khác giữ nguyên về home
      homeBtn.addEventListener("click", () => {
        console.log("🏠 Going home...");
        window.location.href = "/index";
      });
    }
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