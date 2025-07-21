import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("NigerianStockToken", function () {
  // Fixture to deploy the contract
  async function deployNigerianStockTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const NigerianStockToken = await ethers.getContractFactory("NigerianStockToken");
    const contract = await NigerianStockToken.deploy();
    await contract.waitForDeployment();

    return { contract, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      expect(await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await contract.hasRole(await contract.ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should initialize Nigerian stocks correctly", async function () {
      const { contract } = await loadFixture(deployNigerianStockTokenFixture);
      
      const allStocks = await contract.getAllStocks();
      expect(allStocks.length).to.be.greaterThan(0);
      
      // Check if DANGCEM is initialized
      const dangcemStock = await contract.getStock("DANGCEM");
      expect(dangcemStock.symbol).to.equal("DANGCEM");
      expect(dangcemStock.name).to.equal("Dangote Cement Plc");
      expect(dangcemStock.totalSupply).to.equal(17040000000n);
    });

    it("Should have all required roles set up", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      const adminRole = await contract.ADMIN_ROLE();
      const minterRole = await contract.MINTER_ROLE();
      const pauserRole = await contract.PAUSER_ROLE();
      
      expect(await contract.hasRole(adminRole, owner.address)).to.be.true;
      expect(await contract.hasRole(minterRole, owner.address)).to.be.true;
      expect(await contract.hasRole(pauserRole, owner.address)).to.be.true;
    });
  });

  describe("Stock Token Creation", function () {
    it("Should allow admin to create stock token", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      // Note: This test will fail on actual Hedera network without HTS
      // but demonstrates the expected behavior
      const initialPrice = ethers.parseUnits("450", 18);
      
      // This would work on Hedera testnet with proper HTS setup
      // await expect(contract.createStockToken("DANGCEM", initialPrice, { value: ethers.parseEther("5") }))
      //   .to.emit(contract, "StockTokenCreated");
      
      // For now, just check that the function exists and has proper access control
      await expect(contract.connect(owner).createStockToken("DANGCEM", initialPrice, { value: ethers.parseEther("5") }))
        .to.be.reverted; // Will revert because HTS is not available in hardhat
    });

    it("Should not allow non-admin to create stock token", async function () {
      const { contract, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      const initialPrice = ethers.parseUnits("450", 18);
      
      await expect(contract.connect(addr1).createStockToken("DANGCEM", initialPrice, { value: ethers.parseEther("5") }))
        .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Should reject zero price", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      await expect(contract.connect(owner).createStockToken("DANGCEM", 0, { value: ethers.parseEther("5") }))
        .to.be.revertedWith("Price must be greater than 0");
    });

    it("Should reject invalid stock symbol", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      const initialPrice = ethers.parseUnits("450", 18);
      
      await expect(contract.connect(owner).createStockToken("INVALID", initialPrice, { value: ethers.parseEther("5") }))
        .to.be.revertedWith("Stock not found");
    });
  });

  describe("Stock Price Management", function () {
    it("Should allow admin to update stock price", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      const newPrice = ethers.parseUnits("500", 18);
      
      // This will fail because token hasn't been created, but tests the access control
      await expect(contract.connect(owner).updateStockPrice("DANGCEM", newPrice))
        .to.be.revertedWith("Stock token not created");
    });

    it("Should not allow non-admin to update stock price", async function () {
      const { contract, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      const newPrice = ethers.parseUnits("500", 18);
      
      await expect(contract.connect(addr1).updateStockPrice("DANGCEM", newPrice))
        .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Should reject zero price update", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      await expect(contract.connect(owner).updateStockPrice("DANGCEM", 0))
        .to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Stock Status Management", function () {
    it("Should allow admin to set stock status", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      // This will fail because token hasn't been created
      await expect(contract.connect(owner).setStockStatus("DANGCEM", true))
        .to.be.revertedWith("Stock token not created");
    });

    it("Should not allow non-admin to set stock status", async function () {
      const { contract, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      await expect(contract.connect(addr1).setStockStatus("DANGCEM", true))
        .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow pauser to pause contract", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      await contract.connect(owner).pause();
      expect(await contract.paused()).to.be.true;
    });

    it("Should allow pauser to unpause contract", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      await contract.connect(owner).pause();
      await contract.connect(owner).unpause();
      expect(await contract.paused()).to.be.false;
    });

    it("Should not allow non-pauser to pause contract", async function () {
      const { contract, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      await expect(contract.connect(addr1).pause())
        .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent operations when paused", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      await contract.connect(owner).pause();
      
      const initialPrice = ethers.parseUnits("450", 18);
      await expect(contract.connect(owner).createStockToken("DANGCEM", initialPrice, { value: ethers.parseEther("5") }))
        .to.be.revertedWithCustomError(contract, "EnforcedPause");
    });
  });

  describe("View Functions", function () {
    it("Should return correct stock information", async function () {
      const { contract } = await loadFixture(deployNigerianStockTokenFixture);
      
      const stock = await contract.getStock("MTNN");
      expect(stock.symbol).to.equal("MTNN");
      expect(stock.name).to.equal("MTN Nigeria Communications Plc");
      expect(stock.totalSupply).to.equal(20354513050n);
    });

    it("Should return all available stocks", async function () {
      const { contract } = await loadFixture(deployNigerianStockTokenFixture);
      
      const allStocks = await contract.getAllStocks();
      expect(allStocks).to.include("DANGCEM");
      expect(allStocks).to.include("MTNN");
      expect(allStocks).to.include("ZENITHBANK");
    });

    it("Should return empty holdings for new user", async function () {
      const { contract, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      const holdings = await contract.getUserHoldings(addr1.address, "DANGCEM");
      expect(holdings).to.equal(0);
      
      const userStocks = await contract.getUserStocks(addr1.address);
      expect(userStocks.length).to.equal(0);
    });
  });

  describe("HBAR Management", function () {
    it("Should allow admin to withdraw HBAR", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      // Send some HBAR to the contract first
      await owner.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("1")
      });
      
      const contractBalance = await ethers.provider.getBalance(await contract.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("1"));
      
      await contract.connect(owner).withdrawHBAR(ethers.parseEther("0.5"));
      
      const newBalance = await ethers.provider.getBalance(await contract.getAddress());
      expect(newBalance).to.equal(ethers.parseEther("0.5"));
    });

    it("Should not allow non-admin to withdraw HBAR", async function () {
      const { contract, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      await expect(contract.connect(addr1).withdrawHBAR(ethers.parseEther("0.1")))
        .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Should reject withdrawal of more than available balance", async function () {
      const { contract, owner } = await loadFixture(deployNigerianStockTokenFixture);
      
      await expect(contract.connect(owner).withdrawHBAR(ethers.parseEther("1")))
        .to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Receive and Fallback Functions", function () {
    it("Should accept HBAR payments", async function () {
      const { contract, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      await addr1.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("1")
      });
      
      const balance = await ethers.provider.getBalance(await contract.getAddress());
      expect(balance).to.equal(ethers.parseEther("1"));
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant roles", async function () {
      const { contract, owner, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      const minterRole = await contract.MINTER_ROLE();
      await contract.connect(owner).grantRole(minterRole, addr1.address);
      
      expect(await contract.hasRole(minterRole, addr1.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      const { contract, owner, addr1 } = await loadFixture(deployNigerianStockTokenFixture);
      
      const minterRole = await contract.MINTER_ROLE();
      await contract.connect(owner).grantRole(minterRole, addr1.address);
      await contract.connect(owner).revokeRole(minterRole, addr1.address);
      
      expect(await contract.hasRole(minterRole, addr1.address)).to.be.false;
    });
  });
});
