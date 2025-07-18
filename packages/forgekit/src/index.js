export class Logger {
    static formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : '';
        return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
    }
    static info(message, ...args) {
        console.log(this.formatMessage('INFO', message, ...args));
    }
    static error(message, ...args) {
        console.error(this.formatMessage('ERROR', message, ...args));
    }
    static warn(message, ...args) {
        console.warn(this.formatMessage('WARN', message, ...args));
    }
    static debug(message, ...args) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage('DEBUG', message, ...args));
        }
    }
}
// Utility functions
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
export const retry = async (fn, options = {}) => {
    const { maxRetries = 3, delay = 1000 } = options;
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            Logger.warn(`Attempt ${attempt} failed:`, error);
            if (attempt < maxRetries) {
                await sleep(delay * Math.pow(2, attempt - 1)); // Exponential backoff
            }
        }
    }
    throw lastError;
};
export const init = () => {
    Logger.info('🔧 ForgeKit initialized');
};
//# sourceMappingURL=index.js.map