import localFont from "next/font/local";

export const googleSans = localFont({
  src: [
    {
      path: "../public/fonts/google-sans/GoogleSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/google-sans/GoogleSans-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
});

export const googleSansCode = localFont({
  src: [
    {
      path: "../public/fonts/google-sans-code/GoogleSansCode-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-google-sans-code",
  display: "swap",
});
