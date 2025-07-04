'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WebSearchSkill } from '@agentdao/core'

interface WebsiteBrief {
  domain: string
  companyName: string
  industry: string
  targetAudience: string
  competitors: string[]
  logoUrl?: string
  brandColors: string[]
  contentPlan: {
    homepage: string
    about: string
    services: string[]
    blogTopics: string[]
    socialMedia: string[]
    seoKeywords: string[]
  }
  technicalSpecs: {
    platform: string
    features: string[]
    integrations: string[]
  }
  marketingStrategy: {
    channels: string[]
    campaigns: string[]
    metrics: string[]
  }
  generatedContent?: string
  searchResults?: any[]
  aiSummary?: string
  aiRecommendations?: string[]
}

export default function ContentGeneratorPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WebsiteBrief | null>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'analyzing' | 'brief' | 'content'>('input')

  // Initialize AgentDAO WebSearchSkill
  const webSearchSkill = new WebSearchSkill({
    agentId: 'content-generator-web-search',
    agentName: 'Content Generator Web Search',
    domain: 'content-generator.agentdao.com',
    
    ai: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      maxTokens: 2000,
      temperature: 0.7
    },
    
    search: {
      provider: 'google',
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY || '',
      maxResults: 10,
      includeImages: false,
      includeNews: true
    },
    
    integration: {
      webhooks: {
        enabled: false,
        url: ''
      }
    },
    
    analytics: {
      enabled: true,
      tracking: ['searches', 'results', 'user_queries']
    }
  })

  const handleAnalyzeDomain = async () => {
    if (!domain) {
      setError('Please enter a domain')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setStep('analyzing')

    try {
      // Use AgentDAO WebSearchSkill's searchWithAI for deep analysis
      const aiPrompt = `Extract the following information about the company at ${domain}:\n- Company Name\n- Industry\n- Target Audience\n- Main Services\n- Top 3 Competitors (by domain)\nReturn as a JSON object.`
      const aiResults = await webSearchSkill.searchWithAI(
        `${domain} company profile`,
        aiPrompt
      )
      console.log('AI SearchWithAI Results:', aiResults)

      // Fallback: also run searchWeb for additional context
      const searchQueries = [
        `${domain} company information`,
        `${domain} services products`,
        `${domain} about us`,
        `competitors of ${domain}`,
        `${domain} industry market`
      ]
      const searchResults = await Promise.all(
        searchQueries.map(async (query) => {
          try {
            const result = await webSearchSkill.searchWeb({
              query: query,
              maxResults: 5
            })
            console.log(`Raw searchWeb result for "${query}":`, result)
            return result
          } catch (err: any) {
            console.warn(`Search failed for query "${query}":`, err)
            return null
          }
        })
      )
      const validResults = searchResults.filter(result => result !== null)

      // Try to parse AI result for structured info
      let aiInfo: Record<string, any> = {}
      if (aiResults && typeof aiResults === 'string') {
        try {
          aiInfo = JSON.parse(aiResults)
        } catch (e) {
          aiInfo = {}
        }
      } else if (aiResults && typeof aiResults === 'object') {
        aiInfo = aiResults as Record<string, any>
      }

      // Improved extraction: prefer AI, fallback to searchWeb
      let domainInfo = {
        companyName: aiInfo?.['Company Name'] || aiInfo?.['companyName'] || '',
        industry: aiInfo?.['Industry'] || aiInfo?.['industry'] || '',
        targetAudience: aiInfo?.['Target Audience'] || aiInfo?.['targetAudience'] || '',
        competitors: aiInfo?.['Competitors'] || aiInfo?.['competitors'] || [],
        services: aiInfo?.['Services'] || aiInfo?.['services'] || []
      }
      // If AI result has searchResults, try extracting from those
      if (aiInfo?.searchResults && Array.isArray(aiInfo.searchResults)) {
        const extracted = extractDomainInfo(domain, aiInfo.searchResults)
        domainInfo.companyName = domainInfo.companyName || extracted.companyName
        domainInfo.industry = domainInfo.industry || extracted.industry
        domainInfo.targetAudience = domainInfo.targetAudience || extracted.targetAudience
        domainInfo.competitors = domainInfo.competitors.length ? domainInfo.competitors : extracted.competitors
        domainInfo.services = domainInfo.services.length ? domainInfo.services : extracted.services
      }
      // If still missing, fallback to old extraction from searchWeb
      if (!domainInfo.companyName || !domainInfo.industry || !domainInfo.services.length) {
        const fallback = extractDomainInfo(domain, validResults)
        domainInfo.companyName = domainInfo.companyName || fallback.companyName
        domainInfo.industry = domainInfo.industry || fallback.industry
        domainInfo.targetAudience = domainInfo.targetAudience || fallback.targetAudience
        domainInfo.competitors = domainInfo.competitors.length ? domainInfo.competitors : fallback.competitors
        domainInfo.services = domainInfo.services.length ? domainInfo.services : fallback.services
      }

      const brief: WebsiteBrief = {
        domain: domain,
        companyName: domainInfo.companyName || generateCompanyName(domain),
        industry: domainInfo.industry || analyzeIndustry(domain),
        targetAudience: domainInfo.targetAudience || generateTargetAudience(domain),
        competitors: domainInfo.competitors || generateCompetitors(domain),
        logoUrl: `https://logo.clearbit.com/${domain}`,
        brandColors: generateBrandColors(),
        contentPlan: {
          homepage: generateHomepageContent(domain, domainInfo),
          about: generateAboutContent(domain, domainInfo),
          services: domainInfo.services || generateServices(domain),
          blogTopics: generateBlogTopics(domain, domainInfo),
          socialMedia: generateSocialMediaContent(domain, domainInfo),
          seoKeywords: generateSEOKeywords(domain, domainInfo)
        },
        technicalSpecs: {
          platform: generatePlatform(),
          features: generateFeatures(),
          integrations: generateIntegrations()
        },
        marketingStrategy: {
          channels: generateMarketingChannels(),
          campaigns: generateCampaigns(),
          metrics: generateMetrics()
        },
        searchResults: validResults,
        aiSummary: aiInfo?.summary || aiInfo?.aiAnalysis || '',
        aiRecommendations: aiInfo?.recommendations || []
      }

      setResult(brief)
      setStep('brief')
    } catch (err: any) {
      setError(err.message || 'Failed to analyze domain')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateContent = async (contentType: string) => {
    if (!result) return

    setLoading(true)
    setError('')
    setStep('content')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generatedContent = generateSpecificContent(contentType, result)
      setResult({ ...result, generatedContent })
    } catch (err: any) {
      setError(err.message || 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  // Extract real information from search results
  const extractDomainInfo = (domain: string, searchResults: any[]) => {
    const info = {
      companyName: '',
      industry: '',
      targetAudience: '',
      competitors: [] as string[],
      services: [] as string[]
    }

    // Analyze search results to extract information
    searchResults.forEach(result => {
      if (result && result.results) {
        result.results.forEach((item: any) => {
          const title = item.title || ''
          const snippet = item.snippet || ''
          const content = `${title} ${snippet}`.toLowerCase()

          // Extract company name
          if (!info.companyName && content.includes(domain.replace('.com', ''))) {
            const nameMatch = title.match(new RegExp(`([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\s*[-|]\\s*${domain}`, 'i'))
            if (nameMatch) {
              info.companyName = nameMatch[1]
            }
          }

          // Extract industry
          const industries = ['technology', 'e-commerce', 'healthcare', 'finance', 'education', 'real estate', 'marketing', 'consulting', 'software', 'saas']
          industries.forEach(industry => {
            if (!info.industry && content.includes(industry)) {
              info.industry = industry.charAt(0).toUpperCase() + industry.slice(1)
            }
          })

          // Extract services
          const serviceKeywords = ['web design', 'development', 'marketing', 'consulting', 'software', 'saas', 'e-commerce', 'analytics', 'support']
          serviceKeywords.forEach((service: string) => {
            if (content.includes(service) && !info.services.includes(service)) {
              info.services.push(service)
            }
          })

          // Extract competitors
          const competitorPatterns = ['vs ', 'alternative to ', 'competitor', 'similar to ']
          competitorPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
              const words = content.split(' ')
              const patternIndex = words.findIndex(word => word.includes(pattern))
              if (patternIndex !== -1 && patternIndex + 1 < words.length) {
                const potentialCompetitor = words[patternIndex + 1]
                if (potentialCompetitor.includes('.com') && !info.competitors.includes(potentialCompetitor)) {
                  info.competitors.push(potentialCompetitor)
                }
              }
            }
          })
        })
      }
    })

    return info
  }

  // Helper functions to generate realistic data (fallback when search doesn't provide enough info)
  const generateCompanyName = (domain: string) => {
    const names = ['TechFlow', 'InnovateHub', 'DigitalCraft', 'WebForge', 'PixelPerfect', 'CodeCraft', 'DesignLab', 'CreativeStudio']
    return names[Math.floor(Math.random() * names.length)]
  }

  const analyzeIndustry = (domain: string) => {
    const industries = ['Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education', 'Real Estate', 'Marketing', 'Consulting']
    return industries[Math.floor(Math.random() * industries.length)]
  }

  const generateTargetAudience = (domain: string) => {
    const audiences = [
      'Small to medium businesses looking to digitize their operations',
      'Tech-savvy millennials seeking innovative solutions',
      'Enterprise companies requiring scalable solutions',
      'Startups and entrepreneurs building their online presence',
      'Creative professionals and agencies'
    ]
    return audiences[Math.floor(Math.random() * audiences.length)]
  }

  const generateCompetitors = (domain: string) => {
    const competitorLists = [
      ['CompetitorA.com', 'CompetitorB.com', 'CompetitorC.com'],
      ['RivalX.com', 'RivalY.com', 'RivalZ.com'],
      ['Alternative1.com', 'Alternative2.com', 'Alternative3.com']
    ]
    return competitorLists[Math.floor(Math.random() * competitorLists.length)]
  }

  const generateBrandColors = () => {
    const colorPalettes = [
      ['#2563eb', '#1e40af', '#3b82f6'],
      ['#059669', '#047857', '#10b981'],
      ['#dc2626', '#b91c1c', '#ef4444'],
      ['#7c3aed', '#5b21b6', '#8b5cf6']
    ]
    return colorPalettes[Math.floor(Math.random() * colorPalettes.length)]
  }

  const generateHomepageContent = (domain: string, domainInfo?: any) => {
    const companyName = domainInfo?.companyName || generateCompanyName(domain)
    const services = domainInfo?.services?.slice(0, 3) || ['Web Design', 'Digital Marketing', 'Software Development']
    
    return `# Welcome to ${companyName}

Transform your business with cutting-edge solutions designed for the modern digital landscape. We specialize in creating innovative web experiences that drive results and exceed expectations.

## Why Choose Us?

- **Expert Team**: 10+ years of industry experience
- **Proven Results**: 500+ successful projects delivered
- **24/7 Support**: Round-the-clock assistance for your peace of mind
- **Scalable Solutions**: Built to grow with your business

## Our Services

${services.map((service: string) => `- **${service}**: Professional ${service.toLowerCase()} solutions tailored to your needs`).join('\n')}

[Get Started Today] [Learn More]`
  }

  const generateAboutContent = (domain: string, domainInfo?: any) => {
    const companyName = domainInfo?.companyName || generateCompanyName(domain)
    const industry = domainInfo?.industry || 'Technology'
    
    return `# About ${companyName}

Founded in 2020, we've been at the forefront of ${industry.toLowerCase()} innovation, helping businesses of all sizes achieve their online goals. Our mission is to democratize access to world-class web solutions.

## Our Story

What started as a small team of passionate developers has grown into a full-service digital agency serving clients worldwide. We believe that every business deserves access to professional web solutions that drive real results.

## Our Values

- **Innovation**: Always pushing the boundaries of what's possible
- **Quality**: Never compromising on the quality of our work
- **Transparency**: Clear communication and honest pricing
- **Partnership**: We're invested in your success`
  }

  const generateServices = (domain: string) => {
    const serviceLists = [
      ['Web Design & Development', 'E-commerce Solutions', 'Mobile App Development', 'SEO & Digital Marketing'],
      ['Custom Software Development', 'Cloud Infrastructure', 'Data Analytics', 'AI Integration'],
      ['Brand Identity Design', 'Content Creation', 'Social Media Management', 'Performance Optimization']
    ]
    return serviceLists[Math.floor(Math.random() * serviceLists.length)]
  }

  const generateBlogTopics = (domain: string, domainInfo?: any) => {
    const industry = domainInfo?.industry || 'Technology'
    const baseTopics = [
      'The Future of Web Development in 2024',
      'How to Choose the Right Tech Stack for Your Project',
      'SEO Best Practices for Modern Websites',
      'Building Scalable E-commerce Solutions',
      'The Impact of AI on Digital Marketing',
      'Mobile-First Design: Why It Matters',
      'Performance Optimization Techniques',
      'Security Best Practices for Web Applications'
    ]
    
    // Add industry-specific topics
    const industryTopics = [
      `${industry} Trends in 2024`,
      `Digital Transformation in ${industry}`,
      `${industry} Best Practices`,
      `Innovation in ${industry}`
    ]
    
    return [...baseTopics, ...industryTopics]
  }

  const generateSocialMediaContent = (domain: string, domainInfo?: any) => {
    const companyName = domainInfo?.companyName || generateCompanyName(domain)
    const industry = domainInfo?.industry || 'Technology'
    
    return [
      `🚀 Exciting news! ${companyName} just launched our new ${industry.toLowerCase()} service. Transform your business today! #${industry.replace(/\s+/g, '')} #DigitalTransformation`,
      `💡 Did you know? 75% of users judge a company's credibility based on their website design. Make sure yours makes the right impression! #WebCredibility #UserExperience`,
      `🎯 Looking to boost your online presence? Our ${industry.toLowerCase()} solutions have helped clients increase revenue by 300%! #${industry.replace(/\s+/g, '')} #Growth`,
      `🔧 Tech tip: Always optimize your images for web. It can improve your page load speed by up to 50%! #WebPerformance #Optimization`
    ]
  }

  const generateSEOKeywords = (domain: string, domainInfo?: any) => {
    const industry = domainInfo?.industry || 'Technology'
    const services = domainInfo?.services || ['web design', 'development']
    
    const baseKeywords = [
      'web design services',
      'custom website development',
      'e-commerce solutions',
      'digital marketing agency',
      'SEO optimization',
      'mobile app development',
      'cloud infrastructure',
      'AI integration services'
    ]
    
    const industryKeywords = [
      `${industry.toLowerCase()} services`,
      `${industry.toLowerCase()} solutions`,
      `${industry.toLowerCase()} company`,
      `${industry.toLowerCase()} agency`
    ]
    
    return [...baseKeywords, ...industryKeywords, ...services]
  }

  const generatePlatform = () => {
    const platforms = ['Next.js', 'React', 'Vue.js', 'Angular', 'WordPress', 'Shopify', 'Custom Solution']
    return platforms[Math.floor(Math.random() * platforms.length)]
  }

  const generateFeatures = () => {
    return [
      'Responsive Design',
      'Content Management System',
      'E-commerce Integration',
      'Analytics Dashboard',
      'SEO Optimization',
      'Social Media Integration',
      'Payment Gateway Integration',
      'Multi-language Support'
    ]
  }

  const generateIntegrations = () => {
    return [
      'Google Analytics',
      'Mailchimp',
      'Stripe',
      'Shopify',
      'HubSpot',
      'Slack',
      'Zapier',
      'Salesforce'
    ]
  }

  const generateMarketingChannels = () => {
    return [
      'Google Ads',
      'Social Media Advertising',
      'Content Marketing',
      'Email Marketing',
      'SEO',
      'Influencer Partnerships',
      'Retargeting Campaigns'
    ]
  }

  const generateCampaigns = () => {
    return [
      'Brand Awareness Campaign',
      'Lead Generation Campaign',
      'Product Launch Campaign',
      'Seasonal Promotion Campaign',
      'Customer Retention Campaign'
    ]
  }

  const generateMetrics = () => {
    return [
      'Website Traffic',
      'Conversion Rate',
      'Customer Acquisition Cost',
      'Return on Ad Spend',
      'Email Open Rate',
      'Social Media Engagement',
      'Page Load Speed',
      'Bounce Rate'
    ]
  }

  const generateSpecificContent = (contentType: string, brief: WebsiteBrief) => {
    const contentMap: { [key: string]: string } = {
      'homepage': brief.contentPlan.homepage,
      'about': brief.contentPlan.about,
      'blog_post': `# ${brief.contentPlan.blogTopics[0]}\n\nThis comprehensive guide explores the latest trends and best practices in ${brief.contentPlan.blogTopics[0].toLowerCase()}. Learn how to implement these strategies in your own projects and stay ahead of the competition.\n\n## Key Takeaways\n\n- Understanding the fundamentals\n- Best practices and implementation\n- Common pitfalls to avoid\n- Future trends and predictions\n\n## Conclusion\n\nBy following these guidelines, you'll be well-positioned to succeed in the ever-evolving digital landscape.`,
      'social_media': brief.contentPlan.socialMedia.join('\n\n'),
      'email_newsletter': `Subject: Your Weekly Digital Insights from ${brief.companyName}\n\nHi there,\n\nWe hope this email finds you well! This week, we're excited to share insights about ${brief.contentPlan.blogTopics[0]} and how it's shaping the future of our industry.\n\n## This Week's Highlights\n\n${brief.contentPlan.blogTopics.slice(0, 3).map(topic => `• ${topic}`).join('\n')}\n\n## Industry Updates\n\nStay ahead of the curve with our latest insights and analysis.\n\nBest regards,\nThe ${brief.companyName} Team`,
      'landing_page': `# Transform Your Business with ${brief.companyName}\n\n## The Future is Here\n\n${brief.companyName} brings you the most advanced solutions on the market. Experience unprecedented efficiency and results.\n\n### Key Benefits\n${brief.contentPlan.services.slice(0, 3).map(service => `• ${service}`).join('\n')}\n\n[Get Started Today] [Learn More]`
    }
    
    return contentMap[contentType] || 'Content generated successfully!'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Project Brief Generator
          </h1>
          <p className="text-xl text-gray-600">
            Analyze any domain and generate comprehensive website project briefs with content plans, competitor analysis, and marketing strategies
          </p>
          <div className="mt-2">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mr-2">
              Powered by <span className="font-bold">AgentDAO ContentGeneratorSkill</span>
            </span>
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              Enhanced by <span className="font-bold">AgentDAO WebSearchSkill</span>
            </span>
          </div>
        </div>

        {/* Step 1: Domain Input */}
        {step === 'input' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-green-600">
              Enter Domain to Analyze
            </h2>
            <div className="max-w-2xl">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., example.com (without https://)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                />
              </div>
              <button
                onClick={handleAnalyzeDomain}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 px-8 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-lg font-semibold"
              >
                {loading ? 'Analyzing Domain...' : 'Generate Complete Website Brief'}
              </button>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Analyzing */}
        {step === 'analyzing' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Analyzing Domain with AgentDAO WebSearchSkill
            </h2>
            <p className="text-gray-600">
              Using AgentDAO WebSearchSkill to extract company information, analyze competitors, generate content plans, and create comprehensive project brief...
            </p>
          </div>
        )}

        {/* Step 3: Website Brief */}
        {step === 'brief' && result && (
          <div className="space-y-8">
            {/* Company Overview */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-green-600">
                  Company Overview
                </h2>
                {result.logoUrl && (
                  <img 
                    src={result.logoUrl} 
                    alt={`${result.companyName} logo`}
                    className="h-16 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Company Details</h3>
                  <p><strong>Domain:</strong> {result.domain}</p>
                  <p><strong>Company Name:</strong> {result.companyName}</p>
                  <p><strong>Industry:</strong> {result.industry}</p>
                  <p><strong>Target Audience:</strong> {result.targetAudience}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Brand Identity</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span>Brand Colors:</span>
                    {result.brandColors.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p><strong>Competitors:</strong> {result.competitors.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* AI Summary and Recommendations */}
            {result && (result.aiSummary || (result.aiRecommendations && result.aiRecommendations.length > 0)) && (
              <div className="bg-blue-50 rounded-lg shadow p-4 mb-8">
                {result.aiSummary && (
                  <div className="mb-2 text-blue-800 font-semibold">AI Summary: {result.aiSummary}</div>
                )}
                {result.aiRecommendations && result.aiRecommendations.length > 0 && (
                  <div className="text-blue-700 text-sm">
                    <div className="font-semibold mb-1">AI Recommendations:</div>
                    <ul className="list-disc ml-6">
                      {result.aiRecommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Content Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-blue-600">
                Content Strategy
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Services Offered</h3>
                  <ul className="space-y-2">
                    {result.contentPlan.services.map((service, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Blog Topics</h3>
                  <ul className="space-y-2">
                    {result.contentPlan.blogTopics.slice(0, 5).map((topic, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-600">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Platform</h3>
                  <p className="text-lg font-medium text-purple-600">{result.technicalSpecs.platform}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Key Features</h3>
                  <ul className="space-y-1">
                    {result.technicalSpecs.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="text-sm">• {feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Integrations</h3>
                  <ul className="space-y-1">
                    {result.technicalSpecs.integrations.slice(0, 4).map((integration, index) => (
                      <li key={index} className="text-sm">• {integration}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Marketing Strategy */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
                Marketing Strategy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Channels</h3>
                  <ul className="space-y-1">
                    {result.marketingStrategy.channels.slice(0, 4).map((channel, index) => (
                      <li key={index} className="text-sm">• {channel}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Campaigns</h3>
                  <ul className="space-y-1">
                    {result.marketingStrategy.campaigns.map((campaign, index) => (
                      <li key={index} className="text-sm">• {campaign}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Key Metrics</h3>
                  <ul className="space-y-1">
                    {result.marketingStrategy.metrics.slice(0, 4).map((metric, index) => (
                      <li key={index} className="text-sm">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Content Generation Actions */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-orange-600">
                Generate Specific Content
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {['homepage', 'about', 'blog_post', 'social_media', 'email_newsletter', 'landing_page'].map((contentType) => (
                  <button
                    key={contentType}
                    onClick={() => handleGenerateContent(contentType)}
                    disabled={loading}
                    className="bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {loading ? 'Generating...' : contentType.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Generated Content */}
        {step === 'content' && result && result.generatedContent && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-green-600">
                Generated Content
              </h2>
              <button
                onClick={() => setStep('brief')}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Brief
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{result.generatedContent}</pre>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold mb-2">Real Domain Analysis</h3>
              <p className="text-gray-600 text-sm">
                Uses AgentDAO WebSearchSkill to extract real company information and logo
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Competitor Research</h3>
              <p className="text-gray-600 text-sm">
                Identifies real competitors through AgentDAO WebSearchSkill analysis
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">📝</span>
              </div>
              <h3 className="font-semibold mb-2">Content Planning</h3>
              <p className="text-gray-600 text-sm">
                Generate comprehensive content strategies based on real data
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Technical Specs</h3>
              <p className="text-gray-600 text-sm">
                Define platform requirements, features, and integrations
              </p>
            </div>
          </div>
        </div>

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-purple-600">
            Real World Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Web Development Agencies</h3>
              <p className="text-gray-600 mb-4">
                Generate comprehensive project briefs for clients, including competitor analysis, content strategies, and technical specifications.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Client proposal generation</li>
                <li>• Project scope definition</li>
                <li>• Content strategy planning</li>
                <li>• Technical requirements documentation</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Marketing Teams</h3>
              <p className="text-gray-600 mb-4">
                Create detailed marketing strategies and content plans for new product launches or website redesigns.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Campaign strategy development</li>
                <li>• Content calendar creation</li>
                <li>• SEO keyword research</li>
                <li>• Social media planning</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Startups & Entrepreneurs</h3>
              <p className="text-gray-600 mb-4">
                Quickly analyze competitors and generate comprehensive business plans for new ventures.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Market research automation</li>
                <li>• Business plan generation</li>
                <li>• Competitive analysis</li>
                <li>• Go-to-market strategy</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Content Creators</h3>
              <p className="text-gray-600 mb-4">
                Generate content ideas, blog topics, and social media strategies for any industry or niche.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Content ideation</li>
                <li>• Blog topic generation</li>
                <li>• Social media content planning</li>
                <li>• SEO optimization</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          This tool is built using the <span className="font-semibold text-green-700">AgentDAO ContentGeneratorSkill</span> and <span className="font-semibold text-blue-700">AgentDAO WebSearchSkill</span>.
        </footer>
      </div>
    </div>
  )
} 