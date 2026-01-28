const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'views');

// Serve static files
app.use(express.static(PUBLIC_DIR));

// Root redirect to index
app.get('/', (req, res) => {
  res.redirect('/index');
});

// Homepage - hiển thị 4 categories
app.get('/index', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'index.html'));
});

// Trang karaoke lựa chọn playlist
app.get('/karaokemusic', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'music-k.html'));
});

// Trang karaoke player
app.get('/karaoke', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'karaoke-tt.html'));
});

// Trang nhạc có lời - chọn playlist (giống karaokemusic)
app.get('/music', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'music.html'));
});

// Trang player nhạc có lời (giống karaoke player)
app.get('/musicplayer', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'musicqd.html'));
});

// Trang vũ điệu
app.get('/dance', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'dance.html'));
});

// Trang hướng dẫn vũ điệu
app.get('/dance-tutorial', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'dance-tutorial.html'));
});

/* ===== STREAM VIDEO FROM VIETNIX S3 - KARAOKE ===== */
app.get('/video/:filename', async (req, res) => {
  try {
    const file = req.params.filename;
    const url = `https://s3.vn-hcm-1.vietnix.cloud/songs/${file}`;
    const range = req.headers.range;

    const headers = {};
    if (range) headers.Range = range;

    const upstream = await fetch(url, { headers });

    res.status(upstream.status);

    const h = {
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline'
    };

    if (upstream.headers.get('content-type')) h['Content-Type'] = upstream.headers.get('content-type');
    if (upstream.headers.get('content-length')) h['Content-Length'] = upstream.headers.get('content-length');
    if (upstream.headers.get('content-range')) h['Content-Range'] = upstream.headers.get('content-range');

    res.set(h);
    upstream.body.pipe(res);
  } catch (err) {
    console.error('Stream error:', err);
    res.sendStatus(500);
  }
});

/* ===== STREAM VIDEO FROM VIETNIX S3 - MUSIC (CÓ LỜI) ===== */
app.get('/music-video/:filename', async (req, res) => {
  try {
    const file = req.params.filename;
    const url = `https://s3.vn-hcm-1.vietnix.cloud/music/${file}`;
    const range = req.headers.range;

    const headers = {};
    if (range) headers.Range = range;

    const upstream = await fetch(url, { headers });

    res.status(upstream.status);

    const h = {
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline'
    };

    if (upstream.headers.get('content-type')) h['Content-Type'] = upstream.headers.get('content-type');
    if (upstream.headers.get('content-length')) h['Content-Length'] = upstream.headers.get('content-length');
    if (upstream.headers.get('content-range')) h['Content-Range'] = upstream.headers.get('content-range');

    res.set(h);
    upstream.body.pipe(res);
  } catch (err) {
    console.error('Stream error:', err);
    res.sendStatus(500);
  }
});

/* ===== STREAM VIDEO FROM VIETNIX S3 - DANCE ===== */
app.get('/dance-video/:filename', async (req, res) => {
  try {
    const file = req.params.filename;
    const url = `https://s3.vn-hcm-1.vietnix.cloud/dance/${file}`;
    const range = req.headers.range;

    const headers = {};
    if (range) headers.Range = range;

    const upstream = await fetch(url, { headers });

    res.status(upstream.status);

    const h = {
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline'
    };

    if (upstream.headers.get('content-type')) h['Content-Type'] = upstream.headers.get('content-type');
    if (upstream.headers.get('content-length')) h['Content-Length'] = upstream.headers.get('content-length');
    if (upstream.headers.get('content-range')) h['Content-Range'] = upstream.headers.get('content-range');

    res.set(h);
    upstream.body.pipe(res);
  } catch (err) {
    console.error('Stream error:', err);
    res.sendStatus(500);
  }
});

/* ===== STREAM VIDEO FROM VIETNIX S3 - DANCE TUTORIAL ===== */
app.get('/tutorial-video/:filename', async (req, res) => {
  try {
    const file = req.params.filename;
    const url = `https://s3.vn-hcm-1.vietnix.cloud/dancetutorial/${file}`;
    const range = req.headers.range;

    const headers = {};
    if (range) headers.Range = range;

    const upstream = await fetch(url, { headers });

    res.status(upstream.status);

    const h = {
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline'
    };

    if (upstream.headers.get('content-type')) h['Content-Type'] = upstream.headers.get('content-type');
    if (upstream.headers.get('content-length')) h['Content-Length'] = upstream.headers.get('content-length');
    if (upstream.headers.get('content-range')) h['Content-Range'] = upstream.headers.get('content-range');

    res.set(h);
    upstream.body.pipe(res);
  } catch (err) {
    console.error('Stream error:', err);
    res.sendStatus(500);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  ✅ Server running on port ${PORT}                       ║
╠════════════════════════════════════════════════════════╣
║  📂 PAGE ROUTES:                                       ║
║  • GET /              → redirect to /index             ║
║  • GET /index         → Homepage (4 categories)        ║
║                                                        ║
║  🎤 KARAOKE ROUTES:                                    ║
║  • GET /karaokemusic  → Karaoke playlist selection     ║
║  • GET /karaoke       → Karaoke player                 ║
║                         ?playlist={id}                 ║
║                                                        ║
║  🎵 MUSIC ROUTES (CÓ LỜI):                             ║
║  • GET /music         → Music playlist selection       ║
║  • GET /musicplayer   → Music player                   ║
║                         ?playlist={id}                 ║
║                                                        ║
║  💃 DANCE ROUTES:                                      ║
║  • GET /dance         → Vũ điệu page                   ║
║  • GET /dance-tutorial → Hướng dẫn page                ║
╠════════════════════════════════════════════════════════╣
║  📹 VIDEO STREAMING ENDPOINTS:                         ║
║  • GET /video/:filename          → S3:/songs/          ║
║  • GET /music-video/:filename    → S3:/music/          ║
║  • GET /dance-video/:filename    → S3:/dance/          ║
║  • GET /tutorial-video/:filename → S3:/dancetutorial/  ║
╠════════════════════════════════════════════════════════╣
║  📁 DATA FILES REQUIRED:                               ║
║  /public/data/categories.json    (4 categories)        ║
║  /public/data/playlists.json     (karaoke playlists)   ║
║  /public/data/songs.json         (karaoke songs)       ║
║  /public/data/playlists-music.json (music playlists)   ║
║  /public/data/songs-music.json   (music songs)         ║
║  /public/data/dance.json         (dance videos)        ║
║  /public/data/dance-tutorial.json (tutorial videos)    ║
╠════════════════════════════════════════════════════════╣
║  🗂️  VIEWS REQUIRED:                                   ║
║  /views/index.html               (homepage)            ║
║  /views/music-k.html             (karaoke selection)   ║
║  /views/karaoke-tt.html          (karaoke player)      ║
║  /views/music.html               (music list)          ║
║  /views/musicqd.html             (music player)        ║
║  /views/dance.html               (dance page)          ║
║  /views/dance-tutorial.html      (tutorial page)       ║
╠════════════════════════════════════════════════════════╣
║  🎯 FLOW EXAMPLES:                                     ║
║                                                        ║
║  KARAOKE FLOW:                                         ║
║  /index → /karaokemusic → /karaoke?playlist=quydinh    ║
║                                                        ║
║  MUSIC FLOW (NEW):                                     ║
║  /index → /music → /musicplayer?playlist=15-bai-quydinh║
║                                                        ║
║  DANCE FLOW:                                           ║
║  /index → /dance                                       ║
║  /index → /dance-tutorial                              ║
╚════════════════════════════════════════════════════════╝
  `);
});