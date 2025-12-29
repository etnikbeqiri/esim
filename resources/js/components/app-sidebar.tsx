import { NavMain, NavMainCollapsible } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Coins,
    FileText,
    Globe,
    LayoutGrid,
    Package,
    Receipt,
    RefreshCw,
    Server,
    Settings,
    ShoppingCart,
    Users,
    Wallet,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, currency } = usePage<SharedData>().props;
    const user = auth.user;

    // Build navigation items based on user type
    const { mainNavItems, clientNavItems, adminNavItems } = useMemo(() => {
        const isAdmin = user?.is_admin ?? false;
        const isB2B = user?.is_b2b ?? false;
        const hasCustomer = user?.has_customer ?? false;

        // Main nav - shown to all logged in users
        const mainNavItems: NavItem[] = [
            {
                title: 'Dashboard',
                href: isAdmin && !hasCustomer ? '/admin/orders' : '/client',
                icon: LayoutGrid,
            },
        ];

        // Client nav items - only for users with customer profile
        const clientNavItems: NavItem[] = hasCustomer
            ? [
                  {
                      title: 'Browse Packages',
                      href: '/client/packages',
                      icon: Package,
                  },
                  {
                      title: 'My Orders',
                      href: '/client/orders',
                      icon: ShoppingCart,
                  },
              ]
            : [];

        // B2B gets Balance and Invoices pages
        if (isB2B && hasCustomer) {
            clientNavItems.push({
                title: 'Balance',
                href: '/client/balance',
                icon: Wallet,
            });
            clientNavItems.push({
                title: 'Invoices',
                href: '/client/invoices',
                icon: Receipt,
            });
        }

        // Admin nav items - only for admins
        const adminNavItems: NavItem[] = isAdmin
            ? [
                  {
                      title: 'Providers',
                      href: '/admin/providers',
                      icon: Server,
                  },
                  {
                      title: 'Countries',
                      href: '/admin/countries',
                      icon: Globe,
                  },
                  {
                      title: 'Packages',
                      href: '/admin/packages',
                      icon: Package,
                  },
                  {
                      title: 'Orders',
                      href: '/admin/orders',
                      icon: ShoppingCart,
                  },
                  {
                      title: 'Customers',
                      href: '/admin/customers',
                      icon: Users,
                  },
                  {
                      title: 'Sync Jobs',
                      href: '/admin/sync-jobs',
                      icon: RefreshCw,
                  },
                  {
                      title: 'Currencies',
                      href: '/admin/currencies',
                      icon: Coins,
                  },
                  {
                      title: 'Articles',
                      href: '/admin/articles',
                      icon: FileText,
                  },
                  {
                      title: 'Invoices',
                      href: '/admin/invoices',
                      icon: Receipt,
                  },
              ]
            : [];

        return { mainNavItems, clientNavItems, adminNavItems };
    }, [user]);


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {clientNavItems.length > 0 && (
                    <NavMainCollapsible
                        items={clientNavItems}
                        label={user?.is_b2b ? 'Business' : 'My Account'}
                        icon={Briefcase}
                        defaultOpen={true}
                    />
                )}
                {adminNavItems.length > 0 && (
                    <NavMainCollapsible
                        items={adminNavItems}
                        label="Admin"
                        icon={Settings}
                        defaultOpen={true}
                    />
                )}
            </SidebarContent>

            <SidebarFooter>
                {user?.is_b2b && user?.balance && (
                    <div className="px-2 py-2">
                        <Link
                            href="/client/balance"
                            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm hover:bg-muted"
                        >
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="h-4 w-4" />
                                <span>Balance</span>
                            </span>
                            <span className="font-semibold text-green-600">
                                {currency.symbol}{Number(user.balance.available).toFixed(2)}
                            </span>
                        </Link>
                    </div>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
