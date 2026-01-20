export class Logger {
    private static getCallerFile(): string {
        const err = new Error();
        const stack = err.stack?.split('\n') || [];
        // stack[0] is Error
        // stack[1] is this getCallerFile
        // stack[2] is the log method
        // stack[3] is the caller
        const callerLine = stack[3] || stack[2] || '';
        const match = callerLine.match(/\(([^)]+)\)/);
        if (match) {
            const filePath = match[1].split(':')[0];
            // Extract just the filename, remove path
            return filePath.split('/').pop() || filePath;
        }
        return 'unknown';
    }

    private static log(level: string, message: string): void {
        const file = this.getCallerFile();
        console.log(`[${file}] [${level.toUpperCase()}] ${message}`);
    }

    static info(message: string): void {
        this.log('info', message);
    }

    static debug(message: string): void {
        this.log('debug', message);
    }

    static verbose(message: string): void {
        this.log('verbose', message);
    }

    static warn(message: string): void {
        this.log('warn', message);
    }

    static error(message: string): void {
        this.log('error', message);
    }
}
