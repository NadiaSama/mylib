import { getPairContract } from './uniswap';

async function test() {
  if (true) {
    const usdt = '0xdac17f958d2ee523a2206206994597c13d831ec7';
    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

    const pcontract = await getPairContract(usdt, weth);

    const info = await pcontract.getReserveInfo();
    console.log(
      `token0=${info.token0} token0Amount=${info.token0Amount} token1=${info.token1} token1Amount=${info.token1Amount} timestamp=${info.timestamp}`
    );
  }
}

test();

export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};
