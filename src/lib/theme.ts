import { STORAGE_PREFIX } from "./site";

/*
 * Theme storage, shared by the pre-paint script and the toggle.
 *
 * This must stay a plain module. Importing a value out of a "use client"
 * module from server code yields a client reference rather than the string,
 * so a key kept in ThemeToggle made the generated script read
 * `localStorage.getItem(undefined)` and silently never restore a theme.
 */

export const THEME_STORAGE_KEY = `${STORAGE_PREFIX}-theme`;

export type Theme = "light" | "dark";

/**
 * Applies a stored theme before the first paint, and marks the document as
 * JavaScript-capable.
 *
 * Rendered as the first node in <body>. With no stored choice the CSS media
 * query decides, so there is nothing to do and nothing to flash. The `js`
 * class gates the entrance reveals in globals.css: their hidden state must
 * never reach a reader without JavaScript.
 */
export const THEME_INIT_SCRIPT = `(function(){var r=document.documentElement;r.classList.add("js");try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){r.setAttribute("data-theme",t)}}catch(e){}})();`;
