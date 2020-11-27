import {
  getPairContract,
  UniPairContract,
  newFactory,
  uniFactory,
  sushiFactory,
} from './uniswap';
import { binance } from 'ccxt';
import winston from 'winston';

var uniContract: UniPairContract;
var sushiContract: UniPairContract;
var binClient: binance;

export async function init(proxy?: string) {
  if (true) {
    const uf = newFactory(uniFactory);
    const sf = newFactory(sushiFactory);
    const usdt = '0xdac17f958d2ee523a2206206994597c13d831ec7';
    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

    uniContract = await getPairContract(uf, usdt, weth);
    sushiContract = await getPairContract(sf, usdt, weth);
    if (!proxy) {
      proxy = '';
    }
    binClient = new binance({ proxy: proxy });
    await binClient.loadMarkets();
  }
}

export async function record(logger: winston.Logger) {
  const result = await uniContract.getReserveInfo();
  const sr = await sushiContract.getReserveInfo();

  const ticker = await binClient.fetchTicker(uniContract.ccxtSymbol());

  logger.log({
    level: 'info',
    message: 'record',
    token0: result.token0,
    uniToken0Amount: result.token0Amount,
    token1: result.token1,
    uniToken1Amount: result.token1Amount,
    uniT0T1: result.token0Amount / result.token1Amount,
    uniT1T0: result.token1Amount / result.token0Amount,
    sushiToken0Amount: sr.token0Amount,
    sushiToken1Amount: sr.token1Amount,
    sushiT0T1: sr.token0Amount / sr.token1Amount,
    sushiT1T0: sr.token1Amount / sr.token0Amount,

    blockTimestamp: result.timestamp,
    binancePrice: ticker.last,
    binanceTimestamp: ticker.timestamp,
  });
}
