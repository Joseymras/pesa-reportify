
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface BackNavigationButtonProps {
  to: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const BackNavigationButton = ({ 
  to, 
  label = "Back", 
  variant = "outline",
  size = "sm",
  className = "",
  onClick
}: BackNavigationButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
    
    if (to === "#") {
      e.preventDefault();
      navigate(-1); // Go back in history if to="#"
    }
  };
  
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link 
        to={to} 
        className="flex items-center gap-2"
        onClick={handleClick}
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
};

export default BackNavigationButton;
