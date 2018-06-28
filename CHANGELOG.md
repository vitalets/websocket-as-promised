## 0.7.0 (Jan 9, 2018)

* Add `.onOpen` event channel ([#9])

## 0.6.0 (Oct 21, 2017)

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


[#9]: https://github.com/vitalets/websocket-as-promised/issues/9
