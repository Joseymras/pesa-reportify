
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface NextNavigationButtonProps {
  to: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const NextNavigationButton = ({ 
  to, 
  label = "Next", 
  variant = "default",
  size = "sm",
  className = "",
  onClick
}: NextNavigationButtonProps) => {
  return (
    <Button 
      asChild 
      variant={variant} 
      size={size} 
      className={`${className} ${variant === "default" ? "bg-green-600 hover:bg-green-700" : ""}`}
    >
      <Link 
        to={to} 
        className="flex items-center gap-2"
        onClick={onClick}
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
};

export default NextNavigationButton;
