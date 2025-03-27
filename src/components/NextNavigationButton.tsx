
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface NextNavigationButtonProps {
  to: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const NextNavigationButton = ({ 
  to, 
  label = "Next", 
  variant = "default",
  size = "sm",
  className = "",
  onClick,
  disabled = false
}: NextNavigationButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
      return;
    }
    
    if (to === "#") {
      e.preventDefault();
      navigate(1); // Go forward in history if to="#"
    }
  };
  
  return (
    <Button 
      asChild 
      variant={variant} 
      size={size} 
      className={`${className} ${variant === "default" ? "bg-green-600 hover:bg-green-700" : ""}`}
      disabled={disabled}
    >
      <Link 
        to={to} 
        className="flex items-center gap-2"
        onClick={handleClick}
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
};

export default NextNavigationButton;
