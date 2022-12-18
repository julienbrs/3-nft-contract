const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("=======")
    console.log("dev chains = ", developmentChains)
    const args = []
    const simplestNft = await deploy("SimplestNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying the contract...")
        await verify(simplestNft.address, arguments)
    }
    log("===========")
}

module.exports.tags = ["all", "simplestNFT", "main"]
