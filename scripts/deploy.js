const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract from:", deployer.address);

  const Amulet = await hre.ethers.getContractFactory("KingmakerAmulet");
  const amulet = await Amulet.deploy();

  await amulet.waitForDeployment();

  console.log("Kingmaker Amulet deployed to:", await amulet.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
