
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
    close: () => Promise<CloseEvent>;
    removeAllListeners: () => void;
}

declare interface RequestOptions {
    requestId?: string | number;
    timeout?: number;
}
