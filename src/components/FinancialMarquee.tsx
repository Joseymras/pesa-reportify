
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

type FinancialNews = {
  id: string;
  title: string;
  content: string;
  source: string | null;
  publish_date: string;
  category: string | null;
  display_on_marquee: boolean;
};

const FinancialMarquee = () => {
  const [news, setNews] = useState<FinancialNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('financial_news')
          .select('*')
          .eq('display_on_marquee', true)
          .order('publish_date', { ascending: false });
          
        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error('Error fetching financial news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // Set up a timer to refresh the news every 5 minutes
    const intervalId = setInterval(fetchNews, 300000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="bg-black/80 text-white py-2 overflow-hidden">
      <div className="animate-pulse h-6 bg-gray-700 rounded"></div>
    </div>;
  }

  if (news.length === 0) {
    return null;
  }

  // Default news items if database is empty
  const defaultNews = [
    "Safaricom M-PESA revenues grow by 20% in Q2 2023",
    "Central Bank of Kenya introduces new M-PESA transaction limits",
    "M-PESA Global expands to 3 new countries",
    "New M-PESA business features launched for SMEs",
    "M-PESA and PayPal partnership enables faster global transfers"
  ];

  const displayNews = news.length > 0 ? 
    news.map(item => `${item.category ? `[${item.category}]` : ''} ${item.title} ${item.source ? `(${item.source})` : ''}`) : 
    defaultNews;

  return (
    <div className="bg-black/80 text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...displayNews, ...displayNews].map((item, index) => (
          <div key={index} className="mx-6 flex items-center">
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialMarquee;
