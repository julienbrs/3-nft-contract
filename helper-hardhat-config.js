const { ethers } = require("hardhat")

const networkConfig = {
    default: {
        name: "hardhat",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // here it doesn't matter
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "30",
        mintFee: "10000000000000000", // = 0.01 ETH
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "6870",
        callbackGasLimit: "500000",
        interval: "5",
        linkAdress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        mintFee: "10000000000000000", // = 0.01 ETH
    },
    137: {
        name: "polygon",
        vrfCoordinatorV2: "",
    },
    31337: {
        name: "localhost",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // here it doesn't matter
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "30",
        mintFee: "10000000000000000", // = 0.01 ETH
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
