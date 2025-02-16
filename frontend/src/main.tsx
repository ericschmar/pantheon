import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  BrandVariants,
  createDarkTheme,
  createLightTheme,
  FluentProvider,
  Theme,
} from "@fluentui/react-components";

const zed: BrandVariants = {
  10: "#020207",
  20: "#13152A",
  30: "#19224D",
  40: "#1C2D6A",
  50: "#1B3889",
  60: "#1743A9",
  70: "#0B4FCA",
  80: "#355CD3",
  90: "#526AD8",
  100: "#6878DD",
  110: "#7C87E1",
  120: "#8F95E5",
  130: "#A1A5EA",
  140: "#B2B4EE",
  150: "#C3C4F2",
  160: "#D4D4F6",
};

const lightTheme: Theme = {
  ...createLightTheme(zed),
};

const darkTheme: Theme = {
  ...createDarkTheme(zed),
};

darkTheme.colorBrandForeground1 = zed[110];
darkTheme.colorBrandForeground2 = zed[120];

createRoot(document.getElementById("root")!).render(
  <FluentProvider theme={lightTheme}>
    <App />
  </FluentProvider>
);
