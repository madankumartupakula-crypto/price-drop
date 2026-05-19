'use server';
/**
 * @fileOverview A predictive purchase recommendation AI agent.
 *
 * - predictiveBuyRecommendation - A function that provides an AI-driven recommendation on whether to purchase immediately or wait for a potential future price drop.
 * - PredictiveBuyRecommendationInput - The input type for the predictiveBuyRecommendation function.
 * - PredictiveBuyRecommendationOutput - The return type for the predictiveBuyRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictiveBuyRecommendationInputSchema = z.object({
  productId: z.string().describe('The unique identifier of the product.'),
  currentPrice: z.number().describe('The current price of the product.'),
  priceHistory: z
    .array(
      z.object({
        date: z.string().describe('The date of the price recording (ISO 8601 format).'),
        price: z.number().describe('The price at that specific date.'),
      })
    )
    .describe('A historical list of prices for the product.'),
});
export type PredictiveBuyRecommendationInput = z.infer<
  typeof PredictiveBuyRecommendationInputSchema
>;

const PredictiveBuyRecommendationOutputSchema = z.object({
  recommendation: z
    .enum(['buy_now', 'wait'])
    .describe('The AI recommendation: either to purchase immediately or wait for a price drop.'),
  reason: z
    .string()
    .describe(
      'A detailed explanation for the recommendation, analyzing the price history and current trends.'
    ),
});
export type PredictiveBuyRecommendationOutput = z.infer<
  typeof PredictiveBuyRecommendationOutputSchema
>;

export async function predictiveBuyRecommendation(
  input: PredictiveBuyRecommendationInput
): Promise<PredictiveBuyRecommendationOutput> {
  return predictiveBuyRecommendationFlow(input);
}

const predictiveBuyRecommendationPrompt = ai.definePrompt({
  name: 'predictiveBuyRecommendationPrompt',
  input: { schema: PredictiveBuyRecommendationInputSchema },
  output: { schema: PredictiveBuyRecommendationOutputSchema },
  prompt: `You are an expert e-commerce financial analyst specializing in predicting product price movements.
Your goal is to analyze the provided product price history and current price to give a recommendation on whether the user should 'buy_now' or 'wait' for a potential price drop.

Analyze the following data for Product ID: {{{productId}}}

Current Price: ${{{currentPrice}}}

Price History:
{{#each priceHistory}}
- Date: {{{this.date}}}, Price: ${{{this.price}}}
{{/each}}

Consider factors such as:
- Recent price trends (upward, downward, stable).
- Historical lows and highs.
- Volatility of the price.
- Any clear patterns or cycles.

Based on your analysis, provide a recommendation and a clear, concise reason.
`,
});

const predictiveBuyRecommendationFlow = ai.defineFlow(
  {
    name: 'predictiveBuyRecommendationFlow',
    inputSchema: PredictiveBuyRecommendationInputSchema,
    outputSchema: PredictiveBuyRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await predictiveBuyRecommendationPrompt(input);
    if (!output) {
      throw new Error('No output received from the recommendation prompt.');
    }
    return output;
  }
);
