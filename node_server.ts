import express from 'express';
import cors from 'cors';
import { YTMusic, YouTubeSearch, LastFM, fetchFromPiped, fetchFromInvidious, getLyrics, getTrendingMusic, getRadio, getTopArtists, getTopTracks, getArtistInfo, getTrackInfo, getSongComplete, getAlbumComplete, getArtistComplete, getFullChain } from "./lib.js";
import { html as uiHtml } from "./ui.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

const ytmusic = new YTMusic();
const youtubeSearch = new YouTubeSearch();

app.use(cors());
app.use(express.json());

// Root - UI
app.get("/", (req, res) => {
    res.send(uiHtml);
});

// Logo
app.get("/assets/:logo", (req, res) => {
    const logoName = req.params.logo;
    // Check various casing and paths (root level vs assets folder)
    const paths = [
        path.join(__dirname, "assets", logoName),
        path.join(__dirname, logoName),
        path.join(__dirname, "..", "assets", logoName),
        path.join(__dirname, "assets", "Logo.png"), // fallback
    ];
    for (const p of paths) {
        if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
            return res.sendFile(p);
        }
    }
    res.status(404).send("Logo not found");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// ============ SEARCH ============

app.get("/api/search", async (req, res) => {
    const { q, filter, continuationToken, ignore_spelling, fallback, region, language } = req.query;
    const ignoreSpelling = ignore_spelling === "true";
    const withFallback = fallback !== "0";

    if (!q && !continuationToken) return res.status(400).json({ error: "Missing 'q' or 'continuationToken'" });

    try {
        const results = await ytmusic.search(String(q || ""), String(filter || "") || undefined, String(continuationToken || "") || undefined, ignoreSpelling, String(region || "") || undefined, String(language || "") || undefined);

        // Add fallback YouTube IDs for songs
        if (withFallback && filter === "songs" && results.results?.length > 0) {
            const enhanced = await Promise.all(
                results.results.slice(0, 10).map(async (song: any) => {
                    try {
                        const ytResults = await youtubeSearch.searchVideos(`${song.title} ${song.artists?.[0]?.name || ''} official`);
                        const alt = ytResults.results?.find((v: any) => v.channel?.name && !v.channel.name.includes('Topic') && v.id);
                        if (alt) return { ...song, fallbackVideoId: alt.id, fallbackTitle: alt.title };
                    } catch { }
                    return song;
                })
            );
            results.results = [...enhanced, ...results.results.slice(10)];
        }

        res.json({ query: q, filter, region, language, ...results });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

app.get("/api/search/suggestions", async (req, res) => {
    const { q, music } = req.query;
    if (!q) return res.status(400).json({ error: "Missing 'q'" });
    const suggestions = music === "1" ? await ytmusic.getSearchSuggestions(String(q)) : await youtubeSearch.getSuggestions(String(q));
    res.json({ suggestions, source: music === "1" ? "youtube_music" : "youtube" });
});

app.get("/api/yt_search", async (req, res) => {
    const { q, filter, continuationToken } = req.query;
    if (!q && !continuationToken) return res.status(400).json({ error: "Missing 'q' or 'continuationToken'" });

    const results: any[] = [];
    let nextToken: string | null = null;

    try {
        if (continuationToken) {
            if (filter === "videos") { const r = await youtubeSearch.searchVideos(null, String(continuationToken)); results.push(...r.results); nextToken = r.continuationToken; }
            else if (filter === "channels") { const r = await youtubeSearch.searchChannels(null, String(continuationToken)); results.push(...r.results); nextToken = r.continuationToken; }
            else if (filter === "playlists") { const r = await youtubeSearch.searchPlaylists(null, String(continuationToken)); results.push(...r.results); nextToken = r.continuationToken; }
        } else if (q) {
            if (filter === "videos" || filter === "all" || !filter) { const r = await youtubeSearch.searchVideos(String(q)); results.push(...r.results); nextToken = r.continuationToken; }
            if (filter === "channels" || filter === "all") { const r = await youtubeSearch.searchChannels(String(q)); results.push(...r.results); if (!nextToken) nextToken = r.continuationToken; }
            if (filter === "playlists" || filter === "all") { const r = await youtubeSearch.searchPlaylists(String(q)); results.push(...r.results); if (!nextToken) nextToken = r.continuationToken; }
        }
        res.json({ filter, query: q, results, continuationToken: nextToken });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// ============ ENTITIES ============

app.get("/api/songs/:videoId", async (req, res) => res.json(await getSongComplete(req.params.videoId, ytmusic)));
app.get("/api/albums/:browseId", async (req, res) => res.json(await getAlbumComplete(req.params.browseId, ytmusic)));
app.get("/api/album/:id", async (req, res) => res.json(await getAlbumComplete(req.params.id, ytmusic)));
app.get("/api/artists/:browseId", async (req, res) => res.json(await getArtistComplete(req.params.browseId, ytmusic)));
app.get("/api/artist/:artistId", async (req, res) => res.json(await ytmusic.getArtistSummary(req.params.artistId, String(req.query.country || "US"))));
app.get("/api/playlists/:playlistId", async (req, res) => res.json(await ytmusic.getPlaylist(req.params.playlistId)));
app.get("/api/playlist/:id", async (req, res) => res.json(await ytmusic.getPlaylist(req.params.id)));
app.get("/api/related/:id", async (req, res) => res.json({ success: true, data: await ytmusic.getRelated(req.params.id) }));
app.get("/api/chain/:videoId", async (req, res) => res.json(await getFullChain(req.params.videoId, ytmusic)));

// ============ EXPLORE ============

app.get("/api/charts", async (req, res) => res.json(await ytmusic.getCharts(String(req.query.country || "")) || undefined));
app.get("/api/moods", async (req, res) => res.json(await ytmusic.getMoodCategories()));
app.get("/api/moods/:categoryId", async (req, res) => res.json(await ytmusic.getMoodPlaylists(req.params.categoryId)));

app.get("/api/watch_playlist", async (req, res) => {
    const { videoId, playlistId, radio, shuffle, limit } = req.query;
    if (!videoId && !playlistId) return res.status(400).json({ error: "Provide videoId or playlistId" });
    res.json(await ytmusic.getWatchPlaylist(videoId ? String(videoId) : undefined, playlistId ? String(playlistId) : undefined, radio === "true", shuffle === "true", parseInt(String(limit || "25"))));
});

// ============ NATIVE EMBED PLAYER ============

app.get("/player/:videoId", (req, res) => {
    const videoId = req.params.videoId;
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verome Music Player</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --accent: #10b981;
            --bg: #050505;
            --surface: rgba(20, 20, 20, 0.8);
            --border: rgba(255, 255, 255, 0.08);
            --text: #ffffff;
            --text-muted: #a1a1aa;
        }
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: var(--bg); color: var(--text); font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        
        #ytplayer { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }
        
        .player-container {
            width: 100%;
            height: 100%;
            max-width: 500px;
            max-height: 800px;
            background: var(--surface);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            padding: 2rem;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
        }

        .bg-blur {
            position: absolute;
            inset: -50px;
            background-size: cover;
            background-position: center;
            filter: blur(50px) brightness(0.3);
            z-index: 0;
            transition: background-image 0.5s ease;
        }

        .art-container {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            position: relative;
        }

        .art {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .info {
            text-align: center;
            margin-bottom: 2rem;
        }

        .title {
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .artist {
            font-size: 1rem;
            color: var(--text-muted);
            font-weight: 600;
        }

        .controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .btn {
            background: none;
            border: none;
            color: var(--text);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .btn:hover { transform: scale(1.1); color: var(--accent); }
        
        .play-btn {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: var(--text);
            color: var(--bg);
        }
        .play-btn:hover {
            background: var(--accent);
            color: #000;
        }

        .progress-container {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .progress-bar {
            flex: 1;
            height: 6px;
            background: var(--border);
            border-radius: 3px;
            overflow: hidden;
            cursor: pointer;
            position: relative;
        }

        .progress-fill {
            height: 100%;
            background: var(--accent);
            width: 0%;
            transition: width 0.1s linear;
        }

        .loader {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="bg-blur" id="bgBlur"></div>
    <div id="ytplayer"></div>
    
    <div class="player-container">
        <div class="loader" id="loader">Loading Track...</div>
        
        <div class="art-container">
            <img class="art" id="art" src="" alt="Album Art">
        </div>
        
        <div class="info">
            <div class="title" id="title">Loading...</div>
            <div class="artist" id="artist">Verome Music</div>
        </div>

        <div class="progress-container">
            <span id="currTime">0:00</span>
            <div class="progress-bar" id="progressBar" onclick="seek(event)">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <span id="totalTime">0:00</span>
        </div>

        <div class="controls" style="margin-top: 2rem;">
            <button class="btn play-btn" id="playBtn" onclick="togglePlay()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" id="playIcon">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </button>
        </div>
    </div>

    <script>
        const videoId = "${videoId}";
        let player;
        let isPlaying = false;
        let duration = 0;
        let progressInterval;
        let hasFallback = false;

        // Fetch Metadata
        async function loadMetadata(id) {
            try {
                const res = await fetch('/api/songs/' + id);
                const data = await res.json();
                if(data && data.title) {
                    document.getElementById('title').innerText = data.title;
                    document.getElementById('artist').innerText = data.artist || 'Unknown Artist';
                    const artUrl = data.thumbnail || (data.thumbnails && data.thumbnails[0] && data.thumbnails[0].url) || '';
                    if(artUrl) {
                        document.getElementById('art').src = artUrl;
                        document.getElementById('bgBlur').style.backgroundImage = 'url(' + artUrl + ')';
                    }
                }
            } catch(e) { console.error('Meta fetch err', e); }
        }

        loadMetadata(videoId);

        // Init YouTube API
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        function onYouTubeIframeAPIReady() {
            player = new YT.Player('ytplayer', {
                videoId: videoId,
                playerVars: { 'autoplay': 1, 'controls': 0, 'playsinline': 1, 'rel': 0 },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            });
        }

        function onPlayerReady(event) {
            document.getElementById('loader').style.display = 'none';
            event.target.playVideo();
            duration = player.getDuration();
            document.getElementById('totalTime').innerText = formatTime(duration);
            progressInterval = setInterval(updateProgress, 500);
        }

        function onPlayerStateChange(event) {
            if(event.data === YT.PlayerState.PLAYING) {
                isPlaying = true;
                document.getElementById('loader').style.display = 'none';
                duration = player.getDuration();
                document.getElementById('totalTime').innerText = formatTime(duration);
                document.getElementById('playIcon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Pause icon
            } else if(event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                isPlaying = false;
                document.getElementById('playIcon').innerHTML = '<path d="M8 5v14l11-7z"/>'; // Play icon
            }
        }

        async function onPlayerError(event) {
            if (hasFallback) {
                document.getElementById('loader').innerText = 'Playback Failed';
                return;
            }
            hasFallback = true;
            document.getElementById('loader').innerText = 'Finding fallback...';
            document.getElementById('loader').style.display = 'flex';
            try {
                const query = document.getElementById('title').innerText + ' ' + document.getElementById('artist').innerText + ' official music video';
                const searchRes = await fetch('/api/yt_search?q=' + encodeURIComponent(query) + '&filter=videos');
                const searchData = await searchRes.json();
                const alt = searchData.results[0];
                if (alt && alt.id) {
                    player.loadVideoById(alt.id);
                    loadMetadata(alt.id);
                } else throw new Error();
            } catch(e) {
                document.getElementById('loader').innerText = 'Playback Error.';
            }
        }

        function togglePlay() {
            if (!player || !player.getPlayerState) return;
            if (isPlaying) player.pauseVideo();
            else player.playVideo();
        }

        function updateProgress() {
            if (!player || !player.getCurrentTime) return;
            const curr = player.getCurrentTime();
            document.getElementById('currTime').innerText = formatTime(curr);
            if (duration > 0) {
                document.getElementById('progressFill').style.width = ((curr / duration) * 100) + '%';
            }
        }

        function seek(e) {
            if (!player || !duration) return;
            const bar = document.getElementById('progressBar');
            const rect = bar.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            player.seekTo(clickPos * duration, true);
        }

        function formatTime(sec) {
            if(isNaN(sec)) return "0:00";
            let m = Math.floor(sec / 60);
            let s = Math.floor(sec % 60);
            return m + ":" + (s < 10 ? "0" + s : s);
        }
    </script>
</body>
</html>`;
    res.send(html);
});

// ============ STREAMING ============

app.get("/api/stream", async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const piped = await fetchFromPiped(String(id));
    if (piped.success) return res.json({ service: "piped", ...piped });

    const invidious = await fetchFromInvidious(String(id));
    if (invidious.success) return res.json({ service: "invidious", ...invidious });

    res.status(404).json({ success: false, error: "No streaming data found" });
});

app.get("/api/lyrics", async (req, res) => {
    const { title, artist, duration } = req.query;
    if (!title || !artist) return res.status(400).json({ error: "Missing title and artist" });
    res.json(await getLyrics(String(title), String(artist), duration ? parseInt(String(duration)) : undefined));
});

app.get("/api/similar", async (req, res) => {
    const { title, artist, limit } = req.query;
    const similar = await LastFM.getSimilarTracks(String(title), String(artist), String(limit || "5"));
    if ("error" in similar) return res.status(500).json(similar);
    const ytResults = await Promise.all(similar.map(async (t: any) => { const r = await youtubeSearch.searchVideos(`${t.title} ${t.artist}`); return r.results[0] || null; }));
    res.json(ytResults.filter(Boolean));
});

app.get("/api/trending", async (req, res) => res.json(await getTrendingMusic(String(req.query.country || "United States"), ytmusic)));
app.get("/api/radio", async (req, res) => res.json(await getRadio(String(req.query.videoId), ytmusic)));

app.get("/api/top/artists", async (req, res) => res.json(await getTopArtists(String(req.query.country || "") || undefined, parseInt(String(req.query.limit || "20")), ytmusic)));
app.get("/api/top/tracks", async (req, res) => res.json(await getTopTracks(String(req.query.country || "") || undefined, parseInt(String(req.query.limit || "20")), ytmusic)));

export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Verome API (Node.js) running at http://localhost:${PORT}`);
    });
}
