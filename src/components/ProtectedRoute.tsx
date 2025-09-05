import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'lawyer' | 'admin' | 'moderator';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Fetch user role if required
          if (requiredRole) {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .order('granted_at', { ascending: false })
              .limit(1)
              .single();

            if (roleError && roleError.code !== 'PGRST116') {
              console.error('Role fetch error:', roleError);
            } else {
              setUserRole(roleData?.role || 'client');
            }
          }
        }
      } catch (error) {
        console.error('Protection check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          if (requiredRole) {
            // Re-fetch role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .order('granted_at', { ascending: false })
              .limit(1)
              .single();
            setUserRole(roleData?.role || 'client');
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من صلاحيات الوصول...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth with return URL
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    // If user doesn't have required role (except admin who can access everything)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">وصول غير مصرح</h2>
          <p className="text-muted-foreground mb-4">
            ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;