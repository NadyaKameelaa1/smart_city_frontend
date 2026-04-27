<?php

use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

Route::get('/', function () {
    return view('welcome');
});


// Redirect user ke halaman login SSO
Route::get('/auth/sso/redirect', function () {
    return Socialite::driver('sso')->redirect();
});

// Callback setelah user login di SSO
Route::get('/auth/sso/callback', function () {
    try {
        $ssoUser = Socialite::driver('sso')->user();

        $user = \App\Models\User::updateOrCreate(
            ['email' => $ssoUser->getEmail()],
            [
                'name'   => $ssoUser->getName(),
                'sso_id' => $ssoUser->getId(),
            ]
        );

        // Buat token Sanctum untuk user ini
        $token = $user->createToken('sso-token')->plainTextToken;

        // Kirim token ke frontend via query string
        // Frontend akan ambil token ini dan simpan ke localStorage
        return redirect('http://localhost:5173/sso-callback?token=' . $token);

    } catch (\Throwable $e) {
        return redirect('http://localhost:5173/login?error=sso_failed');
    }
});