# AgentDAO Core Package & Skills - Sample Repository

This is a sample working repository demonstrating the AgentDAO core package and skills integration. It showcases how to build AI agents with various capabilities using the AgentDAO framework.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- AgentDAO account (optional for full features)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd test-agentdao

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 What's Included

This sample repository demonstrates the following AgentDAO skills:

### 🤖 Core Skills

- **Web3SubscriptionSkill** - Manage subscription-based services with crypto payments
- **ContentGeneratorSkill** - Generate AI-powered content for blogs, social media, and marketing
- **SocialMediaSkill** - Automate social media posting and engagement
- **HelpSupportSkill** - Create intelligent customer support agents
- **LiveChatSkill** - Real-time chat functionality for agents
- **TokenGatingSkill** - Control access based on token ownership
- **RssFetcherSkill** - Fetch and process RSS feeds
- **WebSearchSkill** - Perform web searches and gather information

### 🛠️ Features Demonstrated

- **Multi-platform Integration** - Connect with various APIs and services
- **AI-Powered Responses** - OpenAI integration for intelligent interactions
- **Web3 Integration** - Blockchain-based subscriptions and payments
- **Real-time Updates** - Live chat and subscription management
- **Analytics & Tracking** - Monitor agent performance and usage
- **Customizable Configurations** - Flexible setup for different use cases

## 🎯 Skill Examples

### Web3 Subscription Management

```typescript
import { Web3SubscriptionSkill } from '@agentdao/core'

const subscriptionConfig = {
  agentId: 'example-agent',
  agentName: 'Example Agent',
  domain: 'example.agentdao.com',
  adaoToken: {
    address: '0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72',
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
        monthly: { price: 100, discount: 0 },
        quarterly: { price: 270, discount: 10 },
        annually: { price: 960, discount: 20 }
      }
    }
  }
}
```

### Content Generation

```typescript
import { ContentGeneratorSkill } from '@agentdao/core'

const contentConfig = {
  agentId: 'content-agent',
  agentName: 'Content Generator',
  brand: {
    name: 'Example Company',
    voice: 'professional',
    tone: 'friendly',
    keywords: ['technology', 'innovation', 'solutions']
  },
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    maxTokens: 2000,
    temperature: 0.7
  }
}
```

### Social Media Management

```typescript
import { SocialMediaSkill } from '@agentdao/core'

const socialConfig = {
  agentId: 'social-agent',
  agentName: 'Social Media Manager',
  platforms: {
    twitter: {
      enabled: true,
      apiKey: 'your-api-key',
      username: '@examplecompany',
      autoReply: true
    }
  },
  scheduling: {
    enabled: true,
    timezone: 'UTC',
    defaultTime: '09:00'
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# OpenAI API Key (for AI-powered features)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# Twitter API (for social media features)
NEXT_PUBLIC_TWITTER_ACCESS_TOKEN=your_twitter_access_token

# AgentDAO Configuration
AGENTDAO_API_KEY=your_agentdao_api_key
AGENTDAO_DOMAIN=your_domain.agentdao.com
```

### Customization

Each skill can be customized through configuration objects. See the individual skill examples in the code for detailed configuration options.

## 📚 Documentation

For detailed documentation on AgentDAO skills and features, visit:

- [AgentDAO Developers Documentation](https://developers.agentdao.com/docs)
- [Core Package Reference](https://developers.agentdao.com/docs/core)
- [Skills Documentation](https://developers.agentdao.com/docs/skills)

## 🧪 Testing

The application includes interactive examples for each skill:

1. **Subscription Management** - Test crypto-based subscription flows
2. **Content Generation** - Generate blog posts and marketing content
3. **Social Media** - Post and manage social media content
4. **Support Chat** - Test customer support interactions
5. **RSS Feeds** - Fetch and process RSS content
6. **Web Search** - Perform web searches and gather information

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:

- Netlify
- Railway
- Heroku
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://developers.agentdao.com/docs](https://developers.agentdao.com/docs)
- **Community**: [AgentDAO Discord](https://discord.gg/agentdao)
- **Issues**: [GitHub Issues](https://github.com/agentdao/core/issues)

## 🔗 Related Links

- [AgentDAO Website](https://agentdao.com)
- [Core Package](https://www.npmjs.com/package/@agentdao/core)
- [Next.js Integration](https://www.npmjs.com/package/@agentdao/next)
- [API Reference](https://developers.agentdao.com/docs/api)

---

Built with ❤️ by the AgentDAO team
