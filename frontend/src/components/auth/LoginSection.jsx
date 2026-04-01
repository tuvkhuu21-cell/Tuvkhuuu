import { motion } from 'motion/react'
import { useState } from 'react'

function LoginSection({ sectionReveal, onSignUpClick, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <motion.section {...sectionReveal} id="login" className="mt-16 md:mt-24">
      <div className="mx-auto w-full max-w-[500px] rounded-lg border border-[#7c9af2]/30 bg-black/50 px-6 pb-5 pt-6 backdrop-blur-none">
        <p className="text-[9px] uppercase tracking-[0.22em] text-white/70">Account Authentication</p>
        <h3 className="mt-2 text-lg uppercase tracking-[0.12em] text-white/85">Log In</h3>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            await onLoginSuccess?.({ email, password })
          }}
        >
          <div>
            <label className="block text-[9px] uppercase tracking-[0.22em] text-white/70">Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="mt-2 w-full border-b border-white/45 bg-transparent pb-2 text-xs text-white outline-none placeholder:text-white/20"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-[0.22em] text-white/70">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="mt-2 w-full border-b border-white/45 bg-transparent pb-2 text-xs text-white outline-none placeholder:text-white/20"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-[#7b95e5] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8ca4ee]"
          >
            Access Account 
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[10px] text-white/45">
          <span>Don't have an account?</span>
          <a
            href="#signup"
            onClick={(event) => {
              event.preventDefault()
              onSignUpClick?.()
            }}
            className="uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]"
          >
            Sign up
          </a>
        </div>

        <div className="mt-5 h-px w-full bg-linear-to-r from-[#4f89ff] via-[#4f89ff]/30 to-transparent" />
      </div>
    </motion.section>
  )
}

export default LoginSection
