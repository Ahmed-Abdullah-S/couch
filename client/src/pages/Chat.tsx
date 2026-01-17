import { useEffect, useRef, useState } from "react";
import { useCoach, useChat } from "@/hooks/use-coach";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Send, Bot, User, Plus, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

interface Message {
  role: string;
  content: string;
  id?: string;
}

export default function Chat() {
  const { t, dir, language } = useLanguage();
  const { coach } = useCoach();
  const [currentThreadId, setCurrentThreadId] = useState<number | null>(null);
  const { threads, messages, createThread } = useChat(currentThreadId || undefined);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize first thread if exists
  useEffect(() => {
    if (threads && threads.length > 0 && !currentThreadId) {
      setCurrentThreadId(threads[0].id);
    }
  }, [threads, currentThreadId]);

  // Load messages when thread changes
  useEffect(() => {
    if (messages) {
      setLocalMessages(messages.map((m, i) => ({ ...m, id: `msg-${i}-${Date.now()}` })));
    }
  }, [messages]);

  // Smooth auto-scroll with animation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [localMessages, isTyping]);

  const handleCreateThread = async () => {
    try {
      const newThread = await createThread("New Chat");
      setCurrentThreadId(newThread.id);
      setLocalMessages([]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create thread", variant: "destructive" });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    if (!currentThreadId) {
      toast({ title: "No Thread", description: "Create a thread first", variant: "destructive" });
      return;
    }
    
    const messageText = input.trim();
    const userMsg: Message = { 
      role: "user", 
      content: messageText,
      id: `user-${Date.now()}`
    };
    
    // Add user message with animation
    setLocalMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setIsTyping(true);
    
    // Focus input after send
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const response = await fetch(api.chat.stream.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          threadId: currentThreadId, 
          message: messageText,
          language: language
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let isFirstChunk = true;

      // Add placeholder assistant message
      const assistantMsgId = `assistant-${Date.now()}`;
      setLocalMessages(prev => [...prev, { role: "assistant", content: "", id: assistantMsgId }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                setIsTyping(false);
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  if (isFirstChunk) {
                    setIsTyping(false);
                    isFirstChunk = false;
                  }
                  assistantMessage += parsed.content;
                  setLocalMessages(prev => {
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg && lastMsg.role === "assistant" && lastMsg.id === assistantMsgId) {
                      updated[updated.length - 1] = { ...lastMsg, content: assistantMessage };
                    }
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      // Remove failed assistant message
      setLocalMessages(prev => prev.filter(m => m.id !== assistantMsgId));
    } finally {
      setIsStreaming(false);
      setIsTyping(false);
    }
  };

  return (
    <div dir={dir} className="h-[calc(100vh-8rem)] flex flex-col bg-background border border-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Header - Instagram Style */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center border-2 border-primary/50 shadow-lg"
          >
            <Bot className="h-5 w-5 text-black" />
          </motion.div>
          <div>
            <h2 className="font-bold text-base">{coach?.name || "Coach"}</h2>
            <div className="flex items-center gap-2">
              {isTyping ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-primary font-medium"
                >
                  {language === 'ar' ? 'يكتب...' : 'typing...'}
                </motion.p>
              ) : (
                <p className="text-xs text-muted-foreground capitalize">{coach?.style} • {coach?.tone}</p>
              )}
            </div>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleCreateThread} variant="ghost" size="sm" className="rounded-full">
            <Plus className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Messages Container - Instagram Style */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
        dir="ltr"
      >
        {!currentThreadId && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center h-full text-muted-foreground"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              </motion.div>
              <p className="text-lg">{t.chat.startConversation}</p>
            </div>
          </motion.div>
        )}
        
        <AnimatePresence>
          {localMessages.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isLastMessage = idx === localMessages.length - 1;
            
            // Layout: user messages on right, assistant on left (same for LTR/RTL)
            // User messages: avatar on right, bubble on left
            // Assistant messages: avatar on left, bubble on right
            
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ 
                  opacity: 0, 
                  y: 20,
                  scale: 0.95
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: 1
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.95,
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: isLastMessage ? 0 : 0
                }}
                className={`flex items-end gap-2 ${
                  isUser 
                    ? "ml-auto" 
                    : "mr-auto"
                }`}
                style={{
                  maxWidth: '85%',
                  width: 'fit-content'
                }}
              >
                {/* Avatar - Only show for assistant (on left) */}
                {!isUser && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    </Avatar>
                  </motion.div>
                )}

                {/* Message Bubble - Instagram Style */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 25
                  }}
                  className={`relative max-w-[75%] md:max-w-[60%] ${
                    isUser 
                      ? "bg-primary text-black" 
                      : "bg-secondary text-foreground"
                  } rounded-2xl px-4 py-2.5 shadow-lg`}
                  dir={dir}
                >
                  {/* Message Content */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-start">
                    {msg.content || ""}
                  </p>
                </motion.div>

                {/* User Avatar - Only show for user messages (on right) */}
                {isUser && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/30">
                      <div className="h-full w-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                        <User className="w-4 h-4 text-black" />
                      </div>
                    </Avatar>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator - Instagram Style */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-2 mr-auto"
            style={{
              maxWidth: '85%',
              width: 'fit-content'
            }}
          >
            <Avatar className="h-8 w-8 border-2 border-primary/20 flex-shrink-0">
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            </Avatar>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-secondary rounded-2xl px-4 py-3 shadow-lg"
            >
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Input Area - Instagram Style */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 bg-card/50 backdrop-blur-sm border-t border-border"
        dir={dir}
      >
        <div className={`flex items-end gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <motion.div 
            className="flex-1 relative"
            whileFocus={{ scale: 1.02 }}
          >
            <Input 
              ref={inputRef}
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t.chat.placeholder}
              className={`bg-background border-border focus-visible:ring-2 focus-visible:ring-primary rounded-full px-4 py-6 text-sm ${
                dir === 'rtl' ? 'pl-12' : 'pr-12'
              }`}
              dir={dir}
              disabled={!currentThreadId || isStreaming}
            />
            {input.trim() && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
              >
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            )}
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!currentThreadId || isStreaming || !input.trim()}
            >
              {isStreaming ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Send className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className={`w-5 h-5 ${dir === 'rtl' ? 'scale-x-[-1]' : ''}`} />
              )}
            </Button>
          </motion.div>
        </div>
        
        {/* Character count or status */}
        {input.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mt-2 text-center"
          >
            {input.length} {language === 'ar' ? 'حرف' : 'characters'}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
