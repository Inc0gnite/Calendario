// Variantes reutilizables de Framer Motion

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.15 } },
};

export const slideUp = {
  hidden: { y: "100%" },
  show: {
    y: 0,
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export const staggerContainer = (staggerDelay = 0.06) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

// Tap feedback para botones
export const tapScale = {
  whileTap: { scale: 0.96 },
  transition: { duration: 0.1 },
};
