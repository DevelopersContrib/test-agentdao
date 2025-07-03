'use client'

import { useState, useEffect } from 'react'
import { Web3SubscriptionSkill } from '@agentdao/core'
import { ethers } from 'ethers'
import Link from 'next/link'

export default function Web3SubscriptionPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [planId, setPlanId] = useState('basic')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [adaoBalance, setAdaoBalance] = useState<string>('0')
  const [adaoBalanceLoading, setAdaoBalanceLoading] = useState<boolean>(false)
  const [wrongNetwork, setWrongNetwork] = useState<boolean>(false)

  // Check if MetaMask is installed
  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsConnected(true)
          await setupProvider()
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }

  // Setup provider and signer
  const setupProvider = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        setProvider(provider)
        setSigner(signer)
        
            // Get balance
    const balance = await provider.getBalance(walletAddress)
    const balanceEth = ethers.formatEther(balance)
    console.log('ETH balance raw:', balance.toString())
    console.log('ETH balance formatted:', balanceEth)
    setBalance(balanceEth)
    
    // Get ADAO balance
    await checkAdaoBalance()
      }
    } catch (error) {
      console.error('Error setting up provider:', error)
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setWalletAddress(accounts[0])
        setIsConnected(true)
        await setupProvider()
        
        // Check if we're on the correct network
        if (provider) {
          const network = await provider.getNetwork()
          console.log('Connected network:', network)
          if (network.chainId !== BigInt(8453)) { // Base mainnet
            setError('Please switch to Base network (Chain ID: 8453)')
            setWrongNetwork(true)
            return
          } else {
            setWrongNetwork(false)
          }
        }
      } else {
        setError('MetaMask is not installed. Please install MetaMask to use this feature.')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet')
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setupProvider()
        } else {
          setWalletAddress('')
          setIsConnected(false)
          setProvider(null)
          setSigner(null)
        }
      })
    }

    checkIfWalletIsConnected()
  }, [])

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

  const handleCreateSubscription = async () => {
    if (!isConnected || !signer) {
      setError('Please connect your wallet first')
      return
    }

    if (!walletAddress) {
      setError('Please enter a wallet address')
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
        from: walletAddress,
        to: receiverAddress,
        amount,
        plan: plan.name,
        billingCycle
      })

      // Check ETH balance for gas fees
      const ethBalance = await provider!.getBalance(walletAddress)
      const estimatedGasCost = ethers.parseEther('0.0001')
      
      if (ethBalance < estimatedGasCost) {
        throw new Error(`Insufficient ETH for gas fees. You need at least ${ethers.formatEther(estimatedGasCost)} ETH on Base network. Current balance: ${ethers.formatEther(ethBalance)} ETH.`)
      }

      // Check ADAO balance
      const adaoTokenAddress = subscriptionConfig.adaoToken.address
      const adaoTokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function transferFrom(address from, address to, uint256 amount) returns (bool)'
      ]

      const adaoTokenContract = new ethers.Contract(adaoTokenAddress, adaoTokenAbi, provider!) as ethers.Contract & {
        transfer: (to: string, amount: ethers.BigNumberish) => Promise<ethers.ContractTransactionResponse>
      }

      const adaoBalance = await adaoTokenContract.balanceOf(walletAddress)
      const requiredAmount = ethers.parseUnits(amount.toString(), subscriptionConfig.adaoToken.decimals)
      
      if (adaoBalance < requiredAmount) {
        throw new Error(`Insufficient ADAO balance. Required: ${amount} ADAO, Available: ${ethers.formatUnits(adaoBalance, subscriptionConfig.adaoToken.decimals)} ADAO`)
      }

      // Execute real ADAO transfer
      console.log('Executing real ADAO transfer...')
      const transferTx = await (adaoTokenContract.connect(signer) as any).transfer(
        receiverAddress,
        requiredAmount
      )

      console.log('Transaction sent:', transferTx.hash)
      
      // Wait for transaction confirmation
      const receipt = await transferTx.wait()
      
      if (!receipt) {
        throw new Error('Transaction failed - no receipt received')
      }

      console.log('Transaction confirmed:', {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      })

      // Create subscription after successful payment
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      subscriptionSkill.setSigner(signer)
      
      const subscription = await subscriptionSkill.createSubscription(
        walletAddress,
        planId,
        billingCycle as 'monthly' | 'quarterly' | 'annually'
      )

      console.log('Subscription created:', subscription)

      setResult({
        success: true,
        subscriptionId: subscription.id,
        transactionHash: receipt.hash,
        userAddress: walletAddress,
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

      // Update balance after transaction
      if (provider) {
        const newBalance = await provider.getBalance(walletAddress)
        setBalance(ethers.formatEther(newBalance))
        
        // Update ADAO balance after transaction
        await checkAdaoBalance()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
      console.error('Subscription error:', err)
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
      console.log('Checking subscription status for:', walletAddress)
      
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      
      // Set the signer for transactions
      if (signer) {
        subscriptionSkill.setSigner(signer)
      }
      
      const status = await subscriptionSkill.checkSubscription(walletAddress)

      console.log('Subscription status:', status)

      setResult({
        success: true,
        status,
        userAddress: walletAddress,
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
    if (!isConnected || !signer) {
      setError('Please connect your wallet first')
      return
    }

    if (!walletAddress) {
      setError('Please enter a wallet address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      console.log('Cancelling subscription for:', walletAddress)
      
      const subscriptionSkill = new Web3SubscriptionSkill(subscriptionConfig)
      
      // Set the signer for transactions
      subscriptionSkill.setSigner(signer)
      
      const result = await subscriptionSkill.cancelSubscription(walletAddress)

      console.log('Subscription cancellation result:', result)

      setResult({
        success: result,
        message: result ? 'Subscription cancelled successfully' : 'Failed to cancel subscription',
        timestamp: new Date().toLocaleString(),
        userAddress: walletAddress
      })
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription')
      console.error('Cancellation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const switchToBaseNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed')
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet in hex
      })
      setWrongNetwork(false)
      setError('')
      // Reconnect wallet after network switch
      await connectWallet()
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          })
          setWrongNetwork(false)
          setError('')
          await connectWallet()
        } catch (addError) {
          setError('Failed to add Base network to MetaMask')
        }
      } else {
        setError('Failed to switch to Base network')
      }
    }
  }

  const checkAdaoBalance = async () => {
    if (!signer || !provider) return
    try {
      setAdaoBalanceLoading(true)
      const address = await signer.getAddress()
      
      console.log('Checking ADAO balance for address:', address)
      console.log('Current network:', await provider.getNetwork())
      
      // ADAO token contract address on Base
      const adaoContractAddress = subscriptionConfig.adaoToken.address
      
      console.log('Using ADAO contract address:', adaoContractAddress)
      
      // ADAO token ABI (minimal for balanceOf)
      const adaoAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)'
      ]
      
      const adaoContract = new ethers.Contract(adaoContractAddress, adaoAbi, provider)
      
      // Try to get token symbol first to verify contract
      try {
        const symbol = await adaoContract.symbol()
        console.log('Token symbol:', symbol)
      } catch (symbolError) {
        console.log('Could not get token symbol, contract might not exist:', symbolError)
      }
      
      const balanceWei = await adaoContract.balanceOf(address)
      const decimals = await adaoContract.decimals()
      const balanceAdao = ethers.formatUnits(balanceWei, decimals)
      
      console.log('ADAO balance raw:', balanceWei.toString())
      console.log('ADAO decimals:', decimals)
      console.log('ADAO balance formatted:', balanceAdao)
      
      setAdaoBalance(parseFloat(balanceAdao).toFixed(2))
    } catch (error) {
      console.error('Error checking ADAO balance:', error)
      setAdaoBalance('Error')
    } finally {
      setAdaoBalanceLoading(false)
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

        {/* Wallet Connection */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔗 Connect Your Wallet
              </h2>
              <p className="text-gray-600">
                Connect your MetaMask wallet to start managing subscriptions
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">💳</span>
            </div>
          </div>
          
          {!isConnected ? (
            <div className="space-y-4">
              {wrongNetwork ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-red-600 text-lg">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Wrong Network
                      </h3>
                      <p className="text-sm text-red-700 mt-1">
                        Please switch to Base network to use this feature
                      </p>
                      <button
                        onClick={switchToBaseNetwork}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                      >
                        Switch to Base Network
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Wallet Required
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        You need MetaMask installed and connected to proceed
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center justify-center space-x-3"
              >
                <span className="text-xl">🦊</span>
                <span>Connect MetaMask Wallet</span>
                <span className="text-sm opacity-80">→</span>
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Don't have MetaMask? 
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-1 underline"
                  >
                    Download here
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-green-600 text-lg">✅</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Wallet Connected Successfully!
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      You can now manage your subscriptions
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-500">📍</span>
                    <span className="text-sm font-medium text-gray-700">Wallet Address</span>
                  </div>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {walletAddress}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-500">💰</span>
                    <span className="text-sm font-medium text-gray-700">ETH Balance</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {parseFloat(balance).toFixed(4)} ETH
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    For gas fees on Base network
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">🪙</span>
                      <span className="text-sm font-medium text-gray-700">ADAO Balance</span>
                    </div>
                    <button
                      onClick={checkAdaoBalance}
                      disabled={adaoBalanceLoading}
                      className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {adaoBalanceLoading ? '⏳' : '🔄'}
                    </button>
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    {adaoBalanceLoading ? 'Checking...' : `${adaoBalance} ADAO`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    For subscription payments
                  </p>
                </div>
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
                
                {!isConnected ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <span className="text-sm text-yellow-800">
                        Connect your wallet first to create a subscription
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✅</span>
                      <span className="text-sm text-green-800">
                        Wallet connected! Ready to create subscription
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCreateSubscription}
                  disabled={loading || !isConnected}
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

                {!isConnected ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <span className="text-sm text-yellow-800">
                        Connect your wallet first to cancel subscription
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-red-600 mr-2">⚠️</span>
                      <span className="text-sm text-red-800">
                        This action cannot be undone
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCancelSubscription}
                  disabled={loading || !isConnected}
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
    </div>
  )
} 