<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Snackin SPA</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Bootstrap CSS pour navbar, boutons, grid, etc. --}}
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
    >

    {{--  CSS Snackin d’origine --}}
    <link rel="stylesheet" href="{{ asset('Contenu/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('Contenu/css/landing.css') }}">

    {{--  React + Vite --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])

    {{--  reCAPTCHA --}}
    <script src="https://www.google.com/recaptcha/api.js?render=explicit" async defer></script>
</head>
<body style="margin:0; padding:0;">
    <div id="app"></div>

    {{--  Bootstrap JS (pour le menu burger, dropdown, etc.) --}}
    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"
    ></script>
</body>
</html>
