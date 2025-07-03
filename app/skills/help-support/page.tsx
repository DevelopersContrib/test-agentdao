"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function HelpSupportSkillPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!question) {
      setError("Please enter your question");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Simulate AI support response
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult({
        question,
        answer: `This is a simulated AI support answer for: "${question}"`,
        status: "Answered (simulated)",
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to get support");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-orange-600 hover:text-orange-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">HelpSupportSkill</h1>
          <p className="text-xl text-gray-600">
            Create intelligent customer support agents for instant help
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-600">Ask a Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Question</label>
                <textarea
                  placeholder="How can I reset my password?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleAsk}
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Getting Answer..." : "Ask Support Agent"}
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
          <h2 className="text-2xl font-semibold mb-4 text-yellow-700">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">E-commerce Store</h3>
              <p className="text-gray-600 mb-3">
                E-commerce sites use HelpSupportSkill to answer customer questions instantly.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Order status inquiries</li>
                <li>• Returns and refunds</li>
                <li>• Product recommendations</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">SaaS Platform</h3>
              <p className="text-gray-600 mb-3">
                SaaS companies provide 24/7 support with AI-powered agents.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Troubleshooting common issues</li>
                <li>• Onboarding new users</li>
                <li>• Escalation to human support</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Banking App</h3>
              <p className="text-gray-600 mb-3">
                Banking apps use HelpSupportSkill for secure, instant answers.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Account balance queries</li>
                <li>• Lost card assistance</li>
                <li>• Transaction history</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Travel Agency</h3>
              <p className="text-gray-600 mb-3">
                Travel agencies answer booking and itinerary questions instantly.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Booking confirmations</li>
                <li>• Travel policy info</li>
                <li>• Emergency support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 