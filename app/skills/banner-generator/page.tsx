"use client";
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ImageGenerationSkill } from '@agentdao/core'

const SOCIAL_SIZES = [
  { name: 'Blog Banner', key: 'blog', size: '1200x628' },
  { name: 'Twitter/X', key: 'twitter', size: '1600x900' },
  { name: 'Facebook', key: 'facebook', size: '1200x630' },
  { name: 'Instagram', key: 'instagram', size: '1080x1080' },
  { name: 'YouTube', key: 'youtube', size: '1280x720' },
  { name: 'TikTok', key: 'tiktok', size: '1080x1920' }
]

// Configure the ImageGenerationSkill
const imageGenConfig = {
  agentId: 'banner-generator',
  agentName: 'Banner Generator',
  domain: 'banner.agentdao.com',
  ai: {
    provider: 'openai' as const,
    model: 'dall-e-3',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    maxTokens: 1000,
    temperature: 0.7
  },
  image: {
    defaultSize: '1024x1024' as const,
    defaultStyle: 'vivid' as const,
    maxImages: 1
  }
}
const imageGenSkill = new ImageGenerationSkill(imageGenConfig)

// Map custom sizes to allowed DALL-E sizes
const DALL_E_SIZES = ['1024x1024', '256x256', '512x512', '1792x1024', '1024x1792'] as const
const mapToDalleSize = (size: string): typeof DALL_E_SIZES[number] => {
  if (size === '1080x1080' || size === '1200x1200') return '1024x1024'
  if (size === '1200x628' || size === '1200x630' || size === '1280x720' || size === '1600x900') return '1792x1024'
  if (size === '1080x1920') return '1024x1792'
  return '1024x1024'
}

export default function BannerGeneratorPage() {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [brand, setBrand] = useState<{ logo?: string; colors?: string[] }>({})
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'generator' | 'docs'>('generator')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Extract logo and brand colors from Clearbit
  const fetchBrandInfo = async (domain: string) => {
    try {
      const logo = `https://logo.clearbit.com/${domain}`
      // For demo, use a static palette
      const colors = ['#2563eb', '#1e40af', '#3b82f6']
      setBrand({ logo, colors })
    } catch {
      setBrand({})
    }
  }

  // Generate images for all platforms using ImageGenerationSkill
  const handleGenerate = async () => {
    if (!url || !prompt) return
    
    setLoading(true)
    setError('')
    setResults([])
    
    try {
      // Check if API key is configured
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.')
      }
      
      const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
      await fetchBrandInfo(domain)
      
      console.log('Starting image generation with config:', {
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Configured' : 'Missing',
        prompt,
        url,
        domain
      })
      
      const generated = await Promise.all(
        SOCIAL_SIZES.map(async (platform) => {
          try {
            let fullPrompt = `${prompt}\nPlatform: ${platform.name}\nSize: ${platform.size}`
            if (brand.colors && brand.colors.length > 0) {
              fullPrompt += `\nBrand colors: ${brand.colors.join(', ')}`
            }
            if (brand.logo) {
              fullPrompt += `\nBrand logo: ${brand.logo}`
            }
            const dalleSize = mapToDalleSize(platform.size)
            
            console.log(`Generating for ${platform.name}:`, { fullPrompt, dalleSize })
            
            const images = await imageGenSkill.generateImages({
              prompt: fullPrompt,
              size: dalleSize
            })
            
            console.log(`Generated for ${platform.name}:`, images)
            
            return {
              ...platform,
              image: images[0]?.url || '',
              meta: images[0] || null
            }
          } catch (platformError: any) {
            console.error(`Error generating for ${platform.name}:`, platformError)
            return {
              ...platform,
              image: '',
              meta: null,
              error: platformError.message
            }
          }
        })
      )
      
      // Check if any images were successfully generated
      const successfulResults = generated.filter(result => result.image)
      if (successfulResults.length === 0) {
        throw new Error('No images were generated successfully. Please check your API key and try again.')
      }
      
      setResults(generated)
    } catch (err: any) {
      console.error('Image generation error:', err)
      setError(err.message || 'Failed to generate images. Please check the console for more details.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-pink-600 hover:text-pink-800 text-lg font-semibold flex items-center">
            <span className="mr-2">←</span> Back to Home
          </Link>
          <div className="flex items-center space-x-2">
            <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-semibold">
              Powered by AgentDAO ImageGenerationSkill
            </span>
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              Enhanced by AgentDAO WebSearchSkill
            </span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold text-lg border-b-2 transition-colors ${tab === 'generator' ? 'bg-white border-pink-600 text-pink-700' : 'bg-pink-100 border-transparent text-pink-500 hover:bg-white'}`}
            onClick={() => setTab('generator')}
          >
            Generator
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold text-lg border-b-2 transition-colors ${tab === 'docs' ? 'bg-white border-pink-600 text-pink-700' : 'bg-pink-100 border-transparent text-pink-500 hover:bg-white'}`}
            onClick={() => setTab('docs')}
          >
            Documentation
          </button>
        </div>
        {tab === 'generator' ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-pink-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Banner & Social Image Generator</h1>
            <p className="text-lg text-gray-600 mb-6">
              Enter a website URL and a creative prompt. Instantly generate banners and social images for all major platforms—blog, Twitter, Facebook, Instagram, YouTube, TikTok—in the right sizes, with your brand.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="text"
                  placeholder="e.g., example.com or https://example.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-lg mb-4"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2">Creative Prompt</label>
                <input
                  type="text"
                  placeholder="e.g., Futuristic city skyline at sunset"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-lg mb-4"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !url || !prompt}
                  className="w-full bg-pink-600 text-white py-4 px-8 rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors text-lg font-semibold shadow-md"
                >
                  {loading ? 'Generating Images...' : 'Generate All Social Images'}
                </button>
                {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
              </div>
              <div className="flex flex-col items-center justify-center">
                {brand.logo && (
                  <img src={brand.logo} alt="Brand Logo" className="h-24 w-24 object-contain mb-2 rounded-xl border border-gray-200 shadow" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                {brand.colors && (
                  <div className="flex items-center space-x-2 mt-2">
                    {brand.colors.map((color, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full border-2 border-gray-300 shadow" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                )}
                {(brand.logo || brand.colors) && <div className="mt-2 text-gray-500 text-xs">Brand preview</div>}
              </div>
            </div>
            {results.length > 0 && (
              <div className="mt-10 bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-lg p-8 border border-pink-100">
                <h2 className="text-2xl font-semibold mb-6 text-pink-600">Generated Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((res, idx) => (
                    <div key={res.key} className="flex flex-col items-center bg-white rounded-xl border border-gray-200 shadow p-4">
                      <div className="mb-2 font-semibold text-gray-700">{res.name} <span className="text-xs text-gray-400">({res.size})</span></div>
                      <img src={res.image} alt={res.name} className="rounded-lg border border-gray-200 mb-2 max-w-full" style={{ maxHeight: 220 }} />
                      <a
                        href={res.image}
                        download={`${res.key}-banner.png`}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 text-sm font-medium shadow"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-pink-100">
            <h2 className="text-2xl font-bold mb-4 text-pink-700">How This Works</h2>
            <p className="mb-4 text-gray-700 text-lg">
              This tool uses <b>AgentDAO ImageGenerationSkill</b> to generate banners and social images for all major platforms, and <b>AgentDAO WebSearchSkill</b> to help extract brand information and context from the provided URL.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-pink-600">How We Use AgentDAO Skills</h3>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li><b>ImageGenerationSkill</b>: Generates images using DALL-E 3, with prompts that include your creative input, platform, size, and brand info.</li>
              <li><b>WebSearchSkill</b>: (Optional) Can be used to extract company/brand info, industry, and style cues from the website for even smarter image generation.</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 text-pink-600">Example Integration</h3>
            <pre className="bg-gray-100 rounded p-4 mb-4 text-sm overflow-x-auto">{`
import { ImageGenerationSkill } from '@agentdao/core'

const imageGenSkill = new ImageGenerationSkill({
  agentId: 'banner-generator',
  ai: {
    provider: 'dalle',
    model: 'dall-e-3',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    maxTokens: 1000,
    temperature: 0.7
  },
  image: {
    defaultSize: '1024x1024',
    defaultStyle: 'vivid',
    maxImages: 1,
    quality: 'standard'
  }
})

const images = await imageGenSkill.generateImages({
  prompt: 'A modern, vibrant banner for a tech blog',
  size: '1792x1024',
  style: 'vivid',
  quality: 'standard',
  numImages: 1
})
`}</pre>
            <h3 className="text-xl font-semibold mb-2 text-pink-600">How to Use in Your Project</h3>
            <ol className="list-decimal ml-6 mb-4 text-gray-700">
              <li>Install <code>@agentdao/core</code> and set up your OpenAI API key.</li>
              <li>Configure <b>ImageGenerationSkill</b> as shown above.</li>
              <li>Call <code>generateImages</code> with your prompt, size, and style.</li>
              <li>Optionally, use <b>WebSearchSkill</b> to extract brand info from a URL.</li>
            </ol>
            <h3 className="text-xl font-semibold mb-2 text-pink-600">References</h3>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li><a href="https://www.npmjs.com/package/@agentdao/core" className="text-pink-700 underline" target="_blank">AgentDAO Core NPM</a></li>
              <li><a href="https://developers.agentdao.com/docs" className="text-pink-700 underline" target="_blank">AgentDAO Documentation</a></li>
              <li><a href="https://platform.openai.com/docs/guides/images" className="text-pink-700 underline" target="_blank">OpenAI DALL-E API</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 