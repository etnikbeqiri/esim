import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Facebook,
    FileText,
    Linkedin,
    Share2,
    Twitter,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
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
    article: Article;
    relatedArticles: Article[];
    meta: {
        title: string;
        description: string | null;
        keywords: string | null;
        image: string | null;
        type: string;
        published_time: string | null;
        author: string | null;
    };
}

export default function BlogShow({ article, relatedArticles, meta }: Props) {
    const { name } = usePage<SharedData>().props;
    const [showShareMenu, setShowShareMenu] = useState(false);
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const canonicalUrl = `${siteUrl}/blog/${article.slug}`;

    // Add JSON-LD structured data for SEO
    useEffect(() => {
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            ...(meta.description && { description: meta.description }),
            ...(meta.image && { image: meta.image }),
            ...(meta.published_time && { datePublished: meta.published_time }),
            ...(meta.author && {
                author: {
                    '@type': 'Person',
                    name: meta.author,
                },
            }),
            publisher: {
                '@type': 'Organization',
                name: name,
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': canonicalUrl,
            },
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        script.id = 'article-jsonld';

        const existing = document.getElementById('article-jsonld');
        if (existing) existing.remove();

        document.head.appendChild(script);

        return () => {
            const el = document.getElementById('article-jsonld');
            if (el) el.remove();
        };
    }, [article, meta, name, canonicalUrl]);

    function shareOnTwitter() {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(canonicalUrl)}`,
            '_blank'
        );
    }

    function shareOnFacebook() {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
            '_blank'
        );
    }

    function shareOnLinkedIn() {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
            '_blank'
        );
    }

    function copyLink() {
        navigator.clipboard.writeText(canonicalUrl);
        setShowShareMenu(false);
    }

    return (
        <GuestLayout>
            <Head title={`${meta.title} - ${name}`}>
                {meta.description ? <meta name="description" content={meta.description} /> : null}
                {meta.keywords ? <meta name="keywords" content={meta.keywords} /> : null}
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:title" content={meta.title || ''} />
                {meta.description ? <meta property="og:description" content={meta.description} /> : null}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} />
                {meta.image ? <meta property="og:image" content={meta.image} /> : null}
                {meta.published_time ? <meta property="article:published_time" content={meta.published_time} /> : null}
                {meta.author ? <meta property="article:author" content={meta.author} /> : null}

                {/* Twitter Card */}
                <meta name="twitter:card" content={meta.image ? 'summary_large_image' : 'summary'} />
                <meta name="twitter:title" content={meta.title || ''} />
                {meta.description ? <meta name="twitter:description" content={meta.description} /> : null}
                {meta.image ? <meta name="twitter:image" content={meta.image} /> : null}
            </Head>

            <article>
                {/* Back Navigation */}
                <div className="bg-gradient-to-b from-muted/50 to-muted/30 pt-6">
                    <div className="container mx-auto px-4">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </Link>
                    </div>
                </div>

                {/* Article Header */}
                <section className="bg-gradient-to-b from-muted/30 to-background pb-8 pt-6 md:pb-12 md:pt-8">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            {/* Meta Info */}
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <Badge variant="secondary">
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    Article
                                </Badge>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {article.reading_time} min read
                                    </span>
                                    {article.formatted_date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {article.formatted_date}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                                {article.title}
                            </h1>

                            {/* Excerpt */}
                            {article.excerpt && (
                                <p className="mb-6 text-lg text-muted-foreground md:text-xl">
                                    {article.excerpt}
                                </p>
                            )}

                            {/* Share */}
                            <div className="flex flex-wrap items-center justify-end gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground mr-2">Share:</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={shareOnTwitter}
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={shareOnFacebook}
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={shareOnLinkedIn}
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={copyLink}
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Image */}
                <section className="pb-8 md:pb-12">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl">
                            {article.featured_image_url ? (
                                <img
                                    src={article.featured_image_url}
                                    alt={article.title}
                                    className="h-auto w-full object-cover"
                                />
                            ) : (
                                <div className="aspect-[21/9] bg-gradient-to-br from-primary/10 via-primary/5 to-muted flex items-center justify-center relative overflow-hidden">
                                    {/* Decorative background pattern */}
                                    <div className="absolute inset-0 opacity-[0.04]">
                                        <div className="absolute top-8 left-12">
                                            <FileText className="h-16 w-16" />
                                        </div>
                                        <div className="absolute top-16 right-20">
                                            <BookOpen className="h-12 w-12" />
                                        </div>
                                        <div className="absolute bottom-12 left-24">
                                            <Clock className="h-10 w-10" />
                                        </div>
                                        <div className="absolute bottom-8 right-12">
                                            <FileText className="h-14 w-14" />
                                        </div>
                                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2">
                                            <BookOpen className="h-8 w-8" />
                                        </div>
                                        <div className="absolute top-1/3 right-1/3">
                                            <FileText className="h-10 w-10" />
                                        </div>
                                    </div>
                                    {/* Main content */}
                                    <div className="relative flex flex-col items-center gap-4">
                                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-primary/60">
                                                {article.title.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                                            <BookOpen className="h-4 w-4" />
                                            <span>Article</span>
                                            <span className="mx-1">•</span>
                                            <Clock className="h-4 w-4" />
                                            <span>{article.reading_time} min read</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Article Content */}
                <section className="pb-12 md:pb-16">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl">
                            <div
                                className="article-content"
                                dangerouslySetInnerHTML={{ __html: article.content || '' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Share Footer */}
                <section className="border-t border-b py-8">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
                                <div>
                                    <p className="font-medium">Enjoyed this article?</p>
                                    <p className="text-sm text-muted-foreground">Share it with your friends</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                                        <Twitter className="mr-2 h-4 w-4" />
                                        Twitter
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={shareOnFacebook}>
                                        <Facebook className="mr-2 h-4 w-4" />
                                        Facebook
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
                                        <Linkedin className="mr-2 h-4 w-4" />
                                        LinkedIn
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold">Continue Reading</h2>
                            <p className="mt-2 text-muted-foreground">
                                More articles you might find interesting
                            </p>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
                            {relatedArticles.map((related) => (
                                <Link key={related.id} href={`/blog/${related.slug}`}>
                                    <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
                                        {related.featured_image_url ? (
                                            <div className="aspect-video overflow-hidden">
                                                <img
                                                    src={related.featured_image_url}
                                                    alt={related.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-muted flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 opacity-[0.03]">
                                                    <div className="absolute top-3 left-3">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div className="absolute bottom-3 right-3">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                </div>
                                                <div className="relative flex flex-col items-center gap-2">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                        <span className="text-xl font-bold text-primary/60 group-hover:text-primary/80 transition-colors">
                                                            {related.title.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                                                        <BookOpen className="h-3 w-3" />
                                                        <span>Article</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <CardContent className="p-5">
                                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {related.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {related.reading_time} min
                                                </span>
                                                {related.formatted_date && (
                                                    <span>{related.formatted_date}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-10 text-center">
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/blog">
                                    View All Articles
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="border-t bg-muted/30 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="mb-4 text-2xl font-bold">Ready to Stay Connected?</h2>
                        <p className="mb-6 text-muted-foreground">
                            Get your eSIM today and enjoy seamless connectivity wherever you travel.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button size="lg" asChild>
                                <Link href="/destinations">Browse Plans</Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/how-it-works">Learn More</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
