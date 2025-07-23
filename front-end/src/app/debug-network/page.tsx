import { NetworkDebugChecker } from "@/components/debug-network-checker";

export default function DebugNetworkPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Network Debug Dashboard</h1>
        <NetworkDebugChecker />
      </div>
    </div>
  );
}
