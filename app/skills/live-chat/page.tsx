"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function LiveChatSkillPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>([]);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!message) {
      setError("Please enter a message");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Simulate live chat response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResult((prev: any) => [
        ...prev,
        { sender: "You", text: message, timestamp: new Date().toLocaleTimeString() },
        { sender: "Agent", text: `Simulated agent reply to: ${message}`, timestamp: new Date().toLocaleTimeString() },
      ]);
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-red-600 hover:text-red-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">LiveChatSkill</h1>
          <p className="text-xl text-gray-600">
            Real-time chat functionality for agents and users
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Box */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Live Chat</h2>
            <div className="space-y-4">
              <div className="h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                {result.length === 0 && <div className="text-gray-400">No messages yet.</div>}
                {result.map((msg: any, idx: number) => (
                  <div key={idx} className={msg.sender === "You" ? "text-right" : "text-left"}>
                    <span className="font-semibold">{msg.sender}:</span> <span>{msg.text}</span>
                    <span className="text-xs text-gray-400 ml-2">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
              <textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-[60px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-pink-600">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-pink-700">Real World Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">E-commerce Store</h3>
              <p className="text-gray-600 mb-3">
                E-commerce sites use LiveChatSkill for instant customer support.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Answering product questions</li>
                <li>• Handling returns and refunds</li>
                <li>• Upselling and cross-selling</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">SaaS Platform</h3>
              <p className="text-gray-600 mb-3">
                SaaS companies provide onboarding and troubleshooting via live chat.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Onboarding new users</li>
                <li>• Troubleshooting technical issues</li>
                <li>• Collecting user feedback</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Healthcare App</h3>
              <p className="text-gray-600 mb-3">
                Healthcare apps use LiveChatSkill for patient support and appointment scheduling.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Scheduling appointments</li>
                <li>• Answering health questions</li>
                <li>• Emergency support</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Banking App</h3>
              <p className="text-gray-600 mb-3">
                Banking apps use LiveChatSkill for secure, real-time support.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Account inquiries</li>
                <li>• Fraud alerts</li>
                <li>• Transaction support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 