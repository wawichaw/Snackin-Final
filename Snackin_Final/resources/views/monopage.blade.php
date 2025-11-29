<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Snackin - SPA (React)</title>
        <!-- include main site CSS so SPA components follow the same theme used by Blade views -->
        <link rel="stylesheet" href="{{ asset('Contenu/css/style.css') }}">
        <link rel="stylesheet" href="{{ asset('Contenu/css/landing.css') }}">
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        <script src="https://www.google.com/recaptcha/api.js?render=explicit" async defer></script>

    </head>
    <body class="antialiased">

        @php
            // prepare auth payload for the client
            $user_auth_data = ['isLoggedin' => false, 'user' => null];
            if (Auth::check()) {
                $user_auth_data = ['isLoggedin' => true, 'user' => Auth::user()];
            }
            // encode as base64 for safe transfer
            $payload = base64_encode(json_encode($user_auth_data));
        @endphp

        <script>
            // decode payload from server and make available on window
            window.user_auth_data = JSON.parse(atob('{!! $payload !!}'));
        </script>

        <div id="app"></div>

    </body>
</html>
