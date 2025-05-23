import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { FiPenTool, FiX, FiImage } from "react-icons/fi";
import Image from "next/image";
import AvatarImageSelector from "./AvatarImageSelector";

export default function AvatarForm({
  isLoading,
  isEditing,
  formData,
  setFormData,
  onChange,
  onSwitchChange,
  onSubmit,
  onCancel,
  onSelectFromGallery
}) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden create-avatar-section">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-800/20">
        <CardTitle className="text-slate-800 dark:text-slate-200">
          {isEditing ? "Edit Avatar" : "Create New Avatar"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {isEditing
            ? "Update your avatar's details"
            : "Create a new character avatar for your AI chats"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <NameField 
            value={formData.name} 
            onChange={onChange} 
            disabled={isLoading} 
          />
          
          <DescriptionField 
            value={formData.description} 
            onChange={onChange} 
            disabled={isLoading} 
          />
          
          <StoryField 
            value={formData.story} 
            onChange={onChange} 
            disabled={isLoading} 
          />
          
          <PersonaField 
            value={formData.persona} 
            onChange={onChange} 
            disabled={isLoading} 
          />
          
          <CreatorField 
            value={formData.creatorNickname} 
            onChange={onChange} 
            disabled={isLoading} 
          />
          
          <AvatarImageSelector
            profileImageUrl={formData.profileImageUrl}
            setFormData={setFormData}
            onSelectFromGallery={onSelectFromGallery}
            isLoading={isLoading}
          />

          <PublicToggle 
            isPublic={formData.isPublic} 
            onSwitchChange={onSwitchChange} 
            disabled={isLoading} 
          />
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50/80 dark:bg-slate-800/20">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <FiX className="w-4 h-4 mr-2" />
          Cancel
        </Button>

        <Button 
          type="submit" 
          onClick={onSubmit} 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </div>
          ) : (
            <div className="flex items-center">
              <FiPenTool className="w-4 h-4 mr-2" />
              {isEditing ? "Update Avatar" : "Create Avatar"}
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function NameField({ value, onChange, disabled }) {
  return (
    <div className="space-y-2 form-section">
      <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
        Name
      </Label>
      <Input
        id="name"
        name="name"
        value={value}
        onChange={onChange}
        placeholder="Character name"
        disabled={disabled}
        required
        className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 form-field-animation"
      />
    </div>
  );
}

function DescriptionField({ value, onChange, disabled }) {
  return (
    <div className="space-y-2 form-section">
      <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">
        Description
      </Label>
      <Textarea
        id="description"
        name="description"
        value={value}
        onChange={onChange}
        placeholder="A brief description of the character"
        disabled={disabled}
        required
        rows={2}
        className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 form-field-animation"
      />
    </div>
  );
}

function StoryField({ value, onChange, disabled }) {
  return (
    <div className="space-y-2 form-section">
      <Label htmlFor="story" className="text-slate-700 dark:text-slate-300 font-medium">
        Background Story
      </Label>
      <Textarea
        id="story"
        name="story"
        value={value}
        onChange={onChange}
        placeholder="The character's background story and history"
        disabled={disabled}
        required
        rows={4}
        className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 form-field-animation"
      />
    </div>
  );
}

function PersonaField({ value, onChange, disabled }) {
  return (
    <div className="space-y-2 form-section">
      <Label htmlFor="persona" className="text-slate-700 dark:text-slate-300 font-medium">
        Persona
      </Label>
      <Textarea
        id="persona"
        name="persona"
        value={value}
        onChange={onChange}
        placeholder="How the character speaks, behaves, and their personality traits"
        disabled={disabled}
        required
        rows={4}
        className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 form-field-animation"
      />
    </div>
  );
}

function CreatorField({ value, onChange, disabled }) {
  return (
    <div className="space-y-2 form-section">
      <Label htmlFor="creatorNickname" className="text-slate-700 dark:text-slate-300 font-medium">
        Creator Nickname (Optional)
      </Label>
      <Input
        id="creatorNickname"
        name="creatorNickname"
        value={value}
        onChange={onChange}
        placeholder="Your nickname as the creator of this character"
        disabled={disabled}
        className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 form-field-animation"
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This will be displayed on the character's details page if the
        character is public.
      </p>
    </div>
  );
}

function PublicToggle({ isPublic, onSwitchChange, disabled }) {
  return (
    <div className="flex items-center space-x-3 py-4 px-1 border-t border-slate-200 dark:border-slate-700/60 form-section">
      <Switch
        id="isPublic"
        checked={isPublic}
        onCheckedChange={onSwitchChange}
        disabled={disabled}
        className="data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
      />
      <div>
        <Label htmlFor="isPublic" className="text-slate-700 dark:text-slate-300 font-medium">
          Share on Marketplace
        </Label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Make your avatar available to other users in the marketplace
        </p>
      </div>
    </div>
  );
}
