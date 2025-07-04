import { NextRequest, NextResponse } from 'next/server'
import { PaymentProcessor } from '@/lib/payment-processor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    // Handle both snake_case (from @agentdao/core) and camelCase keys
    const { 
      // camelCase keys (our API expects these)
      userAddress: camelUserAddress, 
      planId: camelPlanId, 
      billingCycle: camelBillingCycle, 
      signature, 
      message,
      amount,
      receiverAddress,
      // snake_case keys (from @agentdao/core package)
      user_address: snakeUserAddress,
      plan_id: snakePlanId,
      billing_period: snakeBillingPeriod,
      agent_id,
      subscription_id,
      plan_name,
      payment_token,
      transaction_hash
    } = body

    // Use camelCase if available, otherwise fall back to snake_case
    const userAddress = camelUserAddress || snakeUserAddress
    const planId = camelPlanId || snakePlanId
    const billingCycle = camelBillingCycle || snakeBillingPeriod

    console.log('Processed request data:', {
      userAddress,
      planId,
      billingCycle,
      amount,
      receiverAddress,
      hasSignature: !!signature,
      hasMessage: !!message,
      // Additional data from @agentdao/core
      agentId: agent_id,
      subscriptionId: subscription_id,
      planName: plan_name,
      paymentToken: payment_token,
      transactionHash: transaction_hash
    })

    // Validate required fields
    if (!userAddress) {
      console.log('Missing userAddress')
      return NextResponse.json({
        success: false,
        error: 'Missing userAddress'
      }, { status: 400 })
    }

    if (!planId) {
      console.log('Missing planId')
      return NextResponse.json({
        success: false,
        error: 'Missing planId'
      }, { status: 400 })
    }

    if (!billingCycle) {
      console.log('Missing billingCycle')
      return NextResponse.json({
        success: false,
        error: 'Missing billingCycle'
      }, { status: 400 })
    }

    if (!amount) {
      console.log('Missing amount')
      return NextResponse.json({
        success: false,
        error: 'Missing amount'
      }, { status: 400 })
    }

    console.log('All required fields present, initializing payment processor...')

    // Initialize payment processor
    const paymentProcessor = new PaymentProcessor()

    console.log('Processing payment with:', {
      userAddress,
      planId,
      billingCycle,
      amount,
      receiverAddress,
      hasSignature: !!signature,
      hasMessage: !!message
    })

    // Process the payment
    const result = await paymentProcessor.processPayment({
      userAddress,
      planId,
      billingCycle: billingCycle as 'monthly' | 'quarterly' | 'annually',
      amount,
      receiverAddress,
      signature,
      message
    })

    console.log('Payment processor result:', result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        subscriptionId: result.subscriptionId,
        transactionHash: result.transactionHash,
        userAddress,
        planId,
        billingCycle,
        amount,
        receiverAddress: receiverAddress || process.env.NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS,
        timestamp: new Date().toISOString(),
        message: 'Payment processed successfully',
        paymentDetails: result.paymentDetails
      })
    } else {
      console.log('Payment failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        userAddress,
        planId,
        billingCycle,
        amount
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}

// Handle GET requests for payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get('userAddress')

  if (!userAddress) {
    return NextResponse.json(
      { error: 'User address is required' },
      { status: 400 }
    )
  }

  try {
    // Initialize payment processor
    const paymentProcessor = new PaymentProcessor()

    // Check subscription status
    const result = await paymentProcessor.checkSubscriptionStatus(userAddress)

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        userAddress: result.userAddress,
        timestamp: result.timestamp
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        userAddress: result.userAddress
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Status check error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check status'
    }, { status: 500 })
  }
} 