export default function AvatarFormHeader({ isEditing }) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 p-6 create-avatar-section">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {isEditing ? "Update Your Avatar" : "Design Your Avatar"}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {isEditing 
          ? "Update your avatar's details below. Each field helps define your character's personality and appearance."
          : "Fill in the details below to create a unique character. Be creative with the backstory and personality!"}
      </p>
    </div>
  );
}
