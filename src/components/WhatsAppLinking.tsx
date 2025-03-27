
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppGroup {
  id: string;
  name: string;
  active: boolean;
}

const WhatsAppLinking = () => {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([
    { id: '1', name: 'Family Contributions', active: true },
    { id: '2', name: 'Office Chama', active: false }
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  
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
    
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    toast.success("WhatsApp group added");
  };
  
  const removeGroup = (id: string) => {
    setGroups(groups.filter(group => group.id !== id));
    toast.success("WhatsApp group removed");
  };
  
  const toggleGroupActive = (id: string) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, active: !group.active } : group
    ));
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
          
          <div className="flex gap-2 mt-4">
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
