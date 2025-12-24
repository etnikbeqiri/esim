<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $articles = Article::query()
            ->published()
            ->with('author:id,name')
            ->orderByDesc('published_at')
            ->paginate(12);

        return Inertia::render('public/blog/index', [
            'articles' => $articles,
            'meta' => [
                'title' => 'Blog - eSIM Tips, Guides & News',
                'description' => 'Discover helpful guides, tips, and news about eSIM technology, travel connectivity, and staying connected worldwide.',
            ],
        ]);
    }

    public function show(Article $article): Response
    {
        // Only show published articles to public
        if (!$article->is_published) {
            abort(404);
        }

        $article->load('author:id,name');
        $article->incrementViews();

        // Get related articles (latest 3 excluding current)
        $relatedArticles = Article::query()
            ->published()
            ->where('id', '!=', $article->id)
            ->with('author:id,name')
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('public/blog/show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'meta' => [
                'title' => $article->title,
                'description' => $article->meta_description ?? $article->excerpt,
                'keywords' => $article->meta_keywords,
                'image' => $article->featured_image_url,
                'type' => 'article',
                'published_time' => $article->published_at?->toIso8601String(),
                'author' => $article->author?->name,
            ],
        ]);
    }
}
