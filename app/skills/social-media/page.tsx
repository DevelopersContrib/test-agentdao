"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function SocialMediaSkillPage() {
  const [platform, setPlatform] = useState("twitter");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handlePost = async () => {
    if (!message) {
      setError("Please enter a message to post");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Simulate posting to social media
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult({
        platform,
        message,
        status: "Posted successfully! (simulated)",
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SocialMediaSkill</h1>
          <p className="text-xl text-gray-600">
            Automate social media posting and engagement across platforms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="What's happening?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-pink-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handlePost}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Posting..." : "Post to Social Media"}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Result</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Brand Marketing Team</h3>
              <p className="text-gray-600 mb-3">
                A marketing team schedules and posts content to multiple platforms automatically.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Scheduled product launches</li>
                <li>• Automated campaign rollouts</li>
                <li>• Consistent brand messaging</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Influencer</h3>
              <p className="text-gray-600 mb-3">
                Influencers use SocialMediaSkill to engage their audience and grow their following.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automated replies to comments</li>
                <li>• Cross-posting to all platforms</li>
                <li>• Analytics on engagement</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
              <p className="text-gray-600 mb-3">
                Customer support teams monitor and respond to social media inquiries in real time.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automated DMs for FAQs</li>
                <li>• Escalation to human agents</li>
                <li>• Sentiment analysis</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">SaaS Startup</h3>
              <p className="text-gray-600 mb-3">
                SaaS startups use SocialMediaSkill to announce updates and interact with users.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product update announcements</li>
                <li>• Community engagement</li>
                <li>• Feedback collection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 