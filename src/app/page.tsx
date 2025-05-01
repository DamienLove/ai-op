import { AiInteraction } from "@/components/ai-interaction";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot } from "lucide-react";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
       <div className="w-full max-w-4xl h-[90vh] flex flex-col">
         <header className="mb-4">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
             <Bot className="text-accent h-6 w-6"/> Remote AI Assistant
            </h1>
             <p className="text-muted-foreground">Interact with an AI to control your computer.</p>
         </header>
         <AiInteraction />
       </div>
    </main>
  );
}
