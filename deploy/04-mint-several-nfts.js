const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Simplest NFT
    const simplestNft = await ethers.getContract("SimplestNFT", deployer)
    const simplestNftMintTx = await simplestNft.mintNft()
    await simplestNftMintTx.wait(1)
    console.log(`tokenURI of simplestNFT index 0 is ${await simplestNft.getTokenURI()}`)

    // Dynamic svg
    const highValue = ethers.utils.parseEther("1000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNFT", deployer)
    const dynamicSvgNftTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftTx.wait(1)
    console.log(`tokenURI of dynamicSvgNft index 0 is ${await dynamicSvgNft.tokenURI(0)}`)

    // various IPFS NFT
    const variousIpfsNft = await ethers.getContract("VariousIpfsNFT", deployer)
    const mintFee = await variousIpfsNft.getMintFee()
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
    console.log(`tokenURI of variousIpfsNft index 0 is ${await variousIpfsNft.getDogTokenUris(0)}`)
}
