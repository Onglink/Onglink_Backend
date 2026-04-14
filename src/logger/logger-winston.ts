
import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.LOGTAIL_TOKEN;

if (!token) {
  throw new Error("FALTA CONFIGURAR: A variável LOGTAIL_TOKEN não foi encontrada no .env!");
}
const logtail = new Logtail(token);

logtail.info('teste');

const baseLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...rest }) => {
      const meta = Object.keys(rest).length ? JSON.stringify(rest) : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${meta}`;
    })
  ),
  transports: [new LogtailTransport(logtail)]
});

export const logger = {
  info: (msg: string, meta = {}) => baseLogger.info(msg, meta),
  warn: (msg: string, meta = {}) => baseLogger.warn(msg, meta),
  error: (msg: string, meta = {}) => baseLogger.error(msg, meta),
  debug: (msg: string, meta = {}) => baseLogger.debug(msg, meta),
  alert: (msg: string, meta = {}) => baseLogger.log('alert', msg, meta)
};

baseLogger.levels['alert'] = 0;
baseLogger.add(new winston.transports.Console());



