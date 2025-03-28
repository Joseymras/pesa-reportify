
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "./ChatInterface";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export function AdminChat() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationType, setNotificationType] = useState("info");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationContent.trim() || !selectedUserId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields and select a user",
      });
      return;
    }

    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: selectedUserId,
        title: notificationTitle,
        content: notificationContent,
        type: notificationType,
        is_read: false
      });

      if (error) throw error;

      toast({
        title: "Notification sent",
        description: "Your notification has been sent to the user",
      });

      // Clear inputs
      setNotificationTitle("");
      setNotificationContent("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Communication</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">Direct Chat</TabsTrigger>
            <TabsTrigger value="notifications">Send Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <ChatInterface 
              isAdmin={true} 
              selectedUserId={selectedUserId}
              onUserSelect={setSelectedUserId}
            />
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">Select User</Label>
                <Select onValueChange={setSelectedUserId} value={selectedUserId}>
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
              
              <div>
                <Label htmlFor="notification-type">Notification Type</Label>
                <Select onValueChange={setNotificationType} value={notificationType}>
                  <SelectTrigger id="notification-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notification-title">Title</Label>
                <Input
                  id="notification-title"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Notification title"
                />
              </div>
              
              <div>
                <Label htmlFor="notification-content">Content</Label>
                <Textarea
                  id="notification-content"
                  value={notificationContent}
                  onChange={(e) => setNotificationContent(e.target.value)}
                  placeholder="Notification content"
                  rows={4}
                />
              </div>
              
              <Button onClick={handleSendNotification} className="w-full bg-green-600 hover:bg-green-700">
                Send Notification
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
