
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign, LineChart, TrendingUp, Zap } from "lucide-react";

const DashboardInsights = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-yellow-500" />
          Insights & Growth Tips
        </CardTitle>
        <CardDescription>
          Personalized tips to help you get more value from PesaLytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">Track Regular Contributions</h4>
              <p className="text-sm text-muted-foreground">
                Users who track weekly contributions see 40% better group savings compliance. Try setting up a weekly report schedule.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <LineChart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Analyze Contribution Patterns</h4>
              <p className="text-sm text-muted-foreground">
                From your transaction history, we notice most contributions come in during weekends. Consider setting reminders on Fridays.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
              <BadgeDollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium">Upgrade to Unlock More Features</h4>
              <p className="text-sm text-muted-foreground">
                Premium users save an average of 3 hours per week managing their chamas. Explore our pricing plans to upgrade your experience.
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-amber-50 p-4">
          <h4 className="font-medium text-amber-800">Did you know?</h4>
          <p className="mt-1 text-sm text-amber-700">
            You can connect WhatsApp groups to automatically share your reports with members. This saves time and improves transparency in your chama.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardInsights;
