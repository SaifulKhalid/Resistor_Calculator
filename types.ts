
export interface ResistorResult {
  bands: string[];
  resistance_ohms: number;
  formatted_value: string;
  confidence: number;
  isManual?: boolean;
}

export enum ResistorColor {
  Black = "Black",
  Brown = "Brown",
  Red = "Red",
  Orange = "Orange",
  Yellow = "Yellow",
  Green = "Green",
  Blue = "Blue",
  Violet = "Violet",
  Grey = "Grey",
  White = "White",
  Gold = "Gold",
  Silver = "Silver"
}

export interface ColorData {
  hex: string;
  digit: number | null;
  multiplier: number | null;
  tolerance: string | null;
}

export const ColorMap: Record<string, string> = {
  black: "#000000",
  brown: "#8b4513",
  red: "#ff0000",
  orange: "#ffa500",
  yellow: "#ffff00",
  green: "#008000",
  blue: "#0000ff",
  violet: "#ee82ee",
  grey: "#808080",
  white: "#ffffff",
  gold: "#ffd700",
  silver: "#c0c0c0",
};

export const RESISTOR_VALUES: Record<string, { digit: number; multiplier: number; tolerance?: string }> = {
  black: { digit: 0, multiplier: 1 },
  brown: { digit: 1, multiplier: 10, tolerance: "1%" },
  red: { digit: 2, multiplier: 100, tolerance: "2%" },
  orange: { digit: 3, multiplier: 1000 },
  yellow: { digit: 4, multiplier: 10000 },
  green: { digit: 5, multiplier: 100000, tolerance: "0.5%" },
  blue: { digit: 6, multiplier: 1000000, tolerance: "0.25%" },
  violet: { digit: 7, multiplier: 10000000, tolerance: "0.1%" },
  grey: { digit: 8, multiplier: 100000000, tolerance: "0.05%" },
  white: { digit: 9, multiplier: 1000000000 },
  gold: { digit: -1, multiplier: 0.1, tolerance: "5%" },
  silver: { digit: -1, multiplier: 0.01, tolerance: "10%" },
};
