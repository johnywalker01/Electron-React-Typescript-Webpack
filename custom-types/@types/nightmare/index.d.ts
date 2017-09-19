// Type definitions for Nightmare 1.6.5
// Project: https://github.com/segmentio/nightmare
// Definitions by: horiuchi <https://github.com/horiuchi/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped



declare class Nightmare<U> {
    constructor(options?: Nightmare.IConstructorOptions);

    // Interact
    goto(url: string): Nightmare<U>;
    back(): Nightmare<U>;
    forward(): Nightmare<U>;
    refresh(): Nightmare<U>;
    click(selector: string): Nightmare<U>;
    type(selector: string, text: string): Nightmare<U>;
    upload(selector: string, path: string): Nightmare<U>;
    scrollTo(top: number, left: number): Nightmare<U>;
    inject(type: string, file: string): Nightmare<U>;
    end(): Promise<U>;
    evaluate<T1, T2, T3, R>(fn: (arg1: T1, arg2: T2, arg3: T3) => R, cb: (result: R) => void, arg1: T1, arg2: T2, arg3: T3): Nightmare<R>;
    evaluate<T1, T2, R>(fn: (arg1: T1, arg2: T2) => R, cb: (result: R) => void, arg1: T1, arg2: T2): Nightmare<R>;
    evaluate<T, R>(fn: (arg: T) => R, cb: (result: R) => void, arg: T): Nightmare<R>;
    evaluate<T>(fn: (arg: T) => void, cb: () => void, arg: T): Nightmare<T>;
    evaluate<R>(fn: () => R, cb: (result: R) => void): Nightmare<R>;
    evaluate(fn: () => void): Nightmare<void>;
    wait(): Nightmare<U>;
    wait(ms: number): Nightmare<U>;
    wait(selector: string): Nightmare<U>;
    wait(fn: () => any, value: any, delay?: number): Nightmare<U>;
    use<T>(plugin: (nightmare: Nightmare<T>) => void): Nightmare<U | T>;
    run<T>(cb?: (err: any, nightmare: Nightmare<T>) => void): Nightmare<U>;

    // Extract
    exists(selector: string, cb: (result: boolean) => void): Nightmare<U>;
    visible(selector: string, cb: (result: boolean) => void): Nightmare<U>;
    on(event: string, cb: () => void): Nightmare<U>;
    on(event: 'initialized', cb: () => void): Nightmare<U>;
    on(event: 'loadStarted', cb: () => void): Nightmare<U>;
    on(event: 'loadFinished', cb: (status: string) => void): Nightmare<U>;
    on(event: 'urlChanged', cb: (targetUrl: string) => void): Nightmare<U>;
    on(event: 'navigationRequested', cb: (url: string, type: string, willNavigate: boolean, main: boolean) => void): Nightmare<U>;
    on(event: 'resourceRequested', cb: (requestData: Nightmare.IRequest, networkRequest: Nightmare.INetwordRequest) => void): Nightmare<U>;
    on(event: 'resourceReceived', cb: (response: Nightmare.IResponse) => void): Nightmare<U>;
    on(event: 'resourceError', cb: (resourceError: Nightmare.IResourceError) => void): Nightmare<U>;
    on(event: 'consoleMessage', cb: (msg: string, lineNumber: number, sourceId: number) => void): Nightmare<U>;
    on(event: 'alert', cb: (msg: string) => void): Nightmare<U>;
    on(event: 'confirm', cb: (msg: string) => void): Nightmare<U>;
    on(event: 'prompt', cb: (msg: string, defaultValue?: string) => void): Nightmare<U>;
    on(event: 'error', cb: (msg: string, trace?: Nightmare.IStackTrace[]) => void): Nightmare<U>;
    on(event: 'timeout', cb: (msg: string) => void): Nightmare<U>;
    screenshot(path: string): Nightmare<U>;
    pdf(path: string): Nightmare<U>;
    title(cb: (title: string) => void): Nightmare<U>;
    url(cb: (url: string) => void): Nightmare<U>;

    // Settings
    authentication(user: string, password: string): Nightmare<U>;
    useragent(useragent: string): Nightmare<U>;
    viewport(width: number, height: number): Nightmare<U>;
    zoom(zoomFactor: number): Nightmare<U>;
    headers(headers: Object): Nightmare<U>;
}

declare namespace Nightmare {
    export interface IConstructorOptions {
        timeout?: any;  // number | string;
        interval?: any; // number | string;
        port?: number;
        weak?: boolean;
        loadImages?: boolean;
        ignoreSslErrors?: boolean;
        sslProtocol?: string;
        webSecurity?: boolean;
        proxy?: string;
        proxyType?: string;
        proxyAuth?: string;
        cookiesFile?: string;
        phantomPath?: string;
        show?: boolean;
    }

    export interface IRequest {
        id: number;
        method: string;
        url: string;
        time: Date;
        headers: Object;
    }
    export interface INetwordRequest {
        abort(): void;
        changeUrl(url: string): void;
        setHeader(key: string, value: string): void;
    }
    export interface IResponse {
        id: number;
        url: string;
        time: Date;
        headers: Object;
        bodySize: number;
        contentType: string;
        redirectURL: string;
        stage: string;
        status: number;
        statusText: string;
    }
    export interface IResourceError {
        id: number;
        url: string;
        errorCode: number;
        errorString: string;
    }
    export interface IStackTrace {
        file: string;
        line: number;
        function?: string;
    }
}

export = Nightmare;
