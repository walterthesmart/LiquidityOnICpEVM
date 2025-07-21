#!/usr/bin/env node

/**
 * Hedera Native Token Creation Service
 * 
 * This script creates Nigerian Stock Exchange tokens natively on Hedera
 * using the Hedera SDK, replacing the previous Solidity-based approach.
 */

import * as dotenv from 'dotenv';
import { HederaNativeTokenService } from './services/token-service';
import { FrontendIntegrationService } from './services/frontend-integration';
import { NIGERIAN_STOCKS } from './constants/nigerian-stocks';
import { TokenServiceConfig } from './types';

// Load environment variables
dotenv.config();

/**
 * Parse command line arguments
 */
function parseArguments(): {
  network: 'testnet' | 'mainnet' | 'previewnet';
  outputDir: string;
  generateFrontendFiles: boolean;
  tokensOnly: boolean;
  help: boolean;
  } {
  const args = process.argv.slice(2);
  
  const config = {
    network: 'testnet' as 'testnet' | 'mainnet' | 'previewnet',
    outputDir: './exports',
    generateFrontendFiles: true,
    tokensOnly: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
    case '--network': {
      const network = args[i + 1];
      if (['testnet', 'mainnet', 'previewnet'].includes(network)) {
        config.network = network as 'testnet' | 'mainnet' | 'previewnet';
        i++;
      }
      break;
    }
    case '--output-dir':
      config.outputDir = args[i + 1];
      i++;
      break;
    case '--no-frontend':
      config.generateFrontendFiles = false;
      break;
    case '--tokens-only':
      config.tokensOnly = true;
      break;
    case '--help':
    case '-h':
      config.help = true;
      break;
    }
  }

  return config;
}

/**
 * Display help information
 */
function displayHelp(): void {
  console.log(`
🏦 Hedera Native Token Creation Service

Usage: npm run create-tokens [options]

Options:
  --network <network>     Hedera network (testnet, mainnet, previewnet) [default: testnet]
  --output-dir <dir>      Output directory for generated files [default: ./exports]
  --no-frontend          Skip frontend integration file generation
  --tokens-only          Only create tokens, skip all file generation
  --help, -h             Show this help message

Environment Variables:
  HEDERA_NETWORK                 Hedera network (testnet/mainnet/previewnet)
  TESTNET_OPERATOR_ACCOUNT_ID    Operator account ID for testnet
  TESTNET_OPERATOR_PRIVATE_KEY   Operator private key for testnet
  MAINNET_OPERATOR_ACCOUNT_ID    Operator account ID for mainnet
  MAINNET_OPERATOR_PRIVATE_KEY   Operator private key for mainnet

Examples:
  npm run create-tokens                           # Create tokens on testnet
  npm run create-tokens -- --network mainnet     # Create tokens on mainnet
  npm run create-tokens -- --no-frontend         # Skip frontend files
  npm run create-tokens -- --tokens-only         # Only create tokens

For more information, visit: https://docs.hedera.com/hedera/sdks-and-apis
`);
}

/**
 * Get configuration from environment and arguments
 */
function getConfiguration(args: ReturnType<typeof parseArguments>): TokenServiceConfig {
  const networkPrefix = args.network.toUpperCase();
  
  // Try network-specific environment variables first, then fall back to generic ones
  const operatorAccountId = 
    process.env[`${networkPrefix}_OPERATOR_ACCOUNT_ID`] ||
    process.env.HEDERA_OPERATOR_ID ||
    process.env.TESTNET_OPERATOR_ACCOUNT_ID;
    
  const operatorPrivateKey = 
    process.env[`${networkPrefix}_OPERATOR_PRIVATE_KEY`] ||
    process.env.HEDERA_OPERATOR_KEY ||
    process.env.TESTNET_OPERATOR_PRIVATE_KEY;

  if (!operatorAccountId || !operatorPrivateKey) {
    throw new Error(`
❌ Missing Hedera operator credentials for ${args.network}.

Please set the following environment variables:
  ${networkPrefix}_OPERATOR_ACCOUNT_ID (or HEDERA_OPERATOR_ID)
  ${networkPrefix}_OPERATOR_PRIVATE_KEY (or HEDERA_OPERATOR_KEY)

For testnet, you can also use:
  TESTNET_OPERATOR_ACCOUNT_ID
  TESTNET_OPERATOR_PRIVATE_KEY
`);
  }

  return {
    network: args.network,
    operatorAccountId,
    operatorPrivateKey,
    outputDir: args.outputDir,
    generateFrontendFiles: args.generateFrontendFiles
  };
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const args = parseArguments();

  if (args.help) {
    displayHelp();
    return;
  }

  console.log('🚀 Starting Hedera Native Token Creation Service');
  console.log('='.repeat(60));

  let tokenService: HederaNativeTokenService | null = null;

  try {
    // Get configuration
    const config = getConfiguration(args);
    
    console.log(`🌐 Network: ${config.network}`);
    console.log(`👤 Operator: ${config.operatorAccountId}`);
    console.log(`📁 Output Directory: ${config.outputDir}`);
    console.log(`🎨 Generate Frontend Files: ${config.generateFrontendFiles ? 'Yes' : 'No'}`);

    // Initialize token service
    tokenService = new HederaNativeTokenService(config);
    await tokenService.initialize();

    // Create tokens
    console.log(`\n📈 Creating ${NIGERIAN_STOCKS.length} Nigerian Stock Tokens...`);
    const summary = await tokenService.createTokens(NIGERIAN_STOCKS);

    // Display summary
    console.log(`\n${  '='.repeat(70)}`);
    console.log('📊 TOKEN CREATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful: ${summary.successfulCreations}`);
    console.log(`❌ Failed: ${summary.failedCreations}`);
    console.log(`📊 Total: ${summary.totalTokens}`);
    console.log(`💰 Total Cost: ${summary.totalCost}`);

    if (summary.errors.length > 0) {
      console.log('\n❌ Errors:');
      summary.errors.forEach(error => {
        console.log(`   ${error.symbol}: ${error.error}`);
      });
    }

    // Generate frontend integration files if requested
    if (config.generateFrontendFiles && summary.tokens.length > 0 && !args.tokensOnly) {
      const frontendService = new FrontendIntegrationService(config.outputDir);
      const integrationFiles = frontendService.generateAllIntegrationFiles(
        summary.tokens,
        config.network
      );

      console.log('\n📦 Generated Integration Files:');
      console.log(`   📄 Types: ${integrationFiles.typesFile}`);
      console.log(`   ⚙️  Config: ${integrationFiles.configFile}`);
      console.log(`   🪝 Hooks: ${integrationFiles.hooksFile}`);
      console.log(`   🔧 Env Template: ${integrationFiles.envFile}`);
      console.log(`   📖 README: ${integrationFiles.readmeFile}`);
      console.log(`   📊 Metadata Files: ${integrationFiles.metadataFiles.length} files`);
    }

    if (summary.successfulCreations > 0) {
      console.log('\n🎉 Tokens were created successfully using Hedera SDK!');
      console.log('These tokens are now available on the Hedera network and can be:');
      console.log('  • Transferred between accounts');
      console.log('  • Associated with user accounts');
      console.log('  • Integrated with frontend applications');
      console.log('  • Viewed on Hedera explorers');
      
      if (config.generateFrontendFiles && !args.tokensOnly) {
        console.log(`\n📁 Integration files are available in: ${config.outputDir}`);
        console.log('   Copy these files to your frontend project for easy integration.');
      }
    }

    if (summary.failedCreations > 0) {
      console.log('\n⚠️  Some token creations failed.');
      console.log('Common issues and solutions:');
      console.log('  • Insufficient HBAR balance - Add more HBAR to operator account');
      console.log('  • Network connectivity - Check internet connection');
      console.log('  • Invalid credentials - Verify operator account ID and private key');
      console.log('  • Rate limiting - Increase delays between token creations');
    }

  } catch (error: any) {
    console.error('❌ Token creation failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (tokenService) {
      tokenService.close();
    }
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Hedera Native Token Creation completed!');
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('💥 Token creation script failed:', error);
      process.exit(1);
    });
}

export { main as createNigerianStockTokens };
export * from './services/token-service';
export * from './services/frontend-integration';
export * from './types';
export * from './constants/nigerian-stocks';
