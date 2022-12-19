const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const imagesLocation = "./images/variousNFT"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

const FUND_AMOUNT = "100000000000000000" //0.1

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris = [
        "ipfs://QmZ4fdryaXQ7Ynjy89rzkSVQt858jkn1D9UrWMK5azZn8f",
        "ipfs://QmRKA9K6pRun2tH85wLZaFGXiv3WYuSmcyiiaTVKVDf4SG",
        "ipfs://QmTJuvUCVZWvAZ49TZ5fNCRUurxwjRaWso2F2rf4983K5w",
    ]
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)

        subscriptionId = txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }
    log("=======")

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]

    const variousIpfsNft = await deploy("VariousIpfsNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying the contract...")
        await verify(variousIpfsNft.address, args)
    }
    log("===========")
}

async function handleTokenUris() {
    tokenUris = []

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)

    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `A cute ${tokenUriMetadata.name} doggo!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        const medataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${medataUploadResponse.IpfsHash}`)
    }

    console.log("Token URIs Uploaded: ")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "variousNFT", "main"]
