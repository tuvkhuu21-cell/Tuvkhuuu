import { motion } from 'motion/react'

function FooterSection({ umbrellaLogo, sectionReveal }) {
  return (
    <motion.footer {...sectionReveal} className="mt-18">
      <div className="border-y border-[#7c9af2] py-8 md:py-10 flex items-center justify-center">
        <div className="mx-auto grid max-w-[1280px] items-center gap-8 md:grid-cols-[220px_1fr] md:gap-14">
          <img src={umbrellaLogo} className="h-auto w-40 md:w-44" alt="Umbrela" />

          <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
              <span className="text-xs font-semibold text-white">Contact Us</span>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 md:gap-6">
                <span className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2.2" />
                  </svg>
                  Ulaanbaatar, Mongolia Peace Avenue 15160
                </span>

                <span className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="m5 8 7 5 7-5" />
                  </svg>
                  unbrela@gmail.com
                </span>

                <span className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M6.7 4h3.2l1.4 3.6-1.8 1.8a14.5 14.5 0 005.3 5.3l1.8-1.8 3.6 1.4v3.2A2.4 2.4 0 0117.8 20C10.2 20 4 13.8 4 6.2A2.4 2.4 0 016.4 4z" />
                  </svg>
                  +976 95524975
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
              <span className="text-xs font-semibold text-white">Follow Us</span>

              <div className="flex items-center gap-1">
                <motion.span whileHover={{ y: -3, scale: 1.08, borderColor: '#7c9af2', color: '#7c9af2' }} transition={{ duration: 0.2 }} className="grid h-5 w-5 place-items-center rounded-full border border-white text-white" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                    <path d="M13.4 8.2V6.9c0-.56.4-.9 1-.9h1.1V3.5h-1.9c-2 0-3.2 1.2-3.2 3.2v1.5H8.6v2.5h1.8v6.8h3v-6.8h1.9l.3-2.5h-2.2z" />
                  </svg>
                </motion.span>
                <motion.span whileHover={{ y: -3, scale: 1.08, borderColor: '#7c9af2', color: '#7c9af2' }} transition={{ duration: 0.2 }} className="grid h-5 w-5 place-items-center rounded-full border border-white text-white" aria-label="X">
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                    <path d="M17.7 4h2.6l-5.7 6.5 6.7 9.5h-5.2l-4.1-5.8-5.1 5.8H4.3l6.1-6.9L4 4h5.4l3.7 5.3L17.7 4z" />
                  </svg>
                </motion.span>
                <motion.span whileHover={{ y: -3, scale: 1.08, borderColor: '#7c9af2', color: '#7c9af2' }} transition={{ duration: 0.2 }} className="grid h-5 w-5 place-items-center rounded-full border border-white text-white" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="5" />
                    <circle cx="12" cy="12" r="3.5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </motion.span>
                <motion.span whileHover={{ y: -3, scale: 1.08, borderColor: '#7c9af2', color: '#7c9af2' }} transition={{ duration: 0.2 }} className="grid h-5 w-5 place-items-center rounded-full border border-white text-white" aria-label="Telegram">
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                    <path d="M20.8 4.3 3.7 11c-.9.3-.9 1.5.1 1.8l4.3 1.4 1.6 4.8c.3.9 1.5 1.1 2 .3l2.4-3.6 4.4 3.2c.8.6 2 .1 2.2-.9l2.5-12.8c.2-1-.8-1.8-1.8-1.4z" />
                  </svg>
                </motion.span>
                <motion.span whileHover={{ y: -3, scale: 1.08, borderColor: '#7c9af2', color: '#7c9af2' }} transition={{ duration: 0.2 }} className="grid h-5 w-5 place-items-center rounded-full border border-white text-white" aria-label="Pinterest">
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                    <path d="M12 3.7a8.3 8.3 0 0 0-3 16l1-3.8c-.2-.4-.4-1.1-.4-1.8 0-1.7 1-2.9 2.2-2.9 1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1 4.2-.3 1.2.6 2.2 1.8 2.2 2.2 0 3.7-2.8 3.7-6.1 0-2.5-1.7-4.4-4.8-4.4-3.5 0-5.6 2.6-5.6 5.4 0 1 .3 1.8.8 2.3.2.2.2.3.2.5l-.3 1.1c-.1.3-.4.4-.7.3-1.8-.8-2.7-2.9-2.7-5.2 0-3.8 3.2-8.3 9-8.3 4.8 0 8 3.5 8 7.3 0 5-2.8 8.8-6.9 8.8-1.4 0-2.6-.8-3-1.7l-.9 3.3c-.3 1.1-.9 2.2-1.4 3A8.3 8.3 0 1 0 12 3.7z" />
                  </svg>
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-white ">© 2026 All Rights Reserved</p>
    </motion.footer>
  )
}

export default FooterSection
