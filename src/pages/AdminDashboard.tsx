import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Package, BarChart3, Settings, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLostItems: 0,
    totalFoundItems: 0,
    totalMatches: 0,
  });
  //added
  const [users, setUsers] = useState<any[]>([]);
  const [lostItems, setLostItems] = useState<any[]>([]);
  const [foundItems, setFoundItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      await fetchStats();
      //added
      await fetchUsers();
      await fetchItems();
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

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [usersRes, lostRes, foundRes, matchesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('lost_items').select('id', { count: 'exact', head: true }),
        supabase.from('found_items').select('id', { count: 'exact', head: true }),
        supabase.from('item_matches').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalLostItems: lostRes.count || 0,
        totalFoundItems: foundRes.count || 0,
        totalMatches: matchesRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };
  //added
   const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('id, full_name, email, created_at');
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchItems = async () => {
  try {
    const [lostRes, foundRes] = await Promise.all([
      supabase.from('lost_items').select('*'),
      supabase.from('found_items').select('*'),
    ]);

    if (lostRes.error) {
      console.error('Lost items error:', lostRes.error);
      toast.error('Failed to fetch lost items');
    } else {
      setLostItems(lostRes.data || []);
    }

    if (foundRes.error) {
      console.error('Found items error:', foundRes.error);
      toast.error('Failed to fetch found items');
    } else {
      setFoundItems(foundRes.data || []);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    toast.error('Unexpected error fetching items');
  }
};

//added
// 🗑️ Delete Item Function
// const handleDeleteItem = async (id: string, type: 'lost' | 'found') => {
//   if (!confirm('Are you sure you want to delete this item?')) return;

//   const tableName = type === 'lost' ? 'lost_items' : 'found_items';
//   const { error } = await supabase.from(tableName).delete().eq('id', id);

//   if (error) {
//     console.error('Error deleting item:', error);
//     toast.error('Failed to delete item');
//     return;
//   }

//   toast.success('Item deleted successfully');

//   // Update local state
//   if (type === 'lost') {
//     setLostItems((prev) => prev.filter((item) => item.id !== id));
//   } else {
//     setFoundItems((prev) => prev.filter((item) => item.id !== id));
//   }

//   // Refresh stats
//   fetchStats();
// };
// ✅ Function to delete item from Supabase and UI
const handleDeleteItem = async (id: number, type: 'lost' | 'found') => {
  try {
    // Delete from the correct table
    const { error } = await supabase
      .from(type === 'lost' ? 'lost_items' : 'found_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      return;
    }

    // Remove from UI instantly
    if (type === 'lost') {
      setLostItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setFoundItems((prev) => prev.filter((item) => item.id !== id));
    }

    toast.success('Item deleted successfully');
  } catch (err) {
    console.error('Unexpected error deleting item:', err);
    toast.error('Unexpected error occurred');
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };


  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-medium">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, items, and monitor system activity</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="h-10 px-4 border-2 hover:bg-primary/5 transition-smooth">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-10 px-4 hover:bg-destructive/10 hover:text-destructive transition-smooth">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card-enhanced p-6 group hover:scale-105 transition-slow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-medium">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">Users</h3>
              <p className="text-muted-foreground text-sm">Registered users</p>
            </div>
          </div>

          <div className="card-enhanced p-6 group hover:scale-105 transition-slow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-medium">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{stats.totalLostItems}</div>
                <div className="text-sm text-muted-foreground">Reported</div>
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
                <div className="text-3xl font-bold text-foreground">{stats.totalFoundItems}</div>
                <div className="text-sm text-muted-foreground">Reported</div>
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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{stats.totalMatches}</div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">Matches</h3>
              <p className="text-muted-foreground text-sm">Items successfully matched</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="overview" className="h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-medium">
              Users
            </TabsTrigger>
            <TabsTrigger value="items" className="h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-medium">
              Items
            </TabsTrigger>
            <TabsTrigger value="reports" className="h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-medium">
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8 fade-in">
            <div className="card-enhanced p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto shadow-medium">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Welcome, Admin</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Monitor and manage the Lost & Found system. View user activity, manage reported items, and analyze system performance.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                    <h3 className="font-semibold text-foreground mb-2">Quick Actions</h3>
                    <p className="text-sm text-muted-foreground">Use the tabs above to manage users, view items, and generate reports.</p>
                  </div>
                  <div className="p-6 bg-success/5 rounded-xl border border-success/20">
                    <h3 className="font-semibold text-foreground mb-2">System Status</h3>
                    <p className="text-sm text-muted-foreground">All systems operational. {stats.totalMatches} successful matches made.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-8 fade-in">
            <div className="card-enhanced overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/20">
                <h2 className="text-xl font-bold text-foreground">Registered Users</h2>
                <p className="text-muted-foreground">Manage and view all registered users</p>
              </div>
              <div className="overflow-x-auto">
                <table className="table-enhanced">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Join Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="font-mono text-xs">{u.id.slice(0, 8)}...</td>
                        <td className="font-medium">{u.full_name || '—'}</td>
                        <td>{u.email || '—'}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="mt-8 space-y-8 fade-in">
            <div className="card-enhanced overflow-hidden">
              <div className="p-6 border-b border-border bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Lost Items</h2>
                    <p className="text-muted-foreground">Items reported as lost by users</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table-enhanced">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Date Reported</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lostItems.map((item) => (
                      <tr key={item.id}>
                        <td className="font-mono text-xs">{item.id}</td>
                        <td className="font-medium">{item.item_name}</td>
                        <td>
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td>{item.location_lost}</td>
                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id, 'lost')}
                            className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-enhanced overflow-hidden">
              <div className="p-6 border-b border-border bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Found Items</h2>
                    <p className="text-muted-foreground">Items reported as found by users</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table-enhanced">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Date Reported</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foundItems.map((item) => (
                      <tr key={item.id}>
                        <td className="font-mono text-xs">{item.id}</td>
                        <td className="font-medium">{item.item_name}</td>
                        <td>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td>{item.location_found}</td>
                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id, 'found')}
                            className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-8 fade-in">
            <div className="card-enhanced p-8">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-medium">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
                  <p className="text-muted-foreground">System statistics and performance metrics</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">System Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Total Users</span>
                      <span className="text-lg font-bold text-primary">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Total Lost Items</span>
                      <span className="text-lg font-bold text-red-600">{stats.totalLostItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Total Found Items</span>
                      <span className="text-lg font-bold text-green-600">{stats.totalFoundItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Total Matches</span>
                      <span className="text-lg font-bold text-primary">{stats.totalMatches}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Success Rate</h3>
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-primary">
                        {stats.totalLostItems > 0 ? Math.round((stats.totalMatches / stats.totalLostItems) * 100) : 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Items successfully matched</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    More detailed analytics and charts will be available soon.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
export default AdminDashboard;