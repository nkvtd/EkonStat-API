import winston from "winston";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, 'logs');
fs.mkdirSync(logDir, { recursive: true });

const { combine, timestamp, errors, splat, json, colorize, printf } = winston.format;

const fileFormat = combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    splat(),
    json()
);

const consoleFormat = combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    splat(),
    colorize(),
    printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        const base = `${timestamp} [${level}]: ${message}${metaString}`;
        return stack ? `${base}\n${stack}` : base;
    })
);

export const logger = winston.createLogger({
    level: "silly",
    format: fileFormat,
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
            level: "silly",
        }),
        
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
        }),
        
        new winston.transports.File({
            filename: path.join(logDir, "info.log"),
            level: "info",
            format: combine(
                winston.format((info) => (info.level === "info" ? info : false))(),
                fileFormat
            ),
        }),

        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),
    ],
    exitOnError: false,
    handleExceptions: true,
    handleRejections: true
});