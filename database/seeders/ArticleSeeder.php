<?php

namespace Database\Seeders;

use App\Models\Article;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Seed 30 SEO-optimized eSIM articles.
     */
    public function run(): void
    {
        // Load articles from data files
        $articles = array_merge(
            require database_path('seeders/data/articles-basics.php'),
            require database_path('seeders/data/articles-travel.php'),
            require database_path('seeders/data/articles-guides.php'),
            require database_path('seeders/data/articles-business.php'),
            require database_path('seeders/data/articles-future.php'),
        );

        $this->command->info('Creating ' . count($articles) . ' eSIM articles...');

        $created = 0;

        foreach ($articles as $articleData) {
            // Skip if article with this slug already exists
            if (Article::where('slug', $articleData['slug'])->exists()) {
                $this->command->warn("Skipping existing article: {$articleData['title']}");
                continue;
            }

            // Calculate published date based on days_ago
            $daysAgo = $articleData['days_ago'] ?? rand(1, 90);
            $publishedAt = Carbon::now()->subDays($daysAgo);

            // Create the article
            Article::create([
                'title' => $articleData['title'],
                'slug' => $articleData['slug'],
                'excerpt' => $articleData['excerpt'],
                'content' => $articleData['content'],
                'featured_image' => null,
                'is_published' => true,
                'published_at' => $publishedAt,
                'author_id' => 1, // Etnik Beqiri
                'meta_description' => $articleData['meta_description'],
                'meta_keywords' => $articleData['meta_keywords'],
                'views_count' => $articleData['views_count'] ?? rand(50, 500),
            ]);

            $created++;
            $this->command->line("  Created: {$articleData['title']}");
        }

        $this->command->info("Successfully created {$created} articles!");
        $this->command->info('Total articles in database: ' . Article::count());
    }
}
