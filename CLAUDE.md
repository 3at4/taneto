# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Taneto (タネト)** is a mobile app project focused on male fertility support and conception assistance. The project is currently in the planning and research phase, with comprehensive documentation but no code implementation yet.

### Key Concept
- **Target Audience**: 30-something urban males, high-income earners (600万+ yen), married 3+ years
- **Core Philosophy**: Transform male mindset from passive observer to active participant in conception journey
- **Unique Value**: AI-powered self-dialogue partner for emotional support, using garden metaphor for mental/physical state visualization

## Project Structure

```
taneto-pj/
├── docs/
│   ├── prd.md          # Product Requirements Document (comprehensive)
│   ├── solution.md     # Technical solution analysis
│   ├── painSurvey.md   # User pain point research
│   └── report.md       # Market research and competitive analysis
└── CLAUDE.md          # This file
```

## Core Architecture (Planned)

### Three Main Modules
1. **Emotional Onboarding**: Immersive partner-perspective story to build empathy
2. **Journaling Partner**: AI-powered daily reflection prompts and private journaling
3. **Mindful Garden**: Metaphorical visualization of user's mental/physical state

### Design Principles
- **No scoring/evaluation**: Focus on acceptance rather than judgment
- **Privacy-first**: All data stored locally on device
- **Garden metaphor**: Daily "care" activities change garden appearance
- **Male-centric**: Designed specifically for male psychology and needs

## Development Guidelines

### When implementing this project:

1. **UI/UX Approach**:
   - Dark mode as default for male users
   - Simple, intuitive design requiring no tutorials
   - Garden illustrations should be calming, not too realistic or abstract

2. **AI Interaction**:
   - MVP uses pre-written question templates (30 types)
   - Simple acceptance responses, no content analysis initially
   - Focus on emotional support rather than problem-solving

3. **Data Management**:
   - All user data must be encrypted and stored locally
   - No external server transmission for journal entries
   - Privacy policy must explicitly state local-only storage

4. **Core Features Priority**:
   - All three modules are Must-have for MVP
   - Simple garden state changes (weather, flowers, butterflies)
   - Basic activity logging (sleep, exercise, stress level)

## Market Context

### Key Insights from Research:
- 91.7% of men in their 20s-30s want children (vs 88.6% women)
- Male fertility market is severely underserved
- Existing apps (Pairrhythm, LunaLuna) treat men as passive viewers
- Male-specific pain points: isolation, shame, lack of knowledge

### Competitive Differentiation:
- First app to treat men as active participants, not passive supporters
- Focus on mindset transformation rather than data tracking
- Addresses male-specific psychological barriers (shame, pride, control)

## Technical Considerations

### Performance Requirements:
- App startup: <3 seconds
- Screen transitions: <1 second
- Local data encryption essential
- Offline-first architecture

### Future Phases:
- Phase 1: MVP with basic AI and garden features
- Phase 2: Advanced AI analysis, premium features
- Phase 3: Partner integration, community features

## Success Metrics

### Key Goals:
- 40% user retention at 1 month
- Transform male mindset from passive to active participation
- Establish market leadership in male fertility support

This project represents a significant opportunity to address the overlooked male perspective in fertility support, with potential to contribute meaningfully to Japan's declining birth rate challenge.