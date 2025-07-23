import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAccount, useChainId } from "wagmi";
import { NGNWallet } from "../components/NGNStablecoin";
import { StockNGNTrader, DEXDashboard } from "../components/DEX";
import { ConnectWallet } from "../components/ConnectWallet";
import { formatNetworkName } from "../lib/bitfinity-config";

const DEXPage: React.FC = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [activeTab, setActiveTab] = useState<"dashboard" | "trade" | "wallet">(
    "dashboard",
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "trade", label: "Trade", icon: "🔄" },
    { id: "wallet", label: "NGN Wallet", icon: "💰" },
  ];

  return (
    <>
      <Helmet>
        <title>DEX - Nigerian Stock Exchange</title>
        <meta
          name="description"
          content="Trade Nigerian stocks with NGN stablecoin on our decentralized exchange"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Stock ↔ NGN DEX
                </h1>
                <p className="text-gray-600 mt-1">
                  Decentralized exchange for Nigerian stocks and NGN stablecoin
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {chainId && (
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatNetworkName(chainId)}
                    </span>
                  </div>
                )}
                <ConnectWallet />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "dashboard" | "trade" | "wallet")
                  }
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔗</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to start trading Nigerian stocks with NGN
                  stablecoin
                </p>
                <ConnectWallet />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <DEXDashboard />

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📈</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Market Overview
                          </h3>
                          <p className="text-gray-600">
                            Real-time trading data
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">💧</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Liquidity Pools
                          </h3>
                          <p className="text-gray-600">
                            Earn fees by providing liquidity
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Fast Swaps
                          </h3>
                          <p className="text-gray-600">
                            Instant token exchanges
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trade Tab */}
              {activeTab === "trade" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <StockNGNTrader />
                  </div>
                  <div className="space-y-6">
                    <NGNWallet />

                    {/* Trading Tips */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Trading Tips
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs">💡</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Check price impact before large trades to avoid
                            slippage
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-xs">⚡</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Set appropriate slippage tolerance for volatile
                            markets
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-600 text-xs">🔒</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Always approve tokens before trading for security
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Tab */}
              {activeTab === "wallet" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <NGNWallet />

                  <div className="space-y-6">
                    {/* Transaction History */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Transactions
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-xs">↗</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Sent NGN
                              </p>
                              <p className="text-xs text-gray-500">
                                2 hours ago
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-red-600">
                            -₦1,000.00
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs">🔄</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Swapped DANGCEM
                              </p>
                              <p className="text-xs text-gray-500">1 day ago</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            +₦2,500.00
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-xs">
                                ↙
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Received NGN
                              </p>
                              <p className="text-xs text-gray-500">
                                3 days ago
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            +₦5,000.00
                          </span>
                        </div>
                      </div>

                      <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View All Transactions
                      </button>
                    </div>

                    {/* NGN Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        About NGN Stablecoin
                      </h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <p>
                          NGN is a stablecoin pegged to the Nigerian Naira,
                          designed for seamless trading of tokenized Nigerian
                          stocks.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-3">
                          <div>
                            <p className="font-medium text-gray-900">Type</p>
                            <p>ERC-20 Stablecoin</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Peg</p>
                            <p>1 NGN = 1 ₦</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Use Case
                            </p>
                            <p>Stock Trading</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Network</p>
                            <p>{formatNetworkName(chainId)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>
                © 2024 Nigerian Stock Exchange DEX. Built with security and
                transparency in mind.
              </p>
              <div className="flex justify-center space-x-6 mt-4">
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Documentation
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Security
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Support
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default DEXPage;
