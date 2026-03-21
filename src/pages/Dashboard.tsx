import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      await fetchUserData(session.user.id);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      // const [lostRes, foundRes, matchesRes] = await Promise.all([
      //   supabase.from('lost_items').select('*').eq('user_id', userId),
      //   supabase.from('found_items').select('*').eq('user_id', userId),
      //   supabase
      //     .from('item_matches')
      //     .select(`
      //       *,
      //       lost_items(*),
      //       found_items(*)
      //     `)
      //     .or(`lost_items.user_id.eq.${userId},found_items.user_id.eq.${userId}`)
      // ]);
      const [lostRes, foundRes, matchesRes] = await Promise.all([
        supabase.from('lost_items').select('*').order('created_at', { ascending: false }),
        supabase.from('found_items').select('*').order('created_at', { ascending: false }),
        supabase
          .from('item_matches')
          .select(`
            *,
            lost_items(*),
            found_items(*)
          `)
          .order('created_at', { ascending: false })
      ]);
      if (lostRes.data) setLostItems(lostRes.data);
      if (foundRes.data) setFoundItems(foundRes.data);
      if (matchesRes.data) setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load your data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };
//   <Button size="sm" onClick={() => navigate(`/item_matches/${match.id}`)}>
//   View Details
// </Button>


  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-medium">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your items.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/report-lost">
                <Button variant="outline" size="sm" className="h-10 px-4 border-2 hover:bg-primary/5 transition-smooth">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Lost
                </Button>
              </Link>
              <Link to="/report-found">
                <Button variant="outline" size="sm" className="h-10 px-4 border-2 hover:bg-primary/5 transition-smooth">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Found
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-10 px-4 hover:bg-destructive/10 hover:text-destructive transition-smooth">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-enhanced p-6 group hover:scale-105 transition-slow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-medium">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{lostItems.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">Lost Items</h3>
              <p className="text-muted-foreground text-sm">Items reported as lost</p>
            </div>
          </div>

          <div className="card-enhanced p-6 group hover:scale-105 transition-slow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-medium">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{foundItems.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">Found Items</h3>
              <p className="text-muted-foreground text-sm">Items reported as found</p>
            </div>
          </div>

          <div className="card-enhanced p-6 group hover:scale-105 transition-slow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{matches.length}</div>
                <div className="text-sm text-muted-foreground">Found</div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">Matches</h3>
              <p className="text-muted-foreground text-sm">Potential matches found</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="lost" className="h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-medium">
              Lost Items
            </TabsTrigger>
            <TabsTrigger value="found" className="h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-medium">
              Found Items
            </TabsTrigger>
            <TabsTrigger value="matches" className="h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-medium">
              Matches
            </TabsTrigger>
          </TabsList>

          {/* ✅ LOST ITEMS TAB */}
          <TabsContent value="lost" className="mt-8 fade-in">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your lost items...</p>
              </div>
            ) : lostItems.length === 0 ? (
              <div className="card-enhanced p-16 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No lost items yet</h3>
                <p className="text-muted-foreground mb-6">Start by reporting an item you've lost</p>
                <Link to="/report-lost">
                  <Button className="btn-gradient">Report Lost Item</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostItems.map((item: any) => (
                  <div key={item.id} className="card-enhanced overflow-hidden group hover:scale-105 transition-slow">
                    {item.image_url && (
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-slow"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">{item.item_name}</h3>
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                          </svg>
                          Lost on: {new Date(item.date_lost).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location_lost}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ✅ FOUND ITEMS TAB */}
          <TabsContent value="found" className="mt-8 fade-in">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading found items...</p>
              </div>
            ) : foundItems.length === 0 ? (
              <div className="card-enhanced p-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No found items yet</h3>
                <p className="text-muted-foreground mb-6">Help others by reporting items you've found</p>
                <Link to="/report-found">
                  <Button className="btn-gradient">Report Found Item</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundItems.map((item: any) => (
                  <div key={item.id} className="card-enhanced overflow-hidden group hover:scale-105 transition-slow">
                    {item.image_url && (
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-slow"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">{item.item_name}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Found on: {new Date(item.date_found).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location_found}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ✅ MATCHES TAB */}
          <TabsContent value="matches" className="mt-8 fade-in">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="card-enhanced p-16 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No matches found yet</h3>
                <p className="text-muted-foreground">Matches will appear here when lost and found items are similar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((match: any) => (
                  <div key={match.id} className="card-enhanced p-8 hover:scale-[1.02] transition-slow">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Potential Match Found</h3>
                          <p className="text-sm text-muted-foreground">Match Score: {match.similarity_score}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/match/${match.id}`)}
                        className="btn-gradient"
                      >
                        View Details
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <Search className="w-3 h-3 text-red-500" />
                          </div>
                          <h4 className="font-semibold text-foreground">Lost Item</h4>
                        </div>
                        <div className="pl-8 space-y-2">
                          <p className="font-medium">{match.lost_items?.item_name}</p>
                          <p className="text-sm text-muted-foreground">{match.lost_items?.category}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{match.lost_items?.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="w-3 h-3 text-green-500" />
                          </div>
                          <h4 className="font-semibold text-foreground">Found Item</h4>
                        </div>
                        <div className="pl-8 space-y-2">
                          <p className="font-medium">{match.found_items?.item_name}</p>
                          <p className="text-sm text-muted-foreground">{match.found_items?.category}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{match.found_items?.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
