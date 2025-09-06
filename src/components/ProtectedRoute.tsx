import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { SkeletonCard } from '@/components/ui/skeleton-layouts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'lawyer' | 'admin' | 'moderator';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // First get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAuthError('خطأ في التحقق من الجلسة');
          if (isMounted) setIsLoading(false);
          return;
        }

        if (!session?.user) {
          if (isMounted) {
            setUser(null);
            setUserRole(null);
            setIsLoading(false);
          }
          return;
        }

        // Set user first
        if (isMounted) setUser(session.user);
        
        // Only fetch role if required AND user exists
        if (requiredRole && session.user) {
          try {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .order('granted_at', { ascending: false })
              .limit(1)
              .maybeSingle(); // Use maybeSingle to handle no data gracefully

            if (roleError) {
              console.error('Role fetch error:', roleError);
              // If role fetch fails but user exists, default to 'client'
              if (isMounted) setUserRole('client');
            } else {
              if (isMounted) setUserRole(roleData?.role || 'client');
            }
          } catch (error) {
            console.error('Role query exception:', error);
            // Default to client role if role query fails
            if (isMounted) setUserRole('client');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError('حدث خطأ في التحقق من المصادقة');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          setAuthError(null);
          
          // Re-fetch role if required
          if (requiredRole) {
            try {
              const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .order('granted_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (roleError) {
                console.error('Role fetch error on auth change:', roleError);
                setUserRole('client');
              } else {
                setUserRole(roleData?.role || 'client');
              }
            } catch (error) {
              console.error('Role query exception on auth change:', error);
              setUserRole('client');
            }
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">جاري التحقق من صلاحيات الوصول...</p>
          </div>
          <SkeletonCard className="w-full" />
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center pt-6">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">خطأ في المصادقة</h2>
            <p className="text-muted-foreground mb-4">{authError}</p>
            <Button onClick={() => window.location.reload()} data-testid="auth-error-retry">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth with return URL
    const searchParams = new URLSearchParams();
    searchParams.set('redirect', location.pathname);
    return <Navigate to={`/auth?${searchParams.toString()}`} replace />;
  }

  if (requiredRole && userRole && userRole !== requiredRole && userRole !== 'admin') {
    // If user doesn't have required role (except admin who can access everything)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center pt-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">وصول غير مصرح</h2>
            <p className="text-muted-foreground mb-4">
              ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              الصلاحية المطلوبة: {requiredRole} | صلاحيتك الحالية: {userRole}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.history.back()} data-testid="access-denied-back">
                العودة
              </Button>
              <Button onClick={() => navigate('/dashboard')} data-testid="access-denied-dashboard">
                لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;