## 1.0.0 (Nov 21, 2019)

* Provide unpacked sources by default to reduce bundle size ([#22])

## 0.9.0 (Sep 14, 2018)

* Add TypeScript support ([#13])
* Add `removeAllListeners` method ([#12])

## 0.8.0 (Jul 10, 2018)

* Rename `.onPackedMessage` into `.onUnpackedMessage` ([#10])
* Replace `controlled-promise` with [`promise-controller`](https://github.com/vitalets/promise-controller)

## 0.7.0 (Jun 29, 2018)

* Add `.onOpen` event channel ([#9])
* Add `.onSend` event channel ([#8])
* Add `.onError` event channel ([#4])

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


[#4]: https://github.com/vitalets/websocket-as-promised/issues/4
[#8]: https://github.com/vitalets/websocket-as-promised/issues/8
[#9]: https://github.com/vitalets/websocket-as-promised/issues/9
[#10]: https://github.com/vitalets/websocket-as-promised/issues/10
[#12]: https://github.com/vitalets/websocket-as-promised/issues/12
[#13]: https://github.com/vitalets/websocket-as-promised/issues/13
[#22]: https://github.com/vitalets/websocket-as-promised/issues/22
