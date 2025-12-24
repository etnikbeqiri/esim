import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroSection } from '@/components/hero-section';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Clock, FileText, Search } from 'lucide-react';
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

    // Filter articles locally for instant feedback
    const filteredArticles = useMemo(() => {
        if (!searchQuery.trim()) {
            return articles.data;
        }
        const query = searchQuery.toLowerCase();
        return articles.data.filter(
            (article) =>
                article.title.toLowerCase().includes(query) ||
                (article.excerpt && article.excerpt.toLowerCase().includes(query))
        );
    }, [articles.data, searchQuery]);

    // Add JSON-LD structured data for SEO
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

        // Remove existing script if any
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
                {pageDescription ? <meta name="description" content={pageDescription} /> : null}
                <meta property="og:title" content={pageTitle} />
                {pageDescription ? <meta property="og:description" content={pageDescription} /> : null}
                <meta property="og:type" content="website" />
            </Head>

            <HeroSection
                badge={`${articles.total} Article${articles.total !== 1 ? 's' : ''}`}
                title="Travel Tips &"
                titleHighlight="eSIM Guides"
                description="Tips, guides, and news about eSIM technology and staying connected while traveling"
                showSearch={true}
                showStats={false}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search articles..."
            />

            {/* Articles */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
                    {filteredArticles.length === 0 ? (
                        <div className="py-16 text-center">
                            {searchQuery ? (
                                <>
                                    <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mt-4 font-semibold">No articles found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try a different search term
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        Clear Search
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mt-4 font-semibold">No articles yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Check back soon for helpful guides and tips
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {searchQuery && (
                                <p className="mb-6 text-sm text-muted-foreground">
                                    Found {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} matching "{searchQuery}"
                                </p>
                            )}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredArticles.map((article) => (
                                    <Link key={article.id} href={`/blog/${article.slug}`}>
                                        <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                                            {article.featured_image_url ? (
                                                <div className="aspect-video overflow-hidden">
                                                    <img
                                                        src={article.featured_image_url}
                                                        alt={article.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-muted flex items-center justify-center relative overflow-hidden">
                                                    {/* Decorative background pattern */}
                                                    <div className="absolute inset-0 opacity-[0.03]">
                                                        <div className="absolute top-4 left-4">
                                                            <FileText className="h-8 w-8" />
                                                        </div>
                                                        <div className="absolute top-8 right-8">
                                                            <BookOpen className="h-6 w-6" />
                                                        </div>
                                                        <div className="absolute bottom-6 left-8">
                                                            <Clock className="h-5 w-5" />
                                                        </div>
                                                        <div className="absolute bottom-4 right-4">
                                                            <FileText className="h-7 w-7" />
                                                        </div>
                                                    </div>
                                                    {/* Main icon with letter */}
                                                    <div className="relative flex flex-col items-center gap-2">
                                                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                            <span className="text-2xl font-bold text-primary/60 group-hover:text-primary/80 transition-colors">
                                                                {article.title.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                                                            <BookOpen className="h-3 w-3" />
                                                            <span>Article</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <CardContent className="p-4">
                                                <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                    {article.title}
                                                </h2>
                                                {article.excerpt && (
                                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                                        {article.excerpt}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {article.reading_time} min read
                                                    </span>
                                                    {article.formatted_date && (
                                                        <span>{article.formatted_date}</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination - only show when not searching */}
                            {!searchQuery && articles.last_page > 1 && (
                                <div className="mt-8 flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={!articles.prev_page_url}
                                        onClick={() => articles.prev_page_url && router.get(articles.prev_page_url)}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1 px-4">
                                        <span className="text-sm text-muted-foreground">
                                            Page {articles.current_page} of {articles.last_page}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        disabled={!articles.next_page_url}
                                        onClick={() => articles.next_page_url && router.get(articles.next_page_url)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </GuestLayout>
    );
}
