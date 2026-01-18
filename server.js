const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'views');

app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'home.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'index.html'));
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
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
