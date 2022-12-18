const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { describe, beforeEach, it } = require("node:test")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SimplestNFT", async function () {
          const chainId = network.config.chainId

          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = account[0]
              await deployments.fixture(["simplestNFT"])
              simplestNFT = await ethers.getContract("SimplestNFT", deployer)
          })

          describe("mintNft", async function () {
              it("s_tokenCounter should start at 0", async function () {
                  const tokenCounter = await simplestNFT.getTokenCounter()
                  assert.equal(tokenCounter, "0")
              })
          })
      })
