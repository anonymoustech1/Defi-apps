import { network, artifacts } from "hardhat";
import fs from "fs";

const { ethers } = await network.create();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
     
    const tokenContractFactory = await ethers.getContractFactory("SimpleDeFiToken");
    const token = await tokenContractFactory.deploy();
    const tokenAddress = await token.getAddress();
    
    console.log("SimpleDeFiToken contract address:", tokenAddress);
    console.log("Deployer:", deployer.address);
    console.log("Deployer ETH balance:", (await ethers.provider.getBalance(deployer.address)).toString());
    
    await saveContractToFrontend(tokenAddress, "SimpleDeFiToken");
}

async function saveContractToFrontend(address, name) {
    const contractsDir = new URL("../../frontend/src/contracts", import.meta.url).pathname;
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }
    fs.writeFileSync(
        contractsDir + `/${name}-address.json`,
        JSON.stringify({ address }, undefined, 2)
    );
    const contractArtifact = await artifacts.readArtifact(name);
    fs.writeFileSync(
        contractsDir + `/${name}.json`,
        JSON.stringify(contractArtifact, null, 2)
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;   
});
