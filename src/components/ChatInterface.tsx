
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Send, User, Bot } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi, I'm Lizz! I'm here to help with any questions about PesaLytics. How can I assist you today?", 
      timestamp: new Date() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          message: input,
          name,
          email,
          messageHistory: messages,
          sendEmail: isSendingEmail
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);

      if (isSendingEmail) {
        toast({
          title: "Message sent",
          description: "Your message has been sent to our team.",
        });
        setIsSendingEmail(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContactForm = () => {
    setIsContactVisible(!isContactVisible);
  };

  return (
    <Card className="w-full h-[500px] max-w-md mx-auto flex flex-col">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${
                  msg.role === "assistant" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <Avatar className="w-8 h-8 mt-1">
                  {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    msg.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.content}
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {isContactVisible && (
          <div className="mb-4 space-y-3 bg-muted p-3 rounded-md">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={isSendingEmail}
                onCheckedChange={(checked) => setIsSendingEmail(!!checked)}
              />
              <Label htmlFor="sendEmail" className="text-sm">
                Send a copy to the PesaLytics team
              </Label>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()} 
              className="self-end bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleContactForm}
            className="self-start text-xs"
          >
            {isContactVisible ? "Hide contact info" : "Add contact info"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
