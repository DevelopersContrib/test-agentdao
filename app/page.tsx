'use client'

import { useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('Welcome to AgentDAO Skills Example!')

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AgentDAO Skills Example
          </h1>
          <p className="text-xl text-gray-600">
            Sample application demonstrating AgentDAO core package and skills
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            Available Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-blue-600">Web3SubscriptionSkill</h3>
              <p className="text-sm text-gray-600">Manage subscription-based services with crypto payments</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-green-600">ContentGeneratorSkill</h3>
              <p className="text-sm text-gray-600">Generate AI-powered content for blogs and marketing</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-purple-600">SocialMediaSkill</h3>
              <p className="text-sm text-gray-600">Automate social media posting and engagement</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-orange-600">HelpSupportSkill</h3>
              <p className="text-sm text-gray-600">Create intelligent customer support agents</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-red-600">LiveChatSkill</h3>
              <p className="text-sm text-gray-600">Real-time chat functionality for agents</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-indigo-600">TokenGatingSkill</h3>
              <p className="text-sm text-gray-600">Control access based on token ownership</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-teal-600">RssFetcherSkill</h3>
              <p className="text-sm text-gray-600">Fetch and process RSS feeds</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-pink-600">WebSearchSkill</h3>
              <p className="text-sm text-gray-600">Perform web searches and gather information</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Getting Started
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              This is a sample repository demonstrating the AgentDAO core package and skills. 
              To get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Install dependencies: <code className="bg-gray-100 px-2 py-1 rounded">npm install</code></li>
              <li>Set up environment variables in <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code></li>
              <li>Run the development server: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
              <li>Open <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code></li>
            </ol>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Documentation
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              For detailed documentation on AgentDAO skills and features, visit:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><a href="https://developers.agentdao.com/docs" className="text-blue-600 hover:underline">AgentDAO Developers Documentation</a></li>
              <li><a href="https://developers.agentdao.com/docs/core" className="text-blue-600 hover:underline">Core Package Reference</a></li>
              <li><a href="https://developers.agentdao.com/docs/skills" className="text-blue-600 hover:underline">Skills Documentation</a></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
} 