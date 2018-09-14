
export = Options;

declare interface Options {
    createWebSocket?: (url: string) => WebSocket;
    packMessage?: (data: any) => string | ArrayBuffer | Blob;
    unpackMessage?: (data: string | ArrayBuffer | Blob) => any;
    attachRequestId?: (data: any, requestId: string | number) => any;
    extractRequestId?: (data: any) => string | number | undefined;
    timeout?: number;
    connectionTimeout?: number;
}
