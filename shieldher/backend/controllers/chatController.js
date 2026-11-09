exports.handleChat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and must not be empty' });
    }

    if (messages.length > 20) {
      return res.status(400).json({ error: 'Message history limit exceeded (max 20)' });
    }

    // Sanitize and validate messages
    const sanitizedMessages = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') continue;
      const role = msg.role === 'user' ? 'user' : 'assistant';
      const content = String(msg.content || '').slice(0, 1000).trim();
      if (content.length > 0) {
        sanitizedMessages.push({ role, content });
      }
    }

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ error: 'Valid message content is required' });
    }

    const lastMessage = sanitizedMessages[sanitizedMessages.length - 1]?.content?.toLowerCase() || '';

    // Crisp, summarized safety responses
    const getFallbackResponse = (query) => {
      if (query.includes('sos') || query.includes('danger') || query.includes('help') || query.includes('emergency')) {
        return "Press the red SOS button on your screen now to alert your guardians with your live GPS location. You can also dial 112 (National Emergency) or 1091 (Women Helpline). Move toward a well-lit public area immediately.";
      }
      if (query.includes('number') || query.includes('police') || query.includes('helpline')) {
        return "Emergency Helplines:\n• National Emergency: 112\n• Women Helpline: 1091\n• Police: 100\n• Ambulance: 108\nYour designated guardians are also automatically alerted when SOS is triggered.";
      }
      if (query.includes('safe') || query.includes('route') || query.includes('walk') || query.includes('night')) {
        return "Commute Safety Tips:\n1. Walk along well-lit primary roads; avoid isolated alleys.\n2. Keep live GPS tracking active on the Map.\n3. Hold your phone ready, or use the Tactical Fake Call to deter attention.\n4. Stay aware of your surroundings; avoid noise-canceling headphones.";
      }
      return "Hello! I am your ShieldHer Safety Assistant. Ask me any personal safety question, emergency protocol, or how to use the Panic SOS and Safe Map features.";
    };

    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey && !groqKey.includes('placeholder')) {
      const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

      // Concise, summarized prompt for fast comprehension
      const systemPrompt = {
        role: 'system',
        content: `You are ShieldHer Safety Assistant, providing crisp, clear, and reassuring personal safety guidance for women.
Rules:
1. Keep every answer concise and summarized (under 3-4 bullet points or 2 short sentences).
2. Never give long essays or filler text. Be direct, practical, and immediately actionable.
3. If the user mentions danger or fear, immediately recommend pressing the SOS button or dialing 112 / 1091.
4. Do not mention AI, language models, or underlying technology.`
      };

      for (const model of models) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [systemPrompt, ...messages],
              temperature: 0.4,
              max_tokens: 220
            })
          });

          if (response.ok) {
            const data = await response.json();
            return res.json(data);
          }
        } catch (err) {
          console.warn(`[ChatController] Model ${model} fetch failed:`, err.message);
        }
      }
    }

    // Fallback response
    const fallbackText = getFallbackResponse(lastMessage);
    res.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: fallbackText
          }
        }
      ]
    });
  } catch (error) {
    next(error);
  }
};
