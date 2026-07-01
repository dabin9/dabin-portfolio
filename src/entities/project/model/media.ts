export type MediaType = "image" | "gif" | "video";

export type MediaOption = {
  label: string;
  url: string;
  type: MediaType;
  alt: string;
};

export const mediaOptions: MediaOption[] = [
  // Add entries only after the matching file exists in public/media.
  // Example:
  // {
  //   label: "Belle Foret thumbnail",
  //   url: "/media/belleforet-thumb.webp",
  //   type: "image",
  //   alt: "Belle Foret Resort project thumbnail"
  // },
  // {
  //   label: "Belle Foret main interaction",
  //   url: "/media/belleforet-main.mp4",
  //   type: "video",
  //   alt: "Belle Foret Resort main interaction screen"
  // }
];
