<?php

namespace App\Services\Competitors;

use App\Contracts\CompetitorContract;

class CompetitorFactory
{
    /** @var array<string, class-string<CompetitorContract>> */
    private static array $competitors = [
        'thirr' => ThirrCompetitor::class,
        'viaesim' => ViaesimCompetitor::class,
        '99esim' => NinetyNineEsimCompetitor::class,
        'kudoesim' => KudoesimCompetitor::class,
    ];

    public function make(string $slug): CompetitorContract
    {
        $class = self::$competitors[$slug] ?? null;

        if (! $class) {
            throw new \InvalidArgumentException("Unknown competitor: {$slug}");
        }

        return app($class);
    }

    /**
     * @return CompetitorContract[]
     */
    public function all(): array
    {
        return array_map(
            fn (string $class) => app($class),
            self::$competitors,
        );
    }

    /**
     * @return string[]
     */
    public function slugs(): array
    {
        return array_keys(self::$competitors);
    }

    public static function register(string $slug, string $class): void
    {
        self::$competitors[$slug] = $class;
    }
}
