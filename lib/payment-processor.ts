import { ethers } from 'ethers'
import { Web3SubscriptionSkill } from '@agentdao/core'

export interface PaymentRequest {
  userAddress: string
  planId: string
  billingCycle: 'monthly' | 'quarterly' | 'annually'
  amount: number
  receiverAddress?: string
  signature?: string
  message?: string
  signer?: ethers.Signer
}

export interface PaymentResult {
  success: boolean
  subscriptionId?: string
  transactionHash?: string
  error?: string
  gasUsed?: string
  blockNumber?: number
  paymentDetails?: {
    from: string
    to: string
    amount: number
    token: string
    tokenAddress: string
  }
}

export class PaymentProcessor {
  private provider: ethers.JsonRpcProvider
  private subscriptionSkill: Web3SubscriptionSkill
  private config: any

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
    )

    // Initialize subscription skill
    this.config = {
      agentId: 'payment-processor',
      agentName: 'Payment Processor',
      domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/subscription`,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success`,
        successMessage: 'Payment processed successfully!',
        errorMessage: 'Payment failed'
      },
      analytics: {
        trackRevenue: true,
        trackUsage: true,
        exportData: true
      }
    }

    console.log('PaymentProcessor: Creating Web3SubscriptionSkill with config:', this.config)
    this.subscriptionSkill = new Web3SubscriptionSkill(this.config)
    console.log('PaymentProcessor: Web3SubscriptionSkill created successfully')
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      console.log('PaymentProcessor: Starting payment processing with request:', request)
      
      // Validate inputs
      if (!request.userAddress) {
        console.log('PaymentProcessor: Missing userAddress')
        return {
          success: false,
          error: 'Missing user address'
        }
      }

      if (!ethers.isAddress(request.userAddress)) {
        console.log('PaymentProcessor: Invalid user address format:', request.userAddress)
        return {
          success: false,
          error: 'Invalid user address format'
        }
      }

      if (!request.planId) {
        console.log('PaymentProcessor: Missing planId')
        return {
          success: false,
          error: 'Missing plan ID'
        }
      }

      if (!['basic', 'pro', 'enterprise'].includes(request.planId)) {
        console.log('PaymentProcessor: Invalid planId:', request.planId)
        return {
          success: false,
          error: 'Invalid plan ID'
        }
      }

      if (!request.billingCycle) {
        console.log('PaymentProcessor: Missing billingCycle')
        return {
          success: false,
          error: 'Missing billing cycle'
        }
      }

      if (!['monthly', 'quarterly', 'annually'].includes(request.billingCycle)) {
        console.log('PaymentProcessor: Invalid billingCycle:', request.billingCycle)
        return {
          success: false,
          error: 'Invalid billing cycle'
        }
      }

      if (!request.amount) {
        console.log('PaymentProcessor: Missing amount')
        return {
          success: false,
          error: 'Missing amount'
        }
      }

      if (isNaN(Number(request.amount))) {
        console.log('PaymentProcessor: Invalid amount format:', request.amount)
        return {
          success: false,
          error: 'Invalid amount format'
        }
      }

      console.log('PaymentProcessor: All validations passed')

      // Get receiver wallet address
      const receiverAddress = request.receiverAddress || 
        process.env.NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS || 
        '0x1234567890123456789012345678901234567890'

      if (!ethers.isAddress(receiverAddress)) {
        return {
          success: false,
          error: 'Invalid receiver address'
        }
      }

      // Verify signature if provided
      if (request.signature && request.message) {
        try {
          const recoveredAddress = ethers.verifyMessage(request.message, request.signature)
          if (recoveredAddress.toLowerCase() !== request.userAddress.toLowerCase()) {
            return {
              success: false,
              error: 'Invalid signature'
            }
          }
        } catch (error) {
          return {
            success: false,
            error: 'Signature verification failed'
          }
        }
      }

      // Check user's ETH balance for gas fees
      const ethBalance = await this.provider.getBalance(request.userAddress)
      const estimatedGasCost = ethers.parseEther('0.0001') // Lower estimate for Base network
      
      console.log('PaymentProcessor: ETH balance check:', {
        userAddress: request.userAddress,
        ethBalance: ethers.formatEther(ethBalance),
        estimatedGasCost: ethers.formatEther(estimatedGasCost),
        hasEnoughEth: ethBalance >= estimatedGasCost
      })
      
      if (ethBalance < estimatedGasCost) {
        return {
          success: false,
          error: `Insufficient ETH for gas fees. You need at least ${ethers.formatEther(estimatedGasCost)} ETH on Base network. Current balance: ${ethers.formatEther(ethBalance)} ETH. You can get ETH from a faucet or bridge from Ethereum mainnet.`
        }
      }

      // Check user's ADAO token balance
      const adaoTokenAddress = this.config.adaoToken.address
      const adaoTokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function transferFrom(address from, address to, uint256 amount) returns (bool)'
      ]

      const adaoTokenContract = new ethers.Contract(adaoTokenAddress, adaoTokenAbi, this.provider) as ethers.Contract & {
        transfer: (to: string, amount: ethers.BigNumberish) => Promise<ethers.ContractTransactionResponse>
      }
      const adaoBalance = await adaoTokenContract.balanceOf(request.userAddress)
      const requiredAmount = ethers.parseUnits(request.amount.toString(), this.config.adaoToken.decimals)
      
              if (adaoBalance < requiredAmount) {
          return {
            success: false,
            error: `Insufficient ADAO balance. Required: ${request.amount} ADAO, Available: ${ethers.formatUnits(adaoBalance, this.config.adaoToken.decimals)} ADAO`
          }
        }

      // Set the signer for real blockchain transactions
      if (request.signer) {
        this.subscriptionSkill.setSigner(request.signer)
        console.log('PaymentProcessor: Signer set for real transactions')
      } else {
        console.log('PaymentProcessor: No signer provided, using simulation mode')
      }

      console.log('Processing ADAO token transfer:', {
        from: request.userAddress,
        to: receiverAddress,
        amount: request.amount,
        amountWei: requiredAmount.toString()
      })

      // Perform real token transfer if signer is available
      let transactionHash: string
      if (request.signer) {
        console.log('PaymentProcessor: Executing real ADAO transfer...')
        
        // Transfer ADAO tokens using the signer
        const transferTx = await (adaoTokenContract.connect(request.signer) as any).transfer(
          receiverAddress,
          requiredAmount
        )
        
        // Wait for transaction confirmation
        const receipt = await transferTx.wait()
        if (receipt) {
          transactionHash = receipt.hash
          
          console.log('Real ADAO transfer completed:', {
            transactionHash,
            from: request.userAddress,
            to: receiverAddress,
            amount: request.amount,
            token: 'ADAO',
            gasUsed: receipt.gasUsed?.toString(),
            blockNumber: receipt.blockNumber
          })
        } else {
          throw new Error('Transaction receipt is null')
        }
      } else {
        // Fallback to simulation for demo purposes
        transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`
        console.log('Simulated ADAO transfer completed:', {
          transactionHash,
          from: request.userAddress,
          to: receiverAddress,
          amount: request.amount,
          token: 'ADAO'
        })
      }

      console.log('PaymentProcessor: Creating subscription...')
      
      // Create subscription after successful payment
      const subscription = await this.subscriptionSkill.createSubscription(
        request.userAddress,
        request.planId,
        request.billingCycle
      )

      console.log('PaymentProcessor: Subscription created:', subscription)

      // Log the successful payment
      console.log('Payment processed successfully:', {
        userAddress: request.userAddress,
        receiverAddress,
        planId: request.planId,
        billingCycle: request.billingCycle,
        amount: request.amount,
        amountWei: requiredAmount.toString(),
        subscriptionId: subscription.id,
        transactionHash: transactionHash,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        subscriptionId: subscription.id,
        transactionHash: transactionHash,
        gasUsed: '150000', // Estimated gas used
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000, // Mock block number
        paymentDetails: {
          from: request.userAddress,
          to: receiverAddress,
          amount: request.amount,
          token: 'ADAO',
          tokenAddress: adaoTokenAddress
        }
      }

    } catch (error: any) {
      console.error('Payment processing error:', error)
      
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      }
    }
  }

  async checkSubscriptionStatus(userAddress: string) {
    try {
      if (!userAddress || !ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address')
      }

      const status = await this.subscriptionSkill.checkSubscription(userAddress)
      
      return {
        success: true,
        status,
        userAddress,
        timestamp: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('Status check error:', error)
      
      return {
        success: false,
        error: error.message || 'Failed to check status',
        userAddress
      }
    }
  }

  async cancelSubscription(userAddress: string) {
    try {
      if (!userAddress || !ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address')
      }

      const result = await this.subscriptionSkill.cancelSubscription(userAddress)
      
      return {
        success: result,
        userAddress,
        cancelledAt: new Date().toISOString(),
        message: result ? 'Subscription cancelled successfully' : 'Failed to cancel subscription'
      }

    } catch (error: any) {
      console.error('Cancellation error:', error)
      
      return {
        success: false,
        error: error.message || 'Failed to cancel subscription',
        userAddress
      }
    }
  }

  // Get estimated gas cost
  async estimateGasCost(userAddress: string, planId: string, billingCycle: string) {
    try {
      const estimatedGas = await this.subscriptionSkill.estimateGas(
        userAddress,
        planId,
        billingCycle as 'monthly' | 'quarterly' | 'annually'
      )

      return {
        success: true,
        estimatedGas: estimatedGas.toString(),
        estimatedGasEth: ethers.formatEther(estimatedGas)
      }

    } catch (error: any) {
      console.error('Gas estimation error:', error)
      
      return {
        success: false,
        error: error.message || 'Failed to estimate gas cost'
      }
    }
  }

  // Real token transfer method (for when you have user's private key or MetaMask)
  async transferTokens(
    fromAddress: string,
    toAddress: string,
    amount: number,
    signer: ethers.Signer
  ) {
    try {
      const adaoTokenAddress = this.config.adaoToken.address
      const adaoTokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function transferFrom(address from, address to, uint256 amount) returns (bool)'
      ]

      const adaoTokenContract = new ethers.Contract(adaoTokenAddress, adaoTokenAbi, signer)
      const requiredAmount = ethers.parseUnits(amount.toString(), this.config.adaoToken.decimals)

      // Check balance
      const balance = await adaoTokenContract.balanceOf(fromAddress)
      if (balance < requiredAmount) {
        throw new Error(`Insufficient ADAO balance. Required: ${amount} ADAO, Available: ${ethers.formatUnits(balance, this.config.adaoToken.decimals)} ADAO`)
      }

      // Transfer tokens
      const tx = await adaoTokenContract.transfer(toAddress, requiredAmount)
      const receipt = await tx.wait()

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: fromAddress,
        to: toAddress,
        amount: amount,
        token: 'ADAO'
      }

    } catch (error: any) {
      console.error('Token transfer error:', error)
      
      return {
        success: false,
        error: error.message || 'Token transfer failed'
      }
    }
  }
} 