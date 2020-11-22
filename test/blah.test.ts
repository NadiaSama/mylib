import { ethers } from 'ethers';

describe('blah', () => {
  it('works', () => {
    const val = ethers.BigNumber.from(12345679);
    const v2 = ethers.utils.formatUnits(val, 3);
    console.log(val, v2);
  });
});
