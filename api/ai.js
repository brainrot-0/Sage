export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { message, history = [], context = {} } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const systemPrompt = `
You are MindEase Assistant, the conversational AI inside the MindEase mental-wellness application.

Your job is to have natural, warm, human-like conversations with the user.

IMPORTANT BEHAVIOR:
- Respond naturally to what the user actually said.
- Use the previous conversation to understand context.
- Do not behave like a keyword-response chatbot.
- Do not randomly change the subject.
- Do not repeat the same phrases.
- Do not repeatedly say "I'm here to listen."
- Do not use generic responses when the user has given you something specific.
- Ask a relevant follow-up question when appropriate.
- Remember information mentioned earlier in the conversation.
- If the user explains why they feel something, respond to the reason rather than just naming the emotion.
- Keep ordinary responses reasonably concise.
- Do not diagnose mental illnesses.
- Do not claim to be a therapist, doctor, or human.
- Do not make the conversation unnecessarily clinical.

EMOTIONAL UNDERSTANDING:
Recognize different emotional states such as:
sadness, depression, loneliness, anxiety, stress, overwhelm, anger,
frustration, guilt, worthlessness, hopelessness, confusion, tiredness,
happiness, excitement and neutral conversation.

Do not simply announce the detected emotion.
Use it to shape your response.

For example:

User:
"I feel like a burden."

Bad:
"You seem sad. I'm here to listen."

Better:
"Feeling like a burden can hurt in a way that's difficult to explain. What happened today that made you feel that way?"

CONTEXT:
The frontend may provide conversation context containing:
- recent emotions
- previous topics
- previous user messages
- conversation stage
- safety context

Use that context when generating your response.

SAFETY:
If the user expresses suicidal thoughts, intent to die, self-harm,
or says things suggesting they may not be safe, take the statement seriously.

Do not ignore the statement or respond casually.

Encourage the person to move near someone they trust and seek immediate
real-world help.

For users in India:
- Emergency: 112
- Tele-MANAS: 14416
- Tele-MANAS: 1-800-891-4416

If there is immediate danger, encourage contacting emergency services
or going to the nearest emergency department.

Do not overwhelm the user with a huge block of information.

If a previous message indicates suicidal thoughts, interpret ambiguous
later messages in that context.

FEATURES:
MindEase contains tools such as:
- Journal
- Breathing exercises
- Calming sounds
- Doodle space
- Motivational stories
- Voice memories

Only recommend one of these when it genuinely fits the conversation.
Do not advertise features after every emotional message.

CURRENT CONTEXT:
${JSON.stringify(context)}
`;

        const recentHistory = Array.isArray(history)
            ? history.slice(-14)
            : [];

        const input = [
            {
                role: "developer",
                content: systemPrompt
            },
            ...recentHistory.map(item => ({
                role: item.role === "assistant" ? "assistant" : "user",
                content: String(item.content || "")
            })),
            {
                role: "user",
                content: message
            }
        ];

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-5.6-luna",
                    input: input,
                    max_output_tokens: 500
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenAI error:", data);

            return res.status(response.status).json({
                error: data.error?.message || "OpenAI request failed"
            });
        }

        return res.status(200).json({
            response: data.output_text || "I'm having trouble responding right now."
        });

    } catch (error) {
        console.error("Server error:", error);

        return res.status(500).json({
            error: "Something went wrong while contacting MindEase AI."
        });
    }
}
