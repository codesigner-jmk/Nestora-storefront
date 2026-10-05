import { useColorScheme } from "react-native";

const light = {
  background: "#F8F6F2", surface: "#FFFFFF", surfaceMuted: "#EFEAE1",
  text: "#1F1F1C", secondary: "#6F6C65", border: "#E5E1D8",
  accent: "#626B47", accentSurface: "#E9ECDF", danger: "#9A4E42",
};
const dark = {
  background: "#191A16", surface: "#22231F", surfaceMuted: "#2A2B25",
  text: "#F4F1EA", secondary: "#B8B3A8", border: "#3A3B34",
  accent: "#AAB58B", accentSurface: "#34392B", danger: "#E2A196",
};
export function useTheme() { return useColorScheme() === "dark" ? dark : light; }
export type Theme = typeof light;
