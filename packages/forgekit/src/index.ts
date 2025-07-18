export class Logger {
  private static formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ') : '';
    return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
  }

  static info(message: string, ...args: any[]): void {
    console.log(this.formatMessage('INFO', message, ...args));
  }

  static error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message, ...args));
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message, ...args));
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }
}

// Utility functions
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delay?: number } = {}
): Promise<T> => {
  const { maxRetries = 3, delay = 1000 } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      Logger.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await sleep(delay * Math.pow(2, attempt - 1)); // Exponential backoff
      }
    }
  }

  throw lastError!;
};

export const init = () => {
  Logger.info('🔧 ForgeKit initialized');
};
