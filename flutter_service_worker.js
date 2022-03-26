'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "5fa1cdb3f76a526a2ddd35c542eb914f",
"assets/assets/cards/mastercard.png": "b3cf6ef30d23e7fbf53ea664dcf5d915",
"assets/assets/cards/paionner.png": "40902f0c61418936c8b3735c5e4a8c44",
"assets/assets/cards/paypal.png": "60b8d4b4214ee140d48e3b5accf2178d",
"assets/assets/cards/skrill.png": "30b0db9ede4c534280d52b9adeedeaa9",
"assets/assets/cards/visa.png": "b94739e33ee201cec3a068e1c78c534a",
"assets/assets/cards/visa_white.png": "cf275767de526eb81f9d0153334cd7d5",
"assets/assets/cards/visa_yellow.png": "893a0bdaaa779bbd77c786fa2181c238",
"assets/assets/fonts/DMSans_Bold.ttf": "071853031a2175ada019db9e6fd1585c",
"assets/assets/fonts/DMSans_Medium.ttf": "fbbc5a515be4021a9a36f048e25ad396",
"assets/assets/fonts/DMSans_Regular.ttf": "3e7f038b85daa739336e4a3476c687f2",
"assets/assets/fonts/Iconly_Bold.ttf": "34359c91c42323dbd8c9659536a95e16",
"assets/assets/fonts/Iconly_Light.ttf": "748ac53f18cc373f319023959517b7db",
"assets/assets/memoji/1.png": "05b6b1fa1de23f5a6fddf19cd5e17096",
"assets/assets/memoji/10.png": "8f254a511c68f0e1fcfc20bc8539805c",
"assets/assets/memoji/2.png": "dce92883a9a3fe4e1d2d590f88f8894e",
"assets/assets/memoji/3.png": "6252413802ff7fc185e73ef2930cc6f9",
"assets/assets/memoji/4.png": "d4cc800d5b22fd69a8eba964b959aa43",
"assets/assets/memoji/5.png": "4963dae2e454f54ac4e453203bc42658",
"assets/assets/memoji/6.png": "488bc9130ffa672804c53ca9b18236af",
"assets/assets/memoji/7.png": "4dba7f9bbee3bba8b6a7701256a31476",
"assets/assets/memoji/8.png": "4cf2467bbb1af89361ae569eb297842f",
"assets/assets/memoji/9.png": "0c4f31aec174eb1d0b962b0ec4ae0aa4",
"assets/assets/memoji/dash.png": "fa24525d7c163d81d6aadad639b5a98b",
"assets/FontManifest.json": "46df8b651de8902f0a0c423772bf2123",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/NOTICES": "55dfd9d65b67a50a94fafb4291b5df02",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "2927fbbd85e5afb366e7091cc5987811",
"/": "2927fbbd85e5afb366e7091cc5987811",
"main.dart.js": "0f1b81eb48f541f8c51142c020306a9f",
"manifest.json": "176ac09ff27782ed4e6df9af676e39e1",
"version.json": "d67c73e4fc4b1af6c8365f4ad2959ec8"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
