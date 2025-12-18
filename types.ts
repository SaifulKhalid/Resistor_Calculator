
export interface ResistorResult {
  bands: string[];
  resistance_ohms: number;
  formatted_value: string;
  confidence: number;
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
