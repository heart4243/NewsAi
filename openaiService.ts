import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function summarizeArticle(title: string, content: string): Promise<{
  summary: string;
  readTime: number;
  category: string;
}> {
  try {
    const prompt = `Please analyze this news article and provide a JSON response with the following format:
{
  "summary": "A concise 2-3 sentence summary highlighting the key points",
  "readTime": "Estimated reading time in minutes (integer)",
  "category": "One of: politics, tech, sports, business, breaking"
}

Article Title: ${title}
Article Content: ${content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a news analysis expert. Analyze articles and provide concise summaries with appropriate categorization. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: result.summary || "Summary not available",
      readTime: Math.max(1, Math.min(10, result.readTime || 3)),
      category: ["politics", "tech", "sports", "business", "breaking"].includes(result.category) 
        ? result.category 
        : "tech"
    };
  } catch (error) {
    console.error("Failed to summarize article:", error);
    // Fallback summary
    return {
      summary: "Unable to generate summary at this time.",
      readTime: 3,
      category: "tech"
    };
  }
}
