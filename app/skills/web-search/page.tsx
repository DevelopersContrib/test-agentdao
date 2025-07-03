"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function WebSearchSkillPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query) {
      setError("Please enter a search query");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Simulate web search
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult({
        query,
        results: [
          {
            title: `Sample result for: ${query}`,
            url: "https://example.com/result1",
            snippet: `This is a sample search result for the query "${query}". It demonstrates how WebSearchSkill can find relevant information on the web.`,
          },
          {
            title: `Another result for: ${query}`,
            url: "https://example.com/result2",
            snippet: `Another sample search result showing how the search skill works with different types of queries and content.`,
          },
        ],
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to perform search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-pink-600 hover:text-pink-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">WebSearchSkill</h1>
          <p className="text-xl text-gray-600">
            Perform web searches and gather information from across the internet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-pink-600">Search Query</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Term</label>
                <input
                  type="text"
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-rose-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Searching..." : "Search the Web"}
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Search Results</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-rose-700">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Research Assistant</h3>
              <p className="text-gray-600 mb-3">
                Research assistants use WebSearchSkill to gather information for reports and analysis.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Market research</li>
                <li>• Competitive analysis</li>
                <li>• Industry trends</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Content Creator</h3>
              <p className="text-gray-600 mb-3">
                Content creators use WebSearchSkill to fact-check and gather reference materials.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fact verification</li>
                <li>• Source gathering</li>
                <li>• Trend research</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
              <p className="text-gray-600 mb-3">
                Customer support teams use WebSearchSkill to find solutions to complex issues.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Troubleshooting guides</li>
                <li>• Product information</li>
                <li>• Technical documentation</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">News Aggregator</h3>
              <p className="text-gray-600 mb-3">
                News aggregators use WebSearchSkill to find and verify breaking news stories.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Breaking news verification</li>
                <li>• Multiple source checking</li>
                <li>• Fact verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 