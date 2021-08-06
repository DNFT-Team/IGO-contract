// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

let token;
let nft;

async function deployNFT() {
  const NFT = await hre.ethers.getContractFactory('DNFNft');
  nft = await NFT.deploy();
  await nft.deployed();
  console.log('NFT1155 deployed to:', nft.address);
  return nft.address;
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // await deployNFT();
  // return;

  //testnet 0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee
  //        0xe5a2758146bea3422532eeB537bE230113bacDd7
  //        0x7689EbFFB41C5B12F749aA26283a1877685Fe439
  //mainnet
  const erc20 = '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee';
  const amount = 12 * 100000000000000000;
  const nft1155 = '0xe5a2758146bea3422532eeB537bE230113bacDd7';
  const ids = [100, 200, 300];
  const ids_count = [50, 950, 4000];

  // We get the contract to deploy
  const [owner, addr1, addr2] = await ethers.getSigners();
  const IGO = await hre.ethers.getContractFactory('IGO');
  const igo = await IGO.deploy(erc20, amount, nft1155, ids);

  await igo.deployed();

  console.log('IGO deployed to:', igo.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
