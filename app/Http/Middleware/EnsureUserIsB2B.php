<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsB2B
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isB2B()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'This feature is only available for business accounts'], 403);
            }

            abort(403, 'This feature is only available for business accounts.');
        }

        return $next($request);
    }
}
