import { motion } from 'motion/react'

function HeroSection({ heroIllustration, sectionReveal, staggerChildren, fadeUpItem }) {
  return (
    <motion.main {...sectionReveal} className="mt-12 grid items-end gap-10 lg:mt-16 lg:grid-cols-[minmax(280px,430px)_minmax(360px,1fr)] lg:gap-8" id="home">
      <motion.div variants={staggerChildren} initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.5 }}>
        <motion.h1 variants={fadeUpItem} className="m-0 text-xs font-medium leading-[1.3] tracking-[0.01em] text-[#7c9af2] md:text-[2.6rem] lg:text-[3.2rem]">
          <span className="block whitespace-nowrap">Smart Delivery,</span>
          <span className="block whitespace-nowrap">Modern Logistics</span>
        </motion.h1>
        <motion.p variants={fadeUpItem} className="text-justify mt-5 max-w-[auto] text-[1rem] leading-[1.62] text-[#ffffff]">
          Deliver fastest across 25000+ pin codes in world with real time shipment
          tracking feature. Get best international courier services. We are the best
          courier service provider in world. Get best international courier services at
          zero subscription fees.
        </motion.p>
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: 36 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      >
        <motion.img
          src={heroIllustration}
          alt=""
          className="block h-auto w-full lg:ml-auto lg:max-w-[700px]"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5.5, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.main>
  )
}

export default HeroSection
