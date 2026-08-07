const baseImg_url = process.env.NEXT_PUBLIC_IMAGE_URL || "";
const base_AI_Img_url = process.env.NEXT_PUBLIC_AI_MEDIA_URL || "";

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http") || path.startsWith("/images/") || path.startsWith("data:")) return path;

  const cleanBase = baseImg_url.endsWith("/")
    ? baseImg_url.slice(0, -1)
    : baseImg_url;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
};

export const getAIImageUrl = (path: string | undefined | null) => {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http") || path.startsWith("/images/") || path.startsWith("data:")) return path;

  const cleanBase = base_AI_Img_url.endsWith("/")
    ? base_AI_Img_url.slice(0, -1)
    : base_AI_Img_url;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
};
