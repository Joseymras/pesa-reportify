import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Plus, Users, Target, CalendarDays } from "lucide-react";
import { formatCurrency } from "@/utils/calculationUtils";
import { trackEvent } from "@/lib/analytics";
import { getMyPlan, PlanInfo } from "@/lib/entitlements";

export const GROUP_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "chama", label: "Chama / Investment Group" },
  { value: "medical", label: "Medical Fundraiser" },
  { value: "harambee", label: "Harambee" },
  { value: "church", label: "Church / Tithes" },
  { value: "school_fees", label: "School Fees" },
  { value: "family", label: "Family" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
] as const;

type GroupRow = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  target_amount: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
  collected?: number;
  contributorCount?: number;
};

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [plan, setPlan] = useState<PlanInfo | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("other");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const loadGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all(
        (data || []).map(async (g) => {
          const { data: txs } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("group_id", g.id)
            .in("type", ["received", "deposit"]);
          const { count } = await supabase
            .from("contributors")
            .select("id", { count: "exact", head: true })
            .eq("group_id", g.id);
          return {
            ...g,
            collected: (txs || []).reduce((s, t) => s + Number(t.amount), 0),
            contributorCount: count || 0,
          };
        })
      );
      setGroups(enriched);
    } catch (e) {
      console.error(e);
      toast.error("Could not load your groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    getMyPlan(user?.id).then(setPlan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCreate = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Give your group a name");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert({
          user_id: user.id,
          name: name.trim(),
          type,
          description: description.trim() || null,
          target_amount: target ? parseFloat(target) : null,
          deadline: deadline || null,
        })
        .select()
        .single();
      if (error) throw error;
      trackEvent("group_created", user.id, { type });
      toast.success("Group created!");
      setDialogOpen(false);
      setName(""); setDescription(""); setTarget(""); setDeadline(""); setType("other");
      navigate(`/groups/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Could not create group");
    } finally {
      setCreating(false);
    }
  };

  const atLimit = plan?.maxGroups != null && groups.length >= plan.maxGroups;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      <main className="container mx-auto px-4 py-8 flex-grow pt-24">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Contribution Groups</h1>
            <p className="text-muted-foreground">
              Track contributions for weddings, chamas, harambees and more.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" disabled={atLimit}>
                <Plus className="mr-2 h-4 w-4" /> New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a contribution group</DialogTitle>
                <DialogDescription>
                  A group collects M-PESA contributions towards a shared goal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="gname">Group name</Label>
                  <Input id="gname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wanjiku & Kamau Wedding" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GROUP_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gtarget">Target (Ksh, optional)</Label>
                    <Input id="gtarget" type="number" min="0" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100000" />
                  </div>
                  <div>
                    <Label htmlFor="gdeadline">Deadline (optional)</Label>
                    <Input id="gdeadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gdesc">Description (optional)</Label>
                  <Textarea id="gdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this group raising funds for?" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating} className="bg-green-600 hover:bg-green-700">
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {atLimit && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            You've reached the {plan?.name} plan limit of {plan?.maxGroups} groups.{" "}
            <Link to="/pricing" className="font-semibold underline">Upgrade</Link> to create unlimited groups.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No groups yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first contribution group, paste your M-PESA messages,
                and get a beautiful report to share on WhatsApp.
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create your first group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((g) => {
              const pct = g.target_amount ? Math.min(100, ((g.collected || 0) / g.target_amount) * 100) : null;
              return (
                <Link key={g.id} to={`/groups/${g.id}`}>
                  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{g.name}</CardTitle>
                        <Badge variant="secondary" className="capitalize shrink-0">
                          {GROUP_TYPES.find((t) => t.value === g.type)?.label || g.type}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{g.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{g.contributorCount} contributor{g.contributorCount === 1 ? "" : "s"}</span>
                      </div>
                      {g.target_amount ? (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              Ksh {formatCurrency(g.collected || 0)} of {formatCurrency(g.target_amount)}
                            </span>
                            <span className="font-medium">{pct?.toFixed(0)}%</span>
                          </div>
                          <Progress value={pct || 0} className="h-2" />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Collected: Ksh {formatCurrency(g.collected || 0)}
                        </p>
                      )}
                      {g.deadline && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>Due {new Date(g.deadline).toLocaleDateString("en-KE")}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Groups;
