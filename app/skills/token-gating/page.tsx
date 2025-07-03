"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function TokenGatingSkillPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [requiredTokens, setRequiredTokens] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheckAccess = async () => {
    if (!walletAddress) {
      setError("Please enter a wallet address");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Simulate token gating check
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const hasAccess = Math.random() > 0.5; // Random access for demo
      setResult({
        walletAddress,
        requiredTokens: parseInt(requiredTokens),
        hasAccess,
        message: hasAccess ? "Access granted! You have sufficient tokens." : "Access denied. Insufficient tokens.",
        timestamp: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to check access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">TokenGatingSkill</h1>
          <p className="text-xl text-gray-600">
            Control access based on token ownership and blockchain verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Access Control</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x1234567890123456789012345678901234567890"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Tokens</label>
                <input
                  type="number"
                  placeholder="100"
                  value={requiredTokens}
                  onChange={(e) => setRequiredTokens(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleCheckAccess}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Checking..." : "Check Access"}
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
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">NFT Community</h3>
              <p className="text-gray-600 mb-3">
                NFT communities use TokenGatingSkill to control access to exclusive content.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Exclusive Discord channels</li>
                <li>• Private events and meetups</li>
                <li>• Early access to new drops</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">DAO Governance</h3>
              <p className="text-gray-600 mb-3">
                DAOs use TokenGatingSkill to control voting rights and governance access.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Voting on proposals</li>
                <li>• Access to treasury</li>
                <li>• Executive committee membership</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">DeFi Protocol</h3>
              <p className="text-gray-600 mb-3">
                DeFi protocols use TokenGatingSkill for tiered access to features.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Higher yield tiers</li>
                <li>• Advanced trading features</li>
                <li>• Beta feature access</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Gaming Platform</h3>
              <p className="text-gray-600 mb-3">
                Gaming platforms use TokenGatingSkill for premium features and content.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Premium game modes</li>
                <li>• Exclusive skins and items</li>
                <li>• Tournament access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 