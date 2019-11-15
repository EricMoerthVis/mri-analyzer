importScripts('workbox-sw.prod.v2.1.2.js');

const workboxSW = new self.WorkboxSW({clientsClaim: true})
workboxSW.precache([
  {
    "url": "favicon-32x32.png",
    "revision": "c0cef3b49c40bc4d9cad6d6499cfe6f7"
  },
  {
    "url": "index.html",
    "revision": "916feca2bee2f3f91cd8cb9c0566a846"
  },
  {
    "url": "mriAnalyzer.js",
    "revision": "0bdb0570a4cb1b3514d40541e15b1789"
  }
])

workboxSW.router.registerRoute(
  /\.js|\.png|\.wasm$/,
  workboxSW.strategies.staleWhileRevalidate({
  cacheName: 'staleWhileRevalidateContent',
  cacheExpiration: {
    maxEntries: 50,
    maxAgeSeconds: 7 * 24 * 60 * 60 * 26,
    }
  })
);
