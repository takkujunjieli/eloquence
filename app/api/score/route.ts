import { scoringModel } from "@/lib/gemini";

// Helper to get persona specific guidelines
function getCoachInstruction(coachId: string) {
    switch (coachId) {
        case "orator": // Obama-style
            return "You are 'The Orator'. Your style is inspired by Barack Obama. Focus on cadence, pauses, rhetorical flourishes, and inspiring tone. Be constructive but demanding of high rhetorical standards.";
        case "storyteller": // Lincoln-style
            return "You are 'The Storyteller'. Your style is inspired by Abraham Lincoln. Focus on folksy wisdom, humility, and the use of metaphor or anecdote to drive points home. Be gentle but profound.";
        case "executive": // Jobs-style
            return "You are 'The Executive'. Your style is inspired by Steve Jobs. Focus on radical simplicity, clarity, and vision. Be direct, blunt, and demand perfection. No fluff.";
        default:
            return "You are a communication coach.";
    }
}

export async function POST(req: Request) {
    const { transcript, coach } = await req.json();

    const coachInstruction = getCoachInstruction(coach);

    const prompt = `
  ${coachInstruction}

  Analyze the following conversation transcript. The user is "user". The other party is "AI".
  
  Transcript:
  ${JSON.stringify(transcript)}

  Provide a structured assessment in JSON format with the following fields:
  - scores: { clarity: number (0-100), confidence: number (0-100), empathy: number (0-100), persuasion: number (0-100) }
  - feedback: A string paragraph giving overall feedback in your specific Persona voice.
  - suggestions: An array of strings with specific actionable advice (e.g. "Instead of X, try Y").
  - rewrite: Choose one user sentence that was weak and rewrite it in your Persona's ideal style.
  `;

    try {
        const result = await scoringModel.generateContent(prompt);
        const text = result.response.text();
        // Clean up if markdown code blocks are present (Gemini sometimes adds ```json)
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return Response.json(JSON.parse(jsonStr));
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to score conversation" }, { status: 500 });
    }
}
