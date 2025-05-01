// IMPORTANT SECURITY WARNING:
// Executing arbitrary commands received from an LLM or any external source is EXTREMELY DANGEROUS.
// This basic implementation is for demonstration purposes ONLY and is NOT SUITABLE for production
// or any environment where security is a concern.
//
// In a real application, you MUST:
// 1. Sanitize and validate ALL commands rigorously.
// 2. Implement strict allow-listing of permissible commands and arguments.
// 3. Run commands in a sandboxed environment with minimal privileges.
// 4. Add robust error handling, logging, and monitoring.
// 5. Consider alternative, safer methods for achieving the desired functionality (e.g., dedicated APIs instead of shell commands).
//
// DO NOT DEPLOY THIS CODE WITHOUT ADDRESSING THESE SECURITY RISKS.

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Executes a shell command.
 * WARNING: This is highly insecure. See security warnings above.
 * @param command The command string to execute.
 * @returns A promise resolving to the stdout of the command or rejecting with an error.
 */
export async function executeCommand(command: string): Promise<string> {
  console.warn(`[SECURITY WARNING] Executing command: "${command}". This is insecure!`);

  // Basic sanitization attempt (highly insufficient for real security)
  // This attempts to prevent basic command injection techniques but is not foolproof.
  const sanitizedCommand = command
    .replace(/;/g, '')
    .replace(/&&/g, '')
    .replace(/\|\|/g, '')
    .replace(/`/g, '')
    .replace(/\$\(/g, '')
    .trim();

  if (sanitizedCommand !== command) {
      console.error(`[SECURITY] Command modified during sanitization. Original: "${command}", Sanitized: "${sanitizedCommand}"`);
      // Decide how to handle - reject, log, etc. For now, we proceed with caution, but ideally reject.
      // throw new Error("Command potentially unsafe and was modified.");
  }

  // Add specific command blocking (Example) - Expand this list significantly!
  const blockedCommands = ['rm', 'sudo', 'mkfs', 'shutdown', 'reboot', 'chmod', 'chown', '>', '<', '|'];
  const commandParts = sanitizedCommand.split(' ');
  if (blockedCommands.some(blocked => commandParts[0].includes(blocked))) {
      console.error(`[SECURITY] Blocked potentially dangerous command: ${commandParts[0]}`);
      throw new Error(`Execution of command "${commandParts[0]}" is blocked for security reasons.`);
  }


  try {
    // Limit execution time (e.g., 10 seconds)
    const { stdout, stderr } = await execPromise(sanitizedCommand, { timeout: 10000 });

    if (stderr) {
      console.error(`Command execution stderr for "${sanitizedCommand}":\n${stderr}`);
      // Depending on the use case, stderr might be an error or just informational.
      // We'll return stdout but log stderr. Consider if stderr should cause an error.
       return `Standard Output:\n${stdout}\nStandard Error:\n${stderr}`;
    }
    console.log(`Command execution stdout for "${sanitizedCommand}":\n${stdout}`);
    return stdout;
  } catch (error: any) {
    console.error(`Error executing command "${sanitizedCommand}":`, error);
    // Provide a more informative error message back
    return `Error executing command: ${error.message}\nStderr: ${error.stderr}\nStdout: ${error.stdout}`;
   // throw new Error(`Failed to execute command: ${error.message}`); // Re-throwing might be desired
  }
}
