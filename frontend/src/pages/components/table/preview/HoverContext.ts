import { createContext } from "react";

export interface HoverState {
  url: string;
  x: number;
  y: number;
}

export interface HoverContextType {
  setHoveredThumbnail: (state: HoverState | null) => void;
  _registerSetter?: (setter: (state: HoverState | null) => void) => void;
}

export const HoverContext = createContext<HoverContextType | null>(null);

export default HoverContext;
