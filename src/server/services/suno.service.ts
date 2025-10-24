import axios from 'axios';

const SUNO_API_URL = process.env.SUNO_API_URL || 'https://api.goapi.ai/suno';
const SUNO_API_KEY = process.env.SUNO_API_KEY || '';

export interface SunoGenerationRequest {
  prompt: string;
  genre?: string;
  mood?: string;
  duration?: number;
  instrumental?: boolean;
  customLyrics?: string;
}

export interface SunoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  videoUrl?: string;
  title?: string;
  tags?: string[];
  duration?: number;
  errorMessage?: string;
}

export class SunoService {
  /**
   * Generate music using Suno AI
   */
  static async generateMusic(request: SunoGenerationRequest): Promise<SunoGenerationResponse> {
    try {
      if (!SUNO_API_KEY) {
        throw new Error('Suno API key not configured');
      }

      const response = await axios.post(
        `${SUNO_API_URL}/v1/music/generate`,
        {
          prompt: request.prompt,
          make_instrumental: request.instrumental || false,
          custom_mode: !!request.customLyrics,
          lyrics: request.customLyrics,
          tags: request.genre ? [request.genre, request.mood].filter(Boolean).join(', ') : undefined,
          wait_audio: false, // Return immediately, poll for status
        },
        {
          headers: {
            'X-API-Key': SUNO_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        status: 'processing',
        title: response.data.title,
        tags: response.data.tags,
      };
    } catch (error: any) {
      console.error('Suno AI generation error:', error.response?.data || error.message);
      throw new Error(`Failed to generate music: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Check status of music generation
   */
  static async checkStatus(generationId: string): Promise<SunoGenerationResponse> {
    try {
      if (!SUNO_API_KEY) {
        throw new Error('Suno API key not configured');
      }

      const response = await axios.get(
        `${SUNO_API_URL}/v1/music/${generationId}`,
        {
          headers: {
            'X-API-Key': SUNO_API_KEY,
          },
        }
      );

      const data = response.data;

      return {
        id: data.id,
        status: data.status === 'complete' ? 'completed' : data.status === 'error' ? 'failed' : 'processing',
        audioUrl: data.audio_url,
        videoUrl: data.video_url,
        title: data.title,
        tags: data.tags,
        duration: data.duration,
        errorMessage: data.error_message,
      };
    } catch (error: any) {
      console.error('Suno AI status check error:', error.response?.data || error.message);
      throw new Error(`Failed to check status: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get pricing for music generation
   */
  static getPricing(): { cost: number; currency: string } {
    return {
      cost: 2, // $0.02 per generation
      currency: 'usd',
    };
  }
}

