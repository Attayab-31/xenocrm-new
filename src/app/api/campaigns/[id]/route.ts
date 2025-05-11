import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import { logger } from "@/lib/logger";
import { summarizeCampaignPerformance } from "@/lib/ai";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const campaignId = context.params.id;
    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }
    
    // Find the campaign
    const campaign = await Campaign.findById(campaignId).lean();
    
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    
    // Generate AI summary
    const aiSummary = await summarizeCampaignPerformance({
      name: campaign.name,
      audienceSize: campaign.audienceSize,
      sent: campaign.sentCount,
      failed: campaign.failedCount
    });
    
    return NextResponse.json({
      campaign: {
        ...campaign,
        aiSummary
      }
    }, { status: 200 });
    
  } catch (error) {
    logger.error(`Error fetching campaign details`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}