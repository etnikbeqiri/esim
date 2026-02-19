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
    BarChart3,
    Briefcase,
    Coins,
    FileText,
    Globe,
    LayoutGrid,
    LifeBuoy,
    Monitor,
    Package,
    Receipt,
    RefreshCw,
    Server,
    Settings,
    ShoppingCart,
    Smartphone,
    Tag,
    Ticket,
    Users,
    Wallet,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, currency } = usePage<SharedData>().props;
    const user = auth.user;

    const {
        mainNavItems,
        clientNavItems,
        adminCatalogItems,
        adminSalesItems,
        adminSystemItems,
    } = useMemo(() => {
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

        if (hasCustomer) {
            mainNavItems.push(
                {
                    title: 'Destinations',
                    href: '/client/packages',
                    icon: Globe,
                },
                {
                    title: 'My Orders',
                    href: '/client/orders',
                    icon: ShoppingCart,
                },
                {
                    title: 'Invoices',
                    href: '/client/invoices',
                    icon: Receipt,
                },
            );
        }

        // B2B-only items
        const clientNavItems: NavItem[] = [];
        if (isB2B && hasCustomer) {
            clientNavItems.push({
                title: 'Balance',
                href: '/client/balance',
                icon: Wallet,
            });
        }

        // Admin nav — split into logical groups
        const adminCatalogItems: NavItem[] = isAdmin
            ? [
                  { title: 'Providers', href: '/admin/providers', icon: Server },
                  { title: 'Countries', href: '/admin/countries', icon: Globe },
                  { title: 'Packages', href: '/admin/packages', icon: Package },
                  { title: 'Coupons', href: '/admin/coupons', icon: Ticket },
              ]
            : [];

        const adminSalesItems: NavItem[] = isAdmin
            ? [
                  { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
                  { title: 'Customers', href: '/admin/customers', icon: Users },
                  { title: 'Invoices', href: '/admin/invoices', icon: Receipt },
                  { title: 'Tickets', href: '/admin/tickets', icon: LifeBuoy },
                  { title: 'Sales Export', href: '/admin/sales-export', icon: BarChart3 },
              ]
            : [];

        const adminSystemItems: NavItem[] = isAdmin
            ? [
                  { title: 'Articles', href: '/admin/articles', icon: FileText },
                  { title: 'Devices', href: '/admin/devices', icon: Smartphone },
                  { title: 'Brands', href: '/admin/brands', icon: Tag },
                  { title: 'Currencies', href: '/admin/currencies', icon: Coins },
                  { title: 'Sync Jobs', href: '/admin/sync-jobs', icon: RefreshCw },
                  { title: 'Settings', href: '/admin/settings', icon: Monitor },
              ]
            : [];

        return {
            mainNavItems,
            clientNavItems,
            adminCatalogItems,
            adminSalesItems,
            adminSystemItems,
        };
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
                        label="Business"
                        icon={Briefcase}
                        defaultOpen={true}
                    />
                )}
                {adminCatalogItems.length > 0 && (
                    <NavMainCollapsible
                        items={adminCatalogItems}
                        label="Catalog"
                        icon={Package}
                        defaultOpen={true}
                    />
                )}
                {adminSalesItems.length > 0 && (
                    <NavMainCollapsible
                        items={adminSalesItems}
                        label="Sales"
                        icon={ShoppingCart}
                        defaultOpen={true}
                    />
                )}
                {adminSystemItems.length > 0 && (
                    <NavMainCollapsible
                        items={adminSystemItems}
                        label="System"
                        icon={Settings}
                        defaultOpen={false}
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
                                {currency.symbol}
                                {Number(user.balance.available).toFixed(2)}
                            </span>
                        </Link>
                    </div>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
