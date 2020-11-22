const dist = require('./dist');
const winston = require('winston');
const { OnMaintenance } = require('ccxt');
const { sleep } = require('ccxt/js/base/functions/time');

const record = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'record.log' })],
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    })
  ),
  defaultMeta: { record: 'uniswap-binance' },
  transports: [new winston.transports.File({ filename: 'stat.log' })],
});

async function main() {
  logger.info('start loop');
  await dist.init();
  while (true) {
    /*
      try {
        await dist.record(record);
          
      }catch(e) {
          logger.warn("exception catch", {exception: e})
      }
      */
    await dist.record(record);
    await sleep(5000);
  }
}

main();
