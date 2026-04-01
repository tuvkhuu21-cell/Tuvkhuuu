import { motion } from 'motion/react'

function AboutSection({ networkIllustration, weAreIllustration, sectionReveal }) {
  return (
    <motion.section {...sectionReveal} className="mt-16 md:mt-20 lg:mt-14" id="about">
      <div className="mx-auto max-w-[1920px]">
        <motion.img
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          src={networkIllustration}
          alt=""
          aria-hidden="true"
          className="mx-auto block h-auto w-full max-w-[1280px]"
        />

        <div className="mt-2 grid items-center gap-8 lg:grid-cols-[minmax(300px,520px)_minmax(360px,1fr)] lg:gap-10">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="m-0 text-xs font-medium leading-[1.3] tracking-[0.01em] text-[#7c9af2] md:text-[2.6rem] lg:text-[3.2rem]">
              Who We Are ?
            </h2>
            <p className="text-justify mt-5 max-w-[auto] text-[1rem] leading-[1.62] text-[#ffffff]">
              We operate with a focus on disciplined execution and transparent
              communication. By leveraging streamlined workflows and proactive
              problem-solving, our team ensures every project moves seamlessly from
              planning to completion without losing momentum.
            </p>
          </motion.div>

          <motion.div aria-hidden="true" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}>
            <motion.img src={weAreIllustration} alt="" className="ml-auto block h-auto w-full max-w-[660px]" whileHover={{ y: -6 }} transition={{ duration: 0.3 }} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default AboutSection
