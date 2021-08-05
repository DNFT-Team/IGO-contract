// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

let token;
let nft;
async function deployToken() {
  const Token20 = await hre.ethers.getContractFactory('Token20');
  token = await Token20.deploy(10000);
  await token.deployed();
  console.log('Token deployed to:', token.address);
  return token.address;
}

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

  let erc20 = await deployToken();
  let nft1155 = await deployNFT();
  // return ;

  // const erc20 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const amount = 12;
  // const nft1155 = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const ids = [100, 200, 300];
  const ids_count = [50, 950, 4000];

  // We get the contract to deploy
  const [owner, addr1, addr2] = await ethers.getSigners();
  const IGO = await hre.ethers.getContractFactory('IGO');
  const igo = await IGO.deploy(erc20, amount, nft1155, ids);

  await igo.deployed();

  console.log('IGO deployed to:', igo.address);
  console.log(
    'balanceOfOwner',
    (await igo.balanceOf(owner.address)).toString(),
  );
  console.log('balanceOfIgo', (await igo.balance()).toString());

  // let use = await igo.getNftId();
  // console.log(use);
  // return;

  let idsCount = Number(await igo.idsCount());
  console.log('idsCount=', idsCount.toString());

  for (var i = 0; i < idsCount; i++) {
    let tokenId = (await igo.ids(i)).toString();

    await igo.setRewardTotal(tokenId, i + 1);

    let tokenObj = await igo.tokenIds(tokenId);
    console.log('token>> ', tokenId, tokenObj.toString());
  }

  await token.approve(igo.address, 12);
  console.log('mint nft1155>>>');
  await nft.mint(
    igo.address,
    ids[0],
    ids_count[1],
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  );
  await nft.mint(
    igo.address,
    ids[1],
    ids_count[1],
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  );
  await nft.mint(
    igo.address,
    ids[2],
    ids_count[1],
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  );
  console.log(
    'nftOfOwner',
    (await nft.balanceOf(owner.address, ids[0])).toString(),
  );
  console.log(
    'nftOfIGO',
    (await nft.balanceOf(igo.address, ids[0])).toString(),
  );

  console.log('raffle', await igo.raffle());
  console.log(
    'reward tokenId',
    owner.address,
    (await igo.rewards(owner.address)).toString(),
  );

  //only raffle once
  // await igo.raffle();

  for (var i = 0; i < idsCount; i++) {
    let tokenId = (await igo.ids(i)).toString();
    let tokenObjNew = await igo.tokenIds(tokenId);
    console.log('token>>> ', tokenId, tokenObjNew.toString());
  }
  console.log(
    'nftOfOwner',
    (await nft.balanceOf(owner.address, ids[0])).toString(),
  );
  console.log(
    'nftOfIGO',
    (await nft.balanceOf(igo.address, ids[0])).toString(),
  );

  console.log(
    'balanceOfOwner',
    (await igo.balanceOf(owner.address)).toString(),
  );
  console.log('balanceOfIgo', (await igo.balance()).toString());

  return;
  console.log('exec withdraw***********************************************');
  await igo.withdraw();
  console.log(
    'balanceOfOwner',
    (await igo.balanceOf(owner.address)).toString(),
  );
  console.log('balance', (await igo.balance()).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
