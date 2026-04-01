export const sectionReveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
}

export const staggerChildren = {
  initial: { opacity: 0 },
  whileInView: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.12 },
  },
  viewport: { once: true, amount: 0.25 },
}

export const fadeUpItem = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}
