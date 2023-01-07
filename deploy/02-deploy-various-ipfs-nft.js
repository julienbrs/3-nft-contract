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
            trait_type: "Mystery",
            value: "",
        },
        {
            trait_type: "Depth",
            value: "",
        },
    ],
}

const FUND_AMOUNT = "1000000000000000000000" //0.1

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris = [
        "ipfs://Qmf27mznKqXpsCx8kTthL3giVkG7KiUPQP69MiBN9LqUdk",
        "ipfs://QmYjrBCHFWbgPCzg3xeGqcgfXHux8MJmu1by4BfzP5pdVL",
        "ipfs://QmWjUSMZU12RQHPZea1d7vMZpJsCLZcChwgkQT9Jzh78Nf",
        "ipfs://QmacSEriNRqQi5YsV2p5YQa5qsnkt1XYByJgMiezmKiY6z",
        "ipfs://Qma91CAnhuHMLD3Pb7jxgrjbsY2QnoKfDSUSYxdstgGLQc",
        "ipfs://QmVVKcZka5AAsF28FQ9mEQystz74U5kpA3jKfE4P7RceoH",
        "ipfs://QmdKeznoefiY4Aj4UXMaYEc7Vx3YNPpD9Ai6o2A9XV8SCE",
        "ipfs://QmSFfz5oaVbAEeTQQs6qBRbWJJ7xnyVQnewTMt72Pu1ycV",
        "ipfs://QmYyjuhXJtcMJKFEJUT26mCLB72d6Si5ZTrqKpfxssC983",
        "ipfs://Qmf3CR5RTUeC9xzRroeH66ogEdmjXEMdNRjDNhZvbWYwAJ",
        "ipfs://QmddYh4UxnpsLvdMx2rur5eTRew56PkwXfwSutyYADtAZS",
        "ipfs://QmQjdZZUWEdMBBfmCRarxp5St5VQfQTeUK2rHP2J6amRDE",
        "ipfs://QmeAhHnhd1ktLvAsKQmkAkQSDXST81qz16SUWvuRcxrfkT",
    ]

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId, VRFCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
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

    // We need to add consumer
    if (developmentChains.includes(network.name)) {
        await VRFCoordinatorV2Mock.addConsumer(subscriptionId, variousIpfsNft.address)
        log("Consumer is added")
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying the contract...")
        await verify(variousIpfsNft.address, args)
    }
    log("===========")
}

async function handleTokenUris() {
    let tokenName = [
        "Galactic Safari",
        "Cosmic Convergence",
        "Amethyst Safari",
        "Aurora Arpeggio",
        "Space Symphony",
        "Cosmic Chaos",
        "Galactic Symphony",
        "Nebula Symphony",
        "Aurora Blues",
        "Galactic Groove",
        "Atomic Silence",
        "Amethyst Chaos",
        "Space Crimson",
    ]

    let tokenDescription = [
        "Get lost in the rhythms of the universe with Galactic Safari",
        "Experience the cosmic dance of the universe with Cosmic Convergence",
        "Explore the wild expanse of the night sky with Amethyst Safari",
        "Be mesmerized by the shimmering hues of the aurora with Aurora Arpeggio",
        "Experience the symphony of the cosmos with Space Symphony",
        "Embrace the unpredictability of the universe with Cosmic Chaos",
        "Be transported to the depths of the cosmos with Galactic Symphony",
        "Experience the music of the stars with Nebula Symphony",
        "Embrace the beauty of the polar lights with Aurora Blues",
        "Get lost in the cosmic rhythms of the universe with Galactic Groove",
        "Experience the tranquil beauty of the cosmos with with Atomic Silence",
        "Embrace the chaotic beauty of the universe with Amethyst Chaos",
        "Dive into the fiery depths of the cosmos with Space Crimson",
    ]

    let valueMystery = ["Illuminated", "Veiled", "Obscured", "Mystical"]

    let valueDepth = ["Superficial", "Layered", "Abyss", "Cosmic"]

    tokenUris = []

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)

    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = tokenName[imageUploadResponseIndex]
        tokenUriMetadata.description = tokenDescription[imageUploadResponseIndex]
        tokenUriMetadata.attributes[0].value =
            valueMystery[Math.floor(Math.random() * valueMystery.length)]

        tokenUriMetadata.attributes[1].value =
            valueDepth[Math.floor(Math.random() * valueDepth.length)]
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
