import { index as articlesIndex } from '@/actions/App/Http/Controllers/Admin/ArticleController';
import { ImageUpload } from '@/components/image-upload';
import { TiptapEditor } from '@/components/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Articles', href: '/admin/articles' },
    { title: 'Create', href: '/admin/articles/create' },
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function ArticlesCreate() {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        featured_image: File | null;
        meta_description: string;
        meta_keywords: string;
        is_published: boolean;
    }>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: null,
        meta_description: '',
        meta_keywords: '',
        is_published: false,
    });

    useEffect(() => {
        if (!slugManuallyEdited && data.title) {
            setData('slug', slugify(data.title));
        }
    }, [data.title, slugManuallyEdited]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/articles', {
            forceFormData: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Article" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold">Create Article</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
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
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            placeholder="Enter article title"
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) => {
                                                setSlugManuallyEdited(true);
                                                setData('slug', e.target.value);
                                            }}
                                            placeholder="article-url-slug"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            URL: /blog/
                                            {data.slug || 'article-slug'}
                                        </p>
                                        {errors.slug && (
                                            <p className="text-sm text-destructive">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="excerpt">Excerpt</Label>
                                        <Textarea
                                            id="excerpt"
                                            value={data.excerpt}
                                            onChange={(e) =>
                                                setData(
                                                    'excerpt',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Brief description for previews and SEO"
                                            rows={3}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {data.excerpt.length}/500 characters
                                        </p>
                                        {errors.excerpt && (
                                            <p className="text-sm text-destructive">
                                                {errors.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Content</Label>
                                        <TiptapEditor
                                            content={data.content}
                                            onChange={(content) =>
                                                setData('content', content)
                                            }
                                            placeholder="Write your article content..."
                                        />
                                        {errors.content && (
                                            <p className="text-sm text-destructive">
                                                {errors.content}
                                            </p>
                                        )}
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
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_published',
                                                    !!checked,
                                                )
                                            }
                                        />
                                        <Label htmlFor="is_published">
                                            Publish immediately
                                        </Label>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1"
                                        >
                                            {data.is_published
                                                ? 'Publish'
                                                : 'Save Draft'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link href={articlesIndex.url()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Featured Image</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ImageUpload
                                        onChange={(file) =>
                                            setData('featured_image', file)
                                        }
                                    />
                                    {errors.featured_image && (
                                        <p className="mt-2 text-sm text-destructive">
                                            {errors.featured_image}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_description">
                                            Meta Description
                                        </Label>
                                        <Textarea
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) =>
                                                setData(
                                                    'meta_description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="SEO description (max 160 characters)"
                                            rows={3}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {data.meta_description.length}/160
                                            characters
                                        </p>
                                        {errors.meta_description && (
                                            <p className="text-sm text-destructive">
                                                {errors.meta_description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meta_keywords">
                                            Meta Keywords
                                        </Label>
                                        <Input
                                            id="meta_keywords"
                                            value={data.meta_keywords}
                                            onChange={(e) =>
                                                setData(
                                                    'meta_keywords',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                        {errors.meta_keywords && (
                                            <p className="text-sm text-destructive">
                                                {errors.meta_keywords}
                                            </p>
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
