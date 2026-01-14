import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavMainProps {
    items?: NavItem[];
    label?: string;
}

export function NavMain({ items = [], label = 'Platform' }: NavMainProps) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={page.url.startsWith(
                                resolveUrl(item.href),
                            )}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

interface NavMainCollapsibleProps {
    items?: NavItem[];
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    defaultOpen?: boolean;
}

const STORAGE_KEY_PREFIX = 'sidebar_nav_';

export function NavMainCollapsible({
    items = [],
    label,
    icon: Icon,
    defaultOpen = true,
}: NavMainCollapsibleProps) {
    const page = usePage();
    const storageKey = `${STORAGE_KEY_PREFIX}${label.toLowerCase().replace(/\s+/g, '_')}`;

    // Check if any item in this group is active
    const isGroupActive = items.some((item) =>
        page.url.startsWith(resolveUrl(item.href)),
    );

    // Initialize state from localStorage or default
    const [isOpen, setIsOpen] = useState<boolean>(() => {
        if (typeof window === 'undefined') return defaultOpen;
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) {
            return stored === 'true';
        }
        return defaultOpen;
    });

    // Persist state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem(storageKey, String(isOpen));
    }, [isOpen, storageKey]);

    // If a child is active, ensure the group is open
    useEffect(() => {
        if (isGroupActive && !isOpen) {
            setIsOpen(true);
        }
    }, [isGroupActive]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                <Collapsible
                    asChild
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={label}>
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{label}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {items.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url.startsWith(
                                                resolveUrl(item.href),
                                            )}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4" />
                                                )}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
