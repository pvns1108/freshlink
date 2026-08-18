/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7F2",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#146B4B",
          dark: "#0E4F37",
          light: "#E4F0EA",
        },
        accent: {
          DEFAULT: "#E8A33D",
          light: "#FBEBD2",
          dark: "#B97A1F",
        },
        critical: {
          DEFAULT: "#DC2626",
          light: "#FDE8E8",
        },
        ink: {
          DEFAULT: "#14201B",
          muted: "#5B6B62",
          faint: "#94A39B",
        },
        line: "#E1E7E1",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 32, 27, 0.04), 0 4px 16px rgba(20, 32, 27, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
