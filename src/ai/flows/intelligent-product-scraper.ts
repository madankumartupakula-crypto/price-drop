'use server';
/**
 * @fileOverview This file implements the Genkit flow for the Intelligent Product Scraper.
 * It automatically identifies and extracts product details (name, image, current price, variants)
 * from a given e-commerce product URL using an LLM.
 *
 * - extractProductDetails - The main function to trigger the product details extraction.
 * - ExtractProductDetailsInput - The input type for the extractProductDetails function.
 * - ExtractProductDetailsOutput - The return type for the extractProductDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Input Schema: Defines the expected input for the flow.
const ExtractProductDetailsInputSchema = z.object({
  url: z.string().url().describe('The URL of the e-commerce product page.'),
});
export type ExtractProductDetailsInput = z.infer<typeof ExtractProductDetailsInputSchema>;

// 2. Output Schema: Defines the expected output from the flow.
const ExtractProductDetailsOutputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  imageUrl: z.string().url().optional().describe('The URL of the primary product image, if found.'),
  currentPrice: z.number().describe('The current numerical price of the product.'),
  variants: z.array(z.object({
    name: z.string().describe('The name of the product variant (e.g., "Red", "Large").'),
    price: z.number().describe('The numerical price of this specific variant.'),
  })).optional().describe('An array of available product variants, each with a name and price.'),
});
export type ExtractProductDetailsOutput = z.infer<typeof ExtractProductDetailsOutputSchema>;

// Internal Prompt Input Schema: What the prompt function expects.
// This includes the HTML content fetched by the flow.
const ProductDetailsPromptInputSchema = z.object({
  htmlContent: z.string().describe('The raw HTML content of the product page.'),
});

// 3. Genkit Prompt Definition
const extractProductDetailsPrompt = ai.definePrompt({
  name: 'extractProductDetailsPrompt',
  input: { schema: ProductDetailsPromptInputSchema },
  output: { schema: ExtractProductDetailsOutputSchema },
  prompt: `You are an intelligent AI assistant specialized in extracting structured product information from raw HTML content of e-commerce web pages. Your goal is to parse the provided HTML and return specific product details in a strict JSON format.

Carefully analyze the provided HTML content to identify the following details for the main product on the page:
1.  **Product Name**: The main name or title of the product.
2.  **Image URL**: The URL of the primary product image. If multiple images exist, pick the most prominent or main one. Ensure it's a direct URL to an image file. If no clear image is found, omit this field.
3.  **Current Price**: The current selling price of the product. Extract it as a numerical value. Remove any currency symbols (e.g., $, €, £) and thousands separators (e.g., commas, periods if not decimal points). Ensure the decimal part is correctly handled. For example, "$1,234.56" should become 1234.56.
4.  **Variants**: A list of available product variants (e.g., different sizes, colors, models) along with their respective names and prices. Each variant should have a 'name' (string) and a 'price' (number). If no variants are explicitly listed or detectable, omit this field. Extract variant prices as numerical values in the same way as the current price.

If a piece of information cannot be found or is not applicable, omit that specific field from the JSON output. Do not make up data. If a field is an array, return an empty array if no items are found for it, otherwise omit it if it's optional.

**HTML Content to Analyze:**
{{{htmlContent}}}

Provide your answer strictly in the following JSON format. Ensure the JSON is well-formed and directly parsable:
\`\`\`json
{{jsonSchema ExtractProductDetailsOutputSchema}}
\`\`\`
`,
});

// 4. Genkit Flow Definition
const extractProductDetailsFlow = ai.defineFlow(
  {
    name: 'extractProductDetailsFlow',
    inputSchema: ExtractProductDetailsInputSchema,
    outputSchema: ExtractProductDetailsOutputSchema,
  },
  async (input) => {
    // Fetch the HTML content from the provided URL
    const response = await fetch(input.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${input.url}, Status: ${response.status}`);
    }

    const htmlContent = await response.text();

    // Call the prompt with the fetched HTML content
    const { output } = await extractProductDetailsPrompt({ htmlContent });

    if (!output) {
      throw new Error('LLM did not return a valid output for product details.');
    }

    return output;
  }
);

// 5. Exported Wrapper Function
export async function extractProductDetails(input: ExtractProductDetailsInput): Promise<ExtractProductDetailsOutput> {
  return extractProductDetailsFlow(input);
}
