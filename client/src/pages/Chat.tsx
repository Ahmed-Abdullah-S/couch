import { useEffect, useRef, useState } from "react";
import { useCoach, useChat } from "@/hooks/use-coach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: string;
  content: string;
}

export default function Chat() {
  const { coach } = useCoach();
  const { history, sendMessage } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendMessage(userMsg.content);
      setMessages(prev => [...prev, { role: "assistant", content: response.content }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-bold">{coach?.name || "Coach"}</h2>
          <p className="text-xs text-muted-foreground capitalize">{coach?.style} • {coach?.tone}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8">
              {msg.role === "assistant" ? (
                <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary"><Bot className="w-5 h-5" /></div>
              ) : (
                <div className="h-full w-full bg-secondary flex items-center justify-center"><User className="w-5 h-5" /></div>
              )}
            </Avatar>
            <div 
              className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-secondary text-foreground rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
             <Avatar className="h-8 w-8">
               <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary"><Bot className="w-5 h-5" /></div>
             </Avatar>
             <div className="bg-secondary px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
               <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
               <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
               <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-secondary/20 border-t border-border">
        <div className="flex gap-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask your coach anything..."
            className="bg-background border-border focus-visible:ring-primary"
          />
          <Button onClick={handleSend} size="icon" className="bg-primary hover:bg-primary/90 text-black">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
