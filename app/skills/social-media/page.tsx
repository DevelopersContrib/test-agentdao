"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  media?: string[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
  createdAt: Date;
}

interface ContentCalendar {
  id: string;
  title: string;
  description: string;
  posts: SocialMediaPost[];
  theme: string;
  startDate: Date;
  endDate: Date;
}

interface PlatformConfig {
  name: string;
  icon: string;
  characterLimit: number;
  supportsMedia: boolean;
  supportsScheduling: boolean;
  tone: string;
}

export default function SocialMediaSkillPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'schedule' | 'calendar' | 'analytics' | 'documentation'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [calendars, setCalendars] = useState<ContentCalendar[]>([]);

  // Content creation state
  const [topic, setTopic] = useState("");
  const [brandVoice, setBrandVoice] = useState("professional");
  const [targetAudience, setTargetAudience] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(['twitter']);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Scheduling state
  const [scheduledPosts, setScheduledPosts] = useState<SocialMediaPost[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");



  const platformConfigs: PlatformConfig[] = [
    {
      name: 'twitter',
      icon: '🐦',
      characterLimit: 280,
      supportsMedia: true,
      supportsScheduling: true,
      tone: 'conversational and engaging'
    },
    {
      name: 'linkedin',
      icon: '💼',
      characterLimit: 3000,
      supportsMedia: true,
      supportsScheduling: true,
      tone: 'professional and thought leadership'
    },
    {
      name: 'facebook',
      icon: '📘',
      characterLimit: 63206,
      supportsMedia: true,
      supportsScheduling: true,
      tone: 'friendly and community-focused'
    },
    {
      name: 'instagram',
      icon: '📷',
      characterLimit: 2200,
      supportsMedia: true,
      supportsScheduling: true,
      tone: 'visual and lifestyle-focused'
    },
    {
      name: 'tiktok',
      icon: '🎵',
      characterLimit: 150,
      supportsMedia: true,
      supportsScheduling: true,
      tone: 'trendy and entertaining'
    }
  ];

  const handleGenerateContent = async () => {
    if (!topic || !targetAudience) {
      setError("Please provide a topic and target audience");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedContent(null);

    try {
      const response = await fetch('/api/skills/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_content',
          data: {
            topic,
            brandVoice,
            targetAudience,
            platforms
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate content');
      }

      setGeneratedContent(result.data);
    } catch (err: any) {
      console.error('Content generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };



  const handleSchedulePost = async (post: any) => {
    if (!scheduleDate || !scheduleTime) {
      setError("Please select date and time for scheduling");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/skills/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'schedule_post',
          data: {
            platform: post.platform,
            content: post.content,
            scheduledFor: `${scheduleDate}T${scheduleTime}`
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule post');
      }

      setScheduledPosts([...scheduledPosts, result.data]);
      setScheduleDate("");
      setScheduleTime("");
    } catch (err: any) {
      console.error('Scheduling error:', err);
      setError(err.message || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNow = async (post: any) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/skills/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'post_now',
          data: {
            platform: post.platform,
            content: post.content
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post');
      }

      setPosts([...posts, result.data]);
    } catch (err: any) {
      console.error('Posting error:', err);
      setError(err.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const createContentCalendar = () => {
    if (!generatedContent) return;

    const calendar: ContentCalendar = {
      id: Date.now().toString(),
      title: `${topic} Content Campaign`,
      description: `Social media campaign for ${topic}`,
      posts: generatedContent.posts.map((post: any) => ({
        id: Date.now().toString() + Math.random(),
        platform: post.platform,
        content: post.content,
        status: 'draft' as const,
        createdAt: new Date()
      })),
      theme: brandVoice,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
    };

    setCalendars([...calendars, calendar]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Social Media Manager</h1>
          <p className="text-xl text-gray-600 mb-4">
            Create, schedule, and manage social media content with OpenAI-powered intelligence
          </p>
          <div className="flex space-x-2">
            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              🤖 Powered by OpenAI GPT-4
            </span>
            <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-semibold">
              📅 Advanced Scheduling
            </span>
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              📊 Analytics & Insights
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'create', label: 'Content Creation', icon: '✍️' },
            { id: 'schedule', label: 'Scheduler', icon: '📅' },
            { id: 'calendar', label: 'Content Calendar', icon: '📋' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'documentation', label: 'Documentation', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Creation Tab */}
        {activeTab === 'create' && (
          <div className="space-y-8">
            {/* Configuration */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-600">Content Creation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic/Theme</label>
                  <input
                    type="text"
                    placeholder="e.g., Product launch, Industry insights, Company culture"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Voice</label>
                  <select
                    value={brandVoice}
                    onChange={(e) => setBrandVoice(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="humorous">Humorous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g., Tech professionals, Fitness enthusiasts, Small business owners"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                  <div className="space-y-2">
                    {platformConfigs.map(platform => (
                      <label key={platform.name} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platforms.includes(platform.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlatforms([...platforms, platform.name]);
                            } else {
                              setPlatforms(platforms.filter(p => p !== platform.name));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="mr-2">{platform.icon}</span>
                        <span className="capitalize">{platform.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({platform.characterLimit} chars)</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleGenerateContent}
                disabled={loading}
                className="mt-6 w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {loading ? "🤖 Generating AI Content..." : "🚀 Generate AI Content"}
              </button>
            </div>

            {/* Generated Content */}
            {generatedContent && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-6 text-green-600">Generated Content</h2>
                
                {/* Strategy Overview */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Content Strategy</h3>
                  <p className="text-blue-700">{generatedContent.contentStrategy}</p>
                </div>

                {/* Platform Posts */}
                <div className="space-y-6">
                  {generatedContent.posts?.map((post: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">
                            {platformConfigs.find(p => p.name === post.platform)?.icon}
                          </span>
                          <h3 className="font-semibold text-lg capitalize">{post.platform}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePostNow(post)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Post Now
                          </button>
                          <button
                            onClick={() => handleSchedulePost(post)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Schedule
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Content:</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Hashtags:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.hashtags?.map((tag: string, i: number) => (
                              <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Media Type:</strong> {post.mediaType}
                        </div>
                        <div>
                          <strong>Best Time:</strong> {post.bestTime}
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <strong className="text-yellow-800">Engagement Tips:</strong>
                        <p className="text-yellow-700 text-sm mt-1">{post.engagementTips}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Calendar Button */}
                <button
                  onClick={createContentCalendar}
                  className="mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  📋 Create Content Calendar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scheduler Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-blue-600">Post Scheduler</h2>
              
              {/* Schedule Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      const now = new Date();
                      setScheduleDate(now.toISOString().split('T')[0]);
                      setScheduleTime(now.toTimeString().slice(0, 5));
                    }}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Set to Now
                  </button>
                </div>
              </div>

              {/* Scheduled Posts */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Scheduled Posts ({scheduledPosts.length})</h3>
                {scheduledPosts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="text-xl mr-2">
                            {platformConfigs.find(p => p.name === post.platform)?.icon}
                          </span>
                          <span className="font-semibold capitalize">{post.platform}</span>
                          <span className="ml-4 text-sm text-gray-500">
                            {post.scheduledFor?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{post.content}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                          Cancel
                        </button>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-600">Content Calendar</h2>
              
              {calendars.map(calendar => (
                <div key={calendar.id} className="border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{calendar.title}</h3>
                      <p className="text-gray-600">{calendar.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {calendar.startDate.toLocaleDateString()} - {calendar.endDate.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendar.posts.map(post => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">
                            {platformConfigs.find(p => p.name === post.platform)?.icon}
                          </span>
                          <span className="font-semibold capitalize">{post.platform}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{post.content.substring(0, 100)}...</p>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded ${
                            post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            post.status === 'posted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {post.status}
                          </span>
                          <button className="text-blue-600 text-sm hover:underline">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-green-600">Analytics & Insights</h2>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{posts.length}</div>
                  <div className="text-blue-800">Total Posts</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {posts.reduce((sum, post) => sum + (post.engagement?.likes || 0), 0)}
                  </div>
                  <div className="text-green-800">Total Likes</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {posts.reduce((sum, post) => sum + (post.engagement?.shares || 0), 0)}
                  </div>
                  <div className="text-purple-800">Total Shares</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {posts.reduce((sum, post) => sum + (post.engagement?.comments || 0), 0)}
                  </div>
                  <div className="text-orange-800">Total Comments</div>
                </div>
              </div>

              {/* Recent Posts */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Recent Posts</h3>
                <div className="space-y-4">
                  {posts.slice(-5).reverse().map(post => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">
                            {platformConfigs.find(p => p.name === post.platform)?.icon}
                          </span>
                          <div>
                            <div className="font-semibold capitalize">{post.platform}</div>
                            <div className="text-sm text-gray-500">{post.createdAt.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <span>❤️ {post.engagement?.likes || 0}</span>
                          <span>🔄 {post.engagement?.shares || 0}</span>
                          <span>💬 {post.engagement?.comments || 0}</span>
                          <span>👆 {post.engagement?.clicks || 0}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'documentation' && (
          <div className="space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-600">Social Media Manager Documentation</h2>
              <p className="text-gray-700 mb-6">
                The Social Media Manager skill uses AgentDAO's WebSearchSkill to create AI-powered social media content and manage posting schedules. 
                This comprehensive tool combines content generation, scheduling, analytics, and campaign management.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🤖 AI Content Generation</h3>
                  <p className="text-purple-700 text-sm">
                    Uses OpenAI GPT-4 to create platform-specific content with hashtags, engagement tips, and optimal posting times.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📅 Advanced Scheduling</h3>
                  <p className="text-blue-700 text-sm">
                    Schedule posts across multiple platforms with date/time picker and automated posting capabilities.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">📊 Analytics & Insights</h3>
                  <p className="text-green-700 text-sm">
                    Track engagement metrics, post performance, and generate comprehensive analytics reports.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">📋 Content Calendar</h3>
                  <p className="text-orange-700 text-sm">
                    Manage content campaigns with visual calendar, post status tracking, and campaign organization.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Implementation */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-blue-600">Technical Implementation</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">AgentDAO WebSearchSkill Configuration</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { WebSearchSkill } from '@agentdao/core';

const webSearchSkill = new WebSearchSkill({
  agentId: 'social-media-content-creator',
  agentName: 'Social Media Content Creator',
  domain: 'social-media.agentdao.com',
  
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4000,
    temperature: 0.8
  },
  
  search: {
    maxResults: 10,
    includeImages: true,
    includeNews: true
  }
});`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Platform Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Twitter', limit: '280 chars', tone: 'Conversational' },
                      { name: 'LinkedIn', limit: '3000 chars', tone: 'Professional' },
                      { name: 'Facebook', limit: '63,206 chars', tone: 'Community-focused' },
                      { name: 'Instagram', limit: '2200 chars', tone: 'Visual' },
                      { name: 'TikTok', limit: '150 chars', tone: 'Trendy' }
                    ].map((platform, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-semibold">{platform.name}</h4>
                        <p className="text-sm text-gray-600">Limit: {platform.limit}</p>
                        <p className="text-sm text-gray-600">Tone: {platform.tone}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Content Generation Process</h3>
                  <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                    <li><strong>Topic Analysis:</strong> AI analyzes the topic and target audience</li>
                    <li><strong>Platform Optimization:</strong> Creates platform-specific content with appropriate tone and length</li>
                    <li><strong>Hashtag Generation:</strong> Generates relevant hashtags for discoverability</li>
                    <li><strong>Engagement Tips:</strong> Provides platform-specific engagement strategies</li>
                    <li><strong>Timing Recommendations:</strong> Suggests optimal posting times for each platform</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* API Reference */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-600">API Reference</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">SocialMediaPost Interface</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  media?: string[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
  createdAt: Date;
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">ContentCalendar Interface</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`interface ContentCalendar {
  id: string;
  title: string;
  description: string;
  posts: SocialMediaPost[];
  theme: string;
  startDate: Date;
  endDate: Date;
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Key Functions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">handleGenerateContent()</h4>
                      <p className="text-gray-600 text-sm">Generates AI-powered content for selected platforms using OpenAI GPT-4</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">handleSchedulePost(post)</h4>
                      <p className="text-gray-600 text-sm">Schedules a post for future publication with date and time selection</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">handlePostNow(post)</h4>
                      <p className="text-gray-600 text-sm">Immediately publishes a post and tracks engagement metrics</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">createContentCalendar()</h4>
                      <p className="text-gray-600 text-sm">Creates a content calendar from generated posts for campaign management</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Examples */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-orange-600">Usage Examples</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Content Generation</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Generate content for multiple platforms
const topic = "Product Launch";
const brandVoice = "professional";
const targetAudience = "Tech professionals";
const platforms = ["twitter", "linkedin", "instagram"];

await handleGenerateContent({
  topic,
  brandVoice,
  targetAudience,
  platforms
});

// Generated content includes:
// - Platform-specific posts
// - Relevant hashtags
// - Engagement tips
// - Optimal posting times`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Post Scheduling</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Schedule a post for future publication
const post = {
  platform: "twitter",
  content: "Exciting product launch! 🚀",
  hashtags: ["#productlaunch", "#innovation"]
};

await handleSchedulePost(post);

// Set schedule date and time
setScheduleDate("2024-01-15");
setScheduleTime("09:00");`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Analytics Integration</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Track post performance
const post = await handlePostNow(generatedPost);

// Access engagement metrics
console.log(post.engagement.likes); // Number of likes
console.log(post.engagement.shares); // Number of shares
console.log(post.engagement.comments); // Number of comments
console.log(post.engagement.clicks); // Number of clicks

// Generate analytics report
const analytics = {
  totalPosts: posts.length,
  totalLikes: posts.reduce((sum, p) => sum + p.engagement.likes, 0),
  engagementRate: calculateEngagementRate(posts)
};`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-green-600">Best Practices</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Content Creation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Use specific topics and target audiences</li>
                    <li>• Choose appropriate brand voice for your audience</li>
                    <li>• Review and edit generated content before posting</li>
                    <li>• Include relevant hashtags for discoverability</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Scheduling</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Post at optimal times for each platform</li>
                    <li>• Maintain consistent posting schedule</li>
                    <li>• Use content calendar for campaign planning</li>
                    <li>• Monitor scheduled posts regularly</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Analytics</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Track engagement metrics consistently</li>
                    <li>• Analyze performance patterns</li>
                    <li>• Adjust strategy based on data</li>
                    <li>• Monitor competitor performance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Platform Optimization</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Respect character limits for each platform</li>
                    <li>• Use platform-specific features (polls, stories, etc.)</li>
                    <li>• Optimize content for each platform's algorithm</li>
                    <li>• Engage with your audience consistently</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-red-600">Troubleshooting</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-red-800 mb-2">"Failed to generate content"</h3>
                  <p className="text-red-700 text-sm">
                    Ensure you have set the OPENAI_API_KEY environment variable and have sufficient API credits.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">"Please provide a topic and target audience"</h3>
                  <p className="text-yellow-700 text-sm">
                    Make sure to fill in both the topic and target audience fields before generating content.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Scheduling issues</h3>
                  <p className="text-blue-700 text-sm">
                    Ensure you've selected both date and time for scheduling. Use the "Set to Now" button for immediate posting.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-green-800 mb-2">Low engagement</h3>
                  <p className="text-green-700 text-sm">
                    Review the generated engagement tips, post at optimal times, and ensure content is relevant to your audience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 