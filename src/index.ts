import {
  getPairContract,
  UniPairContract,
  newFactory,
  uniFactory,
} from './uniswap';
import winston from 'winston';

var aethEthContract: UniPairContract;

export async function init(proxy?: string) {
  if (true) {
    const uf = newFactory(uniFactory);
    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    const aeth = '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb';

    aethEthContract = await getPairContract(uf, weth, aeth);
    if (!proxy) {
      proxy = '';
    }
  }
}

export async function record(logger: winston.Logger) {
  const result = await aethEthContract.getReserveInfo();

  logger.log({
    level: 'info',
    message: 'record',
    token0: result.token0,
    uniToken0Amount: result.token0Amount,
    token1: result.token1,
    uniToken1Amount: result.token1Amount,
    uniT0T1: result.token0Amount / result.token1Amount,
    uniT1T0: result.token1Amount / result.token0Amount,
    uniTimestamp: result.timestamp,
  });
}
