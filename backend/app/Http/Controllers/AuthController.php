<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:30',
            'password' => 'required|string|min:6',
        ]);

        $user = new User([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);
        $user->role = 'customer';
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password yang Anda masukkan salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Google OAuth Login / Registration handler (Without extra Composer packages)
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        $idToken = $request->credential;
        $expectedClientId = config('services.google.client_id', '828855005140-m7rdk1pn0dq2dtvujklb3v33uq4oedq8.apps.googleusercontent.com');

        // Verify token with Google TokenInfo API
        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (!$response->successful()) {
            return response()->json([
                'message' => 'Token Google tidak valid atau telah kadaluarsa.',
            ], 401);
        }

        $payload = $response->json();

        // Strict verification of audience (Client ID)
        if (!isset($payload['aud']) || $payload['aud'] !== $expectedClientId) {
            return response()->json([
                'message' => 'Client ID Google tidak sesuai.',
            ], 401);
        }

        // Verify email status
        $isEmailVerified = isset($payload['email_verified']) &&
            ($payload['email_verified'] === 'true' || $payload['email_verified'] === true);

        if (!$isEmailVerified || empty($payload['email'])) {
            return response()->json([
                'message' => 'Email akun Google belum terverifikasi.',
            ], 401);
        }

        $email = strtolower(trim($payload['email']));
        $name = $payload['name'] ?? explode('@', $email)[0];

        // Find or create customer
        $user = User::where('email', $email)->first();

        if (!$user) {
            $user = new User([
                'name' => $name,
                'email' => $email,
                'phone' => null,
                'password' => Hash::make(Str::random(32)),
            ]);
            $user->role = 'customer';
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login Google berhasil',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('addresses');

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Update customer profile safely - strictly ignores 'role'.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:6',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // Never modify $user->role!
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }
}
