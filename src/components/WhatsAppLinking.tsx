
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Plus, Trash2, QrCode, Upload, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WhatsAppGroup {
  id: string;
  name: string;
  active: boolean;
}

interface WhatsAppLinkingProps {
  onIntegrationChange?: (integrated: boolean) => void;
  onDirectShare?: (groupId: string, content: string) => Promise<boolean>;
}

const WhatsAppLinking = ({ onIntegrationChange, onDirectShare }: WhatsAppLinkingProps) => {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([
    { id: '1', name: 'Family Contributions', active: true },
    { id: '2', name: 'Office Chama', active: false }
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [autoShareEnabled, setAutoShareEnabled] = useState(false);
  const [shareInProgress, setShareInProgress] = useState(false);
  
  const addGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      active: false
    };
    
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    setNewGroupName('');
    toast.success("WhatsApp group added");
    
    // Notify parent component about integration status
    if (onIntegrationChange) {
      onIntegrationChange(updatedGroups.some(g => g.active));
    }
  };
  
  const removeGroup = (id: string) => {
    const updatedGroups = groups.filter(group => group.id !== id);
    setGroups(updatedGroups);
    toast.success("WhatsApp group removed");
    
    // Notify parent component about integration status
    if (onIntegrationChange) {
      onIntegrationChange(updatedGroups.some(g => g.active));
    }
  };
  
  const toggleGroupActive = (id: string) => {
    const updatedGroups = groups.map(group => 
      group.id === id ? { ...group, active: !group.active } : group
    );
    setGroups(updatedGroups);
    
    // Notify parent component about integration status
    if (onIntegrationChange) {
      onIntegrationChange(updatedGroups.some(g => g.active));
    }
  };

  const handleConnectViaQR = () => {
    setShowQRCode(!showQRCode);
  };
  
  const handleShareToGroup = async (groupId: string, content: string) => {
    if (!onDirectShare) return false;
    
    setShareInProgress(true);
    try {
      const success = await onDirectShare(groupId, content);
      if (success) {
        toast.success(`Report shared to ${groups.find(g => g.id === groupId)?.name}`);
        return true;
      } else {
        toast.error("Failed to share report");
        return false;
      }
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);
      toast.error("An error occurred while sharing the report");
      return false;
    } finally {
      setShareInProgress(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="mr-2 h-5 w-5" />
          Linked WhatsApp Groups
        </CardTitle>
        <CardDescription>
          Link your WhatsApp groups to automatically share reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 ${group.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>{group.name}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={group.active ? "default" : "outline"} 
                  size="sm"
                  onClick={() => toggleGroupActive(group.id)}
                  className={group.active ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {group.active ? "Active" : "Inactive"}
                </Button>
                {group.active && onDirectShare && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleShareToGroup(group.id, "Latest report from PesaLytics")}
                    disabled={shareInProgress}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeGroup(group.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {showQRCode && (
            <div className="mt-4 p-4 border rounded-md text-center">
              <div className="bg-slate-100 p-6 rounded-md inline-block mx-auto mb-3">
                <QrCode className="h-32 w-32 mx-auto text-slate-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Open WhatsApp on your phone, go to Settings &gt; Linked Devices, and scan this QR code
              </p>
              <Button variant="outline" size="sm" onClick={handleConnectViaQR}>
                Hide QR Code
              </Button>
            </div>
          )}
          
          <div className="flex flex-col gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={handleConnectViaQR} className="gap-2">
              <QrCode className="h-4 w-4" />
              {showQRCode ? "Hide QR Code" : "Connect via QR Code"}
            </Button>
            
            <div className="flex gap-2">
              <Input 
                placeholder="Add a new WhatsApp group" 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Button onClick={addGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Switch 
                id="auto-share" 
                checked={autoShareEnabled}
                onCheckedChange={setAutoShareEnabled}
              />
              <Label htmlFor="auto-share">Automatically share new reports</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p className="mb-2">
          Note: Adding a WhatsApp group requires QR code scanning from your phone
        </p>
        <p>
          You can link up to 5 WhatsApp groups with a Premium subscription
        </p>
      </CardFooter>
    </Card>
  );
};

export default WhatsAppLinking;
