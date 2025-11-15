// Animation timing constants
// All animations use CSS only - no JavaScript

export const transitions = {
  // Timing (in milliseconds)
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",

  // Easing functions
  easeInOut: "ease-in-out",
  easeOut: "ease-out",
  easeIn: "ease-in",
  
  // Combined timing + easing
  panelSlide: "300ms ease-in-out",
  contentFade: "200ms ease-out",
  hover: "150ms ease-in-out",
} as const;

// Animation durations as numbers (for calculations if needed)
export const durations = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;
