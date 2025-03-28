
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Users, RefreshCw, CheckCircle, Copy as CopyIcon } from "lucide-react";
import { fetchUserReferral, fetchReferredUsers, fetchReferralRewards, Referral, ReferredUser, ReferralReward } from "@/services/referralService";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/calculationUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CopyToClipboard from "@/components/CopyToClipboard";

const ReferralDashboard = () => {
  const [referral, setReferral] = useState<Referral | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReferralData = async () => {
    setIsLoading(true);
    const [referralData, referredUsersData, rewardsData] = await Promise.all([
      fetchUserReferral(),
      fetchReferredUsers(),
      fetchReferralRewards()
    ]);
    
    setReferral(referralData);
    setReferredUsers(referredUsersData);
    setRewards(rewardsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReferralData();
  }, []);

  const referralUrl = referral ? 
    `${window.location.origin}/signup?ref=${referral.referral_code}` : 
    '';

  const totalPendingRewards = rewards
    .filter(r => r.status === "pending")
    .reduce((sum, reward) => sum + reward.amount, 0);

  const totalPaidRewards = rewards
    .filter(r => r.status === "paid")
    .reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">My Referral Link</CardTitle>
          <CardDescription>
            Share your referral link and earn rewards when people sign up and subscribe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-10 rounded bg-gray-100 animate-pulse"></div>
          ) : referral ? (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                  value={referralUrl}
                  readOnly
                />
                <CopyToClipboard
                  text={referralUrl}
                  variant="ghost"
                  size="sm"
                  successMessage="Referral link copied to clipboard!"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Link Clicks</p>
                  <p className="text-2xl font-bold">{referral.clicks}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Signups</p>
                  <p className="text-2xl font-bold">{referral.signups}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="flex-1 gap-2" variant="outline" size="sm">
                  <Share2 className="h-4 w-4" /> Share on WhatsApp
                </Button>
                <Button className="flex-1 gap-2" variant="outline" size="sm">
                  <Share2 className="h-4 w-4" /> Share on Twitter
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No referral link available</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Referred Users</CardTitle>
            <CardDescription>
              People who signed up using your referral link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 rounded bg-gray-100 animate-pulse"></div>
            ) : referredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        {user.converted_to_paid ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                          </span>
                        ) : (
                          <span className="text-gray-500">Free tier</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p>No referred users yet</p>
                <p className="text-sm">Share your referral link to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Earnings</CardTitle>
            <CardDescription>
              Rewards earned from your referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 rounded bg-gray-100 animate-pulse"></div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500 mb-1">Pending</p>
                    <p className="text-2xl font-bold">
                      Ksh {formatCurrency(totalPendingRewards)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500 mb-1">Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      Ksh {formatCurrency(totalPaidRewards)}
                    </p>
                  </div>
                </div>

                {rewards.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewards.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>
                            {new Date(reward.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            Ksh {formatCurrency(reward.amount)}
                          </TableCell>
                          <TableCell>
                            <span className={`text-${reward.status === 'paid' ? 'green' : reward.status === 'cancelled' ? 'red' : 'orange'}-600`}>
                              {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No earnings yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={loadReferralData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ReferralDashboard;
