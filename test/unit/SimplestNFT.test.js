const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SimplestNFT", async function () {
          const chainId = network.config.chainId
          let simplestNFT, deployer

          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["simplestNFT"])
              simplestNFT = await ethers.getContract("SimplestNFT")
          })

          describe("constructor", async function () {
              it("Should initialize the NFT with right values", async () => {
                  const name = await simplestNFT.name()
                  const symbol = await simplestNFT.symbol()
                  const tokenCounter = await simplestNFT.getTokenCounter()
                  assert.equal(name, "Gradient")
                  assert.equal(symbol, "GRAD")
                  assert.equal(tokenCounter.toString(), "0")
              })
          })

          describe("mintNft", async function () {
              beforeEach(async () => {
                  const txResponse = await simplestNFT.mintNft()
                  await txResponse.wait(1)
              })
              it("User should be able to mint an NFT", async function () {
                  const tokenURI = await simplestNFT.getTokenURI()
                  const tokenCounter = await simplestNFT.getTokenCounter()
                  assert.equal(tokenCounter.toString(), 1)
                  assert.equal(tokenURI, await simplestNFT.TOKEN_URI())
              })
              it("s_tokenCounter should increment after a mint", async function () {
                  const tokenCounterStart = await simplestNFT.getTokenCounter()
                  await simplestNFT.mintNft()
                  const tokenCounterEnd = await simplestNFT.getTokenCounter()
                  assert.equal(tokenCounterEnd.toNumber(), tokenCounterStart.toNumber() + 1)
              })
              it("Show owner of the NFT and his balance", async function () {
                  const deployerAddress = deployer.address
                  const deployerBalance = await simplestNFT.balanceOf(deployerAddress)
                  const owner = await simplestNFT.ownerOf("0")

                  assert.equal(deployerBalance.toString(), "1")
                  assert.equal(owner, deployerAddress)
              })
          })
      })
