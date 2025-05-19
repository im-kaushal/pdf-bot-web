// 'use server';

/**
 * @fileOverview PDF querying AI agent.
 *
 * - pdfQuery - A function that handles the PDF querying process.
 * - PdfQueryInput - The input type for the pdfQuery function.
 * - PdfQueryOutput - The return type for the pdfQuery function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PdfQueryInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z.string().describe('The question to ask about the PDF document.'),
});
export type PdfQueryInput = z.infer<typeof PdfQueryInputSchema>;

const PdfQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the PDF document.'),
});
export type PdfQueryOutput = z.infer<typeof PdfQueryOutputSchema>;

export async function pdfQuery(input: PdfQueryInput): Promise<PdfQueryOutput> {
  return pdfQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pdfQueryPrompt',
  input: {schema: PdfQueryInputSchema},
  output: {schema: PdfQueryOutputSchema},
  prompt: `You are an AI assistant that answers questions about PDF documents.

  You will be given a PDF document and a question. You will answer the question based on the content of the PDF document.

  PDF Document: {{media url=pdfDataUri}}
  Question: {{{question}}}
  Answer: `,
});

const pdfQueryFlow = ai.defineFlow(
  {
    name: 'pdfQueryFlow',
    inputSchema: PdfQueryInputSchema,
    outputSchema: PdfQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
