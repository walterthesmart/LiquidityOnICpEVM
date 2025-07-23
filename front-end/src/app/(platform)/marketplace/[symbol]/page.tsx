/**
 * Stock Detail Page - Completely Redesigned
 *
 * Professional stock detail page inspired by TradingView demo page design.
 * Features comprehensive TradingView widgets for symbol info, charts,
 * technical analysis, company profile, and news timeline.
 *
 * @author Augment Agent
 */
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Info } from "lucide-react";
import { Suspense } from "react";
import getPriceChartData from "@/server-actions/stocks/get_price_chart_data";
import { getStockBySymbol } from "@/server-actions/stocks/getStocks";
import { BuyStocksForm } from "../_components/buy-stocks-form";

// TradingView Widgets
import TradingViewWidget from "@/components/TradingViewWidget";
import TradingViewSymbolInfoWidget from "@/components/TradingViewSymbolInfoWidget";
import TradingViewCompanyProfileWidget from "@/components/TradingViewCompanyProfileWidget";
import TradingViewTimelineWidget from "@/components/TradingViewTimelineWidget";
import TradingViewTechnicalAnalysisWidget from "@/components/TradingViewTechnicalAnalysisWidget";
import TradingViewNewsTimelineWidget from "@/components/TradingViewNewsTimelineWidget";
import TradingViewTickerWidget from "@/components/TradingViewTickerWidget";
import TradingViewErrorBoundary from "@/components/TradingViewErrorBoundary";

//interface for data returned by getStockBySymbol
// interface stockSymbolData {
//   id: number,
//   symbol: string,
//   name: string,
//   price: number,
//   change: number,
//   tokenID: number,
// };

export default async function StockDetail({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  if (!symbol) {
    return (
      <div className="h-screen flex justify-center items-center">
        Stock not found
      </div>
    );
  } // In a real app, you would fetch this based on symbol

  const _data = await getPriceChartData(symbol); // eslint-disable-line @typescript-eslint/no-unused-vars

  const stockSymbol = await getStockBySymbol(symbol);
  const stock = {
    ...stockSymbol,
    description: `${stockSymbol?.name} is a revolutionary company`,
    exchange: `${stockSymbol?.symbol}-NSE`,
    supply: 100000,
    borrow: 50000,
    utilizationRate: 10,
  };

  if (!stockSymbol) {
    return (
      <div className="h-screen flex justify-center items-center">
        Stock not found
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Ticker Tape Widget - Full Width */}
      <div className="w-full bg-white border-b">
        <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse" />}>
          <TradingViewTickerWidget />
        </Suspense>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Header Section with Symbol Info */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Company Name and Basic Info */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {stockSymbol.name}
                  </h1>
                  <span className="text-lg text-gray-600">
                    ({stockSymbol.symbol})
                  </span>
                  <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {stock.exchange}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ₦{stockSymbol.price.toFixed(2)}
                  </span>
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      stockSymbol.change >= 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {stockSymbol.change >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {stockSymbol.change >= 0 ? "+" : ""}
                      {stockSymbol.change.toFixed(2)} (
                      {stockSymbol.change.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Symbol Information Widget */}
            <div className="lg:w-96">
              <TradingViewErrorBoundary
                widgetName="Symbol Info"
                symbol={symbol}
              >
                <Suspense
                  fallback={
                    <div className="h-32 bg-white rounded-lg animate-pulse" />
                  }
                >
                  <TradingViewSymbolInfoWidget
                    symbol={symbol}
                    className="shadow-sm"
                  />
                </Suspense>
              </TradingViewErrorBoundary>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="text-xs text-gray-500 flex items-center font-medium">
                <span>TOTAL SUPPLY</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {stock.supply.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stock.exchange}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="text-xs text-gray-500 flex items-center font-medium">
                <span>TOTAL BORROW</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {stock.borrow.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stock.exchange}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="text-xs text-gray-500 flex items-center font-medium">
                <span>SUPPLY APY</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-blue-600">
                {stockSymbol.change}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="text-xs text-gray-500 flex items-center font-medium">
                <span>UTILIZATION RATE</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {stock.utilizationRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Charts and Analysis */}
          <div className="xl:col-span-3 space-y-6">
            {/* Advanced Chart Widget */}
            <div className="bg-white rounded-lg shadow-sm">
              <TradingViewErrorBoundary
                widgetName="Advanced Chart"
                symbol={symbol}
              >
                <Suspense
                  fallback={
                    <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
                  }
                >
                  <TradingViewWidget
                    symbol={symbol}
                    height="500px"
                    width="100%"
                    title={`${stockSymbol.name} (${stockSymbol.symbol})`}
                    className="rounded-lg"
                    interval="D"
                    allowSymbolChange={true}
                    hideToolbar={false}
                    studies={[]}
                  />
                </Suspense>
              </TradingViewErrorBoundary>
            </div>

            {/* Technical Analysis and Company Profile Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technical Analysis */}
              <TradingViewErrorBoundary
                widgetName="Technical Analysis"
                symbol={symbol}
              >
                <Suspense
                  fallback={
                    <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse" />
                  }
                >
                  <TradingViewTechnicalAnalysisWidget
                    symbol={symbol}
                    className="shadow-sm"
                    height="450px"
                    width="100%"
                    showIntervalTabs={true}
                  />
                </Suspense>
              </TradingViewErrorBoundary>

              {/* Company Profile */}
              <TradingViewErrorBoundary
                widgetName="Company Profile"
                symbol={symbol}
              >
                <Suspense
                  fallback={
                    <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse" />
                  }
                >
                  <TradingViewCompanyProfileWidget
                    symbol={symbol}
                    className="shadow-sm"
                    height="450px"
                    width="100%"
                  />
                </Suspense>
              </TradingViewErrorBoundary>
            </div>

            {/* News and Fundamental Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market News Timeline */}
              <TradingViewErrorBoundary
                widgetName="News Timeline"
                symbol={symbol}
              >
                <Suspense
                  fallback={
                    <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse" />
                  }
                >
                  <TradingViewNewsTimelineWidget
                    symbol={symbol}
                    newsType="symbol"
                    className="shadow-sm"
                    height="500px"
                    width="100%"
                  />
                </Suspense>
              </TradingViewErrorBoundary>

              {/* Fundamental Analysis Timeline */}
              <TradingViewErrorBoundary
                widgetName="Fundamental Analysis"
                symbol={symbol}
              >
                <Suspense
                  fallback={
                    <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse" />
                  }
                >
                  <TradingViewTimelineWidget
                    symbol={symbol}
                    feedMode="market"
                    market="nigeria"
                    className="shadow-sm"
                    height="500px"
                    width="100%"
                    title="Fundamental Analysis"
                    displayMode="adaptive"
                  />
                </Suspense>
              </TradingViewErrorBoundary>
            </div>
          </div>

          {/* Right Column - Trading Form */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <BuyStocksForm entry={stockSymbol} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
