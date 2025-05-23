import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAvatar } from "@/context/AvatarContext";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ModelSelector } from "./ModelSelector";
import { MultiAvatarSelector } from "@/components/MultiAvatarSelector";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiUsers } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // AnimatePresence ekledik

// Tab içeriği için animasyon varyantları - daha belirgin kayma efekti
const tabContentVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 250 : -250,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 250 : -250,
    opacity: 0,
  }),
};

// Geçiş animasyonu ayarları - geri tepme yok
const transition = {
  type: "tween", // Spring yerine tween kullanıldı (geri tepme yok)
  ease: "easeInOut", // Yumuşak geçiş
  duration: 0.2 // Daha hızlı
};

export function ChatWelcomeScreen({ sidebarOpen, onToggleSidebar }) {
  const { user } = useAuth();
  const { selectedAvatar, selectedAvatars = [], clearSelectedAvatars } = useAvatar();
  const { selectedModel, createChat } = useChat();
  const router = useRouter();
  const [isMultiAvatarDialogOpen, setIsMultiAvatarDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("single");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [direction, setDirection] = useState(0); // Geçiş yönünü izlemek için

  // Sekme değişimi sırasında yönü belirle
  const handleTabChange = (newTab) => {
    const dir = newTab === "single" ? -1 : 1;
    setDirection(dir);
    setSelectedTab(newTab);
  };

  const handleStartConversation = async () => {
    console.log("Starting conversation with:", { 
      selectedTab,
      selectedAvatar: selectedAvatar?.id, 
      selectedAvatars: selectedAvatars?.map(a => a?.id), 
      modelId: selectedModel?.id 
    });
    
    // Check if we have either single avatar or multiple avatars selected
    const hasSelection = selectedTab === "single" 
      ? !!selectedAvatar 
      : (selectedAvatars && selectedAvatars.length > 0);
      
    if (!hasSelection) {
      toast.error("Please select at least one character");
      return;
    }

    // Check if model is selected
    if (!selectedModel) {
      toast.error("Please select a model first");
      return;
    }

    // Set loading state to true before creating chat
    setIsCreatingChat(true);

    // Store the toast ID so we can dismiss it explicitly
    const loadingToastId = toast.loading("Creating your conversation...");

    // Create a new chat with a default greeting
    try {
      // Prepare the request based on the selection mode
      const chatRequest = {
        message: "",  // Empty string for message - starting with a blank slate
        modelId: selectedModel.id,
      };
      
      if (selectedTab === "single") {
        // Single avatar mode
        chatRequest.avatarId = selectedAvatar.id;
      } else {
        // Multi avatar mode - explicitly pass the avatar IDs in the request
        chatRequest.avatarIds = selectedAvatars.map(avatar => avatar.id);
        // For backward compatibility, also set the first avatarId
        if (selectedAvatars.length > 0) {
          chatRequest.avatarId = selectedAvatars[0].id;
        }
      }
      
      const chat = await createChat(chatRequest);
      
      // Explicitly dismiss the loading toast before showing success/error
      toast.dismiss(loadingToastId);
      
      if (!chat) {
        console.error("Failed to create chat");
        toast.error("Failed to create chat");
      } else {
        // Show success notification
        toast.success("Conversation created successfully!");
        
        // Yeni URL formatını kullan
        router.push(`/chat/${chat.id}`);
      }
    } catch (error) {
      // Explicitly dismiss the loading toast before showing error
      toast.dismiss(loadingToastId);
      
      console.error("Error creating chat:", error);
      toast.error("Error creating chat");
    } finally {
      // Always set loading state back to false when done
      setIsCreatingChat(false);
    }
  };

  const handleOpenMultiAvatarSelector = () => {
    console.log("Opening multi-avatar selector dialog");
    setIsMultiAvatarDialogOpen(true);
  };

  const handleCloseMultiAvatarSelector = () => {
    console.log("Closing multi-avatar selector dialog");
    setIsMultiAvatarDialogOpen(false);
  };

  const handleMultiAvatarSelectComplete = (selectedAvatars) => {
    console.log("Multi-avatar selection complete:", selectedAvatars?.map(a => a?.id));
    setIsMultiAvatarDialogOpen(false);
  };

  const displayName = user?.displayName || "Guest";

  // Determine button disabled state
  const isButtonDisabled = isCreatingChat || 
                        (selectedTab === "single" && !selectedAvatar) || 
                        (selectedTab === "multi" && (!selectedAvatars || selectedAvatars.length === 0)) || 
                        !selectedModel;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 relative">
      {/* Add sidebar toggle button when sidebar is closed */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleSidebar(true)}
          className="absolute top-4 left-4 h-8 w-8 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          title="Show sidebar"
        >
          <ListBulletIcon className="h-5 w-5" />
          <span className="sr-only">Show sidebar</span>
        </Button>
      )}
      
      <div className="text-center max-w-2xl animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Hello, {displayName}
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Welcome to your personalized AI chat experience. To start a conversation, 
          you need to select a character and a language model.
        </p>
        
        <div className="mb-8 w-full max-w-lg mx-auto">
          <Tabs 
            value={selectedTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="single">Single Character</TabsTrigger>
              <TabsTrigger value="multi">Multiple Characters</TabsTrigger>
            </TabsList>
            
            <div className="relative overflow-hidden" style={{ minHeight: "280px" }}>
              <AnimatePresence custom={direction} mode="wait" initial={false}>
                {selectedTab === "single" ? (
                  <motion.div
                    key="single-tab"
                    custom={direction}
                    variants={tabContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    className="w-full absolute"
                  >
                    {/* Single tab content */}
                    {selectedAvatar ? (
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-200 dark:border-indigo-700 mb-3">
                          {selectedAvatar.profileImageUrl ? (
                            <Image
                              src={selectedAvatar.profileImageUrl}
                              alt={selectedAvatar.name}
                              fill
                              className="object-cover"
                              unoptimized={true}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
                              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                                {selectedAvatar.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">{selectedAvatar.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1 max-w-md">
                          {selectedAvatar.description}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md mb-6 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">No Character Selected</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          Please select a character to chat with.
                        </p>
                        <Button 
                          onClick={() => router.push("/characters")}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        >
                          Choose a Character
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="multi-tab"
                    custom={direction}
                    variants={tabContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    className="w-full absolute"
                  >
                    {/* Multi tab content */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md mb-6 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">Group Conversation</h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {selectedAvatars?.length || 0} character{(selectedAvatars?.length || 0) !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      
                      {selectedAvatars && selectedAvatars.length > 0 ? (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedAvatars.map(avatar => (
                              <div key={avatar.id} className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 rounded-full pl-1 pr-3 py-1">
                                <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                  <Image
                                    src={avatar.profileImageUrl || "/placeholders/avatar-1.png"}
                                    alt={avatar.name}
                                    width={24}
                                    height={24}
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  {avatar.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            These characters will interact with each other and with you in a group conversation.
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                          No characters selected for group chat.
                        </p>
                      )}
                      
                      <Button
                        onClick={handleOpenMultiAvatarSelector}
                        className="w-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60"
                      >
                        <FiUsers className="mr-2 h-4 w-4" />
                        {selectedAvatars.length > 0 ? "Modify Selection" : "Select Characters"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md border border-slate-200 dark:border-slate-800 w-full">
            <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-3">Select a Model</h3>
            {/* Use the wide variant of ModelSelector */}
            <ModelSelector 
              variant="wide" 
              contentClassName="w-[400px] md:w-[450px] lg:w-[500px]" 
            />
          </div>
        </div>
        
        <Button
          onClick={handleStartConversation}
          disabled={isButtonDisabled}
          className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg px-8 py-3 shadow-md transition-all duration-200 hover:shadow-lg text-lg w-full max-w-xs
          ${isCreatingChat ? 'opacity-80 cursor-not-allowed' : ''}`}
        >
          {isCreatingChat ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Conversation...
            </div>
          ) : (
            "Start Conversation"
          )}
        </Button>
        
        {((!selectedAvatar && selectedTab === "single") || 
          ((selectedTab === "multi" && (!selectedAvatars || selectedAvatars.length === 0))) || 
          !selectedModel) && (
          <p className="text-amber-600 dark:text-amber-400 text-sm mt-4">
            {(selectedTab === "single" && !selectedAvatar) || (selectedTab === "multi" && (!selectedAvatars || selectedAvatars.length === 0))
              ? (!selectedModel ? "Please select both characters and a model" : "Please select characters to start chatting") 
              : "Please select a model to start chatting"
            }
          </p>
        )}
      </div>

      {/* Multi-avatar selection dialog */}
      <Dialog open={isMultiAvatarDialogOpen} onOpenChange={setIsMultiAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Characters for Group Chat</DialogTitle>
          </DialogHeader>
          <MultiAvatarSelector 
            onSelectComplete={handleMultiAvatarSelectComplete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
