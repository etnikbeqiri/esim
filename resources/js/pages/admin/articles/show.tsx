import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, ExternalLink, Eye, Pencil, User } from 'lucide-react';

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
    meta_description: string | null;
    meta_keywords: string | null;
    views_count: number;
    reading_time: number;
    author: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    article: Article;
}

export default function ArticlesShow({ article }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Articles', href: '/admin/articles' },
        { title: article.title, href: `/admin/articles/${article.id}` },
    ];

    function handleTogglePublish() {
        router.post(`/admin/articles/${article.id}/toggle-publish`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={article.title} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Article Preview</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTogglePublish}
                        >
                            {article.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/articles/${article.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        {article.is_published && (
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`/blog/${article.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Live
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {article.featured_image_url && (
                            <img
                                src={article.featured_image_url}
                                alt={article.title}
                                className="max-h-[400px] w-full rounded-lg object-cover"
                            />
                        )}

                        <Card>
                            <CardHeader>
                                <div className="mb-2 flex items-center gap-2">
                                    <Badge
                                        variant={
                                            article.is_published
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {article.is_published
                                            ? 'Published'
                                            : 'Draft'}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl">
                                    {article.title}
                                </CardTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {article.author?.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {article.reading_time} min read
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {article.views_count} views
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {article.excerpt && (
                                    <p className="mb-6 text-lg text-muted-foreground">
                                        {article.excerpt}
                                    </p>
                                )}
                                <div
                                    className="prose prose-sm sm:prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: article.content || '',
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Article Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <Badge
                                        variant={
                                            article.is_published
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {article.is_published
                                            ? 'Published'
                                            : 'Draft'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Slug
                                    </span>
                                    <span className="font-mono text-xs">
                                        {article.slug}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Author
                                    </span>
                                    <span>{article.author?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Views
                                    </span>
                                    <span>{article.views_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Reading Time
                                    </span>
                                    <span>{article.reading_time} min</span>
                                </div>
                                {article.formatted_date && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Published
                                        </span>
                                        <span>{article.formatted_date}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Created
                                    </span>
                                    <span>
                                        {new Date(
                                            article.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Updated
                                    </span>
                                    <span>
                                        {new Date(
                                            article.updated_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>SEO</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <span className="mb-1 block text-muted-foreground">
                                        Meta Description
                                    </span>
                                    <p>
                                        {article.meta_description || 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <span className="mb-1 block text-muted-foreground">
                                        Meta Keywords
                                    </span>
                                    <p>{article.meta_keywords || 'Not set'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
