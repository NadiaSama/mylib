import { ethers } from 'ethers';
import { JsonRpcProvider, InfuraProvider } from '@ethersproject/providers';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IUniswapFactory from '@uniswap/v2-core/build/IUniswapV2Factory.json';

type Provider = JsonRpcProvider | InfuraProvider;

function getProvider(env: string | undefined): Provider {
  if ('development' === env) {
    return new ethers.providers.JsonRpcProvider();
  } else {
    return new ethers.providers.InfuraProvider(
      'homestead',
      'f97c7a71446e435fb8954c42c17c0de5'
    );
  }
}

async function test(provider: Provider) {
  console.log(await provider.getBlockNumber());
  if (true) {
    const usdt = '0xdac17f958d2ee523a2206206994597c13d831ec7';
    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    const faddr = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
    const fcontract = new ethers.Contract(faddr, IUniswapFactory.abi, provider);

    const pairAddr = await fcontract.getPair(usdt, weth);
    console.log(`got pair address ${pairAddr}`);
    const pcontract = new ethers.Contract(
      pairAddr,
      IUniswapV2Pair.abi,
      provider
    );
    console.log(`got pair symbol ${await pcontract.symbol()}`);
    const [a, b, c] = await pcontract.getReserves();
    console.log(
      `weth amount=${ethers.utils.formatUnits(
        a.toString(),
        18
      )}, usdt amount=${ethers.utils.formatUnits(b.toString(), 6)},${c}`
    );
  }
}

const p1 = getProvider(process.env.MODE_ENV);
test(p1);

const p2 = getProvider('hehe');
test(p2);

export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};
