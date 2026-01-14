import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Copy,
    Facebook,
    Linkedin,
    Sparkles,
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
    const { trans } = useTrans();
    const [copied, setCopied] = useState(false);
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const canonicalUrl = `${siteUrl}/blog/${article.slug}`;

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
            '_blank',
        );
    }

    function shareOnFacebook() {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
            '_blank',
        );
    }

    function shareOnLinkedIn() {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
            '_blank',
        );
    }

    function copyLink() {
        navigator.clipboard.writeText(canonicalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <GuestLayout>
            <Head title={`${meta.title} - ${name}`}>
                {meta.description ? (
                    <meta name="description" content={meta.description} />
                ) : null}
                {meta.keywords ? (
                    <meta name="keywords" content={meta.keywords} />
                ) : null}
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={meta.title || ''} />
                {meta.description ? (
                    <meta
                        property="og:description"
                        content={meta.description}
                    />
                ) : null}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} />
                {meta.image ? (
                    <meta property="og:image" content={meta.image} />
                ) : null}
                {meta.published_time ? (
                    <meta
                        property="article:published_time"
                        content={meta.published_time}
                    />
                ) : null}
                {meta.author ? (
                    <meta property="article:author" content={meta.author} />
                ) : null}
                <meta
                    name="twitter:card"
                    content={meta.image ? 'summary_large_image' : 'summary'}
                />
                <meta name="twitter:title" content={meta.title || ''} />
                {meta.description ? (
                    <meta
                        name="twitter:description"
                        content={meta.description}
                    />
                ) : null}
                {meta.image ? (
                    <meta name="twitter:image" content={meta.image} />
                ) : null}
            </Head>

            <article>
                {/* Header Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-primary-50/50 to-white pt-6 pb-8 md:pb-12">
                    {/* Decorative elements */}
                    <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl" />

                    <div className="relative z-10 container mx-auto px-4">
                        {/* Back link */}
                        <BackButton
                            href="/blog"
                            label={trans('blog.article.back')}
                            className="mb-8"
                        />

                        <div className="mx-auto max-w-3xl">
                            {/* Meta badges */}
                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 px-3 py-1.5 text-xs font-bold text-accent-950 shadow-sm">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {trans('blog.article.type')}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-700 shadow-sm">
                                    <Clock className="h-3.5 w-3.5 text-accent-500" />
                                    {trans('blog.article.read_time', {
                                        min: String(article.reading_time),
                                    })}
                                </span>
                                {article.formatted_date && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-700 shadow-sm">
                                        <Calendar className="h-3.5 w-3.5 text-accent-500" />
                                        {article.formatted_date}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="mb-6 text-3xl leading-tight font-extrabold tracking-tight text-primary-900 md:text-4xl lg:text-5xl">
                                {article.title}
                            </h1>

                            {/* Excerpt */}
                            {article.excerpt && (
                                <p className="mb-8 text-xl leading-relaxed font-medium text-primary-600/90">
                                    {article.excerpt}
                                </p>
                            )}

                            {/* Share */}
                            <div className="flex flex-wrap items-center justify-end gap-6 border-t border-primary-200/60 pt-6">
                                <div className="flex items-center gap-2">
                                    <span className="mr-2 text-sm font-medium text-primary-500">
                                        {trans('blog.article.share')}
                                    </span>
                                    <button
                                        onClick={shareOnTwitter}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700 hover:shadow-md"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={shareOnFacebook}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700 hover:shadow-md"
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={shareOnLinkedIn}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700 hover:shadow-md"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={copyLink}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700 hover:shadow-md"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    {copied && (
                                        <span className="ml-1 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-bold text-accent-700">
                                            {trans('blog.article.copied')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Image */}
                <section className="pb-8 md:pb-12">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-primary-100 shadow-lg">
                            {article.featured_image_url ? (
                                <img
                                    src={article.featured_image_url}
                                    alt={article.title}
                                    className="h-auto w-full object-cover"
                                />
                            ) : (
                                <div className="relative flex aspect-[21/9] items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50">
                                    <div className="text-center">
                                        <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-300 to-accent-500 shadow-xl shadow-accent-400/30">
                                            <span className="text-4xl font-bold text-accent-950">
                                                {article.title
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm text-primary-500">
                                            <BookOpen className="h-4 w-4" />
                                            <span>
                                                {trans('blog.article.type')}
                                            </span>
                                            <span className="mx-1">•</span>
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {trans(
                                                    'blog.article.read_time',
                                                    {
                                                        min: String(
                                                            article.reading_time,
                                                        ),
                                                    },
                                                )}
                                            </span>
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
                                className="article-content prose prose-headings:font-bold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:text-primary-700 prose-strong:text-foreground"
                                dangerouslySetInnerHTML={{
                                    __html: article.content || '',
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Share Footer */}
                <section className="border-y border-primary-100 bg-gradient-to-r from-primary-50 via-white to-primary-50 py-8">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl">
                            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
                                <div>
                                    <p className="font-bold text-primary-900">
                                        {trans('blog.article.enjoyed')}
                                    </p>
                                    <p className="text-sm text-primary-600">
                                        {trans('blog.article.share_desc')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={shareOnTwitter}
                                        className="border-primary-200 bg-white text-primary-700 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-800"
                                    >
                                        <Twitter className="mr-2 h-4 w-4" />
                                        {trans('blog.article.share_twitter')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={shareOnFacebook}
                                        className="border-primary-200 bg-white text-primary-700 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-800"
                                    >
                                        <Facebook className="mr-2 h-4 w-4" />
                                        {trans('blog.article.share_facebook')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={shareOnLinkedIn}
                                        className="border-primary-200 bg-white text-primary-700 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-800"
                                    >
                                        <Linkedin className="mr-2 h-4 w-4" />
                                        {trans('blog.article.share_linkedin')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="bg-gradient-to-b from-white via-primary-50/30 to-white py-12 md:py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-500 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 px-4 py-2 text-sm font-bold text-accent-950 shadow-lg shadow-accent-500/25">
                                <BookOpen className="h-4 w-4" />
                                {trans('blog.article.continue_reading')}
                            </div>
                            <h2 className="text-2xl font-extrabold text-primary-900 md:text-3xl lg:text-4xl">
                                {trans('blog.article.more_articles')}{' '}
                                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                    {trans(
                                        'blog.article.more_articles_highlight',
                                    )}
                                </span>
                            </h2>
                            <p className="mt-3 text-primary-600">
                                {trans('blog.article.more_articles_desc')}
                            </p>
                        </div>
                        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {relatedArticles.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="group"
                                >
                                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-accent-200 hover:shadow-2xl hover:shadow-primary-500/10">
                                        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
                                            {related.featured_image_url ? (
                                                <img
                                                    src={
                                                        related.featured_image_url
                                                    }
                                                    alt={related.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="bg-mesh flex h-full items-center justify-center opacity-80">
                                                    <div className="text-center">
                                                        <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-300 to-accent-500 shadow-lg shadow-accent-400/30 transition-transform duration-500 group-hover:scale-110">
                                                            <span className="text-xl font-bold text-accent-950">
                                                                {related.title
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            <div className="absolute bottom-3 left-3 z-10">
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 px-2.5 py-1 text-xs font-bold text-accent-950 shadow-sm">
                                                    <Clock className="h-3 w-3" />
                                                    {trans(
                                                        'blog.article.read_time',
                                                        {
                                                            min: String(
                                                                related.reading_time,
                                                            ),
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <div className="mb-3">
                                                {related.formatted_date && (
                                                    <span className="text-xs font-semibold tracking-wider text-accent-600 uppercase">
                                                        {related.formatted_date}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="mb-4 line-clamp-2 flex-1 leading-snug font-bold text-primary-900 transition-colors group-hover:text-primary-600">
                                                {related.title}
                                            </h3>
                                            <div className="flex items-center justify-end border-t border-primary-50 pt-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-primary-600 uppercase transition-colors group-hover:text-accent-600">
                                                    {trans(
                                                        'blog.article.read_article',
                                                    )}
                                                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-primary-200 bg-white text-primary-700 shadow-sm transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-800 hover:shadow-md"
                                asChild
                            >
                                <Link href="/blog">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    {trans('blog.article.view_all')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="relative overflow-hidden border-t border-primary-100 bg-gradient-to-br from-primary-50 via-white to-accent-50/30 py-16">
                <div className="pointer-events-none absolute top-20 -right-20 h-64 w-64 rounded-full bg-accent-400/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl" />
                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 px-4 py-2 text-sm font-bold text-accent-950 shadow-lg shadow-accent-500/25">
                            <Sparkles className="h-4 w-4" />
                            {trans('cta_blog.badge')}
                        </div>
                        <h2 className="mb-4 text-2xl font-extrabold text-primary-900 md:text-3xl lg:text-4xl">
                            {trans('cta_blog.title')}{' '}
                            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                {trans('cta_blog.title_highlight')}
                            </span>
                            {trans('cta_blog.title_suffix')}
                        </h2>
                        <p className="mb-8 text-lg text-primary-600">
                            {trans('cta_blog.description')}
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-3">
                            <Button
                                size="lg"
                                className="btn-gold shadow-lg shadow-accent-500/25 transition-shadow hover:shadow-accent-500/40"
                                asChild
                            >
                                <Link href="/destinations">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {trans('cta_blog.browse_plans')}
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-primary-300 bg-white text-primary-700 shadow-sm transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-800 hover:shadow-md"
                                asChild
                            >
                                <Link href="/how-it-works">
                                    {trans('cta_blog.learn_how')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
