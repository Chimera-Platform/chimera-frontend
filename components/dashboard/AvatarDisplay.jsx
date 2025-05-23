import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiUsers, FiPlus, FiCheck, FiUser } from "react-icons/fi";

export function AvatarDisplay({ userAvatars, selectedAvatar, onSelectAvatar }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          <div className="flex items-center">
            <FiUsers className="w-5 h-5 text-indigo-500 mr-2" />
            My Avatars
          </div>
        </h2>
        <Badge variant="secondary" className="px-2.5 py-0.5">
          {userAvatars?.length || 0} Total
        </Badge>
      </div>
      
      {userAvatars && userAvatars.length > 0 ? (
        <div className="relative pt-1 pb-2 px-0.5">
          <div className="overflow-x-auto pb-2 pl-0.5 hide-scrollbar">
            <div className="flex space-x-3 min-w-max pt-1 pl-0.5">
              {userAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="relative cursor-pointer transition-all duration-200"
                  onClick={() => onSelectAvatar(avatar)}
                >
                  <div 
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center transition-all duration-200 ${
                      selectedAvatar?.id === avatar.id 
                        ? 'shadow-[0_0_0_2px_rgba(99,102,241,0.6)]' 
                        : 'hover:shadow-[0_0_0_2px_rgba(99,102,241,0.4)] hover:shadow-md'
                    }`}
                    style={{
                      transform: selectedAvatar?.id === avatar.id ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <div 
                      className="w-full h-full transition-transform duration-200 hover:scale-105"
                      style={{
                        transformOrigin: 'center',
                      }}
                    >
                      {avatar.profileImageUrl ? (
                        <img 
                          src={avatar.profileImageUrl} 
                          alt={avatar.name || "Avatar"}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = `/placeholders/avatar-${Math.floor(Math.random() * 5) + 1}.png`;
                          }}
                        />
                      ) : avatar.imageUrl ? (
                        <img 
                          src={avatar.imageUrl} 
                          alt={avatar.name || "Avatar"}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = `/placeholders/avatar-${Math.floor(Math.random() * 5) + 1}.png`;
                          }}
                        />
                      ) : avatar.image ? (
                        <img 
                          src={avatar.image} 
                          alt={avatar.name || "Avatar"}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = `/placeholders/avatar-${Math.floor(Math.random() * 5) + 1}.png`;
                          }}
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            backgroundColor: avatar.color ? 
                              `rgba(${parseInt(avatar.color.slice(1, 3), 16)}, ${parseInt(avatar.color.slice(3, 5), 16)}, ${parseInt(avatar.color.slice(5, 7), 16)}, 0.2)` : 
                              (isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(99, 102, 241, 0.2)')
                          }}
                        >
                          <span className="text-xl font-medium text-slate-700 dark:text-slate-200">
                            {avatar.name ? avatar.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedAvatar?.id === avatar.id && (
                    <div className="absolute -top-0.5 -right-0.5 bg-indigo-500/80 backdrop-blur-sm rounded-full p-1 shadow-lg">
                      <FiCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-center truncate w-16 sm:w-20 text-slate-700 dark:text-slate-300">
                    {avatar.name || "Unnamed"}
                  </p>
                </div>
              ))}
              
              {/* Create New Avatar Button */}
              <div 
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                onClick={() => router.push('/create-avatar')}
              >
                <FiPlus className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">New</p>
              </div>
            </div>
          </div>
          {userAvatars.length > 4 && (
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
            <FiUser className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No Avatars Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Create your first avatar to start chatting</p>
          <Button
            size="sm"
            onClick={() => router.push('/create-avatar')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            <FiPlus className="w-4 h-4 mr-1" />
            Create Avatar
          </Button>
        </div>
      )}
    </div>
  );
}
