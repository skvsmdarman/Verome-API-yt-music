export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verome — Premium Music API</title>
  <link rel="icon" href="/assets/logo.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: #10b981;
      --accent-glow: rgba(16, 185, 129, 0.4);
      --bg: #050505;
      --surface: rgba(20, 20, 20, 0.6);
      --surface-border: rgba(255, 255, 255, 0.08);
      --text: #ffffff;
      --text-muted: #a1a1aa;
      --text-dim: #71717a;
      --glass-bg: rgba(255, 255, 255, 0.03);
      --glass-border: rgba(255, 255, 255, 0.08);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    h1, h2, h3, .brand { font-family: 'Outfit', sans-serif; }

    /* Animated Background */
    .bg-mesh {
      position: fixed;
      inset: 0;
      z-index: -1;
      background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1), transparent 50%),
                  radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05), transparent 40%);
      filter: blur(80px);
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 80px 24px 180px;
    }

    /* Hero Section */
    .hero {
      text-align: center;
      margin-bottom: 80px;
      animation: fadeInDown 1s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .logo-container {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 0 auto 32px;
    }

    .logo {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 30px var(--accent-glow));
      animation: float 6s ease-in-out infinite;
      position: relative;
      z-index: 2;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }

    .title {
      font-size: 4rem;
      font-weight: 800;
      letter-spacing: -2px;
      background: linear-gradient(to bottom, #fff, #a1a1aa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }

    .subtitle {
      font-size: 1.25rem;
      color: var(--text-muted);
      font-weight: 400;
    }

    /* Navigation */
    .nav {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 60px;
      background: var(--surface);
      padding: 6px;
      border-radius: 16px;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
      border: 1px solid var(--surface-border);
      backdrop-filter: blur(20px);
    }

    .nav-btn {
      padding: 10px 24px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .nav-btn.active { background: var(--accent); color: #000; box-shadow: 0 4px 20px var(--accent-glow); }

    /* Tabs */
    .tab { display: none; }
    .tab.active { display: block; animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* API Docs Grid */
    .section { margin-bottom: 48px; }
    .section-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--accent);
      margin-bottom: 24px;
      font-weight: 700;
    }

    .api-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .api-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 20px;
      padding: 20px;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 12px;
      backdrop-filter: blur(10px);
    }

    .api-card:hover {
      border-color: rgba(16, 185, 129, 0.3);
      transform: translateY(-4px);
      background: rgba(30, 30, 30, 0.6);
    }

    .api-card-header { display: flex; align-items: center; justify-content: space-between; }
    .method-tag {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 4px 10px;
      background: var(--accent-glow);
      color: var(--accent);
      border-radius: 6px;
    }

    .path-text { font-family: 'SF Mono', monospace; font-size: 0.9rem; font-weight: 500; color: #fff; }
    .desc-text { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; }

    /* Search Bar Premium */
    .search-container {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 24px;
      padding: 12px;
      display: flex;
      gap: 12px;
      margin-bottom: 40px;
      backdrop-filter: blur(20px);
    }

    .input-field {
      flex: 1;
      background: transparent;
      border: none;
      padding: 12px 20px;
      color: #fff;
      font-size: 1.1rem;
      font-family: inherit;
    }

    .input-field:focus { outline: none; }
    .input-field::placeholder { color: var(--text-dim); }

    .select-dropdown {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 0 16px;
      color: #fff;
      cursor: pointer;
    }

    .action-btn {
      background: var(--accent);
      color: #000;
      border: none;
      padding: 0 32px;
      border-radius: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover { transform: scale(1.02); box-shadow: 0 8px 25px var(--accent-glow); }

    /* Results */
    .result-list { display: flex; flex-direction: column; gap: 8px; }
    .result-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px;
      border-radius: 18px;
      background: transparent;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }

    .result-item:hover { background: var(--surface); border-color: var(--surface-border); }
    .result-item.active { background: var(--accent-glow); border-color: rgba(16, 185, 129, 0.2); }

    .art { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; background: #111; box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
    .track-meta { flex: 1; min-width: 0; }
    .track-name { font-weight: 600; font-size: 1rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .artist-name { color: var(--text-muted); font-size: 0.85rem; }
    .duration { font-family: monospace; font-size: 0.8rem; color: var(--text-dim); }

    /* Player Floating Bar */
    .player-bar {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 48px);
      max-width: 900px;
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 32px;
      padding: 16px 24px;
      display: none;
      z-index: 1000;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }

    .player-bar.visible { display: block; animation: playerSlideIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
    
    @keyframes playerSlideIn {
      from { transform: translate(-50%, 100%); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }

    .player-layout { display: flex; align-items: center; gap: 24px; }
    .player-image { width: 56px; height: 56px; border-radius: 14px; object-fit: cover; }
    .player-content { flex: 1; min-width: 0; }
    .player-title { font-weight: 700; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player-artist { font-size: 0.8rem; color: var(--text-muted); }

    .player-controls { display: flex; align-items: center; gap: 12px; }
    .p-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--surface-border);
      background: var(--glass-bg);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .p-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }
    .p-btn.main { background: #fff; color: #000; width: 52px; height: 52px; border: none; }
    .p-btn.main:hover { transform: scale(1.1); box-shadow: 0 0 25px rgba(255,255,255,0.3); }

    .progress-wrapper { margin-top: 12px; display: flex; align-items: center; gap: 12px; }
    .time-label { font-size: 0.65rem; color: var(--text-dim); font-family: monospace; min-width: 40px; }
    .progress-track { flex: 1; height: 5px; background: rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; position: relative; }
    .progress-fill { height: 100%; background: var(--accent); border-radius: 10px; width: 0%; box-shadow: 0 0 10px var(--accent-glow); }

    /* Icons Shorthand */
    .icon { width: 20px; height: 20px; fill: currentColor; }

    @media (max-width: 768px) {
      .title { font-size: 2.5rem; }
      .nav { width: 100%; justify-content: space-around; }
      .search-container { flex-direction: column; }
      .api-grid { grid-template-columns: 1fr; }
      .player-controls { gap: 6px; }
      .p-btn { width: 38px; height: 38px; }
      .p-btn.main { width: 44px; height: 44px; }
    }
  </style>
</head>
<body>
  <div class="bg-mesh"></div>
  
  <div class="container">
    <header class="hero">
      <div class="logo-container">
        <img src="/assets/logo.png" alt="Verome" class="logo">
      </div>
      <h1 class="title">Verome</h1>
      <p class="subtitle">Next-gen Music API for YouTube Music & Streaming</p>
    </header>

    <nav class="nav">
      <button class="nav-btn active" onclick="showTab('docs')">API Docs</button>
      <button class="nav-btn" onclick="showTab('player')">Playground</button>
      <button class="nav-btn" onclick="showTab('tester')">Endpoint Tester</button>
    </nav>

    <!-- API Docs Tab -->
    <div id="docs" class="tab active">
      <div class="section">
        <h3 class="section-title">Search Intelligence</h3>
        <div class="api-grid">
          <div class="api-card" onclick="openTest('search')">
            <div class="api-card-header">
              <span class="path-text">/api/search</span>
              <span class="method-tag">GET</span>
            </div>
            <p class="desc-text">Universal search for songs, albums, and artists with metadata.</p>
          </div>
          <div class="api-card">
            <div class="api-card-header">
              <span class="path-text">/api/yt_search</span>
              <span class="method-tag">GET</span>
            </div>
            <p class="desc-text">Deep-dive YouTube search for videos, channels, and playlists.</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Streaming & Media</h3>
        <div class="api-grid">
          <div class="api-card" onclick="openTest('stream')">
            <div class="api-card-header">
              <span class="path-text">/api/stream</span>
              <span class="method-tag">GET</span>
            </div>
            <p class="desc-text">Retrieve direct audio stream URLs via Piped/Invidious proxies.</p>
          </div>
          <div class="api-card" onclick="openTest('lyrics')">
            <div class="api-card-header">
              <span class="path-text">/api/lyrics</span>
              <span class="method-tag">GET</span>
            </div>
            <p class="desc-text">Get high-fidelity synchronized LRC lyrics for any track.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Playground Tab -->
    <div id="player-tab" class="tab">
      <div class="search-container">
        <select class="select-dropdown" id="filter">
          <option value="">Everything</option>
          <option value="songs">Songs</option>
          <option value="albums">Albums</option>
          <option value="artists">Artists</option>
        </select>
        <input type="text" class="input-field" id="query" placeholder="Type to explore music...">
        <button class="action-btn" id="searchBtn" onclick="search()">Discover</button>
      </div>
      
      <div id="loading" style="display:none; text-align:center; padding: 40px; color: var(--accent);">
        <div class="subtitle">Fetching the rhythm...</div>
      </div>
      
      <div class="result-list" id="results">
        <div style="text-align:center; padding: 60px; color: var(--text-dim);">
          <p>Search for your favorite tracks to start listening.</p>
        </div>
      </div>
    </div>

    <!-- Tester Tab -->
    <div id="tester" class="tab">
      <div style="background: var(--surface); border: 1px solid var(--surface-border); border-radius: 24px; padding: 32px; backdrop-filter: blur(20px);">
        <div style="margin-bottom: 24px;">
          <label style="display:block; font-size: 0.75rem; color: var(--accent); font-weight: 700; margin-bottom: 12px;">ENDPOINT</label>
          <select class="select-dropdown" id="endpoint" onchange="updateInputs()" style="width:100%; height:54px;">
            <option value="search">Search Global</option>
            <option value="stream">Stream Provider</option>
            <option value="song">Song Intel</option>
            <option value="album">Album Hub</option>
            <option value="artist">Artist Bio</option>
            <option value="lyrics">Lyrics Engine</option>
          </select>
        </div>
        
        <div id="inputs" style="display:flex; flex-direction:column; gap:16px; margin-bottom: 24px;"></div>
        
        <div style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px; border: 1px solid var(--surface-border);">
          <span style="color:var(--accent)">GET</span> <span id="urlPreview">/api/search?q=coldplay</span>
        </div>
        
        <button class="action-btn" onclick="testApi()" style="width:100%; height:54px; margin-bottom: 24px;">Execute Request</button>
        
        <div id="response" style="background: #000; border-radius: 16px; padding: 20px; max-height: 400px; overflow: auto; border: 1px solid var(--surface-border);">
          <pre style="font-family: 'SF Mono', monospace; font-size: 0.75rem; color: #10b981;">{ "status": "idle", "message": "Results will appear here" }</pre>
        </div>
      </div>
    </div>
  </div>

  <!-- Player Bar -->
  <div class="player-bar" id="playerBar">
    <div class="player-layout">
      <img class="player-image" id="pThumb" src="">
      <div class="player-content">
        <div class="player-title" id="pTitle">Not Playing</div>
        <div class="player-artist" id="pArtist">-</div>
      </div>
      
      <div class="player-controls">
        <button class="p-btn" onclick="prev()">
          <svg viewBox="0 0 24 24" class="icon"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button class="p-btn main" id="playBtn" onclick="toggle()">
          <svg id="playIcon" viewBox="0 0 24 24" class="icon" style="fill: black;"><path d="M8 5v14l11-7z"/></svg>
          <svg id="pauseIcon" viewBox="0 0 24 24" class="icon" style="fill: black; display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="p-btn" onclick="next()">
          <svg viewBox="0 0 24 24" class="icon"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>
    </div>
    <div class="progress-wrapper">
      <span class="time-label" id="cur">0:00</span>
      <div class="progress-track" id="bar" onclick="seek(event)">
        <div class="progress-fill" id="fill"></div>
      </div>
      <span class="time-label" id="total">0:00</span>
    </div>
  </div>

  <div id="ytplayer"></div>

  <script>
    // System UI Logic
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    var songs = [], yt = null, ready = false, playing = false, idx = -1, interval = null;
    
    document.getElementById('query').onkeypress = e => { if(e.key === 'Enter') search() };

    function showTab(t) {
      document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(t==='player'?'player-tab':t).classList.add('active');
      document.querySelector('.nav-btn[onclick*="'+t+'"]').classList.add('active');
    }

    function onYouTubeIframeAPIReady() {
      yt = new YT.Player('ytplayer', {
        height: '0', width: '0', host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0 },
        events: { onReady: () => ready = true, onStateChange: onState, onError: onErr }
      });
    }

    function onErr(e) {
      var s = songs[idx];
      if(!s) return;
      if(s.fallbackVideoId && !s.triedFallback) {
        s.triedFallback = true; yt.loadVideoById(s.fallbackVideoId);
      } else if(!s.triedSearch) {
        s.triedSearch = true;
        searchFallback(s.title, s.artists?.[0]?.name || '').then(id => { if(id) yt.loadVideoById(id) });
      }
    }

    async function searchFallback(t, a) {
      try {
        const res = await fetch('/api/yt_search?q=' + encodeURIComponent(t + ' ' + a + ' official') + '&filter=videos');
        const data = await res.json();
        return data.results?.[0]?.id || null;
      } catch { return null; }
    }

    function onState(e) {
      const playIcon = document.getElementById('playIcon');
      const pauseIcon = document.getElementById('pauseIcon');
      if (e.data === 1) {
        playing = true; playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; startProgress();
      } else if (e.data === 2) {
        playing = false; playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; stopProgress();
      } else if (e.data === 0) {
        next();
      }
    }

    function startProgress() { stopProgress(); interval = setInterval(updateP, 500); }
    function stopProgress() { if(interval) clearInterval(interval); }
    function updateP() {
      if(!yt || !ready) return;
      var c = yt.getCurrentTime() || 0, t = yt.getDuration() || 0;
      document.getElementById('cur').textContent = fmt(c);
      document.getElementById('total').textContent = fmt(t);
      document.getElementById('fill').style.width = t > 0 ? (c/t*100)+'%' : '0%';
    }
    function fmt(s) { var m=Math.floor(s/60), sec=Math.floor(s%60); return m+':'+(sec<10?'0':'')+sec; }
    function seek(e) {
      var rect = document.getElementById('bar').getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      yt.seekTo(pct * (yt.getDuration() || 0), true);
    }

    async function search() {
      var q = document.getElementById('query').value.trim(); if(!q) return;
      var f = document.getElementById('filter').value;
      document.getElementById('searchBtn').disabled = true;
      document.getElementById('loading').style.display = 'block';
      document.getElementById('results').innerHTML = '';
      
      try {
        var url = '/api/search?q=' + encodeURIComponent(q) + (f ? '&filter='+f : '');
        var res = await fetch(url);
        songs = (await res.json()).results || [];
        render();
      } catch (e) {
        document.getElementById('results').innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-dim);">Error exploring tracks.</div>';
      }
      
      document.getElementById('searchBtn').disabled = false;
      document.getElementById('loading').style.display = 'none';
    }

    function render() {
      var el = document.getElementById('results');
      if (!songs.length) { el.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-dim);">No rhythms found.</div>'; return; }
      
      el.innerHTML = songs.map((s, i) => {
        var thumb = s.thumbnails?.[0]?.url || 'https://img.youtube.com/vi/'+s.videoId+'/mqdefault.jpg';
        return \`
          <div class="result-item \${i===idx?'active':''}" onclick="playSong(\${i})">
            <img class="art" src="\${thumb}">
            <div class="track-meta">
              <div class="track-name">\${s.title}</div>
              <div class="artist-name">\${s.artists?.map(a=>a.name).join(', ') || s.subtitle || 'Various Artists'}</div>
            </div>
            <div class="duration">\${s.duration || ''}</div>
          </div>
        \`;
      }).join('');
    }

    function playSong(i) {
      if(!songs[i]) return;
      idx = i; var s = songs[i];
      document.getElementById('pTitle').textContent = s.title;
      document.getElementById('pArtist').textContent = s.artists?.map(a=>a.name).join(', ') || '';
      document.getElementById('pThumb').src = s.thumbnails?.[0]?.url || 'https://img.youtube.com/vi/'+s.videoId+'/mqdefault.jpg';
      document.getElementById('playerBar').classList.add('visible');
      yt.loadVideoById(s.videoId);
      render();
    }

    function toggle() { if(playing) yt.pauseVideo(); else yt.playVideo(); }
    function prev() { if(idx > 0) playSong(idx-1); }
    function next() { if(idx < songs.length-1) playSong(idx+1); }

    // Tester Logic
    var cfg = {
      search: { inputs: [{n:'q', p:'Query', v:'Starboy'}], url: '/api/search' },
      stream: { inputs: [{n:'id', p:'Video ID', v:'dQw4w9WgXcQ'}], url: '/api/stream' },
      song: { inputs: [{n:'videoId', p:'Video ID', v:'dQw4w9WgXcQ'}], url: '/api/songs/{videoId}' },
      album: { inputs: [{n:'browseId', p:'Album ID', v:'MPREb_PvMNqFUp1oW'}], url: '/api/albums/{browseId}' },
      artist: { inputs: [{n:'browseId', p:'Artist ID', v:'UCIaFw5VBEK8qaW6nRpx_qnw'}], url: '/api/artists/{browseId}' },
      lyrics: { inputs: [{n:'title', p:'Title', v:'Yellow'}, {n:'artist', p:'Artist', v:'Coldplay'}], url: '/api/lyrics' }
    };

    function updateInputs() {
      var ep = document.getElementById('endpoint').value, c = cfg[ep];
      document.getElementById('inputs').innerHTML = c.inputs.map(i => \`
        <div style="flex:1">
          <label style="display:block; font-size: 0.65rem; color: var(--text-dim); margin-bottom: 6px; font-weight: 600;">\${i.p.toUpperCase()}</label>
          <input class="input-field" id="api_\${i.n}" placeholder="\${i.p}" value="\${i.v}" oninput="updateUrl()" style="background: rgba(255,255,255,0.05); width:100%; border-radius: 12px; border: 1px solid var(--surface-border);">
        </div>
      \`).join('');
      updateUrl();
    }

    function updateUrl() {
      var ep = document.getElementById('endpoint').value, c = cfg[ep], url = c.url, params = new URLSearchParams();
      c.inputs.forEach(i => {
        var v = document.getElementById('api_'+i.n)?.value || i.v;
        if(v) { if(url.includes('{'+i.n+'}')) url = url.replace('{'+i.n+'}', encodeURIComponent(v)); else params.append(i.n, v); }
      });
      var qs = params.toString(); if(qs) url += '?' + qs;
      document.getElementById('urlPreview').textContent = url;
    }

    async function testApi() {
      var url = document.getElementById('urlPreview').textContent;
      document.getElementById('response').innerHTML = '<pre style="color:var(--accent)">Requesting...</pre>';
      try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById('response').innerHTML = '<pre style="color:var(--accent)">' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (e) {
        document.getElementById('response').innerHTML = '<pre style="color:#ef4444">Error: ' + e.message + '</pre>';
      }
    }
    
    function openTest(ep) {
        document.getElementById('endpoint').value = ep;
        updateInputs();
        showTab('tester');
    }

    updateInputs();
  </script>
</body>
</html>`;
