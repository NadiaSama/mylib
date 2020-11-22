import { Provider } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import IUniswapFactory from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IERC20 from '@uniswap/v2-core/build/IERC20.json';

interface ReserveResult {
  token0: string;
  token0Amount: string;
  token1: string;
  token1Amount: string;
  timestamp: string;
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

function newFactory(provider: Provider): ethers.Contract {
  const faddr: string = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
  return new ethers.Contract(faddr, IUniswapFactory.abi, provider);
}

const factory = newFactory(provider);

export class UniPairContract {
  readonly contract: ethers.Contract;
  readonly token0: string;
  readonly token1: string;
  constructor(contract: ethers.Contract, token0: string, token1: string) {
    this.contract = contract;
    this.token0 = token0;
    this.token1 = token1;
  }

  getReserves(): Promise<[BigNumber, BigNumber, BigNumber]> {
    return this.contract.getReserves();
  }

  async getReserveInfo(): Promise<ReserveResult> {
    const [ta, tb, tt] = await this.getReserves();
    return {
      token0: this.token0,
      token0Amount: ta.toString(),
      token1: this.token1,
      token1Amount: tb.toString(),
      timestamp: tt.toString(),
    };
  }
}

export async function getPairContract(
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

  return new UniPairContract(contract, token0, token1);
  //return new ethers.Contract(addr, IUniswapV2Pair.abi, provider);
}
