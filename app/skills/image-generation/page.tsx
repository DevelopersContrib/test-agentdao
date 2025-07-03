"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function ImageGenerationSkillPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [style, setStyle] = useState("vivid");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerateImage = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Simulate AI image generation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setResult({
        prompt,
        size,
        style,
        images: [
          {
            id: "generated-1",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            prompt: prompt,
            size: size,
            style: style,
            createdAt: new Date().toISOString(),
            metadata: {
              model: "dall-e-3",
              provider: "openai",
              seed: Math.floor(Math.random() * 1000000)
            }
          },
          {
            id: "generated-2", 
            url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            prompt: prompt,
            size: size,
            style: style,
            createdAt: new Date().toISOString(),
            metadata: {
              model: "dall-e-3",
              provider: "openai",
              seed: Math.floor(Math.random() * 1000000)
            }
          }
        ],
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-violet-600 hover:text-violet-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ImageGenerationSkill</h1>
          <p className="text-xl text-gray-600">
            Generate AI-powered images using DALL-E, Midjourney, and Stable Diffusion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-violet-600">Image Generation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                <textarea
                  placeholder="A futuristic cityscape with flying cars and neon lights"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                >
                  <option value="256x256">256x256</option>
                  <option value="512x512">512x512</option>
                  <option value="1024x1024">1024x1024</option>
                  <option value="1792x1024">1792x1024 (Landscape)</option>
                  <option value="1024x1792">1024x1792 (Portrait)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                >
                  <option value="vivid">Vivid</option>
                  <option value="natural">Natural</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleGenerateImage}
                disabled={loading}
                className="w-full bg-violet-600 text-white py-3 px-6 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Generating..." : "Generate Images"}
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Generated Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.images.map((image: any) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                  <img 
                    src={image.url} 
                    alt={image.prompt}
                    className="w-full h-64 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-lg mb-2">Generated Image</h3>
                  <p className="text-gray-600 text-sm mb-2">"{image.prompt}"</p>
                  <p className="text-xs text-gray-500">Size: {image.size}</p>
                  <p className="text-xs text-gray-500">Style: {image.style}</p>
                  <p className="text-xs text-gray-500">Model: {image.metadata.model}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Marketing Agency</h3>
              <p className="text-gray-600 mb-3">
                Marketing agencies use ImageGenerationSkill to create unique visuals for campaigns.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom product mockups</li>
                <li>• Brand-specific illustrations</li>
                <li>• Campaign visuals</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Content Creator</h3>
              <p className="text-gray-600 mb-3">
                Content creators use ImageGenerationSkill to generate unique images for their content.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blog post headers</li>
                <li>• Social media graphics</li>
                <li>• YouTube thumbnails</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Product Designer</h3>
              <p className="text-gray-600 mb-3">
                Product designers use ImageGenerationSkill to visualize concepts and prototypes.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product concept art</li>
                <li>• UI/UX mockups</li>
                <li>• Prototype visualization</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Game Developer</h3>
              <p className="text-gray-600 mb-3">
                Game developers use ImageGenerationSkill to create concept art and assets.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Character concept art</li>
                <li>• Environment designs</li>
                <li>• Texture generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 