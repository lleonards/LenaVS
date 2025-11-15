
export interface Stanza {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

export interface TextStyleState {
  font: string;
  size: number;
  textColor: string;
  highlightColor: string;
  outlineColor: string;
  alignment: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}