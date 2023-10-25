const hre = require("hardhat");

async function main() {

  const contract = await hre.ethers.deployContract("XDC_HACK", { gasLimit: "9000000" });
  console.log(contract.target);  
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

