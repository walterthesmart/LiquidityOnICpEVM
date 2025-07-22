import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import fs from "fs";

// Load environment variables
dotenvConfig({ path: resolve(__dirname, "..", ".env") });

// Nigerian stocks data (sample for Sepolia deployment)
const SEPOLIA_SAMPLE_STOCKS = [
  {
    symbol: 'DANGCEM',
    name: 'Dangote Cement Token',
    totalSupply: '17040000000000000000000000000', // 17.04 billion * 10^18
    companyName: 'Dangote Cement Plc',
    sector: 'Industrial Goods',
    marketCap: 7710000000000, // 7.71 trillion NGN
  },
  {
    symbol: 'MTNN',
    name: 'MTN Nigeria Token',
    totalSupply: '20354513050000000000000000000', // ~20.35 billion * 10^18
    companyName: 'MTN Nigeria Communications Plc',
    sector: 'Telecommunications',
    marketCap: 4050000000000, // 4.05 trillion NGN
  },
  {
    symbol: 'ZENITHBANK',
    name: 'Zenith Bank Token',
    totalSupply: '31396493786000000000000000000', // ~31.4 billion * 10^18
    companyName: 'Zenith Bank Plc',
    sector: 'Banking',
    marketCap: 1200000000000, // 1.2 trillion NGN
  },
  {
    symbol: 'GTCO',
    name: 'Guaranty Trust Token',
    totalSupply: '29431127496000000000000000000', // ~29.4 billion * 10^18
    companyName: 'Guaranty Trust Holding Company Plc',
    sector: 'Banking',
    marketCap: 1100000000000, // 1.1 trillion NGN
  },
  {
    symbol: 'ACCESS',
    name: 'Access Holdings Token',
    totalSupply: '35687500000000000000000000000', // ~35.7 billion * 10^18
    companyName: 'Access Holdings Plc',
    sector: 'Banking',
    marketCap: 630000000000, // 630 billion NGN
  },
];

interface DeploymentResult {
  network: string;
  chainId: string;
  deployer: string;
  factoryAddress: string;
  deployedAt: string;
  totalTokens: number;
  totalGasUsed: bigint;
  estimatedCostETH: string;
  tokens: Array<{
    symbol: string;
    name: string;
    companyName: string;
    address: string;
    maxSupply: string;
    deploymentGas: string;
  }>;
}

async function estimateGasCosts() {
  console.log("⛽ Estimating gas costs for Sepolia deployment...");
  
  const [deployer] = await ethers.getSigners();
  const gasPrice = await ethers.provider.getFeeData();
  
  console.log(`   Current gas price: ${ethers.formatUnits(gasPrice.gasPrice || 0n, "gwei")} gwei`);
  console.log(`   Max fee per gas: ${ethers.formatUnits(gasPrice.maxFeePerGas || 0n, "gwei")} gwei`);
  
  // Estimate factory deployment
  const NigerianStockTokenFactory = await ethers.getContractFactory("NigerianStockTokenFactory");
  const factoryGasEstimate = await NigerianStockTokenFactory.getDeploymentTransaction(deployer.address).estimateGas();
  
  // Estimate token deployment (approximate)
  const tokenGasEstimate = 2500000n; // Approximate gas per token deployment
  const totalTokens = BigInt(SEPOLIA_SAMPLE_STOCKS.length);
  
  const totalGasEstimate = factoryGasEstimate + (tokenGasEstimate * totalTokens);
  const estimatedCost = totalGasEstimate * (gasPrice.gasPrice || 0n);
  
  console.log(`   Factory deployment gas: ${factoryGasEstimate.toLocaleString()}`);
  console.log(`   Per token gas estimate: ${tokenGasEstimate.toLocaleString()}`);
  console.log(`   Total gas estimate: ${totalGasEstimate.toLocaleString()}`);
  console.log(`   Estimated cost: ${ethers.formatEther(estimatedCost)} ETH`);
  
  return {
    factoryGas: factoryGasEstimate,
    tokenGas: tokenGasEstimate,
    totalGas: totalGasEstimate,
    estimatedCost: ethers.formatEther(estimatedCost)
  };
}

async function deployToSepolia(): Promise<DeploymentResult> {
  console.log("\n🚀 Starting Sepolia deployment of Nigerian Stock Exchange tokens...");
  console.log("================================================================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low ETH balance. You may need more ETH for deployment.");
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
  }

  // Estimate costs
  const gasEstimates = await estimateGasCosts();
  
  console.log("\n📦 Deploying NigerianStockTokenFactory...");
  
  const deploymentResult: DeploymentResult = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    factoryAddress: "",
    deployedAt: new Date().toISOString(),
    totalTokens: SEPOLIA_SAMPLE_STOCKS.length,
    totalGasUsed: 0n,
    estimatedCostETH: gasEstimates.estimatedCost,
    tokens: []
  };

  let totalGasUsed = 0n;

  try {
    // Step 1: Deploy the Factory Contract
    const NigerianStockTokenFactory = await ethers.getContractFactory("NigerianStockTokenFactory");
    const factory = await NigerianStockTokenFactory.deploy(deployer.address);
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    deploymentResult.factoryAddress = factoryAddress;
    
    const factoryDeployTx = factory.deploymentTransaction();
    if (factoryDeployTx) {
      const receipt = await factoryDeployTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
        console.log(`   ✅ Factory deployed at: ${factoryAddress}`);
        console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`   🔗 Transaction: https://sepolia.etherscan.io/tx/${receipt.hash}`);
      }
    }

    // Step 2: Deploy Sample Stock Tokens
    console.log("\n🏭 Deploying sample Nigerian stock tokens...");
    
    for (let i = 0; i < SEPOLIA_SAMPLE_STOCKS.length; i++) {
      const stock = SEPOLIA_SAMPLE_STOCKS[i];
      console.log(`\n   [${i + 1}/${SEPOLIA_SAMPLE_STOCKS.length}] Deploying ${stock.symbol}...`);
      
      try {
        // Prepare stock metadata
        const stockMetadata = {
          symbol: stock.symbol,
          companyName: stock.companyName,
          sector: stock.sector,
          totalShares: stock.totalSupply,
          marketCap: stock.marketCap,
          isActive: true,
          lastUpdated: Math.floor(Date.now() / 1000)
        };

        // Deploy token through factory
        const tx = await factory.deployStockToken(
          stock.name,
          stock.symbol,
          stock.totalSupply,
          stockMetadata,
          deployer.address
        );

        const receipt = await tx.wait();
        if (receipt) {
          totalGasUsed += receipt.gasUsed;
          
          // Get the deployed token address from events
          const event = receipt.logs.find(log => {
            try {
              const parsed = factory.interface.parseLog(log);
              return parsed?.name === 'StockTokenDeployed';
            } catch {
              return false;
            }
          });

          if (event) {
            const parsedEvent = factory.interface.parseLog(event);
            const tokenAddress = parsedEvent?.args[1];
            
            deploymentResult.tokens.push({
              symbol: stock.symbol,
              name: stock.name,
              companyName: stock.companyName,
              address: tokenAddress,
              maxSupply: stock.totalSupply,
              deploymentGas: receipt.gasUsed.toString()
            });

            console.log(`      ✅ ${stock.symbol} deployed at: ${tokenAddress}`);
            console.log(`      ⛽ Gas used: ${receipt.gasUsed.toString()}`);
            console.log(`      🔗 Transaction: https://sepolia.etherscan.io/tx/${receipt.hash}`);
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`      ❌ Failed to deploy ${stock.symbol}:`, error);
        // Continue with other tokens
      }
    }

    deploymentResult.totalGasUsed = totalGasUsed;

    // Step 3: Save deployment results
    await saveDeploymentResults(deploymentResult);
    
    // Step 4: Generate frontend configuration
    await generateFrontendConfig(deploymentResult);

    console.log("\n🎉 Sepolia deployment completed successfully!");
    console.log("================================================================================");
    console.log(`📊 Deployment Summary:`);
    console.log(`   Factory Address: ${deploymentResult.factoryAddress}`);
    console.log(`   Tokens Deployed: ${deploymentResult.tokens.length}/${deploymentResult.totalTokens}`);
    console.log(`   Total Gas Used: ${totalGasUsed.toLocaleString()}`);
    console.log(`   Estimated Cost: ${deploymentResult.estimatedCostETH} ETH`);
    console.log(`   Block Explorer: https://sepolia.etherscan.io/address/${deploymentResult.factoryAddress}`);
    console.log("================================================================================");

    return deploymentResult;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

async function saveDeploymentResults(result: DeploymentResult) {
  const deploymentsDir = resolve(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `nigerian-stocks-sepolia-${result.chainId}.json`;
  const filepath = resolve(deploymentsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
  console.log(`\n💾 Deployment results saved to: ${filepath}`);
}

async function generateFrontendConfig(result: DeploymentResult) {
  const frontendDir = resolve(__dirname, "..", "..", "front-end", "src", "config");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const sepoliaConfig = {
    chainId: parseInt(result.chainId),
    name: "Ethereum Sepolia Testnet",
    factoryAddress: result.factoryAddress,
    blockExplorer: "https://sepolia.etherscan.io",
    tokens: result.tokens.reduce((acc, token) => {
      acc[token.symbol] = token.address;
      return acc;
    }, {} as Record<string, string>),
    deployedAt: result.deployedAt,
    totalTokens: result.tokens.length
  };

  const configPath = resolve(frontendDir, "sepolia-contracts.json");
  fs.writeFileSync(configPath, JSON.stringify(sepoliaConfig, null, 2));
  console.log(`\n🎨 Frontend configuration saved to: ${configPath}`);
}

// Main execution
async function main() {
  try {
    await deployToSepolia();
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { deployToSepolia, SEPOLIA_SAMPLE_STOCKS };
