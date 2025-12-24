import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/tiptap-editor';
import { ImageUpload } from '@/components/image-upload';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    featured_image: string | null;
    featured_image_url: string | null;
    is_published: boolean;
    published_at: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    views_count: number;
    author: {
        id: number;
        name: string;
    };
}

interface Props {
    article: Article;
}

export default function ArticlesEdit({ article }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Articles', href: '/admin/articles' },
        { title: article.title, href: `/admin/articles/${article.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        featured_image: File | null;
        meta_description: string;
        meta_keywords: string;
        is_published: boolean;
        remove_featured_image: boolean;
    }>({
        _method: 'PUT',
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content || '',
        featured_image: null,
        meta_description: article.meta_description || '',
        meta_keywords: article.meta_keywords || '',
        is_published: article.is_published,
        remove_featured_image: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/articles/${article.id}`, {
            forceFormData: true,
        });
    }

    function handleRemoveImage() {
        setData('remove_featured_image', true);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${article.title}`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit Article</h1>
                    {article.is_published && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Article
                            </a>
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Article Content</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter article title"
                                        />
                                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            placeholder="article-url-slug"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            URL: /blog/{data.slug || 'article-slug'}
                                        </p>
                                        {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="excerpt">Excerpt</Label>
                                        <Textarea
                                            id="excerpt"
                                            value={data.excerpt}
                                            onChange={(e) => setData('excerpt', e.target.value)}
                                            placeholder="Brief description for previews and SEO"
                                            rows={3}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {data.excerpt.length}/500 characters
                                        </p>
                                        {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Content</Label>
                                        <TiptapEditor
                                            content={data.content}
                                            onChange={(content) => setData('content', content)}
                                            placeholder="Write your article content..."
                                        />
                                        {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Publish</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) => setData('is_published', !!checked)}
                                        />
                                        <Label htmlFor="is_published">Published</Label>
                                    </div>

                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Views: {article.views_count}</p>
                                        {article.published_at && (
                                            <p>Published: {new Date(article.published_at).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            Save Changes
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href="/admin/articles">Cancel</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Featured Image</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {article.featured_image_url && !data.remove_featured_image && !data.featured_image ? (
                                        <ImageUpload
                                            value={article.featured_image_url}
                                            onChange={(file) => setData('featured_image', file)}
                                            onRemove={handleRemoveImage}
                                        />
                                    ) : (
                                        <ImageUpload
                                            onChange={(file) => {
                                                setData('featured_image', file);
                                                setData('remove_featured_image', false);
                                            }}
                                        />
                                    )}
                                    {errors.featured_image && (
                                        <p className="text-sm text-destructive mt-2">{errors.featured_image}</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <Textarea
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            placeholder="SEO description (max 160 characters)"
                                            rows={3}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {data.meta_description.length}/160 characters
                                        </p>
                                        {errors.meta_description && (
                                            <p className="text-sm text-destructive">{errors.meta_description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                        <Input
                                            id="meta_keywords"
                                            value={data.meta_keywords}
                                            onChange={(e) => setData('meta_keywords', e.target.value)}
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                        {errors.meta_keywords && (
                                            <p className="text-sm text-destructive">{errors.meta_keywords}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
