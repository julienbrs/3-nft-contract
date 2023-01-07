const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const variousIpfsNft = await ethers.getContract("VariousIpfsNFT", deployer)
    const mintFee = await variousIpfsNft.getMintFee()
    console.log("Setting up listener...")
    //setup a listener:
    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 600000) // 10 minutes
        variousIpfsNft.once("NftMinted", async function () {
            resolve()
        })
        const variousIpfsNftMintTx = await variousIpfsNft.requestNFT({ value: mintFee.toString() })
        const variousIpfsNftMintTxReceipt = await variousIpfsNftMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = variousIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await VRFCoordinatorV2Mock.fulfillRandomWords(requestId, variousIpfsNft.address)
        }
    })
    console.log(
        `tokenURI of variousIpfsNft index 0 is ${await variousIpfsNft.getGradientTokenUris(0)}`
    )
}

module.exports.tags = ["all", "mint-gradient"]
