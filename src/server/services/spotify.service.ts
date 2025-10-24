import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const SPOTIFY_REDIRECT_URI = process.env.VITE_API_URL + '/api/auth/spotify/callback' || 'http://localhost:3000/api/auth/spotify/callback';

export interface SpotifyTrackInfo {
  title: string;
  artist: string;
  album?: string;
  releaseDate?: string;
  genre?: string;
  isrc?: string;
}

export class SpotifyService {
  /**
   * Get OAuth URL for user authorization
   */
  static getAuthUrl(): string {
    const scopes = [
      'user-read-email',
      'user-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
    ];

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: scopes.join(' '),
      show_dialog: 'true',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  static async getTokensFromCode(code: string) {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error: any) {
      console.error('Spotify token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Spotify authorization code');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error: any) {
      console.error('Spotify token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh Spotify access token');
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(accessToken: string) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return {
        id: response.data.id,
        email: response.data.email,
        displayName: response.data.display_name,
        country: response.data.country,
        product: response.data.product, // premium, free
      };
    } catch (error: any) {
      console.error('Spotify profile error:', error.response?.data || error.message);
      throw new Error('Failed to get Spotify user profile');
    }
  }

  /**
   * Create a playlist
   */
  static async createPlaylist(
    accessToken: string,
    userId: string,
    name: string,
    description?: string
  ) {
    try {
      const response = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name,
          description: description || 'Created by Titanio Studio',
          public: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        url: response.data.external_urls.spotify,
        name: response.data.name,
      };
    } catch (error: any) {
      console.error('Spotify playlist creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Spotify playlist');
    }
  }

  /**
   * Search for tracks
   */
  static async searchTracks(accessToken: string, query: string, limit: number = 10) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: query,
          type: 'track',
          limit,
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        url: track.external_urls.spotify,
        previewUrl: track.preview_url,
        duration: track.duration_ms,
      }));
    } catch (error: any) {
      console.error('Spotify search error:', error.response?.data || error.message);
      throw new Error('Failed to search Spotify tracks');
    }
  }

  /**
   * Note: Spotify doesn't allow direct uploads via API
   * Music needs to be distributed through official distributors like DistroKid, TuneCore, etc.
   * This method provides information about distribution
   */
  static getDistributionInfo(): {
    message: string;
    distributors: Array<{ name: string; url: string; pricing: string }>;
  } {
    return {
      message: 'Spotify requires music to be distributed through official music distributors.',
      distributors: [
        {
          name: 'DistroKid',
          url: 'https://distrokid.com',
          pricing: '$22.99/year for unlimited uploads',
        },
        {
          name: 'TuneCore',
          url: 'https://www.tunecore.com',
          pricing: '$29.99/year per album',
        },
        {
          name: 'CD Baby',
          url: 'https://www.cdbaby.com',
          pricing: '$9.95 per single',
        },
        {
          name: 'Amuse',
          url: 'https://www.amuse.io',
          pricing: 'Free tier available',
        },
      ],
    };
  }
}

