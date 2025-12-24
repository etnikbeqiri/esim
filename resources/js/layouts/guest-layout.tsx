import LanguageSwitcher from '@/components/language-switcher';
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
            <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                            <Globe className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">{name}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 md:flex">
                        <Link
                            href="/"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            Home
                        </Link>
                        <Link
                            href="/destinations"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            Destinations
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            How it Works
                        </Link>
                        <Link
                            href="/blog"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            Blog
                        </Link>
                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden items-center gap-3 md:flex">
                        <LanguageSwitcher />
                        {auth.user ? (
                            <Button asChild size="sm" className="rounded-xl shadow-lg shadow-primary/25">
                                <Link href="/client">
                                    <User className="mr-2 h-4 w-4" />
                                    My Account
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm" className="rounded-xl">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild size="sm" className="rounded-xl shadow-lg shadow-primary/25">
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="rounded-lg p-2 hover:bg-muted md:hidden"
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
                    <div className="border-t bg-card md:hidden">
                        <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
                            <Link
                                href="/"
                                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/destinations"
                                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Destinations
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How it Works
                            </Link>
                            <Link
                                href="/blog"
                                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Blog
                            </Link>
                            <div className="mt-3 flex items-center justify-between border-t pt-4">
                                <LanguageSwitcher showLabel />
                            </div>
                            <div className="mt-2 flex flex-col gap-2">
                                {auth.user ? (
                                    <Button asChild size="sm" className="rounded-xl">
                                        <Link href="/client">My Account</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        <Button asChild size="sm" className="rounded-xl">
                                            <Link href="/register">Get Started</Link>
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
            <footer className="border-t bg-card">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid gap-8 md:grid-cols-4">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                                    <Globe className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="text-lg font-bold">{name}</span>
                            </Link>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Stay connected anywhere in the world with instant eSIM activation.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/destinations" className="transition-colors hover:text-primary">
                                        Destinations
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/how-it-works" className="transition-colors hover:text-primary">
                                        How it Works
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faq" className="transition-colors hover:text-primary">
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/blog" className="transition-colors hover:text-primary">
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Support</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/contact" className="transition-colors hover:text-primary">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help" className="transition-colors hover:text-primary">
                                        Help Center
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/privacy" className="transition-colors hover:text-primary">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="transition-colors hover:text-primary">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 border-t pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
