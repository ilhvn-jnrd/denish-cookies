<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Akses ditolak. Tindakan ini memerlukan hak akses Administrator.',
            ], 403);
        }

        return $next($request);
    }
}
