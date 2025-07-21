#!/usr/bin/env ts-node

/**
 * Simple script to create Nigerian Stock tokens using Hedera native SDK
 * This replaces all the previous Solidity-based token creation
 */

import { createNigerianStockTokens } from '../src/index';

// Execute the main function
createNigerianStockTokens();
