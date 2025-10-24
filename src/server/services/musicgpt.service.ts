import axios from 'axios';

const MUSICGPT_API_URL = process.env.MUSICGPT_API_URL || 'https://api.musicgpt.com';
const MUSICGPT_API_KEY = process.env.MUSICGPT_API_KEY || '';

export interface MusicGPTGenerationRequest {
  prompt: string;
  genre?: string;
  mood?: string;
  duration?: number;
  instrumental?: boolean;
  needStems?: boolean; // Separate vocals and instrumentals
}

export interface MusicGPTGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrls?: string[]; // MusicGPT generates 2 versions
  stemsUrl?: string; // URL to download stems (vocals + instrumental)
  duration?: number;
  errorMessage?: string;
}

export class MusicGPTService {
  /**
   * Generate music using MusicGPT
   */
  static async generateMusic(request: MusicGPTGenerationRequest): Promise<MusicGPTGenerationResponse> {
    try {
      if (!MUSICGPT_API_KEY) {
        throw new Error('MusicGPT API key not configured');
      }

      const response = await axios.post(
        `${MUSICGPT_API_URL}/v1/generate`,
        {
          prompt: request.prompt,
          genre: request.genre,
          mood: request.mood,
          duration: request.duration || 120,
          instrumental: request.instrumental || false,
          generate_stems: request.needStems || false,
        },
        {
          headers: {
            'Authorization': `Bearer ${MUSICGPT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        status: 'processing',
      };
    } catch (error: any) {
      console.error('MusicGPT generation error:', error.response?.data || error.message);
      throw new Error(`Failed to generate music: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Check status of music generation
   */
  static async checkStatus(generationId: string): Promise<MusicGPTGenerationResponse> {
    try {
      if (!MUSICGPT_API_KEY) {
        throw new Error('MusicGPT API key not configured');
      }

      const response = await axios.get(
        `${MUSICGPT_API_URL}/v1/status/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${MUSICGPT_API_KEY}`,
          },
        }
      );

      const data = response.data;

      return {
        id: data.id,
        status: data.status,
        audioUrls: data.audio_urls,
        stemsUrl: data.stems_url,
        duration: data.duration,
        errorMessage: data.error_message,
      };
    } catch (error: any) {
      console.error('MusicGPT status check error:', error.response?.data || error.message);
      throw new Error(`Failed to check status: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Separate stems (vocals and instrumental) from existing audio
   */
  static async separateStems(audioUrl: string): Promise<{ vocalsUrl: string; instrumentalUrl: string }> {
    try {
      if (!MUSICGPT_API_KEY) {
        throw new Error('MusicGPT API key not configured');
      }

      const response = await axios.post(
        `${MUSICGPT_API_URL}/v1/stems/separate`,
        {
          audio_url: audioUrl,
        },
        {
          headers: {
            'Authorization': `Bearer ${MUSICGPT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        vocalsUrl: response.data.vocals_url,
        instrumentalUrl: response.data.instrumental_url,
      };
    } catch (error: any) {
      console.error('MusicGPT stem separation error:', error.response?.data || error.message);
      throw new Error(`Failed to separate stems: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get pricing for music generation
   */
  static getPricing(): { cost: number; currency: string } {
    return {
      cost: 3, // $0.03 per generation (Pro Plan)
      currency: 'usd',
    };
  }
}

