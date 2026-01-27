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

// Trang karaoke lựa chọn
app.get('/karaokemusic', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'music-k.html'));
});

// Trang karaoke
app.get('/karaoke', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'karaoke-tt.html'));
});

// Trang vũ điệu
app.get('/dance', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'dance.html'));
});

// Trang hướng dẫn vũ điệu
app.get('/dance-tutorial', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'dance-tutorial.html'));
});

// Trang nhạc có lời (15 bài hát)
app.get('/music', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'music.html'));
});

// Trang player nhạc có lời
app.get('/musicqd', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'musicqd.html'));
});


/* ===== STREAM VIDEO FROM VIETNIX S3 ===== */
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

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  ✅ Server running on port ${PORT}              ║
╠═══════════════════════════════════════════════╣
║  📂 ROUTES:                                   ║
║  • /index (Homepage - 4 categories)           ║
║  • /index?category=nhac-tt (Nhạc TT songs)    ║
║  • /karaoke (Karaoke page)                    ║
║  • /dance (Vũ điệu page)                      ║
║  • /dance-tutorial (Hướng dẫn page)           ║
╠═══════════════════════════════════════════════╣
║  📁 FILES STRUCTURE:                          ║
║  /data/categories.json (4 categories)         ║
║  /data/playlists.json (4 playlists in TT)     ║
║  /data/songs.json (songs in each playlist)    ║
║  /data/dance.json (vũ điệu data)              ║
║  /data/dance-tutorial.json (tutorial data)    ║
║  /data/karaoke.json (karaoke data - if any)   ║
╚═══════════════════════════════════════════════╝
  `);
});