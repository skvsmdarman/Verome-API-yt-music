import express from 'express';
import cors from 'cors';
import { YTMusic, YouTubeSearch, LastFM, fetchFromPiped, fetchFromInvidious, getLyrics, getTrendingMusic, getRadio, getTopArtists, getTopTracks, getArtistInfo, getTrackInfo, getSongComplete, getAlbumComplete, getArtistComplete, getFullChain } from "./lib.ts";
import { html as uiHtml } from "./ui.ts";
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
