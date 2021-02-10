
import Channel = require('chnl');
import Options = require('./options');

export = WebSocketAsPromised;

declare class WebSocketAsPromised {
    constructor(url: string, options?: Options);
    ws: WebSocket;
    isOpening: boolean;
    isOpened: boolean;
    isClosing: boolean;
    isClosed: boolean;
    onOpen: Channel;
    onSend: Channel;
    onMessage: Channel;
    onUnpackedMessage: Channel;
    onResponse: Channel;
    onClose: Channel;
    onError: Channel;
    open: () => Promise<Event>;
    sendRequest: (data: any, options?: RequestOptions) => Promise<any>;
    sendPacked: (data: any) => void;
    send: (data: string | ArrayBuffer | Blob) => void;
    waitUnpackedMessage: (predicate: (data: any) => boolean, options?: WaitUnpackedMessageOptions) => Promise<any>
    close: () => Promise<CloseEvent>;
    removeAllListeners: () => void;
}

declare interface RequestOptions {
    requestId?: string | number;
    timeout?: number;
}

declare interface WaitUnpackedMessageOptions {
    timeout?: number;
    timeoutError?: Error;
}
