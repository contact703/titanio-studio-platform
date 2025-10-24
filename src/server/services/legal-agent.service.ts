import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export interface LegalQuery {
  question: string;
  context?: string;
}

export interface LegalResponse {
  answer: string;
  references: Array<{
    source: string;
    url?: string;
    excerpt?: string;
  }>;
  category: string;
  confidence: number;
}

export class LegalAgentService {
  private static openai: OpenAI | null = null;

  private static getClient(): OpenAI {
    if (!this.openai) {
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }
      this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    }
    return this.openai;
  }

  /**
   * Legal knowledge base (simplified version)
   * In production, this would be stored in Pinecone or similar vector database
   */
  private static legalKnowledge = {
    suno_ai: {
      commercial_use: `Suno AI allows commercial use of generated music under their Pro and Premier plans. 
      Free tier users can only use generated music for non-commercial purposes. 
      You own the copyright to music you generate with a paid subscription.`,
      licensing: `With a paid Suno subscription, you receive full commercial rights to your generated music. 
      This includes the right to monetize on streaming platforms, use in videos, and sell as NFTs.`,
      attribution: `Attribution to Suno AI is not required for commercial use with paid plans, 
      but it's appreciated. Free tier users must attribute Suno AI if sharing publicly.`,
    },
    musicgpt: {
      commercial_use: `MusicGPT Pro Plan allows full commercial use of generated music. 
      You retain all rights to the output and can use it in any commercial project.`,
      licensing: `MusicGPT provides royalty-free licenses for all music generated with paid plans. 
      No additional licensing fees or royalties are required.`,
    },
    youtube: {
      content_id: `YouTube's Content ID system may flag AI-generated music if it sounds similar to existing works. 
      Always keep proof of generation (timestamps, prompts) to dispute false claims.`,
      monetization: `You can monetize videos with AI-generated music if you have commercial rights to the music. 
      Join the YouTube Partner Program once you meet eligibility requirements.`,
    },
    spotify: {
      distribution: `Spotify doesn't accept direct uploads. Use distributors like DistroKid, TuneCore, or CD Baby. 
      Ensure you have commercial rights to AI-generated music before distributing.`,
      royalties: `You'll receive royalties based on streams. Typical payout is $0.003-0.005 per stream. 
      Distributors may take a percentage or charge annual fees.`,
    },
    copyright: {
      ai_generated: `Copyright law for AI-generated content is evolving. In the US, purely AI-generated works 
      may not be copyrightable, but works with human creative input generally are. 
      Always add human creativity (editing, arrangement, lyrics) to strengthen copyright claims.`,
      fair_use: `Fair use allows limited use of copyrighted material for purposes like commentary, criticism, 
      or parody. However, AI-generated music should be original and not copy existing works.`,
    },
  };

  /**
   * Answer legal questions using AI
   */
  static async answerQuestion(query: LegalQuery): Promise<LegalResponse> {
    try {
      const client = this.getClient();

      // Determine category
      const category = this.categorizeQuestion(query.question);

      // Get relevant knowledge
      const relevantKnowledge = this.getRelevantKnowledge(category);

      // Create prompt
      const systemPrompt = `You are a legal expert specializing in AI-generated content, copyright law, 
      and music licensing. Provide accurate, helpful answers based on current laws and platform terms of service. 
      Always cite sources and be clear about legal uncertainties. 
      
      Here is relevant legal information:
      ${relevantKnowledge}`;

      const userPrompt = `Question: ${query.question}
      ${query.context ? `\nContext: ${query.context}` : ''}
      
      Please provide a clear, accurate answer with specific references to laws, terms of service, or platform policies.`;

      // Get AI response
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more factual responses
        max_tokens: 1000,
      });

      const answer = completion.choices[0].message.content || 'Unable to generate response';

      // Extract references
      const references = this.extractReferences(category);

      return {
        answer,
        references,
        category,
        confidence: 0.85, // Placeholder - in production, calculate based on knowledge base match
      };
    } catch (error: any) {
      console.error('Legal agent error:', error);
      throw new Error(`Failed to answer legal question: ${error.message}`);
    }
  }

  /**
   * Categorize question
   */
  private static categorizeQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('suno')) return 'suno_ai';
    if (lowerQuestion.includes('musicgpt')) return 'musicgpt';
    if (lowerQuestion.includes('youtube')) return 'youtube';
    if (lowerQuestion.includes('spotify')) return 'spotify';
    if (lowerQuestion.includes('copyright') || lowerQuestion.includes('direitos autorais')) return 'copyright';
    if (lowerQuestion.includes('commercial') || lowerQuestion.includes('comercial')) return 'commercial_use';
    if (lowerQuestion.includes('license') || lowerQuestion.includes('licença')) return 'licensing';

    return 'general';
  }

  /**
   * Get relevant knowledge for category
   */
  private static getRelevantKnowledge(category: string): string {
    const knowledge: string[] = [];

    if (category.includes('suno') || category === 'general') {
      knowledge.push(JSON.stringify(this.legalKnowledge.suno_ai, null, 2));
    }
    if (category.includes('musicgpt') || category === 'general') {
      knowledge.push(JSON.stringify(this.legalKnowledge.musicgpt, null, 2));
    }
    if (category.includes('youtube') || category === 'general') {
      knowledge.push(JSON.stringify(this.legalKnowledge.youtube, null, 2));
    }
    if (category.includes('spotify') || category === 'general') {
      knowledge.push(JSON.stringify(this.legalKnowledge.spotify, null, 2));
    }
    if (category.includes('copyright') || category === 'general') {
      knowledge.push(JSON.stringify(this.legalKnowledge.copyright, null, 2));
    }

    return knowledge.join('\n\n');
  }

  /**
   * Extract references for category
   */
  private static extractReferences(category: string): Array<{ source: string; url?: string; excerpt?: string }> {
    const references: Array<{ source: string; url?: string; excerpt?: string }> = [];

    if (category.includes('suno')) {
      references.push({
        source: 'Suno AI Terms of Service',
        url: 'https://suno.com/terms',
        excerpt: 'Commercial use rights for paid subscribers',
      });
    }

    if (category.includes('youtube')) {
      references.push({
        source: 'YouTube Partner Program Policies',
        url: 'https://support.google.com/youtube/answer/1311392',
        excerpt: 'Monetization and Content ID guidelines',
      });
    }

    if (category.includes('spotify')) {
      references.push({
        source: 'Spotify for Artists - Distribution Guide',
        url: 'https://artists.spotify.com/faq/distribution',
        excerpt: 'How to distribute music to Spotify',
      });
    }

    if (category.includes('copyright')) {
      references.push({
        source: 'U.S. Copyright Office - AI and Copyright',
        url: 'https://www.copyright.gov/ai/',
        excerpt: 'Guidance on AI-generated works',
      });
    }

    // Always add general reference
    references.push({
      source: 'Titanio Studio Legal Knowledge Base',
      excerpt: 'Curated information on AI music and video rights',
    });

    return references;
  }

  /**
   * Get common legal questions and answers
   */
  static getCommonQuestions(): Array<{ question: string; category: string }> {
    return [
      {
        question: 'Can I use Suno AI music commercially?',
        category: 'suno_ai',
      },
      {
        question: 'Do I own the copyright to AI-generated music?',
        category: 'copyright',
      },
      {
        question: 'How do I monetize my music video on YouTube?',
        category: 'youtube',
      },
      {
        question: 'Can I distribute AI music on Spotify?',
        category: 'spotify',
      },
      {
        question: 'What are the licensing requirements for MusicGPT?',
        category: 'musicgpt',
      },
      {
        question: 'Do I need to attribute the AI platform?',
        category: 'licensing',
      },
    ];
  }
}

