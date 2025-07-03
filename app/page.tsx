'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [message, setMessage] = useState('Welcome to AgentDAO Skills Example!')

  const skills = [
    {
      name: 'Web3SubscriptionSkill',
      description: 'Manage subscription-based services with crypto payments',
      color: 'blue',
      href: '/skills/web3-subscription',
      icon: '💰'
    },
    {
      name: 'ContentGeneratorSkill',
      description: 'Generate AI-powered content for blogs and marketing',
      color: 'green',
      href: '/skills/content-generator',
      icon: '✍️'
    },
    {
      name: 'SocialMediaSkill',
      description: 'Automate social media posting and engagement',
      color: 'purple',
      href: '/skills/social-media',
      icon: '📱'
    },
    {
      name: 'HelpSupportSkill',
      description: 'Create intelligent customer support agents',
      color: 'orange',
      href: '/skills/help-support',
      icon: '🛟'
    },
    {
      name: 'LiveChatSkill',
      description: 'Real-time chat functionality for agents',
      color: 'red',
      href: '/skills/live-chat',
      icon: '💬'
    },
    {
      name: 'TokenGatingSkill',
      description: 'Control access based on token ownership',
      color: 'indigo',
      href: '/skills/token-gating',
      icon: '🔐'
    },
    {
      name: 'RssFetcherSkill',
      description: 'Fetch and process RSS feeds',
      color: 'teal',
      href: '/skills/rss-fetcher',
      icon: '📰'
    },
    {
      name: 'WebSearchSkill',
      description: 'Perform web searches and gather information',
      color: 'pink',
      href: '/skills/web-search',
      icon: '🔍'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 border-blue-200 hover:bg-blue-50',
      green: 'text-green-600 border-green-200 hover:bg-green-50',
      purple: 'text-purple-600 border-purple-200 hover:bg-purple-50',
      orange: 'text-orange-600 border-orange-200 hover:bg-orange-50',
      red: 'text-red-600 border-red-200 hover:bg-red-50',
      indigo: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50',
      teal: 'text-teal-600 border-teal-200 hover:bg-teal-50',
      pink: 'text-pink-600 border-pink-200 hover:bg-pink-50'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

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
          <h2 className="text-2xl font-semibold mb-6 text-blue-600">
            Available Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map((skill) => (
              <Link
                key={skill.name}
                href={skill.href}
                className={`p-4 border rounded-lg transition-all duration-200 ${getColorClasses(skill.color)}`}
              >
                <div className="text-2xl mb-2">{skill.icon}</div>
                <h3 className="font-semibold mb-2">{skill.name}</h3>
                <p className="text-sm text-gray-600">{skill.description}</p>
              </Link>
            ))}
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
              <li>Click on any skill above to explore its functionality</li>
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