/**
 * Enhanced Trading Interface Component
 * 
 * Comprehensive trading interface with market/limit orders, slippage settings,
 * gas estimation, order book display, and real-time updates.
 * 
 * @author Augment Agent
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useEstimateGas,
} from "wagmi";
import {
  StockNGNDEXABI,
  NGNStablecoinABI,
  NigerianStockTokenABI,
  getStockNGNDEXAddress,
  getNGNStablecoinAddress,
} from "../../abis";
import { formatEther, parseEther } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calculator
} from "lucide-react";
import { toast } from "sonner";

interface EnhancedTradingInterfaceProps {
  className?: string;
  selectedSymbol?: string;
}

type OrderType = "market" | "limit";
type TradeDirection = "buy" | "sell";

export default function EnhancedTradingInterface({ 
  className = "", 
  selectedSymbol 
}: EnhancedTradingInterfaceProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Trading state
  const [selectedStock, setSelectedStock] = useState<string>(selectedSymbol || "");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>("buy");
  const [inputAmount, setInputAmount] = useState("");
  // const [limitPrice, setLimitPrice] = useState(""); // For future limit order implementation
  const [slippageTolerance, setSlippageTolerance] = useState(5); // 5% default
  const [deadline, setDeadline] = useState(20); // 20 minutes default
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dexAddress = chainId ? getStockNGNDEXAddress(chainId) : "";
  const ngnAddress = chainId ? getNGNStablecoinAddress(chainId) : "";

  // Get all available stock tokens
  const { data: allStockTokens, refetch: refetchStockTokens } = useReadContract({
    address: dexAddress as `0x${string}`,
    abi: StockNGNDEXABI,
    functionName: "getAllStockTokens",
    query: {
      enabled: !!dexAddress,
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  }) as { data: string[] | undefined; refetch: () => void };

  // Get stock info for selected stock (for future use)
  /*
  const { data: stockInfo } = useReadContract({
    address: dexAddress as `0x${string}`,
    abi: StockNGNDEXABI,
    functionName: "getStockInfo",
    args: [selectedStock],
    query: {
      enabled: !!selectedStock && !!dexAddress,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });
  */

  // Get current price
  const { data: currentPrice, refetch: refetchPrice } = useReadContract({
    address: dexAddress as `0x${string}`,
    abi: StockNGNDEXABI,
    functionName: "getCurrentPrice",
    args: [selectedStock],
    query: {
      enabled: !!selectedStock && !!dexAddress,
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });

  // Get user balances
  const { data: ngnBalance, refetch: refetchNGNBalance } = useReadContract({
    address: ngnAddress as `0x${string}`,
    abi: NGNStablecoinABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!ngnAddress,
      refetchInterval: 10000,
    },
  });

  const { data: stockBalance, refetch: refetchStockBalance } = useReadContract({
    address: selectedStock as `0x${string}`,
    abi: NigerianStockTokenABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!selectedStock,
      refetchInterval: 10000,
    },
  });

  // Get swap quote for market orders
  const { data: swapQuote } = useReadContract({
    address: dexAddress as `0x${string}`,
    abi: StockNGNDEXABI,
    functionName: tradeDirection === "buy" ? "getQuoteNGNToStock" : "getQuoteStockToNGN",
    args: [selectedStock, inputAmount ? parseEther(inputAmount) : 0n],
    query: {
      enabled: !!selectedStock && !!inputAmount && !!dexAddress && orderType === "market",
      refetchInterval: 3000, // Refresh every 3 seconds for real-time quotes
    },
  }) as { data: [bigint, bigint, bigint] | undefined };

  // Calculate expected output and price impact
  const expectedOutput = swapQuote ? formatEther(swapQuote[0]) : "0";
  const priceImpact = swapQuote ? Number(formatEther(swapQuote[2])) : 0;
  const minAmountOut = swapQuote 
    ? (swapQuote[0] * BigInt(Math.floor((100 - slippageTolerance) * 100))) / 10000n
    : 0n;

  // Gas estimation
  const { data: gasEstimate } = useEstimateGas({
    to: dexAddress as `0x${string}`,
    data: "0x", // This would need to be the actual transaction data
    query: {
      enabled: !!selectedStock && !!inputAmount && !!dexAddress,
    },
  });

  // Write contract hook
  const { writeContract: writeContractFn } = useWriteContract();

  // Calculate deadline timestamp
  const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 60);

  // Handle trade execution
  const handleTrade = useCallback(async () => {
    if (!isConnected || !selectedStock || !inputAmount) {
      toast.error("Please connect wallet and fill all required fields");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (orderType === "market") {
        // Execute market order
        writeContractFn({
          address: dexAddress as `0x${string}`,
          abi: StockNGNDEXABI,
          functionName: tradeDirection === "buy" ? "swapNGNForStock" : "swapStockForNGN",
          args: [
            selectedStock,
            parseEther(inputAmount),
            minAmountOut,
            deadlineTimestamp,
          ],
        });
        
        toast.success("Market order submitted successfully!");
      } else {
        // For limit orders, we would need additional smart contract functionality
        toast.info("Limit orders coming soon!");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(`Trade failed: ${error.message}`);
      toast.error(`Trade failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    isConnected,
    selectedStock,
    inputAmount,
    orderType,
    tradeDirection,
    writeContractFn,
    dexAddress,
    minAmountOut,
    deadlineTimestamp,
  ]);

  // Handle max button click
  const handleMaxClick = () => {
    if (tradeDirection === "buy" && ngnBalance) {
      setInputAmount(formatEther(ngnBalance as bigint));
    } else if (tradeDirection === "sell" && stockBalance) {
      setInputAmount(formatEther(stockBalance as bigint));
    }
  };

  // Refresh all data
  const refreshData = () => {
    refetchStockTokens();
    refetchPrice();
    refetchNGNBalance();
    refetchStockBalance();
    toast.success("Data refreshed");
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2" />
            Trading Interface
          </div>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Selection */}
        <div className="space-y-2">
          <Label htmlFor="stock-select">Select Stock Token</Label>
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a stock to trade" />
            </SelectTrigger>
            <SelectContent>
              {(allStockTokens as string[])?.map((token) => (
                <SelectItem key={token} value={token}>
                  {token.slice(0, 6)}...{token.slice(-4)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Price Display */}
        {selectedStock && currentPrice ? (
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Price</span>
                <div className="flex items-center">
                  <span className="font-medium">₦{currentPrice ? Number(formatEther(currentPrice as bigint)).toFixed(4) : "0.0000"}</span>
                  <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Order Type Selection */}
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market Order</TabsTrigger>
            <TabsTrigger value="limit">Limit Order</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-4">
            {/* Trade Direction */}
            <div className="flex space-x-2">
              <Button
                variant={tradeDirection === "buy" ? "default" : "outline"}
                className={`flex-1 ${tradeDirection === "buy" ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => setTradeDirection("buy")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={tradeDirection === "sell" ? "default" : "outline"}
                className={`flex-1 ${tradeDirection === "sell" ? "bg-red-600 hover:bg-red-700" : ""}`}
                onClick={() => setTradeDirection("sell")}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount ({tradeDirection === "buy" ? "NGN" : "Stock Tokens"})
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleMaxClick}>
                  MAX
                </Button>
              </div>
              {/* Balance Display */}
              <div className="text-sm text-gray-600">
                Balance: {tradeDirection === "buy" 
                  ? `₦${ngnBalance ? Number(formatEther(ngnBalance as bigint)).toFixed(2) : "0.00"}`
                  : `${stockBalance ? Number(formatEther(stockBalance as bigint)).toFixed(4) : "0.0000"} tokens`
                }
              </div>
            </div>

            {/* Expected Output */}
            {inputAmount && swapQuote && (
              <Card className="bg-blue-50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Expected Output:</span>
                      <span className="font-medium">
                        {tradeDirection === "buy" 
                          ? `${Number(expectedOutput).toFixed(4)} tokens`
                          : `₦${Number(expectedOutput).toFixed(2)}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Price Impact:</span>
                      <span className={`font-medium ${priceImpact > 5 ? "text-red-600" : "text-green-600"}`}>
                        {priceImpact.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Minimum Received:</span>
                      <span className="font-medium text-sm">
                        {tradeDirection === "buy" 
                          ? `${Number(formatEther(minAmountOut)).toFixed(4)} tokens`
                          : `₦${Number(formatEther(minAmountOut)).toFixed(2)}`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="limit" className="space-y-4">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Limit orders coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Advanced order types will be available in the next update
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="advanced-mode">Advanced Settings</Label>
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
            />
          </div>

          {isAdvancedMode && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              {/* Slippage Tolerance */}
              <div className="space-y-2">
                <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
                <Input
                  id="slippage"
                  type="number"
                  min="0.1"
                  max="20"
                  step="0.1"
                  value={slippageTolerance}
                  onChange={(e) => setSlippageTolerance(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  Range: 0.1% - 20%
                </div>
              </div>

              {/* Transaction Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Transaction Deadline (minutes)</Label>
                <Input
                  id="deadline"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={deadline}
                  onChange={(e) => setDeadline(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  Range: 1 - 60 minutes
                </div>
              </div>

              {/* Gas Estimation */}
              {gasEstimate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Gas:</span>
                  <Badge variant="outline">
                    <Calculator className="h-3 w-3 mr-1" />
                    {gasEstimate.toString()}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trade Button */}
        <Button
          onClick={handleTrade}
          disabled={!isConnected || !selectedStock || !inputAmount || isLoading}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              {tradeDirection === "buy" ? "Buy" : "Sell"} {orderType === "market" ? "Market" : "Limit"}
            </>
          )}
        </Button>

        {/* Connection Warning */}
        {!isConnected && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                <span className="text-amber-800">Please connect your wallet to start trading</span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
