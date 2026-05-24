// scripts/deployToken.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ScrapToken with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const Token = await ethers.getContractFactory("ScrapToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const addr = await token.getAddress();
  console.log("✅ ScrapToken deployed to:", addr);
  console.log("   Total supply:", ethers.formatEther(await token.totalSupply()), "$SCRAP");
  console.log("\nAdd to .env:");
  console.log(`SCRAP_TOKEN_ADDRESS=${addr}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
