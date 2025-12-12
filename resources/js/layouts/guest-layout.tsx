import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Globe, Menu, User, X } from 'lucide-react';
import { useState } from 'react';

interface GuestLayoutProps {
    children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    const { auth, name } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Globe className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight">{name}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-6 md:flex">
                        <Link
                            href="/"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Home
                        </Link>
                        <Link
                            href="/destinations"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Destinations
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            How it Works
                        </Link>
                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden items-center gap-2 md:flex">
                        {auth.user ? (
                            <Button asChild variant="default" size="sm">
                                <Link href="/client">
                                    <User className="mr-2 h-4 w-4" />
                                    My Account
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="border-t bg-background md:hidden">
                        <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
                            <Link
                                href="/"
                                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/destinations"
                                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Destinations
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How it Works
                            </Link>
                            <div className="mt-2 flex flex-col gap-2 border-t pt-4">
                                {auth.user ? (
                                    <Button asChild size="sm">
                                        <Link href="/client">My Account</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href="/register">Sign up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid gap-8 md:grid-cols-4">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <Globe className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <span className="text-lg font-semibold">{name}</span>
                            </Link>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Stay connected anywhere in the world with instant eSIM activation.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/destinations" className="hover:text-foreground">
                                        Destinations
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/how-it-works" className="hover:text-foreground">
                                        How it Works
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faq" className="hover:text-foreground">
                                        FAQ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Support</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/contact" className="hover:text-foreground">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help" className="hover:text-foreground">
                                        Help Center
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/privacy" className="hover:text-foreground">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="hover:text-foreground">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
