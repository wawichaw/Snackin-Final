<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Snackin - SPA Vue</title>

    {{-- Bootstrap pour la navigation et les grilles --}}
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
    >

    {{-- Styles existants du site --}}
    <link rel="stylesheet" href="{{ asset('Contenu/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('Contenu/css/landing.css') }}">

    {{-- Assets Vite (Vue) --}}
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    {{-- Injection des infos utilisateur pour le front Vue --}}
    @php
        $user = Auth::user();
        $userData = [
            'isLoggedin' => (bool) $user,
            'user' => $user ? $user->only(['id', 'name', 'email', 'role', 'is_admin']) : null,
        ];
        $encodedUser = base64_encode(json_encode($userData));
    @endphp
    <script>
        window.user_auth_data = JSON.parse(atob('{{ $encodedUser }}'));
    </script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="antialiased vue-spa" style="margin:0; padding:0;">
    <div id="app"></div>

    {{-- reCAPTCHA --}}
    <script src="https://www.google.com/recaptcha/api.js?render=explicit" async defer></script>

    {{-- Bootstrap JS --}}
    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"
    ></script>
</body>
</html>
