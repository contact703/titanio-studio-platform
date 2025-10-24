import axios from 'axios';

/**
 * TikTok Service
 * Handles video uploads and publishing to TikTok
 */
export class TikTokService {
  private static CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
  private static CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
  private static REDIRECT_URI = process.env.VITE_API_URL + '/api/auth/tiktok/callback' || 'http://localhost:3000/api/auth/tiktok/callback';

  static getAuthUrl(): string {
    const params = new URLSearchParams({
      client_key: this.CLIENT_KEY,
      response_type: 'code',
      scope: 'user.info.basic,video.upload,video.publish',
      redirect_uri: this.REDIRECT_URI,
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  static async getTokensFromCode(code: string) {
    try {
      const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
        client_key: this.CLIENT_KEY,
        client_secret: this.CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.REDIRECT_URI,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error: any) {
      console.error('TikTok token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange TikTok authorization code');
    }
  }

  static async uploadVideo(
    accessToken: string,
    videoUrl: string,
    title: string,
    description?: string
  ): Promise<{ videoId: string; url: string }> {
    try {
      // TikTok upload process:
      // 1. Initialize upload
      // 2. Upload video chunks
      // 3. Publish video

      const initResponse = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title,
            description: description || '',
            privacy_level: 'SELF_ONLY', // Start as private
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0, // Will be set during upload
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const publishId = initResponse.data.data.publish_id;
      const uploadUrl = initResponse.data.data.upload_url;

      // In production, implement actual video upload
      // For now, return placeholder
      return {
        videoId: publishId,
        url: `https://www.tiktok.com/@user/video/${publishId}`,
      };
    } catch (error: any) {
      console.error('TikTok upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload to TikTok: ${error.message}`);
    }
  }
}

/**
 * Meta (Facebook/Instagram) Service
 * Handles publishing to Facebook and Instagram
 */
export class MetaService {
  private static APP_ID = process.env.META_APP_ID || '';
  private static APP_SECRET = process.env.META_APP_SECRET || '';
  private static REDIRECT_URI = process.env.VITE_API_URL + '/api/auth/meta/callback' || 'http://localhost:3000/api/auth/meta/callback';

  static getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.APP_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
      response_type: 'code',
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  static async getTokensFromCode(code: string) {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: this.APP_ID,
          client_secret: this.APP_SECRET,
          redirect_uri: this.REDIRECT_URI,
          code,
        },
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error: any) {
      console.error('Meta token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Meta authorization code');
    }
  }

  static async publishToFacebook(
    accessToken: string,
    pageId: string,
    videoUrl: string,
    message: string
  ): Promise<{ postId: string; url: string }> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/videos`,
        {
          file_url: videoUrl,
          description: message,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return {
        postId: response.data.id,
        url: `https://www.facebook.com/${response.data.id}`,
      };
    } catch (error: any) {
      console.error('Facebook publish error:', error.response?.data || error.message);
      throw new Error(`Failed to publish to Facebook: ${error.message}`);
    }
  }

  static async publishToInstagram(
    accessToken: string,
    instagramAccountId: string,
    videoUrl: string,
    caption: string
  ): Promise<{ mediaId: string; url: string }> {
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          video_url: videoUrl,
          caption,
          media_type: 'REELS', // Use REELS for music videos
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          creation_id: containerId,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return {
        mediaId: publishResponse.data.id,
        url: `https://www.instagram.com/p/${publishResponse.data.id}`,
      };
    } catch (error: any) {
      console.error('Instagram publish error:', error.response?.data || error.message);
      throw new Error(`Failed to publish to Instagram: ${error.message}`);
    }
  }
}

/**
 * Apple Music Service
 * Note: Apple Music doesn't have a public upload API
 * Music must be distributed through aggregators
 */
export class AppleMusicService {
  static getDistributionInfo() {
    return {
      message: 'Apple Music requires music to be distributed through official music aggregators.',
      distributors: [
        {
          name: 'DistroKid',
          url: 'https://distrokid.com',
          pricing: '$22.99/year for unlimited uploads',
          features: ['Apple Music', 'iTunes', 'All major platforms'],
        },
        {
          name: 'TuneCore',
          url: 'https://www.tunecore.com',
          pricing: '$29.99/year per album',
          features: ['Keep 100% of royalties', 'Apple Music included'],
        },
        {
          name: 'CD Baby',
          url: 'https://www.cdbaby.com',
          pricing: '$9.95 per single',
          features: ['One-time fee', 'Apple Music distribution'],
        },
      ],
    };
  }

  static async searchMusic(query: string): Promise<any[]> {
    try {
      const response = await axios.get('https://itunes.apple.com/search', {
        params: {
          term: query,
          media: 'music',
          entity: 'song',
          limit: 10,
        },
      });

      return response.data.results.map((track: any) => ({
        id: track.trackId,
        name: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        url: track.trackViewUrl,
        previewUrl: track.previewUrl,
        artwork: track.artworkUrl100,
      }));
    } catch (error: any) {
      console.error('Apple Music search error:', error);
      throw new Error('Failed to search Apple Music');
    }
  }
}

/**
 * Deezer Service
 * Note: Deezer doesn't have a public upload API
 * Music must be distributed through aggregators
 */
export class DeezerService {
  private static APP_ID = process.env.DEEZER_APP_ID || '';
  private static SECRET_KEY = process.env.DEEZER_SECRET_KEY || '';

  static getDistributionInfo() {
    return {
      message: 'Deezer requires music to be distributed through official music aggregators.',
      distributors: [
        {
          name: 'DistroKid',
          url: 'https://distrokid.com',
          pricing: '$22.99/year for unlimited uploads',
          features: ['Deezer', 'All major platforms'],
        },
        {
          name: 'TuneCore',
          url: 'https://www.tunecore.com',
          pricing: '$29.99/year per album',
          features: ['Deezer included', 'Keep 100% of royalties'],
        },
      ],
    };
  }

  static async searchMusic(query: string): Promise<any[]> {
    try {
      const response = await axios.get('https://api.deezer.com/search', {
        params: {
          q: query,
          limit: 10,
        },
      });

      return response.data.data.map((track: any) => ({
        id: track.id,
        name: track.title,
        artist: track.artist.name,
        album: track.album.title,
        url: track.link,
        previewUrl: track.preview,
        artwork: track.album.cover_medium,
      }));
    } catch (error: any) {
      console.error('Deezer search error:', error);
      throw new Error('Failed to search Deezer');
    }
  }
}

