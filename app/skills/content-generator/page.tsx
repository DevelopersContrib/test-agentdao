'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ContentGeneratorPage() {
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState('blog_post')
  const [brandName, setBrandName] = useState('Example Company')
  const [brandVoice, setBrandVoice] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleGenerateContent = async () => {
    if (!topic) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const sampleContent = {
        blog_post: `# ${topic}\n\nThis is a comprehensive blog post about ${topic} written in a ${brandVoice} voice for ${brandName}. The content is engaging and informative, covering key aspects of the topic with practical insights and actionable takeaways.\n\n## Key Points\n\n- Point 1 about ${topic}\n- Point 2 about ${topic}\n- Point 3 about ${topic}\n\n## Conclusion\n\nThis blog post demonstrates how ContentGeneratorSkill can create engaging content tailored to your brand voice and audience.`,
        social_post: `🚀 Exciting news about ${topic}! \n\n${brandName} is leading the way in this innovative space. Discover how this technology is transforming our industry and what it means for the future.\n\n#${topic.replace(/\s+/g, '')} #Innovation #${brandName.replace(/\s+/g, '')}`,
        email_newsletter: `Subject: Your Weekly Update on ${topic}\n\nHi there,\n\nWe hope this email finds you well! This week, we're excited to share insights about ${topic} and how it's shaping the future of our industry.\n\nKey Highlights:\n• Latest developments in ${topic}\n• How ${brandName} is leveraging this technology\n• What this means for you\n\nStay tuned for more updates!\n\nBest regards,\nThe ${brandName} Team`,
        product_description: `${topic} - The ultimate solution for modern businesses. ${brandName} brings you cutting-edge technology that transforms how you work. Features include advanced analytics, seamless integration, and unparalleled performance. Experience the future today with ${brandName}'s ${topic}.`,
        landing_page: `# Transform Your Business with ${topic}\n\n## The Future is Here\n\n${brandName} brings you the most advanced ${topic} solution on the market. Experience unprecedented efficiency and results.\n\n### Key Benefits\n• Increased productivity\n• Cost savings\n• Better results\n\n[Get Started Today]`
      }

      setResult(sampleContent[contentType as keyof typeof sampleContent] || 'Content generated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchGenerate = async () => {
    if (!topic) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Simulate batch content generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const results = [
        {
          template: 'blog_post',
          content: `# ${topic}\n\nThis is a comprehensive blog post about ${topic} written in a ${brandVoice} voice for ${brandName}.`
        },
        {
          template: 'social_post',
          content: `🚀 Exciting news about ${topic}! ${brandName} is leading the way in this innovative space.`
        },
        {
          template: 'email_newsletter',
          content: `Hi there,\n\nWe hope this email finds you well! This week, we're excited to share insights about ${topic}.`
        }
      ]

      setResult(results)
    } catch (err: any) {
      setError(err.message || 'Failed to generate batch content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ContentGeneratorSkill
          </h1>
          <p className="text-xl text-gray-600">
            Generate AI-powered content for blogs, social media, and marketing campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g., The Future of AI in Business"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="blog_post">Blog Post</option>
                  <option value="social_post">Social Media Post</option>
                  <option value="email_newsletter">Email Newsletter</option>
                  <option value="product_description">Product Description</option>
                  <option value="landing_page">Landing Page Copy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  placeholder="Your Company Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Voice
                </label>
                <select
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Actions
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleGenerateContent}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Content'}
              </button>

              <button
                onClick={handleBatchGenerate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Batch Content'}
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Generated Content
            </h2>
            {Array.isArray(result) ? (
              <div className="space-y-6">
                {result.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 capitalize">
                      {item.template.replace('_', ' ')}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            )}
          </div>
        )}

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">
            Real World Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Marketing Agency</h3>
              <p className="text-gray-600 mb-3">
                A marketing agency uses ContentGeneratorSkill to create consistent content across multiple client campaigns.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blog posts for SEO optimization</li>
                <li>• Social media content calendars</li>
                <li>• Email marketing campaigns</li>
                <li>• Product descriptions for e-commerce</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">SaaS Company</h3>
              <p className="text-gray-600 mb-3">
                A SaaS company generates educational content to attract and retain customers.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Technical blog posts</li>
                <li>• How-to guides and tutorials</li>
                <li>• Product update announcements</li>
                <li>• Customer success stories</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">E-commerce Store</h3>
              <p className="text-gray-600 mb-3">
                An e-commerce store creates compelling product descriptions and marketing copy.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product descriptions</li>
                <li>• Category landing pages</li>
                <li>• Promotional emails</li>
                <li>• Social media ads</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Content Creator</h3>
              <p className="text-gray-600 mb-3">
                A content creator uses AI to generate ideas and draft content for their audience.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• YouTube video scripts</li>
                <li>• Podcast episode outlines</li>
                <li>• Newsletter content</li>
                <li>• Social media captions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">✍️</span>
              </div>
              <h3 className="font-semibold mb-2">Multiple Formats</h3>
              <p className="text-gray-600 text-sm">
                Generate blog posts, social media content, emails, and more
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Brand Consistency</h3>
              <p className="text-gray-600 text-sm">
                Maintain consistent voice and tone across all content
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">SEO Optimized</h3>
              <p className="text-gray-600 text-sm">
                Content optimized for search engines and engagement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 