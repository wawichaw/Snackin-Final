import "./bootstrap";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// On encapsule le montage React dans une fonction
function startApp() {
    const el = document.getElementById("app");

    if (!el) {
        console.error(" Élément #app introuvable dans le DOM");
        return;
    }

    const root = createRoot(el);
    root.render(React.createElement(App));
}

// On lance l'app immédiatement
startApp();

export default startApp;
