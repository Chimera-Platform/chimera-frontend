import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FiMessageCircle, FiMessageSquare } from "react-icons/fi";
import { useChat } from "@/context/ChatContext";
import { useAvatar } from "@/context/AvatarContext";
import { toast } from "sonner";

export function ChatStats({ chatsCount = 0, messagesCount = 0 }) {
  const router = useRouter();
  const { selectChat, setManualChatReset } = useChat();
  const { selectedAvatar } = useAvatar();

  const handleStartChat = () => {
    // Check if avatar is selected
    if (!selectedAvatar) {
      toast.error("Please select an avatar first");
      return;
    }

    // First reset the current chat to ensure we get the welcome screen
    setManualChatReset(true);
    selectChat(null);
    
    // Add a small delay to ensure state is updated before navigation
    setTimeout(() => {
      // Navigate to clean chat URL to show welcome screen
      router.push('/chat');
      
      // Reset the manual reset flag after navigation
      setTimeout(() => {
        setManualChatReset(false);
      }, 300);
    }, 50);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/40">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          <div className="flex items-center">
            <FiMessageCircle className="w-4 h-4 text-violet-500 mr-2" />
            Chat Statistics
          </div>
        </h2>
      </div>
      
      <div className="flex-grow flex flex-col justify-center p-3">
        <div className="grid grid-cols-2 gap-3 mb-auto">
          {/* Total Chats Card */}
          <div className="border border-violet-100 dark:border-violet-800/30 rounded-lg p-2 flex items-center">
            <div className="w-8 h-8 rounded-md bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mr-2">
              <FiMessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-violet-600 dark:text-violet-300 mb-0.5">Total Chats</p>
              <h3 className="text-lg font-bold text-violet-700 dark:text-violet-400 leading-none">
                {chatsCount}
              </h3>
            </div>
          </div>
          
          {/* Total Messages Card */}
          <div className="border border-emerald-100 dark:border-emerald-800/30 rounded-lg p-2 flex items-center">
            <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mr-2">
              <FiMessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-300 mb-0.5">Total Messages</p>
              <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                {messagesCount}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Start New Chat Button */}
      <div className="p-3 pt-0 mt-auto">
        <Button
          className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white"
          size="sm"
          onClick={handleStartChat}
        >
          <FiMessageSquare className="w-3.5 h-3.5 mr-1.5" />
          Start New Chat
        </Button>
      </div>
    </div>
  );
}
