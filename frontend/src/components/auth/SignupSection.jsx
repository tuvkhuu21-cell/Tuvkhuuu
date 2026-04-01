import { useState } from 'react'
import { motion } from 'motion/react'

const roles = [
  { id: 'user', label: 'User', icon: '◌' },
  { id: 'driver', label: 'Driver', icon: '◈' },
  { id: 'company', label: 'Company', icon: '▦' },
]

function SignupSection({ sectionReveal, onLoginClick, onSignupSuccess }) {
  const [selectedRole, setSelectedRole] = useState('user')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const roleToApi = {
    user: 'customer',
    driver: 'driver',
    company: 'manager',
  }

  return (
    <motion.section {...sectionReveal} id="signup" className="mt-16 md:mt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-2 text-white/75">
        </div>

        <div className="mx-auto w-full max-w-[500px] rounded-lg border border-[#7c9af2]/30 bg-black/50 px-6 pb-5 pt-6 backdrop-blur-none">
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/70">Identify your role</p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`relative rounded-md px-2 py-3 text-center transition ${
                  selectedRole === role.id
                    ? 'bg-[#0a101b] shadow-[inset_0_0_0_1px_rgba(130,170,255,0.55)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.09]'
                }`}
              >
                {selectedRole === role.id && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#7ea9ff]" />}
                <p className="text-sm text-white/75">{role.icon}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/70">{role.label}</p>
              </button>
            ))}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              await onSignupSuccess?.({
                name,
                email,
                password,
                role: roleToApi[selectedRole],
              })
            }}
          >
            <div>
              <label className="text-[9px] uppercase tracking-[0.22em] text-white/70">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="mt-2 w-full border-b border-white/45 bg-transparent pb-2 text-xs text-white outline-none placeholder:text-white/20"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[0.22em] text-white/70">Corporate Email</label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="mt-2 w-full border-b border-white/45 bg-transparent pb-2 text-xs text-white outline-none placeholder:text-white/20"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[0.22em] text-white/70">Secure Password</label>
              <div className="mt-2 flex items-center border-b border-white/45 pb-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/20"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-xs text-white/55"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-[#7b95e5] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8ca4ee]"
            >
              Initialize Account
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-[10px] text-white/45">
            <span>Already authenticated?</span>
            <a
              href="#login"
              onClick={(event) => {
                event.preventDefault()
                onLoginClick?.()
              }}
              className="uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]"
            >
              Log in
            </a>
          </div>

          <div className="mt-5 h-px w-full bg-linear-to-r from-[#4f89ff] via-[#4f89ff]/30 to-transparent" />
        </div>
      </div>  
    </motion.section>
  )
}

export default SignupSection
