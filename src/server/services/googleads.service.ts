import { GoogleAdsApi, enums } from 'google-ads-api';

const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || '';
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || '';
const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN || '';
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || '';

export interface CampaignRequest {
  name: string;
  budget: number; // daily budget in cents
  keywords: string[];
  adCopy: {
    headlines: string[];
    descriptions: string[];
  };
  targetUrl: string;
  geoTargets?: string[]; // Country codes
}

export interface CampaignResponse {
  campaignId: string;
  status: string;
  budget: number;
}

export class GoogleAdsService {
  private static client: GoogleAdsApi | null = null;

  /**
   * Initialize Google Ads client
   */
  private static getClient(): GoogleAdsApi {
    if (!this.client) {
      this.client = new GoogleAdsApi({
        client_id: GOOGLE_ADS_CLIENT_ID,
        client_secret: GOOGLE_ADS_CLIENT_SECRET,
        developer_token: GOOGLE_ADS_DEVELOPER_TOKEN,
      });
    }
    return this.client;
  }

  /**
   * Create a new campaign
   */
  static async createCampaign(request: CampaignRequest): Promise<CampaignResponse> {
    try {
      const client = this.getClient();
      const customer = client.Customer({
        customer_id: GOOGLE_ADS_CUSTOMER_ID,
        refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      });

      // Create campaign budget
      const budgetResourceName = await this.createBudget(customer, request.name, request.budget);

      // Create campaign
      const campaignOperation = {
        create: {
          name: request.name,
          advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
          status: enums.CampaignStatus.PAUSED, // Start paused
          campaign_budget: budgetResourceName,
          network_settings: {
            target_google_search: true,
            target_search_network: true,
            target_content_network: false,
            target_partner_search_network: false,
          },
          bidding_strategy_type: enums.BiddingStrategyType.MAXIMIZE_CLICKS,
        },
      };

      const campaignResponse = await customer.campaigns.create([campaignOperation]);
      const campaignResourceName = campaignResponse.results[0].resource_name;
      const campaignId = campaignResourceName.split('/').pop()!;

      // Create ad group
      const adGroupResourceName = await this.createAdGroup(
        customer,
        campaignResourceName,
        `${request.name} - Ad Group`
      );

      // Create keywords
      await this.createKeywords(customer, adGroupResourceName, request.keywords);

      // Create responsive search ad
      await this.createAd(customer, adGroupResourceName, request.adCopy, request.targetUrl);

      return {
        campaignId,
        status: 'paused',
        budget: request.budget,
      };
    } catch (error: any) {
      console.error('Google Ads campaign creation error:', error);
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }

  /**
   * Create campaign budget
   */
  private static async createBudget(customer: any, name: string, dailyBudget: number): Promise<string> {
    const budgetOperation = {
      create: {
        name: `Budget for ${name}`,
        amount_micros: dailyBudget * 10000, // Convert cents to micros
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
      },
    };

    const response = await customer.campaignBudgets.create([budgetOperation]);
    return response.results[0].resource_name;
  }

  /**
   * Create ad group
   */
  private static async createAdGroup(customer: any, campaignResourceName: string, name: string): Promise<string> {
    const adGroupOperation = {
      create: {
        name,
        campaign: campaignResourceName,
        type: enums.AdGroupType.SEARCH_STANDARD,
        status: enums.AdGroupStatus.ENABLED,
        cpc_bid_micros: 2000000, // $2.00 max CPC
      },
    };

    const response = await customer.adGroups.create([adGroupOperation]);
    return response.results[0].resource_name;
  }

  /**
   * Create keywords
   */
  private static async createKeywords(customer: any, adGroupResourceName: string, keywords: string[]): Promise<void> {
    const operations = keywords.map(keyword => ({
      create: {
        ad_group: adGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: {
          text: keyword,
          match_type: enums.KeywordMatchType.BROAD,
        },
      },
    }));

    await customer.adGroupCriteria.create(operations);
  }

  /**
   * Create responsive search ad
   */
  private static async createAd(
    customer: any,
    adGroupResourceName: string,
    adCopy: { headlines: string[]; descriptions: string[] },
    finalUrl: string
  ): Promise<void> {
    const adOperation = {
      create: {
        ad_group: adGroupResourceName,
        status: enums.AdGroupAdStatus.ENABLED,
        ad: {
          final_urls: [finalUrl],
          responsive_search_ad: {
            headlines: adCopy.headlines.map(text => ({ text })),
            descriptions: adCopy.descriptions.map(text => ({ text })),
          },
        },
      },
    };

    await customer.adGroupAds.create([adOperation]);
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(campaignId: string): Promise<{
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
  }> {
    try {
      const client = this.getClient();
      const customer = client.Customer({
        customer_id: GOOGLE_ADS_CUSTOMER_ID,
        refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      });

      const query = `
        SELECT
          campaign.id,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros
        FROM campaign
        WHERE campaign.id = ${campaignId}
      `;

      const results = await customer.query(query);
      const row = results[0];

      return {
        impressions: row.metrics?.impressions || 0,
        clicks: row.metrics?.clicks || 0,
        conversions: row.metrics?.conversions || 0,
        cost: Math.round((row.metrics?.cost_micros || 0) / 10000), // Convert micros to cents
      };
    } catch (error: any) {
      console.error('Google Ads stats error:', error);
      throw new Error(`Failed to get campaign stats: ${error.message}`);
    }
  }

  /**
   * Pause/Resume campaign
   */
  static async updateCampaignStatus(campaignId: string, status: 'active' | 'paused'): Promise<void> {
    try {
      const client = this.getClient();
      const customer = client.Customer({
        customer_id: GOOGLE_ADS_CUSTOMER_ID,
        refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      });

      const campaignResourceName = `customers/${GOOGLE_ADS_CUSTOMER_ID}/campaigns/${campaignId}`;

      const operation = {
        update: {
          resource_name: campaignResourceName,
          status: status === 'active' ? enums.CampaignStatus.ENABLED : enums.CampaignStatus.PAUSED,
        },
        update_mask: { paths: ['status'] },
      };

      await customer.campaigns.update([operation]);
    } catch (error: any) {
      console.error('Google Ads status update error:', error);
      throw new Error(`Failed to update campaign status: ${error.message}`);
    }
  }
}

