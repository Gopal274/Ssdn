
'use server';

/**
 * @fileOverview An AI flow to suggest a product category based on its name.
 *
 * - suggestCategory - A function that suggests a category for a product.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestCategoryInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z
    .string()
    .describe('A single, relevant category for the product.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;


export async function suggestCategory(
  input: SuggestCategoryInput
): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}


const suggestCategoryPrompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: { schema: SuggestCategoryInputSchema },
  output: { schema: SuggestCategoryOutputSchema },
  prompt: `You are an expert in product categorization for wholesale and retail businesses. Your task is to provide a single, concise, and relevant category for the given product name.

  For example:
  - "Basmati Rice 5kg" -> "Grains"
  - "MDH Garam Masala 100g" -> "Spices"
  - "Fortune Sunflower Oil 1L" -> "Oils"
  - "Parle-G Biscuit" -> "Biscuits"

  Do not provide more than one category. Just return the single best fit.

  Product Name: {{{productName}}}`,
});


const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async (input) => {
    const { output } = await suggestCategoryPrompt(input);
    if (!output) {
      throw new Error('The AI model failed to return a valid category suggestion.');
    }
    return output;
  }
);
