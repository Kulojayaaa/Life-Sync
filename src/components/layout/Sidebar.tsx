import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Banknote,
  BarChart3,
  Bell,
  Calendar,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Flag,
  IndianRupee,
  Key,
  Landmark,
  ListTodo,
  LogOut,
  MoreHorizontal,
  Package,
  PiggyBank,
  Receipt,
  Settings,
  Shield,
  Target,
  Utensils,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { resolveSupabaseAssetUrl, supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tables } from '@/integrations/supabase/types';
import { LifeSyncLogo } from '@/components/branding/LifeSyncLogo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navGroups = [
  {
    label: 'Today',
    path: '/',
    icon: CalendarRange,
    items: [{ icon: Utensils, label: 'Daily Check-in', path: '/' }],
  },
  {
    label: 'Money',
    path: '/money',
    icon: Wallet,
    items: [
      { icon: Receipt, label: 'Transactions', path: '/expenses' },
      { icon: Banknote, label: 'Accounts', path: '/accounts' },
      { icon: PiggyBank, label: 'Budgets', path: '/budgets' },
      { icon: Target, label: 'Savings', path: '/savings' },
      { icon: IndianRupee, label: 'Bills', path: '/bills' },
      { icon: CreditCard, label: 'EMI', path: '/emis' },
      { icon: Landmark, label: 'Debt', path: '/debt' },
      { icon: CalendarRange, label: 'Planner', path: '/planner' },
      { icon: BarChart3, label: 'Insights', path: '/insights' },
      { icon: FileText, label: 'Reports', path: '/reports' },
    ],
  },
  {
    label: 'Plan',
    path: '/plan',
    icon: ListTodo,
    items: [
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: Bell, label: 'Reminders', path: '/reminders' },
      { icon: Target, label: 'Habits', path: '/habits' },
      { icon: Flag, label: 'Goals', path: '/goals' },
      { icon: FileText, label: 'Notes', path: '/notes' },
    ],
  },
  {
    label: 'More',
    path: '/products',
    icon: MoreHorizontal,
    items: [
      { icon: Package, label: 'Products', path: '/products' },
      { icon: Key, label: 'Vault', path: '/vault' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside
      className={cn(
        'h-screen bg-card border-r border-border flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <LifeSyncLogo size="sm" />
          {!collapsed && (
            <span className="text-xl font-bold text-foreground">LifeSync</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navGroups.map((group) => {
          const isGroupActive = group.path === '/'
            ? location.pathname === '/'
            : location.pathname === group.path || group.items.some((item) => location.pathname === item.path);

          if (collapsed) {
            return (
              <Link
                key={group.label}
                to={group.path}
                className={cn(
                  'flex items-center justify-center rounded-xl px-3 py-2.5 transition-all duration-200',
                  isGroupActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                aria-label={group.label}
                aria-current={isGroupActive ? 'page' : undefined}
              >
                <group.icon className="h-5 w-5" />
              </Link>
            );
          }

          return (
            <Collapsible key={group.label} defaultOpen={isGroupActive || group.label === 'Money'}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                    isGroupActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <group.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 font-semibold">{group.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 group',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group mt-4 border border-primary/20',
              location.pathname === '/admin'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-primary hover:bg-primary/10'
            )}
          >
            <Shield className={cn('w-5 h-5 flex-shrink-0', location.pathname === '/admin' ? 'text-primary-foreground' : 'text-primary')} />
            {!collapsed && <span className="font-medium">Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
            location.pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>

        {!collapsed && user && (
          <div className="mt-4 p-3 bg-muted/50 rounded-xl flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-primary/10">
              {profile?.avatar_url ? (
                <img src={resolveSupabaseAssetUrl(profile.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(profile?.full_name || null)}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
        )}
        {collapsed && user && (
          <div className="mt-4 flex justify-center">
            <Avatar className="w-8 h-8 border border-primary/10">
              {profile?.avatar_url ? (
                <img src={resolveSupabaseAssetUrl(profile.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{getInitials(profile?.full_name || null)}</AvatarFallback>
              )}
            </Avatar>
          </div>
        )}
      </div>
    </aside>
  );
}


