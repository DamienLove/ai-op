'use server';

/**
 * @fileOverview Processes user requests related to coding tasks using an LLM to determine whether to respond directly or execute a command.
 *
 * - processUserRequest - Processes the user request and returns a response or executes a command.
 * - ProcessUserRequestInput - The input type for the processUserRequest function.
 * - ProcessUserRequestOutput - The return type for the processUserRequest function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ProcessUserRequestInputSchema = z.object({
  request: z.string().describe('The user request in natural language.'),
});
export type ProcessUserRequestInput = z.infer<typeof ProcessUserRequestInputSchema>;

const ProcessUserRequestOutputSchema = z.object({
  response: z.string().describe('The response from the LLM, either a direct answer or instructions after executing a command.'),
  commandExecuted: z.boolean().describe('Whether a command was executed or not.'),
});
export type ProcessUserRequestOutput = z.infer<typeof ProcessUserRequestOutputSchema>;

export async function processUserRequest(input: ProcessUserRequestInput): Promise<ProcessUserRequestOutput> {
  return processUserRequestFlow(input);
}

const processUserRequestPrompt = ai.definePrompt({
  name: 'processUserRequestPrompt',
  input: {
    schema: z.object({
      request: z.string().describe('The user request in natural language.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The response from the LLM, either a direct answer or instructions after executing a command.'),
      commandExecuted: z.boolean().describe('Whether a command was executed or not.'),
    }),
  },
  prompt: `You are a helpful AI assistant that can process user requests related to coding tasks.  You can either respond directly to the user, or execute a command if necessary.

  If the user's request requires executing a command, then respond with the command to execute and set commandExecuted to true. If no command needs to be executed, then respond directly to the user and set commandExecuted to false.

  User Request: {{{request}}} `,
});

const processUserRequestFlow = ai.defineFlow<
  typeof ProcessUserRequestInputSchema,
  typeof ProcessUserRequestOutputSchema
>({
  name: 'processUserRequestFlow',
  inputSchema: ProcessUserRequestInputSchema,
  outputSchema: ProcessUserRequestOutputSchema,
}, async input => {
  const {output} = await processUserRequestPrompt(input);
  return output!;
});
