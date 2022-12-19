const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiKeySecret = process.env.PINATA_API_KEY_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiKeySecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)

    let responses = []
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { reponses, files }
}

module.exports = { storeImages }
