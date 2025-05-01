//The ai/flows/execute-command-from-llm.ts file implements the Genkit flow for LLM-based command execution.
//It allows the LLM to analyze user requests, determine if a command needs to be executed, and then execute it securely.

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {executeCommand} from '@/services/command-executor';

const ExecuteCommandInputSchema = z.object({
  request: z.string().describe('The user request to analyze.'),
});
export type ExecuteCommandInput = z.infer<typeof ExecuteCommandInputSchema>;

const ExecuteCommandOutputSchema = z.object({
  commandExecuted: z.boolean().describe('Whether a command was executed or not.'),
  command: z.string().optional().describe('The command that was executed, if any.'),
  executionResult: z.string().optional().describe('The result of the command execution, if any.'),
  llmResponse: z.string().describe('The LLM response to the user.'),
});
export type ExecuteCommandOutput = z.infer<typeof ExecuteCommandOutputSchema>;

export async function executeCommandFromLLM(input: ExecuteCommandInput): Promise<ExecuteCommandOutput> {
  return executeCommandFlow(input);
}

const executeCommandTool = ai.defineTool({
  name: 'executeCommand',
  description: 'Executes a command on the user\u2019s computer. Only use this if the user specifically asks to perform an action on their computer.  The tool returns the STDOUT output of the command after execution.',
  inputSchema: z.object({
    command: z.string().describe('The command to execute.'),
  }),
  outputSchema: z.string(),
},
async input => {
  return executeCommand(input.command);
});

const executeCommandPrompt = ai.definePrompt({
  name: 'executeCommandPrompt',
  input: {
    schema: z.object({
      request: z.string().describe('The user request.'),
    }),
  },
  output: {
    schema: z.object({
      commandExecuted: z.boolean().describe('Whether a command was executed or not.'),
      command: z.string().optional().describe('The command that was executed, if any.'),
      executionResult: z.string().optional().describe('The result of the command execution, if any.'),
      llmResponse: z.string().describe('The LLM response to the user.'),
    }),
  },
  tools: [executeCommandTool],
  prompt: `You are an AI assistant that can execute commands on the user's computer, but ONLY if the user explicitly asks you to.  If the user asks you to do something, you MUST use the executeCommand tool. Otherwise, simply respond to the user without executing any commands.

User request: {{{request}}}

If you execute a command, include the results in your response to the user.

Output in JSON format:
`,
});

const executeCommandFlow = ai.defineFlow<
  typeof ExecuteCommandInputSchema,
  typeof ExecuteCommandOutputSchema
>({
  name: 'executeCommandFlow',
  inputSchema: ExecuteCommandInputSchema,
  outputSchema: ExecuteCommandOutputSchema,
}, async input => {
  const {output} = await executeCommandPrompt(input);

  if (output) {
    return output;
  } else {
    return {
      commandExecuted: false,
      llmResponse: 'There was an error processing your request.',
    };
  }
});
