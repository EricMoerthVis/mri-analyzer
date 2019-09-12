importScripts('workbox-sw.prod.v2.1.2.js');

const workboxSW = new self.WorkboxSW({clientsClaim: true})
workboxSW.precache([
  {
    "url": "favicon-32x32.png",
    "revision": "c0cef3b49c40bc4d9cad6d6499cfe6f7"
  },
  {
    "url": "index.html",
    "revision": "878699bf75774835983c2582d9f15d1e"
  },
  {
    "url": "mriAnalyzer.js",
    "revision": "d5db04a05b617dbf33815dd128edc923"
  },
  {
    "url": "picture.png",
    "revision": "f3e03688349fb4c74feffa72b74d14c1"
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
