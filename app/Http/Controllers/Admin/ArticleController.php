<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $articles = Article::query()
            ->with('author:id,name')
            ->when($request->search, fn($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->when($request->status === 'published', fn($q) => $q->published())
            ->when($request->status === 'draft', fn($q) => $q->draft())
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/articles/index', [
            'articles' => $articles,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/articles/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:articles,slug'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'is_published' => ['boolean'],
        ]);

        $imagePath = null;
        if ($request->hasFile('featured_image')) {
            $imagePath = $request->file('featured_image')->store('articles', 'public');
        }

        $article = Article::create([
            'title' => $validated['title'],
            'slug' => $validated['slug'] ?? null,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'] ?? null,
            'featured_image' => $imagePath,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
            'is_published' => $validated['is_published'] ?? false,
            'published_at' => ($validated['is_published'] ?? false) ? now() : null,
            'author_id' => $request->user()->id,
        ]);

        return redirect()
            ->route('admin.articles.edit', $article)
            ->with('success', 'Article created successfully.');
    }

    public function show(Article $article): Response
    {
        $article->load('author:id,name');

        return Inertia::render('admin/articles/show', [
            'article' => $article,
        ]);
    }

    public function edit(Article $article): Response
    {
        $article->load('author:id,name');

        return Inertia::render('admin/articles/edit', [
            'article' => $article,
        ]);
    }

    public function update(Request $request, Article $article): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:articles,slug,' . $article->id],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'is_published' => ['boolean'],
            'remove_featured_image' => ['boolean'],
        ]);

        $imagePath = $article->featured_image;

        // Handle image removal
        if ($request->boolean('remove_featured_image')) {
            if ($article->featured_image) {
                Storage::disk('public')->delete($article->featured_image);
            }
            $imagePath = null;
        }

        // Handle new image upload
        if ($request->hasFile('featured_image')) {
            // Delete old image if exists
            if ($article->featured_image) {
                Storage::disk('public')->delete($article->featured_image);
            }
            $imagePath = $request->file('featured_image')->store('articles', 'public');
        }

        // Handle publish status changes
        $publishedAt = $article->published_at;
        $wasPublished = $article->is_published;
        $nowPublished = $validated['is_published'] ?? false;

        if (!$wasPublished && $nowPublished) {
            $publishedAt = now();
        }

        $article->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'] ?? $article->slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'] ?? null,
            'featured_image' => $imagePath,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
            'is_published' => $nowPublished,
            'published_at' => $publishedAt,
        ]);

        return redirect()
            ->route('admin.articles.edit', $article)
            ->with('success', 'Article updated successfully.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        // Delete featured image if exists
        if ($article->featured_image) {
            Storage::disk('public')->delete($article->featured_image);
        }

        $article->delete();

        return redirect()
            ->route('admin.articles.index')
            ->with('success', 'Article deleted successfully.');
    }

    public function togglePublish(Article $article): RedirectResponse
    {
        if ($article->is_published) {
            $article->unpublish();
            $status = 'unpublished';
        } else {
            $article->publish();
            $status = 'published';
        }

        return back()->with('success', "Article {$status} successfully.");
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
        ]);

        $path = $request->file('image')->store('articles/content', 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
        ]);
    }
}
