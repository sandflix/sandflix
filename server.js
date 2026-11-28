// ========================================================
// Ramayana 2026 - High-Performance Local Streaming Server
// Native Node.js with HTTP 206 Partial Content (Range) Support
// ========================================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mkv': 'video/x-matroska',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);

  // REST API: Local AudioBookss Library Endpoint
  if (reqPath === '/api/audiobooks') {
    const abDir = path.join(ROOT_DIR, 'AudioBookss');
    fs.readdir(abDir, (err, files) => {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      if (err || !Array.isArray(files)) {
        return res.end(JSON.stringify({ success: true, folder: 'AudioBookss', files: [] }));
      }
      const list = files
        .filter(f => /\.(m4a|mp3|wav|ogg)$/i.test(f))
        .map((f, idx) => ({
          id: 306 + idx,
          filename: f,
          src: `AudioBookss/${f}`
        }));
      return res.end(JSON.stringify({ success: true, folder: 'AudioBookss', files: list }));
    });
    return;
  }

  // REST API: Local Poadcasts Library Endpoint
  if (reqPath === '/api/podcasts') {
    const podDir = path.join(ROOT_DIR, 'Poadcasts');
    fs.readdir(podDir, (err, files) => {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      if (err || !Array.isArray(files)) {
        return res.end(JSON.stringify({ success: true, folder: 'Poadcasts', files: [] }));
      }
      const list = files
        .filter(f => /\.(m4a|mp3|wav|ogg)$/i.test(f))
        .map((f, idx) => ({
          id: 322 + idx,
          filename: f,
          src: `Poadcasts/${f}`
        }));
      return res.end(JSON.stringify({ success: true, folder: 'Poadcasts', files: list }));
    });
    return;
  }

  // REST API: Live YouTube Channel Podcasts RSS Feed (filters out #Shorts)
  if (reqPath === '/api/youtube-podcasts') {
    const queryStr = req.url.split('?')[1] || '';
    const params = new URLSearchParams(queryStr);
    const channelId = (params.get('channelId') || 'UCzwCEE_PchiBULMnAJqhGVg').replace(/[^a-zA-Z0-9_-]/g, '');
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    https.get(rssUrl, (ytRes) => {
      let xml = '';
      ytRes.on('data', chunk => { xml += chunk; });
      ytRes.on('end', () => {
        const episodes = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        while ((match = entryRegex.exec(xml)) !== null) {
          const block = match[1];
          const vid = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || '';
          const titleRaw = (block.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
          const link = (block.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
          const published = ((block.match(/<published>([^<]+)<\/published>/) || [])[1] || '').slice(0, 10);
          const author = (block.match(/<author>\s*<name>([^<]+)<\/name>/) || [])[1] || 'Raj Shamani';
          const title = titleRaw
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          if (!vid || /\/shorts\//i.test(link) || /#shorts/i.test(title)) continue;
          episodes.push({
            videoId: vid,
            title: title,
            artist: author,
            published: published,
            banner: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`
          });
        }
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, channelId, episodes }));
      });
    }).on('error', () => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: false, channelId, episodes: [] }));
    });
    return;
  }

  // REST API: Peachify TMDB Movie Stream Endpoint
  if (reqPath.startsWith('/api/stream/movie/')) {
    const tmdbId = reqPath.replace('/api/stream/movie/', '').trim();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      success: true,
      provider: 'Peachify',
      tmdbId: tmdbId,
      embedUrl: `https://peachify.net/movie/${tmdbId}`,
      playerType: 'iframe'
    }));
  }

  // REST API: Peachify TMDB TV/Series Stream Endpoint
  if (reqPath.startsWith('/api/stream/tv/')) {
    const parts = reqPath.replace('/api/stream/tv/', '').split('/');
    const tmdbId = parts[0] || '243555';
    const season = parts[1] || '1';
    const episode = parts[2] || '1';
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      success: true,
      provider: 'Peachify',
      tmdbId: tmdbId,
      season: season,
      episode: episode,
      embedUrl: `https://peachify.net/tv/${tmdbId}/${season}/${episode}`,
      playerType: 'iframe'
    }));
  }

  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(ROOT_DIR, reqPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileSize = stats.size;
    const range = req.headers.range;

    // Handle HTTP 206 Partial Content (Range requests) for fast video scrubbing
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.writeHead(416, {
          'Content-Range': `bytes */${fileSize}`
        });
        return res.end();
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*'
      });

      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(`🎬 Ramayana (2026) Cinema Server running!`);
  console.log(`🌐 Open in your browser: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

