import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Calendar, 
  FileText, 
  Upload, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Scale,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'client' | 'lawyer' | 'admin' | 'moderator';
  granted_by?: string;
  granted_at: string;
}

const DashboardLayout = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'الرئيسية', roles: ['client', 'lawyer', 'admin', 'moderator'] },
    { path: '/dashboard/appointments', icon: Calendar, label: 'المواعيد', roles: ['client', 'lawyer', 'admin', 'moderator'] },
    { path: '/dashboard/cases', icon: FileText, label: 'القضايا', roles: ['client', 'lawyer', 'admin', 'moderator'] },
    { path: '/dashboard/documents', icon: Upload, label: 'المستندات', roles: ['client', 'lawyer', 'admin', 'moderator'] },
    { path: '/dashboard/messages', icon: MessageSquare, label: 'الرسائل', roles: ['client', 'lawyer', 'admin', 'moderator'] },
    { path: '/dashboard/admin', icon: Settings, label: 'إدارة النظام', roles: ['admin'] },
    { path: '/dashboard/profile', icon: User, label: 'الملف الشخصي', roles: ['client', 'lawyer', 'admin', 'moderator'] }
  ];

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              setTimeout(() => {
                fetchUserData(session.user.id);
              }, 0);
            } else {
              setProfile(null);
              setUserRole(null);
            }
          }
        );

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false })
        .limit(1)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Role fetch error:', roleError);
      } else {
        setUserRole(roleData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم تسجيل الخروج",
          description: "تم تسجيل الخروج بنجاح"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive"
      });
    }
  };

  const getVisibleMenuItems = () => {
    if (!userRole) return menuItems.filter(item => item.roles.includes('client'));
    return menuItems.filter(item => item.roles.includes(userRole.role));
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'client': 'عميلة',
      'lawyer': 'محامية',
      'admin': 'مديرة',
      'moderator': 'مشرفة'
    };
    return roleNames[role as keyof typeof roleNames] || 'عميلة';
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      'client': 'secondary',
      'lawyer': 'default',
      'admin': 'destructive',
      'moderator': 'outline'
    };
    return variants[role] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile header */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary">جمعية وفاء</span>
                </div>
                <NotificationBell />
              </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed lg:relative inset-y-0 right-0 z-50 w-72 bg-card border-l border-border transform ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
                    <Scale className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-bold text-primary">جمعية وفاء</h1>
                    <p className="text-xs text-muted-foreground">لوحة التحكم</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="bg-secondary/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {profile?.full_name || 'مستخدم'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(userRole?.role || 'client')} className="text-xs">
                        {getRoleDisplayName(userRole?.role || 'client')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {getVisibleMenuItems().map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary/50 text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:mr-72">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;