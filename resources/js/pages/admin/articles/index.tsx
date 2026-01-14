import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    is_published: boolean;
    published_at: string | null;
    views_count: number;
    formatted_date: string | null;
    author: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Props {
    articles: {
        data: Article[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Articles', href: '/admin/articles' },
];

export default function ArticlesIndex({ articles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/articles',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get('/admin/articles', newFilters, { preserveState: true });
    }

    function handleTogglePublish(article: Article) {
        router.post(
            `/admin/articles/${article.id}/toggle-publish`,
            {},
            { preserveState: true },
        );
    }

    function handleDelete() {
        if (!deleteArticle) return;
        router.delete(`/admin/articles/${deleteArticle.id}`, {
            preserveState: true,
            onSuccess: () => setDeleteArticle(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Articles" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Articles</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                            {articles.total} articles
                        </span>
                        <Button asChild>
                            <Link href="/admin/articles/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Article
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search articles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[200px] pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead className="w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No articles found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                articles.data.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{article.title}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    /blog/{article.slug}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {article.author?.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    article.is_published
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleTogglePublish(article)
                                                }
                                            >
                                                {article.is_published
                                                    ? 'Published'
                                                    : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {article.views_count}
                                        </TableCell>
                                        <TableCell>
                                            {article.formatted_date || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/articles/${article.id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/articles/${article.id}/edit`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteArticle(
                                                            article,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {articles.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(articles.last_page, 10) },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === articles.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/articles', {
                                        ...filters,
                                        page,
                                    })
                                }
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog
                open={!!deleteArticle}
                onOpenChange={(open) => !open && setDeleteArticle(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Article</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {deleteArticle?.title}"? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
