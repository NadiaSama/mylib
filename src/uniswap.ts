import { Provider } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import IUniswapFactory from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IERC20 from '@uniswap/v2-core/build/IERC20.json';

interface ReserveResult {
  token0: string;
  token0Amount: number;
  token1: string;
  token1Amount: number;
  timestamp: number;
}

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

const provider = getProvider('');

export const uniFactory: string = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
export const sushiFactory: string =
  '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac';

export function newFactory(fAddr: string): ethers.Contract {
  return new ethers.Contract(fAddr, IUniswapFactory.abi, provider);
}

export class UniPairContract {
  readonly contract: ethers.Contract;
  readonly token0: string;
  readonly token1: string;
  readonly token0Dec: number;
  readonly token1Dec: number;
  constructor(
    contract: ethers.Contract,
    token0: string,
    token1: string,
    token0Dec: number,
    token1Dec: number
  ) {
    this.contract = contract;
    this.token0 = token0;
    this.token1 = token1;
    this.token0Dec = token0Dec;
    this.token1Dec = token1Dec;
  }

  getReserves(): Promise<[BigNumber, BigNumber, number]> {
    return this.contract.getReserves();
  }

  ccxtSymbol(): string {
    var ret: string;
    if (this.token0 == 'USDT') {
      ret = `${this.token1}/${this.token0}`;
    } else {
      ret = `${this.token0}/${this.token1}`;
    }

    return ret.replace('WETH', 'ETH');
  }

  async getReserveInfo(): Promise<ReserveResult> {
    const [ta, tb, tt] = await this.getReserves();
    return {
      token0: this.token0,
      token0Amount: Number(ethers.utils.formatUnits(ta, this.token0Dec)),
      token1: this.token1,
      token1Amount: Number(ethers.utils.formatUnits(tb, this.token1Dec)),
      timestamp: tt,
    };
  }
}

export async function getPairContract(
  factory: ethers.Contract,
  addrA: string,
  addrB: string
): Promise<UniPairContract> {
  const addr = await factory.getPair(addrA, addrB);
  const contract = new ethers.Contract(addr, IUniswapV2Pair.abi, provider);
  const token0Addr = await contract.token0();
  const token1Addr = await contract.token1();
  const token0C = new ethers.Contract(token0Addr, IERC20.abi, provider);
  const token1C = new ethers.Contract(token1Addr, IERC20.abi, provider);
  const token0 = await token0C.symbol();
  const token1 = await token1C.symbol();
  const d0 = await token0C.decimals();
  const d1 = await token1C.decimals();

  return new UniPairContract(contract, token0, token1, d0, d1);
  //return new ethers.Contract(addr, IUniswapV2Pair.abi, provider);
}
