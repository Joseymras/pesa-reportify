
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Send, User, Bot, Shield } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_type: "assistant" | "user" | "admin";
  created_at: string;
  user_id: string | null;
  recipient_id: string | null;
}

type Message = {
  role: "assistant" | "user" | "admin";
  content: string;
  timestamp: Date;
  userId?: string;
};

interface ChatInterfaceProps {
  isAdmin?: boolean;
  selectedUserId?: string;
  onUserSelect?: (userId: string) => void;
}

export default function ChatInterface({ isAdmin = false, selectedUserId, onUserSelect }: ChatInterfaceProps) {
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
  const [users, setUsers] = useState<Profile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
    
    // If this is admin chat, load users
    if (isAdmin) {
      loadUsers();
    }
    
    // Load chat history
    loadChatHistory();
  }, [isAdmin, selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadChatHistory = async () => {
    if (!user && !selectedUserId) return;
    
    try {
      const userId = selectedUserId || user?.id;
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`user_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedMessages: Message[] = (data as ChatMessage[]).map(msg => ({
          role: msg.sender_type as "assistant" | "user" | "admin",
          content: msg.content,
          timestamp: new Date(msg.created_at),
          userId: msg.user_id
        }));
        
        setMessages(prevMessages => [
          prevMessages[0], // Keep the welcome message
          ...formattedMessages
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Determine message role based on who's sending
    const messageRole = isAdmin ? "admin" : "user";
    const userId = isAdmin ? selectedUserId : user?.id;

    if (isAdmin && !selectedUserId) {
      toast({
        variant: "destructive",
        title: "No user selected",
        description: "Please select a user to chat with",
      });
      return;
    }

    const userMessage = {
      role: messageRole as "user" | "admin",
      content: input,
      timestamp: new Date(),
      userId: userId
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Store message in database
      if (userId) {
        await supabase.from('chat_messages').insert({
          content: input,
          user_id: isAdmin ? null : userId,
          recipient_id: isAdmin ? selectedUserId : null,
          sender_type: messageRole
        });
      }

      // If not admin, get AI response
      if (!isAdmin) {
        const { data, error } = await supabase.functions.invoke("ai-assistant", {
          body: {
            message: input,
            name,
            email,
            messageHistory: messages,
            sendEmail: isSendingEmail,
            userId: user?.id
          },
        });

        if (error) throw error;

        const assistantMessage = {
          role: "assistant" as const,
          content: data.response,
          timestamp: new Date(),
          userId: userId
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Store AI response in database too
        if (userId) {
          await supabase.from('chat_messages').insert({
            content: data.response,
            user_id: userId,
            recipient_id: null,
            sender_type: 'assistant'
          });
        }

        if (isSendingEmail) {
          toast({
            title: "Message sent",
            description: "Your message has been sent to our team.",
          });
          setIsSendingEmail(false);
        }
      } else {
        // For admin, send notification to user
        await supabase.from('notifications').insert({
          user_id: selectedUserId,
          content: `New message from support: ${input.substring(0, 30)}${input.length > 30 ? '...' : ''}`,
          type: 'chat',
          is_read: false
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContactForm = () => {
    setIsContactVisible(!isContactVisible);
  };

  const handleUserSelect = (value: string) => {
    if (onUserSelect) {
      onUserSelect(value);
    }
  };

  return (
    <Card className="w-full h-[500px] max-w-md mx-auto flex flex-col">
      <CardContent className="flex flex-col h-full p-4">
        {isAdmin && (
          <div className="mb-4">
            <Label htmlFor="user-select">Select User</Label>
            <Select onValueChange={handleUserSelect} value={selectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "assistant" ? "justify-start" : 
                msg.role === "admin" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${
                  msg.role === "assistant" || msg.role === "admin" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <Avatar className="w-8 h-8 mt-1">
                  {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : 
                   msg.role === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    msg.role === "assistant"
                      ? "bg-muted text-foreground"
                      : msg.role === "admin"
                      ? "bg-purple-100 text-foreground"
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

        {!isAdmin && isContactVisible && (
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
              disabled={isLoading || !input.trim() || (isAdmin && !selectedUserId)} 
              className="self-end bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleContactForm}
              className="self-start text-xs"
            >
              {isContactVisible ? "Hide contact info" : "Add contact info"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
