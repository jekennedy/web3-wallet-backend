import { BigNumber, ethers } from 'ethers';

async function getCurrentGasPrices(provider) {
  const latestBlock = await provider.getBlock('latest');
  const baseFeePerGas = latestBlock.baseFeePerGas;
  const gasPrice = latestBlock.gasPrice;

  // Calculate maxFeePerGas assuming we're willing to pay a 2 gwei priority fee
  const maxPriorityFeePerGas: BigNumber = ethers.utils.parseUnits('2', 'gwei');
  // double the base fee and add the priority fee
  const maxFeePerGas: BigNumber = baseFeePerGas
    .mul(2)
    .add(maxPriorityFeePerGas);

  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
    gasPrice,
  };
}

export { getCurrentGasPrices };
