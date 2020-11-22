import { getPairContract, UniPairContract } from './uniswap';
import { binance } from 'ccxt';
import winston from 'winston';

var contract: UniPairContract;
var binClient: binance;

export async function init(proxy?: string) {
  if (true) {
    const usdt = '0xdac17f958d2ee523a2206206994597c13d831ec7';
    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

    contract = await getPairContract(usdt, weth);
    if (!proxy) {
      proxy = '';
    }
    binClient = new binance({ proxy: proxy });
    await binClient.loadMarkets();
  }
}

export async function record(logger: winston.Logger) {
  const result = await contract.getReserveInfo();

  const ticker = await binClient.fetchTicker(result.usdtSymbol());

  logger.log({
    level: 'info',
    message: 'record',
    token0: result.token0,
    token0Amount: result.token0Amount,
    token1: result.token1,
    token1Amount: result.token1Amount,
    blockTimestamp: result.timestamp,
    binancePrice: ticker.last,
    binanceTimestamp: ticker.timestamp,
  });
}
