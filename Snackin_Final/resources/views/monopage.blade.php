<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Snackin - SPA (React)</title>

        {{-- Tes CSS existants pour garder le même style que les pages Blade --}}
        <link rel="stylesheet" href="{{ asset('Contenu/css/style.css') }}">
        <link rel="stylesheet" href="{{ asset('Contenu/css/landing.css') }}">

        {{-- Indispensable pour React avec Vite --}}
@viteReactRefresh
@vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="antialiased">

        @php
            // On passe les infos d'auth au frontend
            $user_auth_data = ['isLoggedin' => false, 'user' => null];
            if (Auth::check()) {
                $user_auth_data = ['isLoggedin' => true, 'user' => Auth::user()];
            }
            $payload = base64_encode(json_encode($user_auth_data));
        @endphp

        <script>
            // Disponible pour AuthContext côté React
            window.user_auth_data = JSON.parse(atob('{!! $payload !!}'));
        </script>

        {{-- Point d’ancrage de ta SPA React --}}
        <div id="app"></div>

    </body>
</html>
