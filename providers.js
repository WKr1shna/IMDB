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
            const searchResponse = await axios.get(`http://localhost:4030/search?q=${encodeURIComponent(title)}`);
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
                const detailsResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}`);
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
                const seasonsResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/seasons`);
                seasons = seasonsResponse.data.seasons;
                if (seasons && seasons.length > 0) {
                    vidstreamShowSeasonsCache.set(resolvedId, seasons);
                }
            }
            const matchingSeason = seasons.find(s => Number(s.number) === targetSeasonNum) || seasons[0];
            const seasonId = matchingSeason.id;

            let episodes = vidstreamSeasonEpisodesCache.get(seasonId);
            if (!episodes) {
                const episodesResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/episodes?seasonId=${seasonId}`);
                episodes = episodesResponse.data.episodes;
                if (episodes && episodes.length > 0) {
                    vidstreamSeasonEpisodesCache.set(seasonId, episodes);
                }
            }
            const matchingEpisode = episodes.find(e => Number(e.number) === targetEpisodeNum) || episodes[0];
            episodeId = matchingEpisode.id;
        }

        if (!episodeId) throw new Error('Episode ID not found');

        const serversResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/servers?episodeId=${episodeId}`);
        const servers = serversResponse.data.servers;
        if (!servers || servers.length === 0) throw new Error('No servers available');

        let selectedServer = servers.find(s => s.name.toLowerCase().includes(this.preferredServerName.toLowerCase())) || servers[0];
        const sourcesResponse = await axios.get(`http://localhost:4030/movie/${resolvedId}/sources?serverId=${selectedServer.id}`);
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
// PROVIDER 3: VidPlay (Iframe fallback)
// =============================================================================
class VidPlay extends StreamingProvider {
    constructor() {
        super('VidPlay', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const url = mediaType === 'tv'
            ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=ffd166&autoplay=true`
            : `https://vidlink.pro/movie/${tmdbId}?primaryColor=ffd166&autoplay=true`;
        return { iframeUrl: url };
    }
}

// =============================================================================
// PROVIDER 4: VidSrc (Iframe fallback)
// =============================================================================
class VidSrc extends StreamingProvider {
    constructor() {
        super('VidSrc', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const url = mediaType === 'tv'
            ? `https://vidsrc.sbs/embed/tv/${tmdbId}/${season}/${episode}?autoplay=true&color=ffd166`
            : `https://vidsrc.sbs/embed/movie/${tmdbId}?autoplay=true&color=ffd166`;
        return { iframeUrl: url };
    }
}

// =============================================================================
// PROVIDER 5: 2Embed (Iframe fallback)
// =============================================================================
class TwoEmbed extends StreamingProvider {
    constructor() {
        super('2Embed', 'iframe');
    }
    async resolve({ tmdbId, mediaType, season, episode }) {
        const url = mediaType === 'tv'
            ? `https://www.2embed.online/embed/tv/${tmdbId}/${season}/${episode}`
            : `https://www.2embed.online/embed/movie/${tmdbId}`;
        return { iframeUrl: url };
    }
}

// Registry in fallback order
const PROVIDERS = [
    new VidStream(),
    new VidCloud(),
    new VidPlay(),
    new VidSrc(),
    new TwoEmbed()
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
