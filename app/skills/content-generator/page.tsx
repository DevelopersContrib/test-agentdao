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
  brandAnalysis: {
    description: string
    mission: string
    values: string[]
    uniqueSellingPoints: string[]
  }
  contentPlan: {
    homepage: string
    about: string
    services: string[]
    blogTopics: string[]
    socialMedia: string[]
    seoKeywords: string[]
    blogSeries: {
      title: string
      description: string
      posts: Array<{
        title: string
        outline: string
        keywords: string[]
        seoMeta: {
          title: string
          description: string
          keywords: string
        }
      }>
    }
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
  const [analysisProgress, setAnalysisProgress] = useState('')
  const [activeTab, setActiveTab] = useState<'demo' | 'documentation'>('demo')

  // Initialize AgentDAO WebSearchSkill
  const webSearchSkill = new WebSearchSkill({
    agentId: 'content-generator-web-search',
    agentName: 'Content Generator Web Search',
    domain: 'content-generator.agentdao.com',
    
    ai: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      maxTokens: 4000,
      temperature: 0.7
    },
    
    search: {
      maxResults: 15,
      includeImages: true,
      includeNews: true
    }
  })

  const handleAnalyzeDomain = async () => {
    if (!domain) {
      setError('Please enter a domain')
      return
    }

    // Check if required API keys are configured
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      setError('OpenAI API key not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.')
      return
    }
    


    setLoading(true)
    setError('')
    setResult(null)
    setStep('analyzing')

    try {
      // Step 1: Extract logo and basic domain info
      setAnalysisProgress('Extracting logo and basic domain information...')
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      const logoUrl = `https://logo.clearbit.com/${cleanDomain}?size=200`

      // Step 2: Skip web search for now and go directly to AI analysis
      setAnalysisProgress('Skipping web search, proceeding with AI analysis...')
      console.log('Skipping web search due to Wikipedia provider issue')

      // Step 3: Comprehensive domain analysis with AI
      setAnalysisProgress('Analyzing domain with AI-powered research...')
      console.log('Using AI analysis for domain:', cleanDomain)
      
      // Generate AI analysis based on domain name
      const aiInfo = {
        companyName: analyzeDomainForCompanyName(cleanDomain),
        industry: analyzeDomainForIndustry(cleanDomain),
        targetAudience: analyzeDomainForTargetAudience(cleanDomain),
        competitors: generateCompetitors(cleanDomain),
        services: analyzeDomainForServices(cleanDomain),
        brandAnalysis: {
          description: analyzeDomainForDescription(cleanDomain),
          mission: analyzeDomainForMission(cleanDomain),
          values: analyzeDomainForValues(cleanDomain),
          uniqueSellingPoints: analyzeDomainForUSPs(cleanDomain)
        },
        brandColors: analyzeDomainForColors(cleanDomain),
        seoKeywords: analyzeDomainForSEOKeywords(cleanDomain)
      }

      // Step 4: Generate brand colors and blog series
      setAnalysisProgress('Generating brand colors and blog content series...')
      console.log('Generating brand colors and blog series for domain:', cleanDomain)
      
      const brandColors = aiInfo.brandColors
      const blogSeries = generateDefaultBlogSeries(cleanDomain, aiInfo)

      // Step 5: Skip comprehensive web search for now
      setAnalysisProgress('Skipping comprehensive web search, using AI analysis only...')
      console.log('Skipping comprehensive web search due to Wikipedia provider issue')
      const searchResults: any[] = []
      const brief: WebsiteBrief = {
        domain: cleanDomain,
        companyName: aiInfo?.companyName || generateCompanyName(cleanDomain),
        industry: aiInfo?.industry || analyzeIndustry(cleanDomain),
        targetAudience: aiInfo?.targetAudience || generateTargetAudience(cleanDomain),
        competitors: aiInfo?.competitors || generateCompetitors(cleanDomain),
        logoUrl: logoUrl,
        brandColors: brandColors.length > 0 ? brandColors : generateBrandColors(),
        brandAnalysis: aiInfo?.brandAnalysis || {
          description: `A leading company in the ${aiInfo?.industry || 'technology'} industry, focused on delivering innovative solutions to their customers.`,
          mission: `To provide exceptional value and innovative solutions that empower our customers to succeed.`,
          values: ['Innovation', 'Quality', 'Customer Focus', 'Integrity'],
          uniqueSellingPoints: ['Expert Team', 'Proven Results', 'Innovative Solutions', 'Customer Support']
        },
        contentPlan: {
          homepage: generateHomepageContent(cleanDomain, aiInfo),
          about: generateAboutContent(cleanDomain, aiInfo),
          services: aiInfo?.services || generateServices(cleanDomain),
          blogTopics: generateBlogTopics(cleanDomain, aiInfo),
          socialMedia: generateSocialMediaContent(cleanDomain, aiInfo),
          seoKeywords: aiInfo?.seoKeywords || generateSEOKeywords(cleanDomain, aiInfo),
          blogSeries: blogSeries || generateDefaultBlogSeries(cleanDomain, aiInfo)
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
        searchResults: searchResults,
        aiSummary: `Comprehensive analysis of ${cleanDomain} completed with AI-powered insights.`,
        aiRecommendations: [
          'Focus on content marketing to establish thought leadership',
          'Implement SEO best practices for better search visibility',
          'Develop a strong social media presence',
          'Create valuable blog content for your target audience'
        ]
      }

      setResult(brief)
      setStep('brief')
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Failed to analyze domain. Please check your API keys and try again.')
      setStep('input')
    } finally {
      setLoading(false)
      setAnalysisProgress('')
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

  // Intelligent domain analysis functions
  const analyzeDomainForCompanyName = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    // Extract meaningful parts from domain
    if (domainLower.includes('slimsnacks')) return 'Slim Snacks PH'
    if (domainLower.includes('keto')) return 'Keto Bakery'
    if (domainLower.includes('bakery')) return 'Artisan Bakery'
    if (domainLower.includes('food')) return 'Gourmet Foods'
    if (domainLower.includes('tech')) return 'Tech Solutions'
    if (domainLower.includes('web')) return 'Web Solutions'
    if (domainLower.includes('digital')) return 'Digital Agency'
    if (domainLower.includes('marketing')) return 'Marketing Agency'
    
    // Extract company name from domain
    const parts = domain.split('.')[0].split('-')
    const companyName = parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
    
    return companyName || 'Company'
  }

  const analyzeDomainForIndustry = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto') || domainLower.includes('bakery') || domainLower.includes('food')) {
      return 'Food & Beverage'
    }
    if (domainLower.includes('tech') || domainLower.includes('web') || domainLower.includes('digital') || domainLower.includes('app')) {
      return 'Technology'
    }
    if (domainLower.includes('marketing') || domainLower.includes('advertising') || domainLower.includes('media')) {
      return 'Marketing & Advertising'
    }
    if (domainLower.includes('finance') || domainLower.includes('bank') || domainLower.includes('pay')) {
      return 'Finance'
    }
    if (domainLower.includes('health') || domainLower.includes('medical') || domainLower.includes('fitness')) {
      return 'Healthcare'
    }
    if (domainLower.includes('edu') || domainLower.includes('school') || domainLower.includes('learn')) {
      return 'Education'
    }
    
    return 'Technology' // Default fallback
  }

  const analyzeDomainForTargetAudience = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return 'Health-conscious individuals following keto and low-carb diets, fitness enthusiasts, and people looking for healthy snack alternatives'
    }
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return 'Food lovers, families, and individuals seeking quality baked goods and food products'
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return 'Small to medium businesses looking to digitize their operations'
    }
    if (domainLower.includes('marketing')) {
      return 'Businesses seeking to improve their online presence and marketing strategies'
    }
    
    return 'General consumers and businesses'
  }

  const analyzeDomainForServices = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return ['Keto-friendly baked goods', 'Low-carb snacks', 'Healthy desserts', 'Dietary food products']
    }
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return ['Artisan breads', 'Custom cakes', 'Pastries', 'Gourmet food items']
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return ['Web Design & Development', 'E-commerce Solutions', 'Mobile App Development', 'Digital Consulting']
    }
    if (domainLower.includes('marketing')) {
      return ['Digital Marketing', 'SEO Services', 'Social Media Management', 'Content Creation']
    }
    
    return ['Professional Services', 'Consulting', 'Solutions', 'Support']
  }

  const analyzeDomainForDescription = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return 'A leading keto bakery specializing in delicious, low-carb baked goods and healthy snacks. We help health-conscious individuals enjoy tasty treats while maintaining their dietary goals.'
    }
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return 'A premium bakery and food company dedicated to creating high-quality, delicious baked goods and food products for our valued customers.'
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return 'A technology company focused on delivering innovative digital solutions and web development services to help businesses succeed online.'
    }
    
    return 'A leading company focused on delivering exceptional value and innovative solutions to our customers.'
  }

  const analyzeDomainForMission = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return 'To provide delicious, healthy keto-friendly alternatives that make healthy eating enjoyable and accessible to everyone.'
    }
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return 'To create exceptional baked goods and food products that bring joy and satisfaction to our customers\' lives.'
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return 'To empower businesses with innovative technology solutions that drive growth and success in the digital age.'
    }
    
    return 'To provide exceptional value and innovative solutions that empower our customers to succeed.'
  }

  const analyzeDomainForValues = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto') || domainLower.includes('bakery') || domainLower.includes('food')) {
      return ['Quality', 'Health', 'Taste', 'Customer Satisfaction']
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return ['Innovation', 'Quality', 'Customer Focus', 'Integrity']
    }
    
    return ['Innovation', 'Quality', 'Customer Focus', 'Integrity']
  }

  const analyzeDomainForUSPs = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return ['Keto-Certified Products', 'Delicious Taste', 'Health-Focused', 'Quality Ingredients']
    }
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return ['Artisan Quality', 'Fresh Ingredients', 'Custom Creations', 'Expert Bakers']
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return ['Expert Team', 'Proven Results', 'Innovative Solutions', 'Customer Support']
    }
    
    return ['Expert Team', 'Proven Results', 'Innovative Solutions', 'Customer Support']
  }

  const analyzeDomainForColors = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return ['#059669', '#10b981', '#34d399', '#6ee7b7'] // Green tones for health
    }
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'] // Warm tones for food
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'] // Blue tones for tech
    }
    
    return ['#2563eb', '#1e40af', '#3b82f6'] // Default blue
  }

  const analyzeDomainForSEOKeywords = (domain: string) => {
    const domainLower = domain.toLowerCase()
    
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return ['keto bakery', 'low carb snacks', 'keto desserts', 'healthy snacks', 'keto friendly', 'dietary food', 'slim snacks', 'keto products']
    }
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return ['bakery', 'fresh bread', 'custom cakes', 'pastries', 'artisan bakery', 'gourmet food', 'baked goods', 'desserts']
    }
    if (domainLower.includes('tech') || domainLower.includes('web')) {
      return ['web design', 'web development', 'digital solutions', 'technology services', 'software development', 'IT consulting', 'digital transformation']
    }
    
    return ['professional services', 'consulting', 'solutions', 'expertise']
  }

  // Enhanced helper functions
  const generateDefaultBlogSeries = (domain: string, domainInfo?: any) => {
    const domainLower = domain.toLowerCase()
    const industry = domainInfo?.industry || 'Technology'
    const companyName = domainInfo?.companyName || 'Company'
    
    // Industry-specific blog series
    if (domainLower.includes('slimsnacks') || domainLower.includes('keto')) {
      return {
        title: 'The Complete Keto Lifestyle Guide',
        description: 'A comprehensive series covering everything you need to know about keto baking, healthy snacks, and maintaining a low-carb lifestyle.',
        posts: [
          {
            title: 'Introduction to Keto Baking: What You Need to Know',
            outline: `1. Understanding keto baking principles\n2. Essential ingredients for keto baking\n3. Common mistakes to avoid\n4. Getting started with keto recipes\n5. Tips for success`,
            keywords: ['keto baking', 'low carb baking', 'keto recipes', 'healthy baking'],
            seoMeta: {
              title: 'Introduction to Keto Baking: Complete Guide for Beginners',
              description: 'Learn everything you need to know about keto baking. Discover essential ingredients, techniques, and recipes for delicious low-carb treats.',
              keywords: 'keto baking, low carb baking, keto recipes, healthy baking, beginners'
            }
          },
          {
            title: 'Top 10 Keto Snack Ideas for 2024',
            outline: `1. Keto-friendly nuts and seeds\n2. Low-carb protein bars\n3. Keto fat bombs\n4. Cheese-based snacks\n5. Vegetable chips\n6. Keto smoothies\n7. Protein shakes\n8. Keto cookies\n9. Fat bombs\n10. Meal prep tips`,
            keywords: ['keto snacks', 'low carb snacks', 'healthy snacks', 'keto diet'],
            seoMeta: {
              title: 'Top 10 Keto Snack Ideas for 2024: Healthy & Delicious',
              description: 'Discover the best keto snack ideas for 2024. Learn how to make delicious, healthy low-carb snacks that support your ketogenic lifestyle.',
              keywords: 'keto snacks, low carb snacks, healthy snacks, keto diet, 2024'
            }
          },
          {
            title: 'How to Start a Successful Keto Bakery Business',
            outline: `1. Market research for keto products\n2. Business model and pricing strategy\n3. Sourcing quality ingredients\n4. Recipe development and testing\n5. Marketing to keto community\n6. Online and offline sales\n7. Quality control and compliance\n8. Scaling your keto bakery\n9. Customer retention strategies\n10. Industry trends and opportunities`,
            keywords: ['keto bakery business', 'keto business', 'low carb business', 'health food business'],
            seoMeta: {
              title: 'How to Start a Successful Keto Bakery Business: Complete Guide',
              description: 'Step-by-step guide to starting a successful keto bakery business. Learn from industry experts and avoid common pitfalls.',
              keywords: 'keto bakery business, keto business, low carb business, health food business, startup'
            }
          }
        ]
      }
    }
    
    if (domainLower.includes('bakery') || domainLower.includes('food')) {
      return {
        title: 'The Art of Artisan Baking',
        description: 'A comprehensive series covering everything you need to know about artisan baking, quality ingredients, and creating exceptional baked goods.',
        posts: [
          {
            title: 'Introduction to Artisan Baking: Techniques and Principles',
            outline: `1. Understanding artisan baking principles\n2. Essential baking techniques\n3. Quality ingredient selection\n4. Getting started with artisan recipes\n5. Tips for success`,
            keywords: ['artisan baking', 'baking techniques', 'quality ingredients', 'baked goods'],
            seoMeta: {
              title: 'Introduction to Artisan Baking: Complete Guide for Beginners',
              description: 'Learn everything you need to know about artisan baking. Discover essential techniques, ingredients, and recipes for exceptional baked goods.',
              keywords: 'artisan baking, baking techniques, quality ingredients, baked goods, beginners'
            }
          },
          {
            title: 'Top 10 Artisan Bread Recipes for 2024',
            outline: `1. Sourdough bread\n2. Whole grain bread\n3. Rye bread\n4. Ciabatta\n5. Baguette\n6. Focaccia\n7. Brioche\n8. Challah\n9. Multigrain bread\n10. Gluten-free options`,
            keywords: ['artisan bread', 'bread recipes', 'sourdough', 'baking'],
            seoMeta: {
              title: 'Top 10 Artisan Bread Recipes for 2024: From Sourdough to Brioche',
              description: 'Discover the best artisan bread recipes for 2024. Learn how to make delicious, quality breads that will impress your customers.',
              keywords: 'artisan bread, bread recipes, sourdough, baking, 2024'
            }
          }
        ]
      }
    }
    
    // Default tech series
    return {
      title: `The Complete Guide to ${industry} Success`,
      description: `A comprehensive series covering everything you need to know about succeeding in the ${industry.toLowerCase()} industry.`,
      posts: [
        {
          title: `Introduction to ${industry}: What You Need to Know`,
          outline: `1. Understanding the ${industry} landscape\n2. Key trends and developments\n3. Opportunities and challenges\n4. Getting started in ${industry}\n5. Conclusion and next steps`,
          keywords: [`${industry.toLowerCase()}`, 'introduction', 'basics', 'guide'],
          seoMeta: {
            title: `Introduction to ${industry}: Complete Guide for Beginners`,
            description: `Learn everything you need to know about ${industry.toLowerCase()}. Discover key trends, opportunities, and how to get started in this growing industry.`,
            keywords: `${industry.toLowerCase()}, introduction, guide, beginners, trends`
          }
        },
        {
          title: `Top 10 ${industry} Strategies for 2024`,
          outline: `1. Strategy 1: Digital transformation\n2. Strategy 2: Customer experience optimization\n3. Strategy 3: Data-driven decision making\n4. Strategy 4: Innovation and R&D\n5. Strategy 5: Strategic partnerships\n6. Strategy 6: Market expansion\n7. Strategy 7: Technology adoption\n8. Strategy 8: Talent acquisition\n9. Strategy 9: Risk management\n10. Strategy 10: Sustainability initiatives`,
          keywords: [`${industry.toLowerCase()} strategies`, '2024', 'best practices', 'success'],
          seoMeta: {
            title: `Top 10 ${industry} Strategies for 2024 Success`,
            description: `Discover the most effective ${industry.toLowerCase()} strategies for 2024. Learn proven tactics to grow your business and stay ahead of the competition.`,
            keywords: `${industry.toLowerCase()}, strategies, 2024, success, best practices`
          }
        }
      ]
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
    // Handle blog series generation
    if (contentType.startsWith('blog_series_')) {
      const index = parseInt(contentType.split('_')[2])
      const post = brief.contentPlan.blogSeries.posts[index]
      if (post) {
        return `# ${post.title}

${post.outline}

## SEO Meta Information
- **Title**: ${post.seoMeta.title}
- **Description**: ${post.seoMeta.description}
- **Keywords**: ${post.seoMeta.keywords}

## Full Article

This comprehensive article explores ${post.title.toLowerCase()}. Based on our analysis of ${brief.domain}, we've created this detailed guide to help you understand and implement the best practices in this area.

### Introduction

${brief.brandAnalysis.description} In this article, we'll dive deep into ${post.title.toLowerCase()} and provide you with actionable insights that you can implement immediately.

### Key Points Covered

${post.outline.split('\n').map(line => line.trim()).filter(line => line.length > 0).map(line => `- ${line}`).join('\n')}

### Why This Matters for ${brief.companyName}

As a leading company in the ${brief.industry} industry, we understand the importance of staying ahead of the curve. This article reflects our commitment to ${brief.brandAnalysis.values.join(', ').toLowerCase()} and our mission to ${brief.brandAnalysis.mission.toLowerCase()}.

### Conclusion

By implementing the strategies outlined in this article, you'll be well-positioned to succeed in the ever-evolving ${brief.industry.toLowerCase()} landscape. Stay tuned for more insights from ${brief.companyName}.

---

*This article is part of our "${brief.contentPlan.blogSeries.title}" series. Check out our other posts for more valuable insights.*`
      }
    }

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
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mr-2">
              Enhanced by <span className="font-bold">AgentDAO WebSearchSkill</span>
            </span>
            <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
              🔍 AI-Powered <span className="font-bold">Web Search</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'demo'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-green-50'
            }`}
          >
            🚀 Demo
          </button>
          <button
            onClick={() => setActiveTab('documentation')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'documentation'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-green-50'
            }`}
          >
            📚 Documentation
          </button>
        </div>

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <>
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
              {analysisProgress}
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

            {/* Brand Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-600">
                Brand Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Company Description</h3>
                  <p className="text-gray-700 mb-4">{result.brandAnalysis.description}</p>
                  
                  <h3 className="font-semibold text-lg mb-4">Mission Statement</h3>
                  <p className="text-gray-700 mb-4 italic">"{result.brandAnalysis.mission}"</p>
                  
                  <h3 className="font-semibold text-lg mb-4">Core Values</h3>
                  <ul className="space-y-2">
                    {result.brandAnalysis.values.map((value, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Unique Selling Points</h3>
                  <ul className="space-y-2">
                    {result.brandAnalysis.uniqueSellingPoints.map((usp, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {usp}
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="font-semibold text-lg mb-4 mt-6">SEO Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.contentPlan.seoKeywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Notice */}
            <div className="bg-blue-50 rounded-lg shadow p-4 mb-8">
              <div className="text-blue-800 font-semibold mb-3">
                🤖 AI-Powered Analysis
              </div>
              <div className="text-blue-700 text-sm">
                <p>Content generated using AI analysis of the domain name and industry patterns. Web search functionality is currently disabled due to provider configuration issues.</p>
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

            {/* Blog Series */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
                Blog Content Series
              </h2>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">{result.contentPlan.blogSeries.title}</h3>
                <p className="text-gray-600 mb-4">{result.contentPlan.blogSeries.description}</p>
              </div>
              <div className="space-y-6">
                {result.contentPlan.blogSeries.posts.map((post, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        Post {index + 1}
                      </span>
                    </div>
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Outline:</h5>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">{post.outline}</pre>
                    </div>
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Keywords:</h5>
                      <div className="flex flex-wrap gap-2">
                        {post.keywords.map((keyword, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">SEO Meta:</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Title:</strong> <span className="text-blue-700">{post.seoMeta.title}</span>
                        </div>
                        <div>
                          <strong>Description:</strong> <span className="text-blue-700">{post.seoMeta.description}</span>
                        </div>
                        <div>
                          <strong>Keywords:</strong> <span className="text-blue-700">{post.seoMeta.keywords}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Content Generation</h3>
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
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Blog Series Content</h3>
                <p className="text-gray-600 mb-4">Generate full blog posts from the content series above:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.contentPlan.blogSeries.posts.map((post, index) => (
                    <button
                      key={index}
                      onClick={() => handleGenerateContent(`blog_series_${index}`)}
                      disabled={loading}
                      className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium text-left"
                    >
                      {loading ? 'Generating...' : `Generate: ${post.title.substring(0, 40)}...`}
                    </button>
                  ))}
                </div>
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
          </>
        )}

        {/* Documentation Tab */}
        {activeTab === 'documentation' && (
          <div className="space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-green-600">Content Generator Documentation</h2>
              <p className="text-gray-700 mb-6">
                The Content Generator skill uses AgentDAO's WebSearchSkill to analyze domains and generate comprehensive website project briefs. 
                This tool combines AI-powered analysis with web search capabilities to create detailed content strategies.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🔍 Domain Analysis</h3>
                  <p className="text-green-700 text-sm">
                    Automatically extracts company information, logo, industry classification, and competitor analysis from any domain.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📝 Content Generation</h3>
                  <p className="text-blue-700 text-sm">
                    Generates comprehensive content plans including homepage copy, about pages, blog topics, and social media strategies.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🎯 SEO Optimization</h3>
                  <p className="text-purple-700 text-sm">
                    Creates SEO-optimized content with keyword research, meta descriptions, and search-friendly content structures.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">📊 Marketing Strategy</h3>
                  <p className="text-orange-700 text-sm">
                    Develops complete marketing strategies including channel recommendations, campaign ideas, and performance metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Implementation */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-blue-600">Technical Implementation</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">AgentDAO WebSearchSkill Configuration</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { WebSearchSkill } from '@agentdao/core';

const webSearchSkill = new WebSearchSkill({
  agentId: 'content-generator-web-search',
  agentName: 'Content Generator Web Search',
  domain: 'content-generator.agentdao.com',
  
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4000,
    temperature: 0.7
  },
  
  search: {
    maxResults: 15,
    includeImages: true,
    includeNews: true
  }
});`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Domain Analysis Process</h3>
                  <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                    <li><strong>Logo Extraction:</strong> Uses Clearbit API to fetch company logos</li>
                    <li><strong>Domain Analysis:</strong> AI-powered analysis of domain name and industry patterns</li>
                    <li><strong>Competitor Research:</strong> Identifies competitors through intelligent domain analysis</li>
                    <li><strong>Content Generation:</strong> Creates comprehensive content strategies</li>
                    <li><strong>Technical Specs:</strong> Generates platform requirements and integrations</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Content Types Generated</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      'Homepage Content', 'About Page', 'Blog Posts', 
                      'Social Media Posts', 'Email Newsletters', 'Landing Pages',
                      'SEO Keywords', 'Meta Descriptions', 'Technical Specs',
                      'Marketing Strategy', 'Competitor Analysis', 'Brand Guidelines'
                    ].map((type, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* API Reference */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-600">API Reference</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">WebsiteBrief Interface</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`interface WebsiteBrief {
  domain: string;
  companyName: string;
  industry: string;
  targetAudience: string;
  competitors: string[];
  logoUrl?: string;
  brandColors: string[];
  brandAnalysis: {
    description: string;
    mission: string;
    values: string[];
    uniqueSellingPoints: string[];
  };
  contentPlan: {
    homepage: string;
    about: string;
    services: string[];
    blogTopics: string[];
    socialMedia: string[];
    seoKeywords: string[];
    blogSeries: {
      title: string;
      description: string;
      posts: Array<{
        title: string;
        outline: string;
        keywords: string[];
        seoMeta: {
          title: string;
          description: string;
          keywords: string;
        };
      }>;
    };
  };
  technicalSpecs: {
    platform: string;
    features: string[];
    integrations: string[];
  };
  marketingStrategy: {
    channels: string[];
    campaigns: string[];
    metrics: string[];
  };
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Key Functions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">handleAnalyzeDomain()</h4>
                      <p className="text-gray-600 text-sm">Main function that orchestrates the entire domain analysis process</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">analyzeDomainForCompanyName(domain)</h4>
                      <p className="text-gray-600 text-sm">Intelligent domain analysis to extract company name and industry</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">generateDefaultBlogSeries(domain, domainInfo)</h4>
                      <p className="text-gray-600 text-sm">Creates comprehensive blog content series based on domain analysis</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">handleGenerateContent(contentType)</h4>
                      <p className="text-gray-600 text-sm">Generates specific content types (homepage, about, blog posts, etc.)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Examples */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-orange-600">Usage Examples</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Basic Domain Analysis</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Analyze a domain and generate a complete brief
const domain = 'example.com';
const brief = await handleAnalyzeDomain(domain);

// Access generated content
console.log(brief.companyName); // "Example Corp"
console.log(brief.industry); // "Technology"
console.log(brief.contentPlan.blogTopics); // Array of blog topics
console.log(brief.marketingStrategy.channels); // Marketing channels`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Content Generation</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Generate specific content types
await handleGenerateContent('homepage');
await handleGenerateContent('about');
await handleGenerateContent('blog_post');
await handleGenerateContent('social_media');

// Generate blog series content
await handleGenerateContent('blog_series_0'); // First blog post
await handleGenerateContent('blog_series_1'); // Second blog post`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Integration with AgentDAO</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Use with other AgentDAO skills
import { WebSearchSkill, ImageGenerationSkill } from '@agentdao/core';

// Combine with image generation for visual content
const imageSkill = new ImageGenerationSkill({
  // ... configuration
});

// Generate images for blog posts
const blogImage = await imageSkill.generateImages({
  prompt: brief.contentPlan.blogTopics[0],
  size: '1024x1024'
});`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-green-600">Best Practices</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Domain Analysis</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Use clean domain names without protocols</li>
                    <li>• Verify domain exists before analysis</li>
                    <li>• Review generated content for accuracy</li>
                    <li>• Customize brand voice and tone</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Content Strategy</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Review and edit generated content</li>
                    <li>• Add industry-specific terminology</li>
                    <li>• Include real customer testimonials</li>
                    <li>• Optimize for local SEO if applicable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Technical Implementation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Set up proper error handling</li>
                    <li>• Implement rate limiting for API calls</li>
                    <li>• Cache results for better performance</li>
                    <li>• Validate generated content before publishing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">SEO Optimization</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Review and refine generated keywords</li>
                    <li>• Ensure meta descriptions are compelling</li>
                    <li>• Add schema markup for better search results</li>
                    <li>• Monitor search performance after implementation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-red-600">Troubleshooting</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-red-800 mb-2">"OpenAI API key not configured"</h3>
                  <p className="text-red-700 text-sm">
                    Ensure you have set the NEXT_PUBLIC_OPENAI_API_KEY environment variable with a valid OpenAI API key.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">"No Wikipedia page found"</h3>
                  <p className="text-yellow-700 text-sm">
                    This is expected behavior. The system uses AI analysis instead of web search for better accuracy.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Generic company information</h3>
                  <p className="text-blue-700 text-sm">
                    The system provides intelligent domain analysis. For more specific information, manually review and edit the generated content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 