#!/bin/bash

# BFT Token Minting Script using curl
# 
# This script provides a curl-based alternative for minting BFT testnet tokens
# using the Bitfinity EVM JSON-RPC API
#
# Usage:
#   ./scripts/mint-bft-curl.sh <address> <amount> [network]
#   ./scripts/mint-bft-curl.sh 0x1234567890123456789012345678901234567890 10 testnet

set -e  # Exit on any error

# Default configuration
DEFAULT_NETWORK="testnet"
TESTNET_RPC="https://testnet.bitfinity.network"
MAINNET_RPC="https://mainnet.bitfinity.network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate Ethereum address
validate_address() {
    local address=$1
    if [[ ! $address =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        log_error "Invalid Ethereum address format: $address"
        exit 1
    fi
}

# Convert decimal to hex wei (18 decimals)
decimal_to_hex_wei() {
    local amount=$1
    # Use bc for precise calculation
    local wei=$(echo "$amount * 1000000000000000000" | bc)
    printf "0x%x" $wei
}

# Convert hex wei to decimal
hex_wei_to_decimal() {
    local hex_wei=$1
    # Remove 0x prefix and convert to decimal
    local wei_decimal=$((16#${hex_wei#0x}))
    # Convert to decimal with 6 decimal places
    echo "scale=6; $wei_decimal / 1000000000000000000" | bc -l
}

# Generate random request ID
generate_request_id() {
    echo $((RANDOM * RANDOM))
}

# Make JSON-RPC request
make_rpc_request() {
    local rpc_url=$1
    local method=$2
    local params=$3
    local request_id=$(generate_request_id)
    
    local json_request=$(cat <<EOF
{
    "jsonrpc": "2.0",
    "method": "$method",
    "params": $params,
    "id": $request_id
}
EOF
)
    
    log_info "Making JSON-RPC request to $rpc_url"
    log_info "Method: $method"
    log_info "Params: $params"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "User-Agent: BFT-Minting-Curl/1.0" \
        -d "$json_request" \
        "$rpc_url")
    
    echo "$response"
}

# Get balance
get_balance() {
    local rpc_url=$1
    local address=$2
    
    log_info "Checking balance for $address..."
    
    local params="[\"$address\", \"latest\"]"
    local response=$(make_rpc_request "$rpc_url" "eth_getBalance" "$params")
    
    # Parse response
    local error=$(echo "$response" | jq -r '.error // empty')
    if [[ -n "$error" ]]; then
        log_error "Balance check failed: $(echo "$error" | jq -r '.message')"
        return 1
    fi
    
    local balance_hex=$(echo "$response" | jq -r '.result')
    local balance_decimal=$(hex_wei_to_decimal "$balance_hex")
    
    echo "$balance_hex,$balance_decimal"
}

# Mint native tokens
mint_native_tokens() {
    local rpc_url=$1
    local address=$2
    local amount=$3
    
    local hex_amount=$(decimal_to_hex_wei "$amount")
    
    log_info "Minting $amount BTF to $address..."
    log_info "Amount in hex wei: $hex_amount"
    
    local params="[\"$address\", \"$hex_amount\"]"
    local response=$(make_rpc_request "$rpc_url" "ic_mint_native_token" "$params")
    
    # Parse response
    local error=$(echo "$response" | jq -r '.error // empty')
    if [[ -n "$error" ]]; then
        log_error "Minting failed: $(echo "$error" | jq -r '.message')"
        return 1
    fi
    
    local tx_hash=$(echo "$response" | jq -r '.result')
    log_success "Minting successful!"
    log_success "Transaction hash: $tx_hash"
    
    echo "$tx_hash"
}

# Main function
main() {
    local address=$1
    local amount=$2
    local network=${3:-$DEFAULT_NETWORK}
    
    # Validate inputs
    if [[ -z "$address" || -z "$amount" ]]; then
        echo "Usage: $0 <address> <amount> [network]"
        echo "Example: $0 0x1234567890123456789012345678901234567890 10 testnet"
        exit 1
    fi
    
    validate_address "$address"
    
    # Set RPC URL based on network
    local rpc_url
    local explorer_url
    case $network in
        testnet)
            rpc_url=$TESTNET_RPC
            explorer_url="https://explorer.testnet.bitfinity.network"
            ;;
        mainnet)
            rpc_url=$MAINNET_RPC
            explorer_url="https://explorer.bitfinity.network"
            ;;
        *)
            log_error "Unsupported network: $network"
            exit 1
            ;;
    esac
    
    echo ""
    log_info "🚀 BFT Token Minting (curl version)"
    echo "====================================="
    echo "Network: $network"
    echo "RPC URL: $rpc_url"
    echo "Target Address: $address"
    echo "Amount: $amount BTF"
    echo "====================================="
    echo ""
    
    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed. Please install jq first."
        exit 1
    fi
    
    # Check if bc is available
    if ! command -v bc &> /dev/null; then
        log_error "bc is required but not installed. Please install bc first."
        exit 1
    fi
    
    # Get initial balance
    local initial_balance_result=$(get_balance "$rpc_url" "$address")
    if [[ $? -ne 0 ]]; then
        exit 1
    fi
    
    local initial_balance_hex=$(echo "$initial_balance_result" | cut -d',' -f1)
    local initial_balance_decimal=$(echo "$initial_balance_result" | cut -d',' -f2)
    
    log_success "Initial balance: $initial_balance_decimal BTF"
    
    # Mint tokens
    local tx_hash=$(mint_native_tokens "$rpc_url" "$address" "$amount")
    if [[ $? -ne 0 ]]; then
        exit 1
    fi
    
    # Wait a moment for the transaction to be processed
    log_info "Waiting 5 seconds for transaction processing..."
    sleep 5
    
    # Get final balance
    local final_balance_result=$(get_balance "$rpc_url" "$address")
    if [[ $? -ne 0 ]]; then
        log_warning "Could not verify final balance, but minting may have been successful"
        exit 0
    fi
    
    local final_balance_hex=$(echo "$final_balance_result" | cut -d',' -f1)
    local final_balance_decimal=$(echo "$final_balance_result" | cut -d',' -f2)
    
    # Calculate balance increase
    local balance_increase=$(echo "scale=6; $final_balance_decimal - $initial_balance_decimal" | bc -l)
    
    echo ""
    log_info "📈 Minting Summary:"
    echo "   Initial Balance: $initial_balance_decimal BTF"
    echo "   Final Balance: $final_balance_decimal BTF"
    echo "   Balance Increase: $balance_increase BTF"
    echo "   Transaction: $explorer_url/tx/$tx_hash"
    
    # Verify minting success
    local expected_increase=$(echo "scale=6; $amount" | bc -l)
    local diff=$(echo "scale=6; $balance_increase - $expected_increase" | bc -l | sed 's/^-//')
    
    if (( $(echo "$diff < 0.000001" | bc -l) )); then
        log_success "Minting verified successfully!"
    else
        log_warning "Balance increase doesn't match expected amount"
    fi
}

# Run main function with all arguments
main "$@"
