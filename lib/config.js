// Whether Firebase Storage features (profile photo upload, save-to-gallery,
// inpaint upload) are enabled. Disabled by setting
// NEXT_PUBLIC_STORAGE_ENABLED=false (e.g. portfolio/demo deployments).
export const STORAGE_ENABLED =
  process.env.NEXT_PUBLIC_STORAGE_ENABLED !== "false";

// User-facing message shown when a storage-dependent action is attempted while
// storage is disabled.
export const STORAGE_DISABLED_MESSAGE =
  "This feature is disabled in the demo deployment.";

// Bundled avatar images offered when storage is disabled (image upload off), so
// users can still pick a character image without uploading. Paths are under public/.
export const PRESET_AVATARS = [
  "/images/AnimeGirl.webp",
  "/images/ChatGPTGirlFriend.webp",
  "/images/EmirHoca.jpg",
  "/images/ErenKacar.webp",
  "/images/default-avatar.png",
];
