"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";

// Modülerleştirilmiş bileşenler
import AvatarFormHeader from "@/components/avatar/AvatarFormHeader";
import AvatarForm from "@/components/avatar/AvatarForm";
import AvatarFormTips from "@/components/avatar/AvatarFormTips";
import { useAvatarForm } from "@/hooks/useAvatarForm";

// Styles
import "../dashboard/styles.css";
import "./styles.css";

export default function CreateAvatarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  
  const {
    isLoading,
    isEditing,
    formData,
    setFormData,
    loadAvatarForEditing,
    handleChange,
    handleSwitchChange,
    handleSubmit,
    handleSelectFromGallery,
    handleImageSelected
  } = useAvatarForm(editId, router);

  // Load avatar data if editing
  useEffect(() => {
    if (editId) {
      loadAvatarForEditing(editId);
    }
  }, [editId, loadAvatarForEditing]);

  // Check if image URL is from the search params or localStorage (coming back from gallery)
  useEffect(() => {
    handleImageSelected(searchParams);
  }, [searchParams, handleImageSelected]);

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardShell 
      activePage="create-avatar"
      title={isEditing ? "Edit Avatar" : "Create New Avatar"}
    >
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <AvatarFormHeader isEditing={isEditing} />
        
        <AvatarForm
          isLoading={isLoading}
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          onChange={handleChange}
          onSwitchChange={handleSwitchChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onSelectFromGallery={handleSelectFromGallery}
        />
        
        <AvatarFormTips />
      </div>
    </DashboardShell>
  );
}
