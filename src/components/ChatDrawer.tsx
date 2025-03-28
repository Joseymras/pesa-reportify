
import { useState } from "react";
import { Button } from "./ui/button";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerClose
} from "./ui/drawer";
import { MessageCircle, X } from "lucide-react";
import ChatInterface from "./ChatInterface";

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 p-0 bg-green-600 hover:bg-green-700 shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>Chat with Lizz</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <ChatInterface />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
