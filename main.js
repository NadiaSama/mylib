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
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json()
  ),
  defaultMeta: { record: 'uniswap-binance' },
  transports: [new winston.transports.File({ filename: 'stat.log' })],
});

async function main() {
  await dist.init();
  setInterval(async () => {
    await dist.record(record);
  }, 5000);
}
main();

process.on('SIGINT', signal => {
  console.log(`receive ${signal}`);
  process.exit(0);
});
