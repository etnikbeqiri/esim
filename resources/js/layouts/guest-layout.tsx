import AppLogoIcon from '@/components/app-logo-icon';
import LanguageSwitcher from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, User, X } from 'lucide-react';
import { useState } from 'react';

interface GuestLayoutProps {
    children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    const { auth, name } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-primary-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-primary-100 bg-white/80 backdrop-blur-lg">
                <div className="container mx-auto flex h-20 items-center justify-between px-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <img alt="Logo" className="h-12 w-12 object-contain" src="/logo.png" />
                        <span className="text-xl font-bold tracking-tight text-primary-900">
                            {name}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 md:flex">
                        <Link
                            href="/"
                            className="rounded-full px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-900"
                        >
                            Home
                        </Link>
                        <Link
                            href="/destinations"
                            className="rounded-full px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-900"
                        >
                            Destinations
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="rounded-full px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-900"
                        >
                            How it Works
                        </Link>
                        <Link
                            href="/blog"
                            className="rounded-full px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-900"
                        >
                            Blog
                        </Link>
                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden items-center gap-3 md:flex">
                        <LanguageSwitcher />
                        {auth.user ? (
                            <GoldButton
                                asChild
                                size="sm"
                                className="rounded-full px-6"
                            >
                                <Link href="/client">
                                    <User className="mr-2 h-4 w-4" />
                                    My Account
                                </Link>
                            </GoldButton>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full px-5 font-semibold text-primary-700 hover:bg-primary-50 hover:text-primary-900"
                                >
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <GoldButton
                                    asChild
                                    size="sm"
                                    className="rounded-full px-6"
                                >
                                    <Link href="/register">Get Started</Link>
                                </GoldButton>
                            </>
                        )}
                    </div>

                    {/* Mobile Language Switcher & Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <LanguageSwitcher />
                        <button
                            className="rounded-lg p-2 text-primary-800 hover:bg-primary-50"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-primary-100 bg-white md:hidden">
                        <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
                            <Link
                                href="/"
                                className="rounded-xl px-4 py-3 text-sm font-medium text-primary-900 hover:bg-primary-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/destinations"
                                className="rounded-xl px-4 py-3 text-sm font-medium text-primary-900 hover:bg-primary-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Destinations
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="rounded-xl px-4 py-3 text-sm font-medium text-primary-900 hover:bg-primary-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How it Works
                            </Link>
                            <Link
                                href="/blog"
                                className="rounded-xl px-4 py-3 text-sm font-medium text-primary-900 hover:bg-primary-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Blog
                            </Link>
                            <div className="mt-3 flex items-center justify-between border-t border-primary-100 pt-4">
                                <LanguageSwitcher showLabel />
                            </div>
                            <div className="mt-4 flex flex-col gap-3">
                                {auth.user ? (
                                    <GoldButton
                                        asChild
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Link href="/client">My Account</Link>
                                    </GoldButton>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="w-full rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-900"
                                        >
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        <GoldButton
                                            asChild
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Link href="/register">
                                                Get Started
                                            </Link>
                                        </GoldButton>
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
            <footer className="relative overflow-hidden border-t border-primary-200">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-white to-accent-50" />

                {/* Decorative Elements */}
                <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl" />
                <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-accent-200/20 blur-3xl" />

                <div className="relative z-10 container mx-auto px-4 py-16">
                    <div className="grid gap-12 md:grid-cols-4">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <Link
                                href="/"
                                className="flex items-center gap-3"
                            >
                                <img alt="Logo" className="h-12 w-12 object-contain" src="/logo.png" />
                                <span className="text-xl font-bold text-primary-900">
                                    {name}
                                </span>
                            </Link>
                            <p className="mt-6 text-sm leading-relaxed text-primary-600">
                                Stay connected anywhere in the world with
                                instant eSIM activation. No roaming fees, just
                                freedom.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="mb-6 text-sm font-bold tracking-wider text-primary-900 uppercase">
                                Quick Links
                            </h3>
                            <ul className="space-y-4 text-sm text-primary-600">
                                <li>
                                    <Link
                                        href="/destinations"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        Destinations
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/how-it-works"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        How it Works
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/faq"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/blog"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="mb-6 text-sm font-bold tracking-wider text-primary-900 uppercase">
                                Support
                            </h3>
                            <ul className="space-y-4 text-sm text-primary-600">
                                <li>
                                    <Link
                                        href="/contact"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/help"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        Help Center
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="mb-6 text-sm font-bold tracking-wider text-primary-900 uppercase">
                                Legal
                            </h3>
                            <ul className="space-y-4 text-sm text-primary-600">
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/terms"
                                        className="transition-colors hover:text-primary-900"
                                    >
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 border-t border-primary-200 pt-8 text-center text-sm text-primary-500">
                        <p>
                            &copy; {new Date().getFullYear()} {name}. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
