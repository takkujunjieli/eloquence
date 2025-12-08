# Eloquence

A mobile-first web app that coaches you to speak better using AI.

## Getting Started

1.  **Get a Gemini API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
2.  **Configure Environment**:
    Create a file named `.env.local` in this directory (`eq/app/.env.local`) and add your key:
    ```bash
    GEMINI_API_KEY=your_key_here
    ```
3.  **Run the Server**:
    ```bash
    npm run dev
    ```
4.  **Open**: Visit [http://localhost:3000](http://localhost:3000)

## Features
- **Scenario Selection**: Negotiation, Interview, Difficult Convo.
- **Coach Personas**: "The Orator" (Obama), "The Storyteller" (Lincoln), etc.
- **Real-time**: Web Speech API integration.
- **Feedback**: Post-conversation scoring and suggestions.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
