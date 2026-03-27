import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { axiosError as formatAxiosError } from '@redtea/format-axios-error/logform';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '..', '..', '..', 'logs');
fs.mkdirSync(logDir, { recursive: true });

const { combine, timestamp, errors, splat, json, colorize, printf } =
    winston.format;

const axiosErrorFormat =
    formatAxiosError() as unknown as winston.Logform.Format;

const fileFormat = combine(
    axiosErrorFormat,
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    splat(),
    json(),
);

const consoleFormat = combine(
    axiosErrorFormat,
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    splat(),
    colorize(),
    printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : '';
        const base = `${timestamp} [${level}]: ${message}${metaString}`;
        return stack ? `${base}\n${stack}` : base;
    }),
);

export const logger = winston.createLogger({
    level: 'silly',
    format: fileFormat,
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
            level: 'silly',
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'info.log'),
            level: 'info',
            format: combine(
                winston.format((info) =>
                    info.level === 'info' ? info : false,
                )(),
                fileFormat,
            ),
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
        }),
    ],
    exitOnError: false,
    handleExceptions: true,
    handleRejections: true,
});
