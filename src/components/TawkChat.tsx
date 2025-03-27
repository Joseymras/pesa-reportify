
import { useEffect } from 'react';

interface TawkChatProps {
  propertyId: string;
  widgetId: string;
}

const TawkChat = ({ propertyId, widgetId }: TawkChatProps) => {
  useEffect(() => {
    // Create script element for Tawk.to
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Inject the script into the DOM
    document.body.appendChild(script);

    // Clean up
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [propertyId, widgetId]);

  return null; // This component doesn't render anything visible
};

export default TawkChat;
