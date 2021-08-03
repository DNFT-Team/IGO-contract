// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function deployNFT() {
  const NFT = await hre.ethers.getContractFactory("DNFNft");
  const nft = await NFT.deploy();
  await nft.deployed();
  console.log("NFT1155 deployed to:", nft.address);
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
  // return ;

  const erc20 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const nft1155 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const ids = [100,200,300]

  // We get the contract to deploy
  const [owner, addr1, addr2] = await ethers.getSigners();
  const IGO = await hre.ethers.getContractFactory("IGO");
  const igo = await IGO.deploy(erc20,nft1155,ids);

  await igo.deployed();

  console.log("IGO deployed to:", igo.address);

  console.log("balance",await igo.balance());

  let idsCount =Number( await igo.idsCount());
  console.log("idsCount=",idsCount.toString());

  for(var i=0;i<idsCount;i++){
    let tokenId = (await igo.ids(i)).toString();

    await igo.setRewardTotal(tokenId,i+1);

    let tokenObj = await igo.tokenIds(tokenId);
    console.log("token>> ",tokenId,tokenObj.toString());
  }

  console.log("mint",ids[0],await igo.mint(ids[0]));
  console.log("reward tokenId",owner.address,(await igo.rewards(owner.address)).toString());

  //only mint once
  await igo.mint(ids[1]);

  for(var i=0;i<idsCount;i++){
    let tokenId = (await igo.ids(i)).toString();
    let tokenObjNew = await igo.tokenIds(tokenId);
    console.log("token>>> ",tokenId,tokenObjNew.toString());
  }




}

async function getToken(igo,index)
{


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
