// =============================================================================
// Streaming Provider System
// Modular provider architecture with automatic fallback.
// Only officially documented providers and endpoints are used.
// =============================================================================

class StreamingProvider {
    constructor(name, baseUrl) {
        this.providerName = name;
        this.baseUrl = baseUrl;
    }

    /** @returns {string} Embed URL for a movie */
    getMovieEmbed(tmdbId) {
        throw new Error('getMovieEmbed() must be implemented');
    }

    /** @returns {string} Embed URL for a TV episode */
    getEpisodeEmbed(tmdbId, season, episode) {
        throw new Error('getEpisodeEmbed() must be implemented');
    }

    /** @returns {boolean} Whether this provider is currently available */
    isAvailable() {
        return true;
    }

    /** @returns {boolean} Whether this provider supports movies */
    supportsMovie() {
        return true;
    }

    /** @returns {boolean} Whether this provider supports TV */
    supportsTV() {
        return true;
    }
}

// =============================================================================
// PROVIDER 1: VidKing
// Docs: https://www.vidking.net
// Movie: /embed/movie/{tmdbId}
// TV:    /embed/tv/{tmdbId}/{season}/{episode}
// Params: color, autoPlay
// =============================================================================
class VidKing extends StreamingProvider {
    constructor() {
        super('VidKing', 'https://www.vidking.net');
    }

    getMovieEmbed(tmdbId) {
        return `${this.baseUrl}/embed/movie/${tmdbId}?color=ffd166&autoPlay=true`;
    }

    getEpisodeEmbed(tmdbId, season, episode) {
        return `${this.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}?color=ffd166&autoPlay=true&nextEpisode=true&episodeSelector=true`;
    }
}

// =============================================================================
// PROVIDER 2: VidSrc
// Official domain: vidsrc.sbs
// Movie: /embed/movie/{tmdb_id}
// TV:    /embed/tv/{tmdb_id}/{season}/{episode}
// Params: autoplay, color, sub, t, controls
// =============================================================================
class VidSrc extends StreamingProvider {
    constructor() {
        super('VidSrc', 'https://vidsrc.sbs');
    }

    getMovieEmbed(tmdbId) {
        return `${this.baseUrl}/embed/movie/${tmdbId}?autoplay=true&color=ffd166`;
    }

    getEpisodeEmbed(tmdbId, season, episode) {
        return `${this.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}?autoplay=true&color=ffd166`;
    }
}

// =============================================================================
// PROVIDER 3: VidLink
// Official domain: vidlink.pro
// Movie: /movie/{tmdbId}
// TV:    /tv/{tmdbId}/{season}/{episode}
// Params: primaryColor, secondaryColor, iconColor, icons, title, poster,
//         autoplay, nextbutton, player, startAt, sub_file, sub_label, fallback_url
// =============================================================================
class VidLink extends StreamingProvider {
    constructor() {
        super('VidLink', 'https://vidlink.pro');
    }

    getMovieEmbed(tmdbId) {
        return `${this.baseUrl}/movie/${tmdbId}?primaryColor=ffd166&autoplay=true`;
    }

    getEpisodeEmbed(tmdbId, season, episode) {
        return `${this.baseUrl}/tv/${tmdbId}/${season}/${episode}?primaryColor=ffd166&autoplay=true&nextbutton=true`;
    }
}

// =============================================================================
// PROVIDER 4: 2Embed
// Official domain: www.2embed.online
// Movie: /embed/movie/{id}    (TMDB ID)
// TV:    /embed/tv/{id}/{season}/{episode}
// =============================================================================
class TwoEmbed extends StreamingProvider {
    constructor() {
        super('2Embed', 'https://www.2embed.online');
    }

    getMovieEmbed(tmdbId) {
        return `${this.baseUrl}/embed/movie/${tmdbId}`;
    }

    getEpisodeEmbed(tmdbId, season, episode) {
        return `${this.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;
    }
}

// =============================================================================
// Provider Registry — fallback order: VidKing → VidSrc → VidLink → 2Embed
// =============================================================================
const PROVIDERS = [
    new VidKing(),
    new VidSrc(),
    new VidLink(),
    new TwoEmbed()
];

// =============================================================================
// StreamingProviderManager
// Generates embed URLs, selects providers, handles fallback ordering.
// =============================================================================
class StreamingProviderManager {
    /**
     * Returns an ordered array of { name, url } objects for the given media.
     * Only providers that are available and support the requested media type
     * are included. The order matches the fallback priority.
     */
    static getProviders(tmdbId, mediaType, season = null, episode = null) {
        return PROVIDERS
            .filter(p => p.isAvailable())
            .filter(p => mediaType === 'tv' ? p.supportsTV() : p.supportsMovie())
            .map(provider => {
                const url = mediaType === 'tv'
                    ? provider.getEpisodeEmbed(tmdbId, season, episode)
                    : provider.getMovieEmbed(tmdbId);

                return {
                    name: provider.providerName,
                    url
                };
            });
    }
}

module.exports = {
    StreamingProviderManager,
    PROVIDERS
};
