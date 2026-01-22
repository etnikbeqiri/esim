<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Country;
use App\Models\Package;
use Carbon\Carbon;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    public function __invoke(): \Symfony\Component\HttpFoundation\Response
    {
        $sitemap = Sitemap::create()
            ->add(Url::create('/')->setPriority(1.0)->setLastModificationDate(Carbon::today()))
            ->add(Url::create('/destinations')->setPriority(0.8)->setLastModificationDate(Carbon::today()))
            ->add(Url::create('/how-it-works')->setPriority(0.7)->setLastModificationDate(Carbon::today()))
            ->add(Url::create('/faq')->setPriority(0.6)->setLastModificationDate(Carbon::today()))
            ->add(Url::create('/help')->setPriority(0.6)->setLastModificationDate(Carbon::today()))
            ->add(Url::create('/privacy')->setPriority(0.4)->setLastModificationDate(Carbon::today()))
            ->add(Url::create('/terms')->setPriority(0.4)->setLastModificationDate(Carbon::today()))
            ->add(Url::create('/refund')->setPriority(0.4)->setLastModificationDate(Carbon::today()));

        Country::active()->each(function (Country $country) use ($sitemap) {
            $sitemap->add(
                Url::create("/destinations/{$country->iso_code}")
                    ->setPriority(0.8)
                    ->setLastModificationDate($country->updated_at ?? Carbon::today())
            );
        });

        Package::active()->each(function (Package $package) use ($sitemap) {
            $sitemap->add(
                Url::create("/package/{$package->uuid}")
                    ->setPriority(0.7)
                    ->setLastModificationDate($package->updated_at ?? Carbon::today())
            );
        });

        Article::published()->each(function (Article $article) use ($sitemap) {
            $sitemap->add(
                Url::create("/blog/{$article->slug}")
                    ->setPriority(0.6)
                    ->setLastModificationDate($article->updated_at ?? Carbon::today())
            );
        });

        return $sitemap->toResponse(request());
    }
}
