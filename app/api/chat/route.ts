import { model } from "@/lib/gemini";

export async function POST(req: Request) {
    const { history, context } = await req.json();

    const prompt = `You are a roleplay partner in a conversation training app. 
  The user has selected the following scenario: "${context}".
  
  Your goal is to play the role defined by this scenario authentically.
  - If "Job Interview", be a professional interviewer. Ask behavioral questions.
  - If "Business Negotiation", be a tough but fair counter-party.
  - If "Difficult Conversation", be the person the user is in conflict with.
  
  Keep your responses concise (1-3 sentences) to allow for a back-and-forth dialogue.
  Do not break character. Do not act as an AI assistant. Act AS the role.`;

    try {
        // Get the last message from the array (current user input)
        // and the previous history
        const lastMessage = history[history.length - 1];
        const previousHistory = history.slice(0, -1);

        const chatSession = model.startChat({
            history: [
                { role: "user", parts: [{ text: prompt }] },
                { role: "model", parts: [{ text: "Understood. I am ready to play the role. Please start." }] },
                // Map previous history to Gemini format
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...previousHistory.map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.message }]
                }))
            ]
        });

        const result = await chatSession.sendMessage(lastMessage.message);
        const response = result.response.text();

        return Response.json({ message: response });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to generate response" }, { status: 500 });
    }
}
