import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      event, 
      subscriptionId, 
      userAddress, 
      planId, 
      billingCycle, 
      amount,
      timestamp 
    } = body

    console.log('Webhook received:', {
      event,
      subscriptionId,
      userAddress,
      planId,
      billingCycle,
      amount,
      timestamp
    })

    // Handle different webhook events
    switch (event) {
      case 'subscription.created':
        // Handle new subscription creation
        console.log('New subscription created:', subscriptionId)
        // Here you could:
        // - Send welcome email
        // - Update user database
        // - Trigger onboarding flow
        break

      case 'subscription.renewed':
        // Handle subscription renewal
        console.log('Subscription renewed:', subscriptionId)
        // Here you could:
        // - Send renewal confirmation
        // - Update billing records
        // - Extend user access
        break

      case 'subscription.cancelled':
        // Handle subscription cancellation
        console.log('Subscription cancelled:', subscriptionId)
        // Here you could:
        // - Send cancellation email
        // - Update user status
        // - Trigger retention flow
        break

      case 'payment.failed':
        // Handle failed payment
        console.log('Payment failed for subscription:', subscriptionId)
        // Here you could:
        // - Send payment failure notification
        // - Update subscription status
        // - Trigger retry logic
        break

      case 'payment.succeeded':
        // Handle successful payment
        console.log('Payment succeeded for subscription:', subscriptionId)
        // Here you could:
        // - Send payment confirmation
        // - Update billing records
        // - Extend user access
        break

      default:
        console.log('Unknown webhook event:', event)
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      event,
      subscriptionId,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message
    }, { status: 500 })
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')

  if (challenge) {
    // Webhook verification challenge
    return NextResponse.json({
      success: true,
      challenge,
      message: 'Webhook endpoint is active'
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is ready',
    timestamp: new Date().toISOString()
  })
} 