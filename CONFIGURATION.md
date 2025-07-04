# Configuration Guide

This guide explains how to configure the AgentDAO skills and set up your environment variables.

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# OpenAI API Key (Required for AI-powered features)
# Get your API key from: https://platform.openai.com/api-keys
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Optional Variables

```env
# Twitter API Credentials (For SocialMediaSkill)
NEXT_PUBLIC_TWITTER_API_KEY=your_twitter_api_key_here
NEXT_PUBLIC_TWITTER_API_SECRET=your_twitter_api_secret_here
NEXT_PUBLIC_TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
NEXT_PUBLIC_TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here

# AgentDAO Configuration (For enhanced features)
AGENTDAO_API_KEY=your_agentdao_api_key_here
AGENTDAO_DOMAIN=your_domain.agentdao.com

# Web3 Configuration (For blockchain features)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_ADAO_TOKEN_ADDRESS=0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72
NEXT_PUBLIC_ADAO_TOKEN_DECIMALS=18
NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS=0x1234567890123456789012345678901234567890

# RSS Feed Configuration
NEXT_PUBLIC_DEFAULT_RSS_URL=https://hnrss.org/frontpage
NEXT_PUBLIC_RSS_FETCH_LIMIT=5

# Google Search API Configuration (For WebSearchSkill)
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Photo/Image Configuration
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
NEXT_PUBLIC_PIXABAY_API_KEY=your_pixabay_api_key_here

# Analytics Configuration
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id_here

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Key Setup Instructions

### 1. OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to your `.env.local` file

### 2. Twitter API Credentials

1. Visit [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use an existing one
3. Navigate to "Keys and tokens"
4. Generate "Access Token and Secret"
5. Add the credentials to your `.env.local` file

### 3. AgentDAO API Key (Optional)

1. Visit [AgentDAO Dashboard](https://agentdao.com/dashboard)
2. Sign up for an account
3. Generate an API key
4. Add it to your `.env.local` file

### 4. Web3 Configuration (For Web3SubscriptionSkill)

#### MetaMask Setup

1. Install [MetaMask](https://metamask.io/) browser extension
2. Create or import a wallet
3. Add Base network to MetaMask:
   - Network Name: Base
   - RPC URL: <https://mainnet.base.org>
   - Chain ID: 8453
   - Currency Symbol: ETH
   - Block Explorer: <https://basescan.org>

#### ADAO Token Setup

1. The ADAO token address is pre-configured for Base network
2. You can add ADAO token to MetaMask using the address: `0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72`
3. Ensure you have some ETH on Base network for gas fees

#### Receiver Wallet (Optional)

1. Set `NEXT_PUBLIC_RECEIVER_WALLET_ADDRESS` in your `.env.local` file
2. This wallet will receive subscription payments
3. If not set, the default contract receiver will be used

### 5. Google Search API (For WebSearchSkill)

#### Google Custom Search API Setup

1. **Go to Google Cloud Console**: Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Create a new project** (or select existing one):
   - Click on the project dropdown at the top
   - Click "New Project"
   - Give it a name like "AgentDAO Web Search"
   - Click "Create"

3. **Enable the Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click on it and click "Enable"

4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - Add it to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY`

5. **Create Custom Search Engine**:
   - Go to [https://cse.google.com/cse/](https://cse.google.com/cse/)
   - Click "Add" to create a new search engine
   - Enter any site (like `google.com`) in "Sites to search"
   - Check "Search the entire web"
   - Click "Create"
   - Copy the Search Engine ID (cx)
   - Add it to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID`

#### Usage Limits

- Google Custom Search API provides 100 free queries per day
- Additional queries cost $5 per 1000 queries
- Consider upgrading to a paid plan for production use

### 6. Photo/Image API Keys (Optional)

#### Unsplash API Key

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key
4. Add it to your `.env.local` file as `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`

#### Pexels API Key

1. Visit [Pexels API](https://www.pexels.com/api/)
2. Sign up for an account
3. Get your API key
4. Add it to your `.env.local` file as `NEXT_PUBLIC_PEXELS_API_KEY`

#### Pixabay API Key

1. Visit [Pixabay API](https://pixabay.com/api/docs/)
2. Register for an account
3. Get your API key
4. Add it to your `.env.local` file as `NEXT_PUBLIC_PIXABAY_API_KEY`

## Testing Configuration

After setting up your environment variables:

1. Start the development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Test each skill using the interactive examples
4. Check the browser console for any configuration errors

## Troubleshooting

### Common Issues

1. **"API key not found" errors**
   - Ensure your `.env.local` file is in the root directory
   - Restart the development server after adding environment variables
   - Check that variable names match exactly (case-sensitive)

2. **Twitter API errors**
   - Verify your Twitter app has the correct permissions
   - Ensure your access tokens are valid and not expired
   - Check that your app is approved for the endpoints you're using

3. **OpenAI API errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure you're using a supported model

4. **Web3/Blockchain errors**
   - Ensure MetaMask is installed and connected
   - Verify you're on the correct network (Base mainnet)
   - Check that you have sufficient ETH for gas fees
   - Ensure the ADAO token contract is accessible
   - Verify your wallet has the required permissions

### Getting Help

- Check the [AgentDAO Documentation](https://developers.agentdao.com/docs)
- Join the [AgentDAO Discord](https://discord.gg/agentdao)
- Open an issue on [GitHub](https://github.com/agentdao/core/issues)
