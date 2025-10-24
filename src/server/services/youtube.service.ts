import { google } from 'googleapis';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const YOUTUBE_REDIRECT_URI = process.env.VITE_API_URL + '/api/auth/youtube/callback' || 'http://localhost:3000/api/auth/youtube/callback';

export interface YouTubeUploadRequest {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'public' | 'private' | 'unlisted';
  videoUrl: string; // URL or local path
  thumbnailUrl?: string;
}

export interface YouTubeUploadResponse {
  videoId: string;
  url: string;
  status: string;
}

export class YouTubeService {
  private static oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    YOUTUBE_REDIRECT_URI
  );

  /**
   * Get OAuth URL for user authorization
   */
  static getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  static async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Set credentials for authenticated requests
   */
  static setCredentials(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Upload video to YouTube
   */
  static async uploadVideo(
    request: YouTubeUploadRequest,
    accessToken: string,
    refreshToken?: string
  ): Promise<YouTubeUploadResponse> {
    try {
      this.setCredentials(accessToken, refreshToken);

      const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

      // Download video if URL provided
      let videoPath = request.videoUrl;
      if (request.videoUrl.startsWith('http')) {
        videoPath = await this.downloadVideo(request.videoUrl);
      }

      // Upload video
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: request.title,
            description: request.description,
            tags: request.tags || [],
            categoryId: request.categoryId || '10', // Music category
          },
          status: {
            privacyStatus: request.privacyStatus || 'public',
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });

      const videoId = response.data.id!;

      // Upload thumbnail if provided
      if (request.thumbnailUrl) {
        await this.uploadThumbnail(videoId, request.thumbnailUrl, accessToken, refreshToken);
      }

      // Clean up downloaded file
      if (request.videoUrl.startsWith('http')) {
        fs.unlinkSync(videoPath);
      }

      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        status: response.data.status?.uploadStatus || 'uploaded',
      };
    } catch (error: any) {
      console.error('YouTube upload error:', error);
      throw new Error(`Failed to upload to YouTube: ${error.message}`);
    }
  }

  /**
   * Upload thumbnail for video
   */
  static async uploadThumbnail(
    videoId: string,
    thumbnailUrl: string,
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      this.setCredentials(accessToken, refreshToken);

      const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

      // Download thumbnail
      const thumbnailPath = await this.downloadVideo(thumbnailUrl);

      await youtube.thumbnails.set({
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath),
        },
      });

      // Clean up
      fs.unlinkSync(thumbnailPath);
    } catch (error: any) {
      console.error('YouTube thumbnail upload error:', error);
      // Don't throw, thumbnail upload is optional
    }
  }

  /**
   * Download video/image from URL
   */
  private static async downloadVideo(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'stream' });
    const extension = path.extname(url) || '.mp4';
    const tempPath = path.join('/tmp', `youtube-upload-${Date.now()}${extension}`);
    
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(tempPath));
      writer.on('error', reject);
    });
  }

  /**
   * Get video statistics
   */
  static async getVideoStats(videoId: string, accessToken: string, refreshToken?: string) {
    try {
      this.setCredentials(accessToken, refreshToken);

      const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

      const response = await youtube.videos.list({
        part: ['statistics', 'status'],
        id: [videoId],
      });

      const video = response.data.items?.[0];

      return {
        views: parseInt(video?.statistics?.viewCount || '0'),
        likes: parseInt(video?.statistics?.likeCount || '0'),
        comments: parseInt(video?.statistics?.commentCount || '0'),
        status: video?.status?.uploadStatus,
      };
    } catch (error: any) {
      console.error('YouTube stats error:', error);
      throw new Error(`Failed to get video stats: ${error.message}`);
    }
  }
}

