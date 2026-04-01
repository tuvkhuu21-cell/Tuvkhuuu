import { motion } from 'motion/react'

function Header({ umbrellaLogo, accountIcon, onAccountClick }) {
  return (
    <header className="flex flex-wrap items-center gap-5 md:gap-15">
      <motion.img
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        src={umbrellaLogo}
        className="h-auto w-33 md:w-50"
        alt="Umbrela"
      />

      <nav
        className="order-3 flex w-full justify-center gap-4 md:order-none md:ml-auto md:w-auto md:gap-15 pt-11"
        aria-label="Main navigation"
      >
        <motion.a whileHover={{ y: -2, color: '#7c9af2' }} transition={{ duration: 0.2 }} className="text-base font-medium uppercase tracking-[0.12em] text-[#ffffff] transition-colors" href="#home">
          Home
        </motion.a>
        <motion.a whileHover={{ y: -2, color: '#7c9af2' }} transition={{ duration: 0.2 }} className="text-base font-medium uppercase tracking-[0.12em] text-[#ffffff] transition-colors" href="#service">
          Service
        </motion.a>
        <motion.a whileHover={{ y: -2, color: '#7c9af2' }} transition={{ duration: 0.2 }} className="text-base font-medium uppercase tracking-[0.12em] text-[#ffffff] transition-colors" href="#about">
          About
        </motion.a>
      </nav>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        whileHover={{ y: -2, scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        className="grid h-15 w-15 place-items-center rounded-full bg-transparent p-0 pt-6 md:h-[52px] md:w-[52px]"
        aria-label="Open account menu"
        type="button"
        onClick={onAccountClick}
      >
        <img src={accountIcon} alt="" aria-hidden="true" className="h-10 w-10 md:h-10 md:w-10" />
      </motion.button>
    </header>
  )
}

export default Header
