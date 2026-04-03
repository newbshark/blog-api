import winston from 'winston';

interface LogMetaData {
    [key: string]: unknown;
}

export class LoggerService {
    private readonly logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp( { format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: 'logs/app.log',
                })],
        });
    }

    info(message: string, logType: string, meta?: LogMetaData) {
        this.logger.info(message, {
            logType,
            ...meta,
        });
    }

    warn(message: string, logType: string, meta?: LogMetaData) {
        this.logger.warn(message, {
            logType,
            ...meta,
        });
    }

    error(message: string, logType: string, meta?: LogMetaData) {
        this.logger.error(message, {
            logType,
            ...meta,
        });
    }
}
