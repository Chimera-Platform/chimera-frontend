import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";

export function BackHeader({ title, onBack = null }) {
  const router = useRouter();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        onClick={handleBack} 
        className="mr-2 hover:bg-slate-100 dark:hover:bg-slate-800/60"
      >
        <FiArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h1>
    </div>
  );
}
