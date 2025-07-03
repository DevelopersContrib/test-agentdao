'use client'

import { useState } from 'react'
import { Web3SubscriptionSkill } from '@agentdao/core'
import Link from 'next/link'

export default function Web3SubscriptionPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [planId, setPlanId] = useState('basic')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const subscriptionConfig = {
    agentId: 'web3-subscription-demo',
    agentName: 'Web3 Subscription Demo',
    domain: 'demo.agentdao.com',
    adaoToken: {
      address: '0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72',
      decimals: 18,
      network: 'base' as const,
      logo: 'https://example.com/adao-logo.png'
    },
    plans: {
      basic: {
        name: 'Basic Plan',
        description: 'Essential features for individuals',
        features: ['chat', 'basic_analytics', 'email_support'],
        pricing: {
          monthly: { price: 100, discount: 0 },
          quarterly: { price: 270, discount: 10 },
          annually: { price: 960, discount: 20 }
        },
        billing: {
          cycle: 'monthly',
          gracePeriod: 7,
          autoRenew: true
        }
      },
      pro: {
        name: 'Pro Plan',
        description: 'Advanced features for teams',
        features: ['chat', 'advanced_analytics', 'priority_support', 'api_access'],
        pricing: {
          monthly: { price: 500, discount: 0 },
          quarterly: { price: 1350, discount: 10 },
          annually: { price: 4800, discount: 20 }
        }
      },
      enterprise: {
        name: 'Enterprise Plan',
        description: 'Custom solutions for large organizations',
        features: ['chat', 'enterprise_analytics', 'dedicated_support', 'custom_integrations'],
        pricing: {
          monthly: { price: 2000, discount: 0 },
          quarterly: { price: 5400, discount: 10 },
          annually: { price: 19200, discount: 20 }
        }
      }
    },
    provider: {
      rpcUrl: 'https://mainnet.base.org',
      chainId: 8453
    },
    payment: {
      enabled: true,
      methods: ['adao', 'eth']
    },
    integration: {
      webhooks: {
        enabled: true,
        url: 'https://demo.agentdao.com/webhook'
      }
    },
    analytics: {
      enabled: true,
      tracking: ['subscriptions', 'revenue', 'usage', 'churn']
    }
  }

  const handleCreateSubscription = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      
      const subscription = await subscriptionSkill.createSubscription({
        planId,
        walletAddress,
        billingCycle
      })

      setResult(subscription)
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      
      const status = await subscriptionSkill.checkSubscriptionStatus({
        walletAddress
      })

      setResult(status)
    } catch (err: any) {
      setError(err.message || 'Failed to check subscription status')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      
      const result = await subscriptionSkill.cancelSubscription({
        walletAddress
      })

      setResult(result)
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Web3SubscriptionSkill
          </h1>
          <p className="text-xl text-gray-600">
            Manage subscription-based services with crypto payments on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x1234567890123456789012345678901234567890"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic Plan - 100 ADAO/month</option>
                  <option value="pro">Pro Plan - 500 ADAO/month</option>
                  <option value="enterprise">Enterprise Plan - 2000 ADAO/month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly (10% discount)</option>
                  <option value="annually">Annually (20% discount)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Actions
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleCreateSubscription}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Subscription'}
              </button>

              <button
                onClick={handleCheckStatus}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Check Subscription Status'}
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Canceling...' : 'Cancel Subscription'}
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
              Results
            </h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Real World Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">
            Real World Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">SaaS Platform</h3>
              <p className="text-gray-600 mb-3">
                A software-as-a-service platform uses Web3SubscriptionSkill to offer tiered pricing with crypto payments.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Basic: $50/month in ADAO tokens</li>
                <li>• Pro: $200/month with advanced features</li>
                <li>• Enterprise: Custom pricing for large teams</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Content Creator Platform</h3>
              <p className="text-gray-600 mb-3">
                Content creators can monetize their work with subscription-based access to premium content.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Free tier with limited access</li>
                <li>• Premium: 100 ADAO/month for full access</li>
                <li>• VIP: 500 ADAO/month with exclusive content</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">AI Service Provider</h3>
              <p className="text-gray-600 mb-3">
                AI service providers offer different usage tiers with automatic billing and token-based payments.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Starter: 50 API calls/day</li>
                <li>• Growth: 500 API calls/day</li>
                <li>• Scale: Unlimited API calls</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Gaming Platform</h3>
              <p className="text-gray-600 mb-3">
                Gaming platforms use subscriptions for premium features, skins, and exclusive game modes.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Free: Basic gameplay</li>
                <li>• Premium: 200 ADAO/month for extra features</li>
                <li>• Ultimate: 1000 ADAO/month for everything</li>
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
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2">Crypto Payments</h3>
              <p className="text-gray-600 text-sm">
                Accept payments in ADAO tokens and other cryptocurrencies
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">🔄</span>
              </div>
              <h3 className="font-semibold mb-2">Auto-Renewal</h3>
              <p className="text-gray-600 text-sm">
                Automatic subscription renewal with grace periods
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Track subscriptions, revenue, and usage metrics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 