import { NextRequest, NextResponse } from 'next/server';
import { WebSearchSkill } from '@agentdao/core';

// Lazy initialization of WebSearchSkill to avoid build-time errors
let webSearchSkill: WebSearchSkill | null = null;

function getWebSearchSkill(): WebSearchSkill {
  if (!webSearchSkill) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.');
    }
    
    webSearchSkill = new WebSearchSkill({
      agentId: 'social-media-content-creator',
      agentName: 'Social Media Content Creator',
      domain: 'social-media.agentdao.com',
      
      ai: {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: apiKey,
        maxTokens: 4000,
        temperature: 0.8
      },
      
      search: {
        maxResults: 10,
        includeImages: true,
        includeNews: true
      }
    });
  }
  return webSearchSkill;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'generate_content':
        return await generateContent(data);
      case 'schedule_post':
        return await schedulePost(data);
      case 'post_now':
        return await postNow(data);
      case 'get_analytics':
        return await getAnalytics(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Social Media API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateContent(data: any) {
  const { topic, brandVoice, targetAudience, platforms } = data;

  if (!topic || !targetAudience) {
    return NextResponse.json(
      { error: 'Topic and target audience are required' },
      { status: 400 }
    );
  }

  try {
    const prompt = `Create engaging social media content for the following specifications:

Topic: ${topic}
Brand Voice: ${brandVoice}
Target Audience: ${targetAudience}
Platforms: ${platforms.join(', ')}

For each platform, create:
1. A compelling post (within character limits)
2. Relevant hashtags
3. Suggested media type (image, video, carousel, etc.)
4. Best posting time
5. Engagement tips

Platform-specific requirements:
${platforms.map((platform: string) => {
  const limits = {
    twitter: 280,
    linkedin: 3000,
    facebook: 63206,
    instagram: 2200,
    tiktok: 150
  };
  const tones = {
    twitter: 'conversational and engaging',
    linkedin: 'professional and thought leadership',
    facebook: 'friendly and community-focused',
    instagram: 'visual and lifestyle-focused',
    tiktok: 'trendy and entertaining'
  };
  return `${platform}: ${limits[platform as keyof typeof limits] || 280} chars, ${tones[platform as keyof typeof tones] || 'engaging'} tone`;
}).join('\n')}

Return as JSON with this structure:
{
  "posts": [
    {
      "platform": "platform_name",
      "content": "post content",
      "hashtags": ["hashtag1", "hashtag2"],
      "mediaType": "image/video/carousel",
      "bestTime": "time suggestion",
      "engagementTips": "tips for better engagement"
    }
  ],
  "contentStrategy": "overall strategy summary",
  "trendingTopics": ["topic1", "topic2"],
  "hashtagStrategy": "hashtag strategy explanation"
}`;

    const aiResults = await getWebSearchSkill().searchWithAI(
      `${topic} social media content ${brandVoice} ${targetAudience}`,
      prompt
    );

    let parsedResults;
    try {
      if (typeof aiResults === 'string') {
        parsedResults = JSON.parse(aiResults);
      } else {
        parsedResults = aiResults;
      }
    } catch (e) {
      // Fallback to generated content if parsing fails
      parsedResults = generateFallbackContent(topic, brandVoice, targetAudience, platforms);
    }

    return NextResponse.json({ success: true, data: parsedResults });
  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function generateFallbackContent(topic: string, voice: string, audience: string, platforms: string[]) {
  const posts = platforms.map((platform: string) => {
    const limits = {
      twitter: 280,
      linkedin: 3000,
      facebook: 63206,
      instagram: 2200,
      tiktok: 150
    };
    
    const content = `🚀 Exciting news about ${topic}! 

${voice === 'professional' ? 'We\'re thrilled to share insights that will help you succeed.' : 
  voice === 'casual' ? 'This is going to be awesome!' : 
  'Discover how this can transform your experience.'}

#${topic.replace(/\s+/g, '')} #innovation #success

Best time to post: ${getBestTimeForPlatform(platform)}
Media: Image or video recommended`;

    return {
      platform,
      content: content.substring(0, limits[platform as keyof typeof limits] || 280),
      hashtags: [`#${topic.replace(/\s+/g, '')}`, '#innovation', '#success'],
      mediaType: 'image',
      bestTime: getBestTimeForPlatform(platform),
      engagementTips: 'Ask questions, use emojis, and encourage comments!'
    };
  });

  return {
    posts,
    contentStrategy: `Create engaging ${voice} content about ${topic} for ${audience}`,
    trendingTopics: [topic, 'innovation', 'success'],
    hashtagStrategy: 'Use relevant hashtags to increase discoverability'
  };
}

function getBestTimeForPlatform(platform: string) {
  const times = {
    twitter: '9-10 AM or 1-3 PM',
    linkedin: '8-10 AM or 5-6 PM',
    facebook: '1-4 PM or 7-9 PM',
    instagram: '11 AM-1 PM or 7-9 PM',
    tiktok: '6-10 PM'
  };
  return times[platform as keyof typeof times] || '9 AM';
}

async function schedulePost(data: any) {
  const { platform, content, scheduledFor } = data;

  // In a real implementation, this would save to a database
  // For now, we'll simulate the scheduling
  const scheduledPost = {
    id: Date.now().toString(),
    platform,
    content,
    scheduledFor: new Date(scheduledFor),
    status: 'scheduled',
    createdAt: new Date()
  };

  return NextResponse.json({ 
    success: true, 
    data: scheduledPost,
    message: `Post scheduled for ${platform} on ${new Date(scheduledFor).toLocaleString()}`
  });
}

async function postNow(data: any) {
  const { platform, content } = data;

  // In a real implementation, this would post to the actual social media platform
  // For now, we'll simulate the posting
  const postedContent = {
    id: Date.now().toString(),
    platform,
    content,
    status: 'posted',
    engagement: {
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20),
      clicks: Math.floor(Math.random() * 200)
    },
    createdAt: new Date()
  };

  return NextResponse.json({ 
    success: true, 
    data: postedContent,
    message: `Successfully posted to ${platform}`
  });
}

async function getAnalytics(data: any) {
  // In a real implementation, this would fetch analytics from social media platforms
  // For now, we'll return mock analytics
  const analytics = {
    totalPosts: 25,
    totalLikes: 1250,
    totalShares: 450,
    totalComments: 180,
    totalClicks: 3200,
    engagementRate: 4.2,
    topPerformingPlatform: 'instagram',
    bestPostingTimes: {
      twitter: '9-10 AM',
      linkedin: '8-10 AM',
      facebook: '1-4 PM',
      instagram: '11 AM-1 PM',
      tiktok: '6-10 PM'
    },
    recentPosts: [
      {
        platform: 'twitter',
        content: 'Exciting product launch! 🚀',
        engagement: { likes: 45, shares: 12, comments: 8, clicks: 120 }
      },
      {
        platform: 'linkedin',
        content: 'Industry insights on digital transformation...',
        engagement: { likes: 89, shares: 23, comments: 15, clicks: 340 }
      }
    ]
  };

  return NextResponse.json({ success: true, data: analytics });
} 