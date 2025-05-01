"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Terminal, Bot, Send, AlertTriangle } from "lucide-react";
import { processUserRequest } from "@/ai/flows/process-user-request-with-llm";
import { executeCommandFromLLM } from "@/ai/flows/execute-command-from-llm";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "ai" | "command" | "result" | "error" | "info";
  content: string;
  commandExecuted?: boolean;
  command?: string;
}

export function AiInteraction() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const addMessage = (message: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: crypto.randomUUID() }]);
  };

 useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
     // Focus input after AI response
    if (!isPending && inputRef.current) {
        inputRef.current.focus();
    }
  }, [messages, isPending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userInput.trim() || isPending) return;

    const currentInput = userInput;
    setUserInput(""); // Clear input immediately

    addMessage({ type: "user", content: currentInput });

    startTransition(async () => {
      try {
        addMessage({ type: "info", content: "Processing request..." });

        // First, ask the LLM if a command needs execution (or if it can just respond)
        // Note: The provided flows seem to slightly overlap. executeCommandFromLLM appears
        // more comprehensive as it includes the tool logic. We'll primarily use that.
        // If processUserRequest was intended for a preliminary check, that logic could be added here.

        const response = await executeCommandFromLLM({ request: currentInput });

        // Remove the "Processing..." message
        setMessages(prev => prev.filter(msg => !(msg.type === 'info' && msg.content === 'Processing request...')));


        if (response.commandExecuted && response.command) {
           addMessage({
             type: "command",
             content: `Executing command: ${response.command}`,
           });
           if (response.executionResult) {
            addMessage({
                type: "result",
                content: response.executionResult,
             });
           }
        }

         addMessage({
           type: "ai",
           content: response.llmResponse,
           commandExecuted: response.commandExecuted,
           command: response.command
         });


      } catch (error: any) {
         // Remove the "Processing..." message
        setMessages(prev => prev.filter(msg => !(msg.type === 'info' && msg.content === 'Processing request...')));

        console.error("AI Interaction Error:", error);
        const errorMessage = error.message || "An unexpected error occurred.";
        addMessage({ type: "error", content: `Error: ${errorMessage}` });
        toast({
          variant: "destructive",
          title: "AI Error",
          description: errorMessage,
        });
      }
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const renderMessageContent = (content: string) => {
    // Basic rendering, can be enhanced for markdown, code blocks etc.
     // Basic check for code block fences
    if (content.startsWith('```') && content.endsWith('```')) {
        const code = content.substring(3, content.length - 3).trim();
         // Attempt to detect language (simple check)
        const firstLine = code.split('\n')[0];
        let language = '';
        if (firstLine.match(/^(bash|sh|zsh|javascript|python|typescript|html|css|json|yaml)/)) {
            language = firstLine;
             return <pre><code className={`language-${language}`}>{code.substring(firstLine.length).trim()}</code></pre>;
        }
        return <pre><code>{code}</code></pre>;
    }
    // Render newlines
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };


  return (
    <div className="flex flex-col h-full bg-secondary p-4 gap-4">
      <Card className="flex-1 flex flex-col overflow-hidden border border-border shadow-md rounded-lg">
         <CardHeader className="bg-card border-b border-border p-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant Output
          </CardTitle>
          <CardDescription>Responses and command execution logs</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
           <ScrollArea className="h-full" ref={scrollAreaRef}>
             <div className="p-4 space-y-4">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                   {msg.type !== 'user' && (
                     <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground ${
                        msg.type === 'ai' ? 'bg-primary text-primary-foreground' :
                        msg.type === 'command' ? 'bg-accent text-accent-foreground' :
                        msg.type === 'result' ? 'bg-secondary text-secondary-foreground border border-border' :
                        msg.type === 'error' ? 'bg-destructive text-destructive-foreground' :
                         'bg-muted text-muted-foreground' // info
                       }`}>
                        {msg.type === 'ai' ? <Bot size={18} /> :
                         msg.type === 'command' || msg.type === 'result' ? <Terminal size={18} /> :
                         msg.type === 'error' ? <AlertTriangle size={18} /> :
                         <Loader2 size={18} className="animate-spin"/> /* info */
                         }

                     </span>
                    )}
                    <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        msg.type === 'user' ? 'bg-primary text-primary-foreground' :
                        msg.type === 'ai' ? 'bg-card text-card-foreground shadow-sm' :
                        msg.type === 'command' ? 'bg-accent/10 text-accent-foreground font-mono text-sm border border-accent/30' :
                         msg.type === 'result' ? 'bg-card text-card-foreground font-mono text-sm border border-border' :
                        msg.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/30' :
                         'bg-muted text-muted-foreground text-sm italic' // info
                        }`}>
                         {msg.type === 'command' || msg.type === 'result' || msg.type === 'error'
                           ? <pre className="whitespace-pre-wrap break-words bg-transparent p-0 text-inherit"><code>{renderMessageContent(msg.content)}</code></pre>
                           : renderMessageContent(msg.content)}
                     </div>
                     {msg.type === 'user' && (
                        <span className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-accent text-accent-foreground">
                            👤
                        </span>
                    )}
                </div>
                ))}
                {isPending && messages[messages.length -1]?.type !== 'info' && (
                 <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                       <Loader2 size={18} className="animate-spin"/>
                     </span>
                    <div className="max-w-[75%] rounded-lg px-4 py-2 bg-muted text-muted-foreground text-sm italic">
                        Thinking...
                    </div>
                 </div>
                )}
             </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter your command or request..."
          value={userInput}
          onChange={handleInputChange}
          disabled={isPending}
          className="flex-1 focus-visible:ring-accent" // Use accent for focus
        />
        <Button
          type="submit"
          disabled={isPending || !userInput.trim()}
          className="bg-accent hover:bg-accent/90 text-accent-foreground" // Use accent color
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="ml-2">Send</span>
        </Button>
      </form>
       <div className="text-xs text-muted-foreground text-center mt-2">
        <AlertTriangle className="inline h-3 w-3 mr-1" />
        Warning: Executing AI-generated commands can be risky. Review commands before execution if possible. This tool is for demonstration purposes.
      </div>
    </div>
  );
}
