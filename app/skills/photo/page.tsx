"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function PhotoSkillPage() {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("unsplash");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearchPhotos = async () => {
    if (!query) {
      setError("Please enter a search query");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Simulate photo search
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult({
        query,
        provider,
        photos: [
          {
            id: "sample-1",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200",
            title: `Sample photo for: ${query}`,
            description: "A beautiful sample photo from Unsplash",
            photographer: {
              name: "Sample Photographer",
              username: "sample_user",
              profileUrl: "https://unsplash.com/@sample_user"
            },
            dimensions: { width: 1920, height: 1080 },
            tags: [query, "sample", "beautiful"],
            provider: provider,
            license: "Free to use"
          },
          {
            id: "sample-2",
            url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200",
            title: `Another sample for: ${query}`,
            description: "Another stunning sample photo",
            photographer: {
              name: "Another Photographer",
              username: "another_user",
              profileUrl: "https://unsplash.com/@another_user"
            },
            dimensions: { width: 1920, height: 1080 },
            tags: [query, "nature", "landscape"],
            provider: provider,
            license: "Free to use"
          }
        ],
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to search photos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PhotoSkill</h1>
          <p className="text-xl text-gray-600">
            Search and manage stock photos from Unsplash, Pexels, and Pixabay
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-amber-600">Photo Search</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
                <input
                  type="text"
                  placeholder="e.g., nature, business, technology"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="unsplash">Unsplash</option>
                  <option value="pexels">Pexels</option>
                  <option value="pixabay">Pixabay</option>
                  <option value="all">All Providers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleSearchPhotos}
                disabled={loading}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Searching..." : "Search Photos"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.photos.map((photo: any) => (
                <div key={photo.id} className="border border-gray-200 rounded-lg p-4">
                  <img 
                    src={photo.thumbnailUrl} 
                    alt={photo.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-lg mb-2">{photo.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{photo.description}</p>
                  <p className="text-xs text-gray-500">By {photo.photographer.name}</p>
                  <p className="text-xs text-gray-500">Provider: {photo.provider}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Marketing Agency</h3>
              <p className="text-gray-600 mb-3">
                Marketing agencies use PhotoSkill to find high-quality images for campaigns.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Social media content</li>
                <li>• Website banners</li>
                <li>• Email marketing</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Content Creator</h3>
              <p className="text-gray-600 mb-3">
                Content creators use PhotoSkill to find images for blogs and articles.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blog post illustrations</li>
                <li>• Newsletter images</li>
                <li>• Presentation slides</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">E-commerce Store</h3>
              <p className="text-gray-600 mb-3">
                E-commerce stores use PhotoSkill for product photography and lifestyle images.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product lifestyle shots</li>
                <li>• Category banners</li>
                <li>• Social media posts</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Web Designer</h3>
              <p className="text-gray-600 mb-3">
                Web designers use PhotoSkill to find images for website designs.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hero section images</li>
                <li>• Background images</li>
                <li>• Icon and illustration sets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 