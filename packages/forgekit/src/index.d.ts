export declare class Logger {
    private static formatMessage;
    static info(message: string, ...args: any[]): void;
    static error(message: string, ...args: any[]): void;
    static warn(message: string, ...args: any[]): void;
    static debug(message: string, ...args: any[]): void;
}
export declare const sleep: (ms: number) => Promise<void>;
export declare const retry: <T>(fn: () => Promise<T>, options?: {
    maxRetries?: number;
    delay?: number;
}) => Promise<T>;
export declare const init: () => void;
//# sourceMappingURL=index.d.ts.map