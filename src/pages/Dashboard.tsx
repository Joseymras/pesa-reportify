import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import WhatsAppLinking from "@/components/WhatsAppLinking";
import MpesaBulkImporter from "@/components/MpesaBulkImporter";
import TemplateSelector from "@/components/TemplateSelector";
import DashboardInsights from "@/components/DashboardInsights";
import ReferralDashboard from "@/components/ReferralDashboard";
import { ReportDownloader } from "@/components/ReportDownloader";
import SavedReports from "@/components/SavedReports";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CopyToClipboard from "@/components/CopyToClipboard";
import { useNavigate, Link } from "react-router-dom";
import { calculateTotal, formatCurrency } from "@/utils/calculationUtils";
import { AdminChat } from "@/components/AdminChat";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [isWhatsAppLinked, setIsWhatsAppLinked] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [mpesaData, setMpesaData] = useState([
    { name: 'Sent', value: 0 },
    { name: 'Received', value: 0 },
  ]);
  const [transactionHistory, setTransactionHistory] = useState([
    { name: 'Jan', income: 0, expense: 0 },
    { name: 'Feb', income: 0, expense: 0 },
    { name: 'Mar', income: 0, expense: 0 },
    { name: 'Apr', income: 0, expense: 0 },
    { name: 'May', income: 0, expense: 0 },
    { name: 'Jun', income: 0, expense: 0 },
  ]);
  const [showChat, setShowChat] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const user = supabase.auth.user();

  useEffect(() => {
    setIsWhatsAppLinked(true);
    setTotalIncome(50000);
    setTotalExpenses(20000);
    setNetBalance(30000);
    setMpesaData([
      { name: 'Sent', value: 20000 },
      { name: 'Received', value: 30000 },
    ]);
    setTransactionHistory([
      { name: 'Jan', income: 5000, expense: 2000 },
      { name: 'Feb', income: 6000, expense: 3000 },
      { name: 'Mar', income: 7000, expense: 1000 },
      { name: 'Apr', income: 8000, expense: 4000 },
      { name: 'May', income: 9000, expense: 2000 },
      { name: 'Jun', income: 10000, expense: 5000 },
    ]);

    // Check if current user is admin
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin', { 
          uid: user?.id 
        });
        
        if (error) throw error;
        setIsAdmin(data || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    if (user) {
      checkAdminStatus();
    }
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />

      <main className="container mx-auto px-4 py-8 flex-grow pt-24">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={() => navigate("/templates")} className="bg-green-600 hover:bg-green-700">
            Get Started with Templates
          </Button>
        </div>

        {/* Admin section */}
        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
            <AdminChat />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Total Income</CardTitle>
              <CardDescription>All income from M-Pesa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Ksh {formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>All expenses from M-Pesa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Ksh {formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Net Balance</CardTitle>
              <CardDescription>Income less expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">Ksh {formatCurrency(netBalance)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>A breakdown of income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#00C49F" />
                  <Bar dataKey="expense" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>M-Pesa Transactions</CardTitle>
              <CardDescription>Distribution of sent vs received</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mpesaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mpesaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="insights" className="mt-4">
              <DashboardInsights />
            </TabsContent>
            <TabsContent value="bulk-import" className="mt-4">
              <MpesaBulkImporter />
            </TabsContent>
            <TabsContent value="whatsapp" className="mt-4">
              <WhatsAppLinking />
            </TabsContent>
            <TabsContent value="referrals" className="mt-4">
              <ReferralDashboard />
            </TabsContent>
            <TabsContent value="reports" className="mt-4">
              <ReportDownloader type="budget" data={{}} />
              <SavedReports />
            </TabsContent>
            <TabsContent value="templates" className="mt-4">
              <TemplateSelector />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
