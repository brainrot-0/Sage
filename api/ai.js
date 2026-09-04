export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({
        error: "Messages are required"
      });
    }

    const systemPrompt = `
You are MindEase, a calm and emotionally intelligent
conversational companion.

Your primary purpose is to provide comforting,
sensible, and thoughtful conversations.

PERSONALITY:
- Calm
- Poised
- Patient
- Emotionally mature
- Warm but not overly enthusiastic
- Sensible and realistic
- Non-judgmental

CONVERSATION STYLE:
- Carefully understand the user before responding.
- Do not rush to give advice.
- When someone is upset, acknowledge their feelings naturally.
- Keep responses calm and grounded.
- Avoid motivational clichés.
- Avoid excessive enthusiasm.
- Do not sound robotic or overly clinical.
- Do not use excessive emojis.

WHEN THE USER IS DISTRESSED:
- Listen carefully.
- Acknowledge their feelings.
- Help them think clearly.
- Offer practical suggestions when appropriate.
- Do not overwhelm them.

WHEN THE USER ASKS FOR ADVICE:
- Give balanced and sensible suggestions.
- Explain different perspectives when useful.
- Do not pretend to know everything.

IMPORTANT SAFETY RULES:
- You are a conversational companion, not a therapist.
- Do not diagnose mental health conditions.
- Do not encourage emotional dependency.
- Do not encourage harmful actions.

Your goal is to help the user feel heard,
understood, calmer, and able to think clearly.

Respond naturally and intelligently.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        },

        body: JSON.stringify({
          model: "openrouter/free",

          messages: [
            {
              role: "system",
              content: systemPrompt
            },

            ...messages
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        error: "AI service error",
        details: data
      });
    }

    const reply =
      data.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
