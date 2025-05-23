export default function AvatarFormTips() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800/30 p-6 create-avatar-section">
      <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tips for a Great Avatar
      </h3>
      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1.5 list-disc pl-5">
        <li>Create a detailed background story to give your avatar depth</li>
        <li>Define clear personality traits and speaking style</li>
        <li>Choose an image that captures your avatar's essence</li>
        <li>Share your avatar on the marketplace for others to enjoy</li>
      </ul>
    </div>
  );
}
