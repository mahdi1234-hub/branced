# BRANCED - AI-Powered Flipbook Assistant

An end-to-end AI assistant powered by **Cerebras LLM** that guides users step-by-step through any domain or subject, presented in an interactive flipbook format with rich animations and data visualizations.

## Live Demo

**[https://branced-alpha.vercel.app](https://branced-alpha.vercel.app)**

## Features

### AI Guidance Engine
- **Cerebras LLM Integration** (Llama 4 Scout) for intelligent, context-aware guidance
- Step-by-step guidance with suggestions, follow-ups, and key findings
- Domain-agnostic: works for any subject or field
- Maintains conversation context throughout the session

### Interactive Flipbook
- **Page-flip animations** using Framer Motion spring physics and GSAP
- Smooth 3D page transitions with perspective transforms
- Keyboard navigation (arrow keys) and progress indicators
- NOVERA-inspired luxury design aesthetic

### Multi-Step Onboarding Form
- **Conditional logic**: Fields appear/hide based on previous answers
- **Variables and calculations**: Priority score computed from urgency + experience
- **Multiple field types**: Text, textarea, select, radio, checkbox, range, number
- **Validation**: Required fields with visual feedback
- **Multiple endings**: Different guidance paths based on form inputs

### Data Visualization (Results Flipbook)
- **Nivo Charts**: Bar charts, pie charts, line charts, radar charts
- **D3.js**: Custom animated gauge chart with arc transitions
- Risk level indicator with animated progress bar
- Key findings and recommendations display
- Score breakdown across multiple dimensions

### Design & Animations
- **GSAP**: Hero text reveal animation, parallax effects, search bar intro
- **Framer Motion**: Page transitions, staggered item animations, presence animations
- **NOVERA Theme**: Stone color palette, Playfair Display serif headings, Inter sans-serif body
- Floating particle effects, gradient backgrounds
- Responsive design for mobile and desktop

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| AI/LLM | Cerebras API (Llama 4 Scout 17B) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion, GSAP |
| Charts | Nivo (Bar, Pie, Line, Radar), D3.js |
| Deployment | Vercel |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/mahdi1234-hub/branced.git
cd branced

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Cerebras API key

# Run development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-----------|
| `CEREBRAS_API_KEY` | Your Cerebras API key for LLM access |

## Architecture

```
src/
  app/
    page.tsx          # Main app with 4 phases: Landing, Onboarding, Guidance, Results
    layout.tsx        # Root layout with fonts and metadata
    globals.css       # Global styles (Tailwind v4, custom classes)
    api/
      chat/
        route.ts      # Cerebras LLM API endpoint
  components/
    Flipbook.tsx      # Page-flip animation component (GSAP + Framer Motion)
    FormStep.tsx      # Multi-step form with conditional logic
    ChatInterface.tsx # AI chat with formatted message types
    Charts.tsx        # Nivo + D3.js visualization components
  lib/
    types.ts          # TypeScript type definitions
    store.ts          # Simple state management
    form-config.ts    # Form steps, conditions, and calculations
```

## User Flow

1. **Landing Page** - NOVERA-inspired hero with GSAP text reveal animation
2. **Onboarding Flipbook** - 4-step form with conditional logic, collected in a page-flip flipbook
3. **AI Guidance Chat** - Interactive conversation with Cerebras LLM, context-aware follow-ups
4. **Results Flipbook** - Analysis presented in a flipbook with Nivo charts, D3.js gauges, recommendations

## License

MIT
