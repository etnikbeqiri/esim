import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Clock,
    Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    is_published: boolean;
    published_at: string | null;
    formatted_date: string | null;
    reading_time: number;
    author: {
        id: number;
        name: string;
    };
}

interface Props {
    articles: {
        data: Article[];
        current_page: number;
        last_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    meta: {
        title: string;
        description: string;
    };
}

export default function BlogIndex({ articles, meta }: Props) {
    const { name } = usePage<SharedData>().props;
    const pageTitle = meta?.title || 'Blog';
    const pageDescription = meta?.description || '';
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = useMemo(() => {
        if (!searchQuery.trim()) {
            return articles.data;
        }
        const query = searchQuery.toLowerCase();
        return articles.data.filter(
            (article) =>
                article.title.toLowerCase().includes(query) ||
                (article.excerpt &&
                    article.excerpt.toLowerCase().includes(query)),
        );
    }, [articles.data, searchQuery]);

    useEffect(() => {
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: pageTitle,
            description: pageDescription,
            publisher: {
                '@type': 'Organization',
                name: name,
            },
            blogPost: articles.data.map((article) => ({
                '@type': 'BlogPosting',
                headline: article.title,
                description: article.excerpt || '',
                datePublished: article.published_at,
                author: {
                    '@type': 'Person',
                    name: article.author?.name,
                },
                url: `${window.location.origin}/blog/${article.slug}`,
            })),
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        script.id = 'blog-jsonld';

        const existing = document.getElementById('blog-jsonld');
        if (existing) existing.remove();

        document.head.appendChild(script);

        return () => {
            const el = document.getElementById('blog-jsonld');
            if (el) el.remove();
        };
    }, [articles, pageTitle, pageDescription, name]);

    return (
        <GuestLayout>
            <Head title={`${pageTitle} - ${name}`}>
                {pageDescription ? (
                    <meta name="description" content={pageDescription} />
                ) : null}
                <meta property="og:title" content={pageTitle} />
                {pageDescription ? (
                    <meta property="og:description" content={pageDescription} />
                ) : null}
                <meta property="og:type" content="website" />
            </Head>

            <HeroSection
                badge={`${articles.total} Article${articles.total !== 1 ? 's' : ''} Available`}
                title="Travel Tips &"
                titleHighlight="eSIM Guides"
                description="Expert insights, detailed guides, and latest news about eSIM technology and staying connected while traveling"
                showSearch={true}
                showStats={false}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search articles..."
            />

            {/* Articles Grid */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    {filteredArticles.length === 0 ? (
                        <div className="py-16 text-center">
                            {searchQuery ? (
                                <div className="mx-auto max-w-sm">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                                        <Search className="h-8 w-8 text-primary-500" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-primary-900">
                                        No articles found
                                    </h3>
                                    <p className="mb-4 text-primary-600">
                                        Try a different search term
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery('')}
                                        className="border-primary-300 text-primary-700 hover:bg-primary-50"
                                    >
                                        Clear Search
                                    </Button>
                                </div>
                            ) : (
                                <div className="mx-auto max-w-sm">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                                        <BookOpen className="h-8 w-8 text-primary-500" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-primary-900">
                                        No articles yet
                                    </h3>
                                    <p className="text-primary-600">
                                        Check back soon for helpful guides and
                                        tips
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {searchQuery && (
                                <p className="mb-6 text-sm text-primary-600">
                                    Found {filteredArticles.length} article
                                    {filteredArticles.length !== 1
                                        ? 's'
                                        : ''}{' '}
                                    matching "
                                    <span className="font-medium text-primary-900">
                                        {searchQuery}
                                    </span>
                                    "
                                </p>
                            )}

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredArticles.map((article, index) => (
                                    <Link
                                        key={article.id}
                                        href={`/blog/${article.slug}`}
                                        className="group relative flex h-full flex-col"
                                    >
                                        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-accent-200 hover:shadow-2xl hover:shadow-primary-500/10">
                                            {/* Image */}
                                            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
                                                {article.featured_image_url ? (
                                                    <img
                                                        src={
                                                            article.featured_image_url
                                                        }
                                                        alt={article.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="bg-mesh flex h-full items-center justify-center opacity-80">
                                                        <div className="text-center">
                                                            <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-300 to-accent-500 shadow-lg shadow-accent-400/30 transition-transform duration-500 group-hover:scale-110">
                                                                <span className="text-2xl font-bold text-accent-950">
                                                                    {article.title
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Overlay gradient on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                                {/* Reading time badge */}
                                                <div className="absolute bottom-3 left-3 z-10">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 px-3 py-1 text-xs font-bold text-accent-950 shadow-sm">
                                                        <Clock className="h-3 w-3" />
                                                        {article.reading_time}{' '}
                                                        min read
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-1 flex-col p-6">
                                                <div className="mb-3 flex items-center gap-2">
                                                    {article.formatted_date && (
                                                        <span className="text-xs font-semibold tracking-wider text-accent-600 uppercase">
                                                            {
                                                                article.formatted_date
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="mb-3 line-clamp-2 text-xl leading-snug font-extrabold text-primary-900 transition-colors group-hover:text-primary-600">
                                                    {article.title}
                                                </h2>

                                                {article.excerpt && (
                                                    <p className="mb-6 line-clamp-3 flex-1 text-sm leading-relaxed text-primary-600/80">
                                                        {article.excerpt}
                                                    </p>
                                                )}

                                                <div className="mt-auto flex items-center justify-between border-t border-primary-50 pt-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-200 to-primary-300 text-[10px] font-bold text-primary-800">
                                                            {article.author?.name?.charAt(
                                                                0,
                                                            ) || 'A'}
                                                        </div>
                                                        <span className="text-xs font-medium text-primary-500">
                                                            {
                                                                article.author
                                                                    ?.name
                                                            }
                                                        </span>
                                                    </div>

                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-primary-600 uppercase transition-colors group-hover:text-accent-600">
                                                        Read Article
                                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {!searchQuery && articles.last_page > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        disabled={!articles.prev_page_url}
                                        onClick={() =>
                                            articles.prev_page_url &&
                                            router.get(articles.prev_page_url)
                                        }
                                        className="border-primary-300 bg-white text-primary-700 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium text-primary-600">
                                        Page{' '}
                                        <span className="font-bold text-primary-900">
                                            {articles.current_page}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-bold text-primary-900">
                                            {articles.last_page}
                                        </span>
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={!articles.next_page_url}
                                        onClick={() =>
                                            articles.next_page_url &&
                                            router.get(articles.next_page_url)
                                        }
                                        className="border-primary-300 bg-white text-primary-700 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 disabled:opacity-50"
                                    >
                                        Next
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden border-t border-primary-100 bg-gradient-to-br from-primary-50 via-white to-accent-50/30 py-16">
                <div className="pointer-events-none absolute top-20 -right-20 h-64 w-64 rounded-full bg-accent-400/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl" />
                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 px-4 py-2 text-sm font-bold text-accent-950 shadow-lg shadow-accent-500/25">
                            <Sparkles className="h-4 w-4" />
                            Start Your Journey
                        </div>
                        <h2 className="mb-4 text-2xl font-extrabold text-primary-900 md:text-3xl lg:text-4xl">
                            Ready to{' '}
                            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                Stay Connected
                            </span>
                            ?
                        </h2>
                        <p className="mb-8 text-lg text-primary-600">
                            Get your eSIM today and enjoy seamless connectivity
                            wherever you travel.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-3">
                            <Button
                                size="lg"
                                className="btn-gold shadow-lg shadow-accent-500/25 transition-shadow hover:shadow-accent-500/40"
                                asChild
                            >
                                <Link href="/destinations">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Browse Plans
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-primary-300 bg-white text-primary-700 shadow-sm transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-800 hover:shadow-md"
                                asChild
                            >
                                <Link href="/how-it-works">
                                    Learn How It Works
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
