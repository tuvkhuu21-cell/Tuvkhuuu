import { motion } from 'motion/react'

function ServiceSection({
  anywhereIcon,
  quicklyIcon,
  safetyIcon,
  inHandIcon,
  serviceIllustration,
  sectionReveal,
  staggerChildren,
  fadeUpItem,
}) {
  return (
    <motion.section {...sectionReveal} className="mt-16 md:mt-20 lg:mt-24" id="service">
      <motion.div
        className="mx-auto grid max-w-[1920px] grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
        variants={staggerChildren}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.45 }}
      >
        <motion.img variants={fadeUpItem} whileHover={{ y: -8, scale: 1.03 }} transition={{ duration: 0.25 }} src={anywhereIcon} alt="Anywhere" className="mx-auto h-auto w-[200px] md:w-[200px]" />
        <motion.img variants={fadeUpItem} whileHover={{ y: -8, scale: 1.03 }} transition={{ duration: 0.25 }} src={quicklyIcon} alt="Quickly" className="mx-auto h-auto w-[200px] md:w-[200px]" />
        <motion.img variants={fadeUpItem} whileHover={{ y: -8, scale: 1.03 }} transition={{ duration: 0.25 }} src={safetyIcon} alt="Safety" className="mx-auto h-auto w-[200px] md:w-[200px]" />
        <motion.img variants={fadeUpItem} whileHover={{ y: -8, scale: 1.03 }} transition={{ duration: 0.25 }} src={inHandIcon} alt="In Hand" className="mx-auto h-auto w-[200px] md:w-[200px]" />
      </motion.div>

      <div className="mt-8 grid items-center gap-8 lg:mt-14 lg:grid-cols-[minmax(320px,1fr)_minmax(320px,1fr)] lg:gap-10">
        <motion.div aria-hidden="true" initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <motion.img src={serviceIllustration} alt="" className="mx-auto block h-auto w-full max-w-[700px]" whileHover={{ scale: 1.015 }} transition={{ duration: 0.3 }} />
        </motion.div>

        <motion.div className="lg:pr-4" initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}>
          <motion.h2 className="m-0 text-xs font-medium leading-[1.3] tracking-[0.01em] text-[#7c9af2] md:text-[2.6rem] lg:text-[3.2rem] text-right" whileHover={{ letterSpacing: '0.02em' }} transition={{ duration: 0.25 }}>
            Our Service
          </motion.h2>
          <motion.p className="text-justify mt-5 max-w-[auto] text-[1rem] leading-[1.62] text-[#ffffff]" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15 }}>
            We created our service to bring the best of the city to your doorstep,
            building a delivery platform that supports local merchants while making your
            daily life a little easier. Our delivery platform was born from a simple
            idea: to create a service that feels like a neighbor helping a neighbor,
            ensuring your local favorites are always just a tap away.
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ServiceSection
