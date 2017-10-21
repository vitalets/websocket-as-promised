## 0.6.0 (tbd)

* Two handlers for packing messages (`options.packRequest / options.unpackResponse`)
are replaced with 4 more atomic hadlers:
  * `options.packMessage()`
  * `options.unpackMessage()`
  * `options.attachRequestId()`
  * `options.extractRequestId()`

* Method `.request()` is renamed to `.sendRequest()`.

* Introduced new method and channels: 
  * `.sendPacked()`
  * `.onPackedMessage`
  * `.onResponse`
  
* Added changelog :)


