// =============================================================================
// Streaming Provider System
// Modular provider architecture with parallel resolver.
// =============================================================================

const axios = require('axios');

class StreamingProvider {
    constructor(name, type) {
        this.providerName = name;
        this.type = type; // 'native' (resolves to m3u8) or 'iframe' (resolves to iframe URL)
    }

    /** @returns {Promise<Object>} Resolved stream sources or iframe URLs */
    async resolve(params) {
        throw new Error('resolve() must be implemented');
    }

    isAvailable() {
        return true;
    }

    supportsMovie() {
        return true;
    }

    supportsTV() {
        return true;
    }
}

// =============================================================================
// Cache Store for Local Resolution
// =============================================================================
const tmdbToVidstreamIdCache = new Map();
const vidstreamMovieEpisodeIdCache = new Map();
const vidstreamShowSeasonsCache = new Map();
const vidstreamSeasonEpisodesCache = new Map();

class VidStreamBase extends StreamingProvider {
    constructor(name, preferredServerName) {
        super(name, 'native');
        this.preferredServerName = preferredServerName;
    }

    async resolve({ tmdbId, mediaType, season, episode, title, year }) {
        let resolvedId = tmdbToVidstreamIdCache.get(tmdbId);
        if (!resolvedId) {
            console.log(`[VidStream Base] Cache miss for ID mapping of TMDB ${tmdbId}. Searching...`);
            const searchResponse = await axios.get(`http://localhost:4030/search?q=${encodeURIComponent(title)}`, { timeout: 3500 });
            const searchData = searchResponse.data;
            if (!searchData || !searchData.items || searchData.items.length === 0) {
                throw new Error('No search results found');
            }
            const cleanString = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanTargetTitle = cleanString(title);
            const matches = searchData.items.filter(item => {
                const isTv = !!(item.stats && item.stats.seasons);
                if (mediaType === 'tv' && !isTv) return false;
                if (mediaType === 'movie' && isTv) return false;
                const cleanItemTitle = cleanString(item.title);
                return cleanItemTitle.includes(cleanTargetTitle) || cleanTargetTitle.includes(cleanItemTitle);
            });
            if (matches.length === 0) throw new Error('No matching media type found');
            let bestMatch = matches[0];
            if (mediaType === 'movie' && year) {
                const yearMatch = matches.find(item => item.stats && item.stats.year && item.stats.year.includes(year));
                if (yearMatch) bestMatch = yearMatch;
            }
            resolvedId = bestMatch.id;
            tmdbToVidstreamIdCache.set(tmdbId, resolvedId);
        }

        let episodeId = null;
        if (mediaType === 'movie') {
            episodeId = vidstreamMovieEpisodeIdCache.get(resolvedId);
            if (!episodeId) {
                const detailsResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}`, { timeout: 3500 });
                episodeId = detailsResponse.data.episodeId;
                if (episodeId) {
                    vidstreamMovieEpisodeIdCache.set(resolvedId, episodeId);
                }
            }
        } else {
            const targetSeasonNum = Number(season) || 1;
            const targetEpisodeNum = Number(episode) || 1;

            let seasons = vidstreamShowSeasonsCache.get(resolvedId);
            if (!seasons) {
                const seasonsResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/seasons`, { timeout: 3500 });
                seasons = seasonsResponse.data.seasons;
                if (seasons && seasons.length > 0) {
                    vidstreamShowSeasonsCache.set(resolvedId, seasons);
                }
            }
            const matchingSeason = seasons.find(s => Number(s.number) === targetSeasonNum) || seasons[0];
            const seasonId = matchingSeason.id;

            let episodes = vidstreamSeasonEpisodesCache.get(seasonId);
            if (!episodes) {
                const episodesResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/episodes?seasonId=${seasonId}`, { timeout: 3500 });
                episodes = episodesResponse.data.episodes;
                if (episodes && episodes.length > 0) {
                    vidstreamSeasonEpisodesCache.set(seasonId, episodes);
                }
            }
            const matchingEpisode = episodes.find(e => Number(e.number) === targetEpisodeNum) || episodes[0];
            episodeId = matchingEpisode.id;
        }

        if (!episodeId) throw new Error('Episode ID not found');

        const serversResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/servers?episodeId=${episodeId}`, { timeout: 3500 });
        const servers = serversResponse.data.servers;
        if (!servers || servers.length === 0) throw new Error('No servers available');

        let selectedServer = servers.find(s => s.name.toLowerCase().includes(this.preferredServerName.toLowerCase())) || servers[0];
        const sourcesResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/sources?serverId=${selectedServer.id}`, { timeout: 3500 });
        return sourcesResponse.data;
    }
}

// =============================================================================
// PROVIDER 1: VidStream (Local API Resolver with UpCloud)
// =============================================================================
class VidStream extends VidStreamBase {
    constructor() {
        super('VidStream', 'upcloud');
    }
}

// =============================================================================
// PROVIDER 2: VidCloud (Local API Resolver with VidCloud)
// =============================================================================
class VidCloud extends VidStreamBase {
    constructor() {
        super('VidCloud', 'vidcloud');
    }
}

// =============================================================================
// PROVIDER 3: VidPlay (Iframe - VidLink Pro)
// =============================================================================
class VidPlay extends StreamingProvider {
    constructor() {
        super('VidPlay', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const s = season || 1;
        const e = episode || 1;
        const url = mediaType === 'tv'
            ? `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?primaryColor=ffd166&autoplay=true`
            : `https://vidlink.pro/movie/${tmdbId}?primaryColor=ffd166&autoplay=true`;
        return { iframeUrl: url };
    }
}

// =============================================================================
// PROVIDER 4: VidSrc (Iframe - VidSrc Mirrors)
// =============================================================================
class VidSrc extends StreamingProvider {
    constructor() {
        super('VidSrc', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const s = season || 1;
        const e = episode || 1;
        const url = mediaType === 'tv'
            ? `https://vidsrc.pm/embed/tv/${tmdbId}/${s}/${e}`
            : `https://vidsrc.pm/embed/movie/${tmdbId}`;
        return { iframeUrl: url };
    }
}

// =============================================================================
// PROVIDER 5: MultiEmbed (Iframe - MultiEmbed.mov)
// =============================================================================
class MultiEmbed extends StreamingProvider {
    constructor() {
        super('MultiEmbed', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const s = season || 1;
        const e = episode || 1;
        const url = mediaType === 'tv'
            ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
            : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
        return { iframeUrl: url };
    }
}

// =============================================================================
// PROVIDER 6: 2Embed (Iframe - 2Embed.cc)
// =============================================================================
class TwoEmbed extends StreamingProvider {
    constructor() {
        super('2Embed', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const s = season || 1;
        const e = episode || 1;
        const url = mediaType === 'tv'
            ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
            : `https://www.2embed.cc/embed/${tmdbId}`;
        return { iframeUrl: url };
    }
}

// =============================================================================
// PROVIDER 7: AutoEmbed (Iframe - AutoEmbed Player)
// =============================================================================
class AutoEmbed extends StreamingProvider {
    constructor() {
        super('AutoEmbed', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const s = season || 1;
        const e = episode || 1;
        const url = mediaType === 'tv'
            ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`
            : `https://player.autoembed.cc/embed/movie/${tmdbId}`;
        return { iframeUrl: url };
    }
}

// Registry in fallback order (Instant reliable iframe providers first, followed by alternates & native)
const PROVIDERS = [
    new VidPlay(),
    new VidSrc(),
    new MultiEmbed(),
    new TwoEmbed(),
    new AutoEmbed(),
    new VidStream(),
    new VidCloud()
];

class StreamingProviderManager {
    static getProviders(tmdbId, mediaType, season = null, episode = null) {
        return PROVIDERS
            .filter(p => p.isAvailable())
            .filter(p => mediaType === 'tv' ? p.supportsTV() : p.supportsMovie())
            .map(provider => ({
                name: provider.providerName,
                type: provider.type
            }));
    }
}

module.exports = {
    StreamingProviderManager,
    PROVIDERS
};
