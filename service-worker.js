/*
====================================
Expiry Tracker
Service Worker
Part 1 of 2
====================================
*/

const CACHE_NAME = "expiry-tracker-v1";

const APP_FILES = [

    "./",
    "./index.html",
    "./style.css",

    "./script.js",
    "./storage.js",
    "./scanner.js",
    "./notifications.js",

    "./manifest.json",

   "./icons/test.png",
    "./icons/icon-512.png"

];

/* -----------------------------
   Install
----------------------------- */

self.addEventListener("install", event => {

    console.log("Service Worker Installing...");

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                console.log("Caching app files...");

                return cache.addAll(APP_FILES);

            })

    );

    self.skipWaiting();

});

/* -----------------------------
   Activate
----------------------------- */

self.addEventListener("activate", event => {

    console.log("Service Worker Activated");

    event.waitUntil(

        caches.keys()

            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if(key !== CACHE_NAME){

                            console.log("Removing old cache:", key);

                            return caches.delete(key);

                        }

                    })

                );

            })

    );

    self.clients.claim();

});
/* -----------------------------
   Fetch
----------------------------- */

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request)

            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request)

                    .then(networkResponse => {

                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone = networkResponse.clone();

                            caches.open(CACHE_NAME)

                                .then(cache => {

                                    cache.put(event.request, responseClone);

                                });

                        }

                        return networkResponse;

                    })

                    .catch(() => {

                        if (event.request.mode === "navigate") {

                            return caches.match("./index.html");

                        }

                    });

            })

    );

});

/* -----------------------------
   Messages
----------------------------- */

self.addEventListener("message", event => {

    if (event.data === "skipWaiting") {

        self.skipWaiting();

    }

});

console.log("Service Worker Ready ✅");