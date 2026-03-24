import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// Define schema
const outputSchema = z.object({
  summary: z.string().describe("A concise summary of the repository"),
  cool_facts: z
    .array(z.string())
    .max(5)
    .describe("A list of up to 5 interesting facts about the repository"),
});

// Initialize model
const llm = new ChatOpenAI({
  temperature: 0,
  model: "gpt-4o-mini", // or "gpt-3.5-turbo" if needed
});

// Attach structured output
const structuredModel = llm.withStructuredOutput(outputSchema);

// Main function
export async function summarizeReadme(readme) {
  try {
    const result = await structuredModel.invoke(`
You are an expert developer.

Summarize the following GitHub repository README.

Also extract up to 5 interesting facts.

README:
${readme}
`);

    return result;
  } catch (error) {
    console.error("Summarization error:", error);
    throw new Error("Failed to summarize README");
  }
}