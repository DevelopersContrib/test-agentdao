'use client'

import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId, useBalance, useDisconnect, usePublicClient, useWalletClient } from 'wagmi'
import { mainnet, base } from 'wagmi/chains'
import { ethers } from 'ethers'
import Link from 'next/link'
import { Web3SubscriptionSkill } from '@agentdao/core'

export default function Web3SubscriptionPage() {
  // --- wagmi hooks for wallet/account/network state ---
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  // ETH balance (live)
  const { data: ethBalance } = useBalance({ address, chainId: base.id })

  // ADAO balance (live, using wagmi + ethers)
  const [adaoBalance, setAdaoBalance] = React.useState<string>('0')
  const [adaoLoading, setAdaoLoading] = React.useState(false)
  const [adaoError, setAdaoError] = React.useState('')

  // --- ADAO contract config ---
  const ADAO_ADDRESS = process.env.NEXT_PUBLIC_ADAO_TOKEN_ADDRESS as `0x${string}`
  const ADAO_DECIMALS = Number(process.env.NEXT_PUBLIC_ADAO_TOKEN_DECIMALS || 18)
  const ADAO_ABI = [
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }]
    },
    {
      name: 'decimals',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint8' }]
    },
    {
      name: 'symbol',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'string' }]
    },
    {
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    }
  ] as const

  // Fetch ADAO balance using wagmi's publicClient and ethers
  React.useEffect(() => {
    async function fetchAdao() {
      if (!address || !publicClient) return
      setAdaoLoading(true)
      setAdaoError('')
      try {
        // Use wagmi's readContract instead of ethers for consistency
        const bal = await publicClient.readContract({
          address: ADAO_ADDRESS,
          abi: ADAO_ABI,
          functionName: 'balanceOf',
          args: [address]
        }) as bigint

        const decimals = await publicClient.readContract({
          address: ADAO_ADDRESS,
          abi: ADAO_ABI,
          functionName: 'decimals',
          args: []
        }) as number

        setAdaoBalance(Number(ethers.formatUnits(bal, decimals)).toFixed(2))
      } catch (err: any) {
        setAdaoError('Error fetching ADAO balance')
        setAdaoBalance('0')
        console.error('ADAO balance fetch error:', err)
      } finally {
        setAdaoLoading(false)
      }
    }
    fetchAdao()
  }, [address, publicClient])

  // Manual refresh function for ADAO balance
  const refreshAdaoBalance = async () => {
    if (!address || !publicClient) return
    setAdaoLoading(true)
    setAdaoError('')
    try {
      const bal = await publicClient.readContract({
        address: ADAO_ADDRESS,
        abi: ADAO_ABI,
        functionName: 'balanceOf',
        args: [address]
      }) as bigint

      const decimals = await publicClient.readContract({
        address: ADAO_ADDRESS,
        abi: ADAO_ABI,
        functionName: 'decimals',
        args: []
      }) as number

      setAdaoBalance(Number(ethers.formatUnits(bal, decimals)).toFixed(2))
    } catch (err: any) {
      setAdaoError('Error fetching ADAO balance')
      setAdaoBalance('0')
      console.error('ADAO balance refresh error:', err)
    } finally {
      setAdaoLoading(false)
    }
  }

  // --- Only allow actions if connected and on Base ---
  const isBase = chainId === base.id
  const canUse = isConnected && isBase

  // --- UI State ---
  const [planId, setPlanId] = React.useState('basic')
  const [billingCycle, setBillingCycle] = React.useState('monthly')
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<any>(null)
  const [error, setError] = React.useState('')

  // Tab state
  const [tab, setTab] = React.useState<'demo' | 'docs'>('demo')
  // Hydration fix: only render after mount
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  // --- Subscription Configuration ---
  const subscriptionConfig = {
    agentId: 'web3-subscription-demo',
    agentName: 'Web3 Subscription Demo',
    domain: 'demo.agentdao.com',
    adaoToken: {
      address: process.env.NEXT_PUBLIC_ADAO_TOKEN_ADDRESS || '0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72',
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
          defaultPeriod: 'monthly' as const,
          allowPeriodChange: true,
          prorationEnabled: true
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
        },
        billing: {
          defaultPeriod: 'monthly' as const,
          allowPeriodChange: true,
          prorationEnabled: true
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
        },
        billing: {
          defaultPeriod: 'monthly' as const,
          allowPeriodChange: true,
          prorationEnabled: true
        }
      }
    },
    provider: {
      rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),
      explorer: 'https://basescan.org'
    },
    payment: {
      autoApprove: true,
      requireConfirmation: false,
      refundPolicy: {
        enabled: true,
        gracePeriod: 7
      },
      billing: {
        allowTrial: true,
        trialDays: 7,
        gracePeriodDays: 3
      }
    },
    integration: {
      webhookUrl: 'https://demo.agentdao.com/webhook',
      redirectUrl: 'https://demo.agentdao.com/success',
      successMessage: 'Subscription created successfully!',
      errorMessage: 'Failed to create subscription'
    },
    analytics: {
      trackRevenue: true,
      trackUsage: true,
      exportData: true
    }
  }

  // --- Transaction Handlers using wagmi ---
  const handleCreateSubscription = async () => {
    if (!isBase) {
      setError('Please switch to Base network to create a subscription.')
      return
    }
    if (!isConnected || !address || !walletClient || !publicClient) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Get plan pricing
      const plan = subscriptionConfig.plans[planId as keyof typeof subscriptionConfig.plans]
      const pricing = plan.pricing[billingCycle as keyof typeof plan.pricing]
      const amount = pricing.price

      // Get receiver address - this should be set in your .env.local file
      const receiverAddress = process.env.NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS || '0x1234567890123456789012345678901234567890'
      
      if (receiverAddress === '0x1234567890123456789012345678901234567890') {
        console.warn('Using default receiver address. Please set NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS in your .env.local file')
      }

      console.log('Starting real blockchain transaction:', {
        from: address,
        to: receiverAddress,
        amount,
        plan: plan.name,
        billingCycle
      })

      // Check ETH balance for gas fees
      if (!ethBalance || ethBalance.value < ethers.parseEther('0.0001')) {
        throw new Error(`Insufficient ETH for gas fees. You need at least 0.0001 ETH on Base network. Current balance: ${ethBalance ? ethers.formatEther(ethBalance.value) : '0'} ETH.`)
      }

      // Check ADAO balance using publicClient
      const adaoTokenAddress = subscriptionConfig.adaoToken.address
      const adaoBalance = await publicClient.readContract({
        address: adaoTokenAddress as `0x${string}`,
        abi: ADAO_ABI,
        functionName: 'balanceOf',
        args: [address]
      }) as bigint

      const requiredAmount = ethers.parseUnits(amount.toString(), subscriptionConfig.adaoToken.decimals)
      
      if (adaoBalance < requiredAmount) {
        throw new Error(`Insufficient ADAO balance. Required: ${amount} ADAO, Available: ${ethers.formatUnits(adaoBalance, subscriptionConfig.adaoToken.decimals)} ADAO`)
      }

      // Execute real ADAO transfer using wagmi walletClient
      console.log('Executing real ADAO transfer...')
      console.log('Contract address:', adaoTokenAddress)
      console.log('Receiver address:', receiverAddress)
      console.log('Amount in wei:', requiredAmount.toString())
      console.log('Signer address:', address)
      
      const { request } = await publicClient.simulateContract({
        address: adaoTokenAddress as `0x${string}`,
        abi: ADAO_ABI,
        functionName: 'transfer',
        args: [receiverAddress as `0x${string}`, requiredAmount],
        account: address,
      })

      const hash = await walletClient.writeContract(request)
      
      console.log('Transaction sent:', hash)
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      if (!receipt) {
        throw new Error('Transaction failed - no receipt received')
      }

      console.log('Transaction confirmed:', {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      })

      // Create subscription after successful payment
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      // Create an ethers.js signer from the injected provider (window.ethereum)
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No wallet provider found. Please install MetaMask or another wallet.')
      }
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      subscriptionSkill.setSigner(signer)
      
      const subscription = await subscriptionSkill.createSubscription(
        address,
        planId,
        billingCycle as 'monthly' | 'quarterly' | 'annually'
      )

      console.log('Subscription created:', subscription)

      setResult({
        success: true,
        subscriptionId: subscription.id,
        transactionHash: receipt.transactionHash,
        userAddress: address,
        planId,
        billingCycle,
        amount,
        receiverAddress,
        timestamp: new Date().toISOString(),
        message: 'Payment processed successfully',
        gasUsed: receipt.gasUsed?.toString(),
        blockNumber: receipt.blockNumber,
        status: 'success'
      })

      // Refresh ADAO balance after transaction
      const newAdaoBalance = await publicClient.readContract({
        address: adaoTokenAddress as `0x${string}`,
        abi: ADAO_ABI,
        functionName: 'balanceOf',
        args: [address]
      }) as bigint
      setAdaoBalance(Number(ethers.formatUnits(newAdaoBalance, subscriptionConfig.adaoToken.decimals)).toFixed(2))
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
      console.error('Subscription error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!isBase) {
      setError('Please switch to Base network to check subscription status.')
      return
    }
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      console.log('Checking subscription status for:', address)
      
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      
      // For wagmi v2, we'll skip setting the signer for now
      // The subscription skill might need to be updated to work with wagmi v2
      
      const status = await subscriptionSkill.checkSubscription(address)

      console.log('Subscription status:', status)

      setResult({
        success: true,
        status,
        userAddress: address,
        timestamp: new Date().toLocaleString()
      })
    } catch (err: any) {
      setError(err.message || 'Failed to check subscription status')
      console.error('Status check error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!isBase) {
      setError('Please switch to Base network to cancel your subscription.')
      return
    }
    if (!isConnected || !address || !walletClient) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      console.log('Cancelling subscription for:', address)
      
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      
      // For wagmi v2, we'll skip setting the signer for now
      // The subscription skill might need to be updated to work with wagmi v2
      
      const result = await subscriptionSkill.cancelSubscription(address)

      console.log('Subscription cancellation result:', result)

      setResult({
        success: result,
        message: result ? 'Subscription cancelled successfully' : 'Failed to cancel subscription',
        timestamp: new Date().toLocaleString(),
        userAddress: address
      })
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription')
      console.error('Cancellation error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold text-lg border-b-2 transition-colors ${tab === 'demo' ? 'bg-white border-blue-600 text-blue-700' : 'bg-blue-100 border-transparent text-blue-500 hover:bg-white'}`}
            onClick={() => setTab('demo')}
          >
            Demo
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold text-lg border-b-2 transition-colors ${tab === 'docs' ? 'bg-white border-blue-600 text-blue-700' : 'bg-blue-100 border-transparent text-blue-500 hover:bg-white'}`}
            onClick={() => setTab('docs')}
          >
            Documentation
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'demo' ? (
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

            {/* Wallet Connection (RainbowKit) */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🔗 Connect Your Wallet
                  </h2>
                  <p className="text-gray-600">
                    Connect your MetaMask (or any wallet) to start managing subscriptions
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">💳</span>
                </div>
              </div>
              <ConnectButton chainStatus="icon" showBalance={false} />
              {!isConnected && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700">Wallet Required: Please connect your wallet to proceed.</p>
                </div>
              )}
              {isConnected && !isBase && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">Wrong Network: Please switch to Base network to use this app.</p>
                </div>
              )}
              {canUse && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-sm text-green-800">
                      Wallet connected and ready! You're on Base network and can create subscriptions.
                    </span>
                  </div>
                </div>
              )}
              {canUse && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-gray-500">📍</span>
                      <span className="text-sm font-medium text-gray-700">Wallet Address</span>
                    </div>
                    <p className="text-sm text-gray-900 font-mono break-all">{address}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-gray-500">💰</span>
                      <span className="text-sm font-medium text-gray-700">ETH Balance</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{ethBalance ? Number(ethBalance.formatted).toFixed(4) : '0.0000'} ETH</p>
                    <p className="text-xs text-gray-500 mt-1">For gas fees on Base network</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">🪙</span>
                        <span className="text-sm font-medium text-gray-700">ADAO Balance</span>
                      </div>
                      <button
                        onClick={refreshAdaoBalance}
                        disabled={adaoLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                        title="Refresh ADAO balance"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {adaoLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking...
                        </span>
                      ) : (
                        `${adaoBalance} ADAO`
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">For subscription payments</p>
                    {adaoError && <p className="text-xs text-red-500 mt-1">{adaoError}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Subscription Configuration */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-lg">⚙️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Choose Your Plan
                    </h2>
                    <p className="text-gray-600">
                      Select the perfect subscription plan for your needs
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Plan Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📦 Subscription Plan
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          planId === 'basic' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setPlanId('basic')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Basic</span>
                          {planId === 'basic' && (
                            <span className="text-blue-600 text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Perfect for individuals</p>
                        <p className="text-lg font-bold text-blue-600">100 ADAO</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>

                      <div 
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          planId === 'pro' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setPlanId('pro')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Pro</span>
                          {planId === 'pro' && (
                            <span className="text-blue-600 text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Great for teams</p>
                        <p className="text-lg font-bold text-blue-600">500 ADAO</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>

                      <div 
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          planId === 'enterprise' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setPlanId('enterprise')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Enterprise</span>
                          {planId === 'enterprise' && (
                            <span className="text-blue-600 text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">For large organizations</p>
                        <p className="text-lg font-bold text-blue-600">2000 ADAO</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Cycle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📅 Billing Cycle
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          billingCycle === 'monthly' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setBillingCycle('monthly')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Monthly</span>
                          {billingCycle === 'monthly' && (
                            <span className="text-green-600 text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">No discount</p>
                      </div>

                      <div 
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          billingCycle === 'quarterly' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setBillingCycle('quarterly')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Quarterly</span>
                          {billingCycle === 'quarterly' && (
                            <span className="text-green-600 text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-green-600 font-semibold">Save 10%</p>
                      </div>

                      <div 
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          billingCycle === 'annually' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setBillingCycle('annually')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Annually</span>
                          {billingCycle === 'annually' && (
                            <span className="text-green-600 text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-green-600 font-semibold">Save 20%</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">💰 Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">
                          {planId === 'basic' ? 'Basic' : planId === 'pro' ? 'Pro' : 'Enterprise'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing:</span>
                        <span className="font-medium capitalize">{billingCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-lg text-blue-600">
                          {(() => {
                            const plan = subscriptionConfig.plans[planId as keyof typeof subscriptionConfig.plans]
                            const pricing = plan.pricing[billingCycle as keyof typeof plan.pricing]
                            return `${pricing.price} ADAO`
                          })()}
                        </span>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Payment To:</span>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {process.env.NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS || '0x1234...5678'}
                            </span>
                            <p className="text-xs text-gray-500">Receiver Wallet</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">💡</span>
                          <span className="text-sm text-blue-800">
                            Payment will be sent in ADAO tokens to the receiver wallet
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-lg">🚀</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Manage Your Subscription
                    </h2>
                    <p className="text-gray-600">
                      Create, check, or cancel your subscription
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Create Subscription */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          ✨ Create New Subscription
                        </h3>
                        <p className="text-sm text-gray-600">
                          Start your subscription with the selected plan
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">1</span>
                      </div>
                    </div>
                    
                    {!address && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <span className="text-yellow-600 mr-2">⚠️</span>
                          <span className="text-sm text-yellow-800">
                            Connect your wallet first to create a subscription
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleCreateSubscription}
                      disabled={loading || !address}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center justify-center space-x-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">💳</span>
                          <span>Create Subscription</span>
                          <span className="text-sm opacity-80">→</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Check Status */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          📊 Check Subscription Status
                        </h3>
                        <p className="text-sm text-gray-600">
                          View your current subscription details
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">2</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckStatus}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center justify-center space-x-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Checking Status...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🔍</span>
                          <span>Check Status</span>
                          <span className="text-sm opacity-80">→</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cancel Subscription */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          🚫 Cancel Subscription
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cancel your active subscription
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm">3</span>
                      </div>
                    </div>

                    {!address && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <span className="text-yellow-600 mr-2">⚠️</span>
                          <span className="text-sm text-yellow-800">
                            Connect your wallet first to cancel subscription
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleCancelSubscription}
                      disabled={loading || !address}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center justify-center space-x-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Canceling...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">❌</span>
                          <span>Cancel Subscription</span>
                          <span className="text-sm opacity-80">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-red-600 text-lg">❌</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error Occurred
                        </h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        
                        {error.includes('Insufficient ETH for gas fees') && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 How to get ETH on Base network:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• <a href="https://bridge.base.org/" target="_blank" rel="noopener noreferrer" className="underline">Bridge ETH from Ethereum mainnet</a></li>
                              <li>• <a href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet" target="_blank" rel="noopener noreferrer" className="underline">Use Base faucet (if available)</a></li>
                              <li>• Buy ETH on an exchange and withdraw to Base network</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-lg">📋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Transaction Results
                    </h2>
                    <p className="text-gray-600">
                      Details of your subscription operation
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                  {result.success ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <span className="text-green-600 text-2xl mr-3">✅</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Operation Successful!
                          </h3>
                          <p className="text-gray-600">
                            Your subscription has been processed successfully
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.subscriptionId && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-gray-500">🆔</span>
                              <span className="text-sm font-medium text-gray-700">Subscription ID</span>
                            </div>
                            <p className="text-sm text-gray-900 font-mono break-all">
                              {result.subscriptionId}
                            </p>
                          </div>
                        )}

                        {result.transactionHash && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-gray-500">🔗</span>
                              <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                            </div>
                            <p className="text-sm text-gray-900 font-mono break-all">
                              {result.transactionHash}
                            </p>
                          </div>
                        )}

                        {result.userAddress && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-gray-500">👤</span>
                              <span className="text-sm font-medium text-gray-700">User Address</span>
                            </div>
                            <p className="text-sm text-gray-900 font-mono break-all">
                              {result.userAddress}
                            </p>
                          </div>
                        )}

                        {result.planId && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-gray-500">📦</span>
                              <span className="text-sm font-medium text-gray-700">Plan</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {result.planId}
                            </p>
                          </div>
                        )}

                        {result.billingCycle && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-gray-500">📅</span>
                              <span className="text-sm font-medium text-gray-700">Billing Cycle</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {result.billingCycle}
                            </p>
                          </div>
                        )}

                        {result.amount && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-gray-500">💰</span>
                              <span className="text-sm font-medium text-gray-700">Amount Paid</span>
                            </div>
                            <p className="text-lg font-bold text-blue-600">
                              {result.amount} ADAO
                            </p>
                          </div>
                        )}

                        {result.paymentDetails && (
                          <>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-gray-500">📤</span>
                                <span className="text-sm font-medium text-gray-700">From</span>
                              </div>
                              <p className="text-sm text-gray-900 font-mono break-all">
                                {result.paymentDetails.from}
                              </p>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-gray-500">📥</span>
                                <span className="text-sm font-medium text-gray-700">To (Receiver)</span>
                              </div>
                              <p className="text-sm text-gray-900 font-mono break-all">
                                {result.paymentDetails.to}
                              </p>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-gray-500">🪙</span>
                                <span className="text-sm font-medium text-gray-700">Token</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {result.paymentDetails.token} ({result.paymentDetails.tokenAddress})
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {result.timestamp && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-gray-500">🕒</span>
                            <span className="text-sm font-medium text-gray-700">Timestamp</span>
                          </div>
                          <p className="text-sm text-gray-900">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <span className="text-red-600 text-2xl mr-3">❌</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Operation Failed
                          </h3>
                          <p className="text-gray-600">
                            {result.error || 'An error occurred during processing'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                        <pre className="text-sm text-red-700 whitespace-pre-wrap">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
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
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4 text-blue-700">Web3SubscriptionSkill Integration Guide</h1>
            <p className="mb-6 text-lg text-gray-700">
              This guide explains how to use the AgentDAO Web3SubscriptionSkill for production-grade Web3 subscriptions with ADAO tokens on the Base network.
            </p>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">Required .env Variables</h2>
            <p className="mb-2 text-gray-700">Add these to your <code>.env.local</code> file in your project root:</p>
            <pre className="bg-gray-100 rounded p-2 mb-4 text-sm overflow-x-auto">{`
NEXT_PUBLIC_ADAO_TOKEN_ADDRESS=0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72
NEXT_PUBLIC_ADAO_TOKEN_DECIMALS=18
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS=0xYourReceiverWalletAddress
`}</pre>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li><code>NEXT_PUBLIC_ADAO_TOKEN_ADDRESS</code>: ADAO token contract address on Base</li>
              <li><code>NEXT_PUBLIC_ADAO_TOKEN_DECIMALS</code>: Token decimals (18 for ADAO)</li>
              <li><code>NEXT_PUBLIC_BASE_RPC_URL</code>: Base network RPC URL</li>
              <li><code>NEXT_PUBLIC_CHAIN_ID</code>: Base network chain ID (8453)</li>
              <li><code>NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS</code>: Your wallet address to receive subscription payments</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">Overview</h2>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li>Wallet connection with wagmi + RainbowKit</li>
              <li>Live ADAO balance and plan selection</li>
              <li>On-chain payment and backend verification</li>
              <li>Clear error handling and user feedback</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">How We Integrated Web3SubscriptionSkill</h2>
            <ol className="list-decimal ml-6 mb-4 text-gray-700">
              <li>
                <b>Install AgentDAO Core:</b>
                <pre className="bg-gray-100 rounded p-2 mt-1 mb-2 text-sm">npm install @agentdao/core</pre>
              </li>
              <li>
                <b>Configure the Skill:</b>
                <pre className="bg-gray-100 rounded p-2 mt-1 mb-2 text-sm overflow-x-auto">{`
import { Web3SubscriptionSkill } from '@agentdao/core';

const subscriptionConfig = {
  agentId: 'my-agent-123',
  agentName: 'My Agent',
  domain: 'myagent.agentdao.com',
  adaoToken: {
    address: '0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72', // ADAO on Base
    decimals: 18,
    network: 'base',
    logo: 'https://example.com/adao-logo.png'
  },
  plans: {
    basic: {
      name: 'Basic Plan',
      description: 'Essential features',
      features: ['chat', 'basic_analytics'],
      pricing: {
        monthly: { adao: 100 },
        quarterly: { adao: 270 },
        annually: { adao: 960 }
      }
    },
    pro: {
      name: 'Pro Plan',
      description: 'Advanced features',
      features: ['chat', 'analytics', 'priority_support'],
      pricing: {
        monthly: { adao: 250 },
        quarterly: { adao: 675 },
        annually: { adao: 2400 }
      }
    }
  },
  provider: {
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453
  }
};
`}</pre>
              </li>
              <li>
                <b>Create the Skill Instance:</b>
                <pre className="bg-gray-100 rounded p-2 mt-1 mb-2 text-sm">{`
const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig);
`}</pre>
              </li>
              <li>
                <b>Create a Subscription:</b>
                <pre className="bg-gray-100 rounded p-2 mt-1 mb-2 text-sm">{`
const subscription = await subscriptionSkill.createSubscription(
  userAddress,
  'pro',      // plan ID
  'monthly'   // billing period
);
`}</pre>
              </li>
              <li>
                <b>Check Subscription Status:</b>
                <pre className="bg-gray-100 rounded p-2 mt-1 mb-2 text-sm">{`
const status = await subscriptionSkill.getSubscriptionStatus(userAddress);
`}</pre>
              </li>
              <li>
                <b>Get Revenue Analytics:</b>
                <pre className="bg-gray-100 rounded p-2 mt-1 mb-2 text-sm">{`
const analytics = await subscriptionSkill.getRevenueAnalytics();
`}</pre>
              </li>
            </ol>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">How to Use in Your Own Project</h2>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li>Install <code>@agentdao/core</code> and set up your config as above.</li>
              <li>Connect the user's wallet (wagmi + RainbowKit recommended).</li>
              <li>Display available plans and let the user select one.</li>
              <li>Call <code>createSubscription</code> with the user's address, plan, and billing period.</li>
              <li>Handle transaction confirmation and errors in your UI.</li>
              <li>Check subscription status as needed for gating features/content.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">Best Practices</h2>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li>Check for sufficient ADAO and ETH (for gas) before allowing a subscription.</li>
              <li>Use clear error messages for wallet, network, or payment issues.</li>
              <li>Keep your config (token address, chain ID, etc.) up to date with the latest ADAO deployment on Base.</li>
              <li>For production, secure your backend endpoints and validate all on-chain transactions.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">Example UI Flow</h2>
            <ol className="list-decimal ml-6 mb-4 text-gray-700">
              <li>User connects wallet.</li>
              <li>User sees available plans and their ADAO balance.</li>
              <li>User selects a plan and clicks "Subscribe."</li>
              <li>App calls <code>createSubscription</code>, triggers wallet transaction.</li>
              <li>On success, backend verifies and updates subscription status.</li>
              <li>User sees confirmation and can access gated features.</li>
            </ol>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">References</h2>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li><a href="https://www.npmjs.com/package/@agentdao/core" className="text-blue-700 underline" target="_blank">AgentDAO Core NPM</a></li>
              <li><a href="https://developers.agentdao.com/docs" className="text-blue-700 underline" target="_blank">AgentDAO Documentation</a></li>
              <li><a href="https://base.org/" className="text-blue-700 underline" target="_blank">Base Network Info</a></li>
              <li><a href="https://wagmi.sh/" className="text-blue-700 underline" target="_blank">wagmi</a> and <a href="https://www.rainbowkit.com/" className="text-blue-700 underline" target="_blank">RainbowKit</a> for wallet integration</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 