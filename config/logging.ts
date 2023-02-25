import winston from 'winston'
import {Loggly} from 'winston-loggly-bulk';

export default class Logger {
    logger: any;
    constructor() {
        winston.add(new Loggly({
            token: process.env.LOGGER_TOKEN,
            subdomain: process.env.LOGGER_SUBDOMAIN,
            tags: ["Winston-NodeJS"],
            json: true
        }));
        this.logger = winston;
    }

    silly(message){
        console.log('silly', message)
        this.logger.log('silly', message);
    }
    debug(message){
        console.log('debug', message)
        this.logger.log('debug', message);
    }
    verbose(message){
        console.log('verbose', message)
        this.logger.log('verbose', message);
    }
    info(message){
        console.log('info', message)
        this.logger.info(message);
    }
    warn(message){
        console.warn('warn', message)
        this.logger.warn(message);
    }
    error(message){
        console.error('error', message)
        this.logger.error(message);
    }
}
