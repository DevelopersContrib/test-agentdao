"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function RssFetcherSkillPage() {
  const [rssUrl, setRssUrl] = useState("https://hnrss.org/frontpage");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFetchRss = async () => {
    if (!rssUrl) {
      setError("Please enter an RSS URL");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Simulate RSS fetching
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult({
        url: rssUrl,
        title: "Sample RSS Feed",
        items: [
          {
            title: "Sample Article 1",
            link: "https://example.com/article1",
            description: "This is a sample RSS feed article description.",
            pubDate: new Date().toISOString(),
          },
          {
            title: "Sample Article 2",
            link: "https://example.com/article2",
            description: "Another sample RSS feed article description.",
            pubDate: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch RSS feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-teal-600 hover:text-teal-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RssFetcherSkill</h1>
          <p className="text-xl text-gray-600">
            Fetch and process RSS feeds for content aggregation and monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-teal-600">RSS Feed</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RSS URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/rss"
                  value={rssUrl}
                  onChange={(e) => setRssUrl(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleFetchRss}
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Fetching..." : "Fetch RSS Feed"}
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
          <h2 className="text-2xl font-semibold mb-4 text-cyan-700">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">News Aggregator</h3>
              <p className="text-gray-600 mb-3">
                News aggregators use RssFetcherSkill to collect articles from multiple sources.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Collecting breaking news</li>
                <li>• Topic-based filtering</li>
                <li>• Content curation</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Content Monitoring</h3>
              <p className="text-gray-600 mb-3">
                Companies monitor RSS feeds for brand mentions and industry news.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Brand reputation monitoring</li>
                <li>• Competitor analysis</li>
                <li>• Industry trend tracking</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Blog Platform</h3>
              <p className="text-gray-600 mb-3">
                Blog platforms use RssFetcherSkill to import content from external sources.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Content syndication</li>
                <li>• Guest post aggregation</li>
                <li>• Multi-author feeds</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Research Tool</h3>
              <p className="text-gray-600 mb-3">
                Research tools use RssFetcherSkill to gather academic and industry publications.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Academic paper tracking</li>
                <li>• Patent monitoring</li>
                <li>• Research collaboration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 