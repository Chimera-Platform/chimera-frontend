import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FiCreditCard } from "react-icons/fi";
import { useCredits } from "@/context/CreditsContext";

export function CreditsCard() {
  const router = useRouter();
  const { credits, loading, error, refreshCredits } = useCredits();
  
  // Calculate remaining credits
  const remainingCredits = credits?.data ? 
    (credits.data.total_credits - credits.data.total_usage).toFixed(2) : 
    null;
  
  // Calculate usage percentage
  const usagePercentage = credits?.data && credits.data.total_credits > 0 ? 
    Math.min(100, ((credits.data.total_usage / credits.data.total_credits) * 100).toFixed(1)) : 
    "0.0";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <FiCreditCard className="w-5 h-5 text-emerald-500 mr-2" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          OpenRouter Credits
        </h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => router.push("/chat")}
          >
            Set API Key
          </Button>
        </div>
      ) : credits?.data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Credits</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {credits.data.total_credits.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400">Used Credits</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {credits.data.total_usage.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Remaining</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {remainingCredits}
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <div className="flex items-center">
                <span className="text-slate-600 dark:text-slate-400">Credits Usage</span>
                <span className="text-slate-600 dark:text-slate-400 ml-2 font-medium">({usagePercentage}%)</span>
              </div>
              <Button 
                variant="link" 
                className="text-emerald-600 dark:text-emerald-400 p-0 h-auto"
                onClick={() => window.open("https://openrouter.ai/account", "_blank")}
              >
                Buy more credits →
              </Button>
            </div>
            <Progress value={parseFloat(usagePercentage)} className="h-2" />
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-slate-500 dark:text-slate-400">No credit information available</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => router.push("/chat")}
          >
            Set API Key
          </Button>
        </div>
      )}
    </div>
  );
}
