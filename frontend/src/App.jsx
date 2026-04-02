import umbrellaLogo from './assets/umbrela.svg'
import accountIcon from './assets/account.svg'
import heroIllustration from './assets/hero.svg'
import anywhereIcon from './assets/anywhere.svg'
import quicklyIcon from './assets/quickly.svg'
import safetyIcon from './assets/safety.svg'
import inHandIcon from './assets/inhand.svg'
import serviceIllustration from './assets/service.svg'
import weAreIllustration from './assets/weare.svg'
import networkIllustration from './assets/network.svg'
import { BackgroundBeams } from './components/ui/background-beams'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import Header from './components/pages/Header'
import HeroSection from './components/pages/HeroSection'
import ServiceSection from './components/pages/ServiceSection'
import AboutSection from './components/pages/AboutSection'
import FooterSection from './components/pages/FooterSection'
import AdminDashboardSection from './components/dashboards/admin/AdminDashboardSection'
import CompanyDashboardSection from './components/dashboards/company/CompanyDashboardSection'
import UserDashboardSection from './components/dashboards/user/UserDashboardSection'
import DriverDashboardSection from './components/dashboards/driver/DriverDashboardSection'
import SignupSection from './components/auth/SignupSection'
import LoginSection from './components/auth/LoginSection'
import CustomerOrderSection from './components/app/CustomerOrderSection'
import CustomerCheckoutSection from './components/app/CustomerCheckoutSection'
import CustomerTrackingSection from './components/app/CustomerTrackingSection'
import CustomerOrderHistorySection from './components/app/CustomerOrderHistorySection'
import ManagerAnalyticsSection from './components/app/ManagerAnalyticsSection'
import { sectionReveal, staggerChildren, fadeUpItem } from './components/pages/animations'
import { useAuth } from './context/AuthContext'
import { getAccessToken } from './lib/api'

function App() {
  const [activeView, setActiveView] = useState('landing')
  const [authMode, setAuthMode] = useState('login')
  const [dashboardMode, setDashboardMode] = useState('admin')
  const [activeOrder, setActiveOrder] = useState(null)
  const [authError, setAuthError] = useState('')
  const auth = useAuth()

  async function handleLogin(credentials) {
    try {
      setAuthError('')
      await auth.login(credentials)
      setActiveView('dashboard')
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Login failed')
    }
  }

  const roleDashboardMap = {
    admin: ['admin', 'company', 'user', 'driver'],
    manager: ['company'],
    customer: ['user'],
    driver: ['driver'],
  }

  const dashboardLabels = {
    admin: 'Admin Dashboard',
    company: 'Company Dashboard',
    user: 'User Dashboard',
    driver: 'Driver Dashboard',
  }

  const allowedDashboardModes = auth.user ? roleDashboardMap[auth.user.role] || ['user'] : ['user']

  useEffect(() => {
    if (!allowedDashboardModes.includes(dashboardMode)) {
      setDashboardMode(allowedDashboardModes[0])
    }
  }, [dashboardMode, allowedDashboardModes])

  useEffect(() => {
    // Only load user data if not already loaded and we have a token
    if (!auth.user && getAccessToken()) {
      auth.loadMe().catch(() => {})
    }
  }, [])

  // Handle authentication-based routing
  useEffect(() => {
    if (auth.loading) return // Don't redirect while loading
    
    const hasToken = getAccessToken()
    const isAuthenticated = auth.user && hasToken
    
    // If user is authenticated and on landing/auth, redirect to dashboard
    if (isAuthenticated && (activeView === 'landing' || activeView === 'auth')) {
      setActiveView('dashboard')
      return
    }
    
    // If user is not authenticated and not on landing/auth, redirect to landing
    if (!isAuthenticated && !['landing', 'auth'].includes(activeView)) {
      setActiveView('landing')
      return
    }
  }, [auth.user, auth.loading, activeView])

  async function handleSignup(payload) {
    try {
      setAuthError('')
      await auth.register(payload)
      setActiveView('dashboard')
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative min-h-screen w-full overflow-hidden px-6 pb-10 pt-6 text-left font-['Poppins','Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] text-[#ffffff] md:px-10 md:pb-12 md:pt-8 lg:px-16"
    >
      <BackgroundBeams className="pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10">
        {activeView === 'landing' ? (
          <>
            <Header
              umbrellaLogo={umbrellaLogo}
              accountIcon={accountIcon}
              onAccountClick={() => {
                setAuthMode('login')
                setActiveView('auth')
              }}
            />

            <HeroSection
              heroIllustration={heroIllustration}
              sectionReveal={sectionReveal}
              staggerChildren={staggerChildren}
              fadeUpItem={fadeUpItem}
            />

            <ServiceSection
              anywhereIcon={anywhereIcon}
              quicklyIcon={quicklyIcon}
              safetyIcon={safetyIcon}
              inHandIcon={inHandIcon}
              serviceIllustration={serviceIllustration}
              sectionReveal={sectionReveal}
              staggerChildren={staggerChildren}
              fadeUpItem={fadeUpItem}
            />

            <AboutSection
              networkIllustration={networkIllustration}
              weAreIllustration={weAreIllustration}
              sectionReveal={sectionReveal}
            />

            <FooterSection umbrellaLogo={umbrellaLogo} sectionReveal={sectionReveal} />
          </>
        ) : activeView === 'auth' ? (
          <section className="mx-auto w-full max-w-5xl pt-4">
            <button
              type="button"
              onClick={async () => {
                await auth.logout()
                setActiveView('landing')
              }}
              className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]"
            >
              ← Back to home
            </button>

            {authMode === 'login' ? (
              <LoginSection
                sectionReveal={sectionReveal}
                onSignUpClick={() => setAuthMode('signup')}
                onLoginSuccess={handleLogin}
              />
            ) : (
              <SignupSection sectionReveal={sectionReveal} onLoginClick={() => setAuthMode('login')} onSignupSuccess={handleSignup} />
            )}

            {authError ? <p className="mt-4 text-xs text-red-300">{authError}</p> : null}
          </section>
        ) : activeView === 'order' ? (
          <CustomerOrderSection
            onBack={() => setActiveView('dashboard')}
            onOrderCreated={(order) => {
              setActiveOrder(order)
              setActiveView(order.paymentMethod === 'Card' ? 'checkout' : 'tracking')
            }}
          />
        ) : activeView === 'checkout' && activeOrder ? (
          <CustomerCheckoutSection
            order={activeOrder}
            onBack={() => setActiveView('order')}
            onPaid={() => setActiveView('tracking')}
          />
        ) : activeView === 'tracking' && activeOrder ? (
          <CustomerTrackingSection orderId={activeOrder.id} onBack={() => setActiveView('dashboard')} />
        ) : activeView === 'order-history' ? (
          <CustomerOrderHistorySection
            onBack={() => setActiveView('dashboard')}
            onTrackOrder={(order) => {
              setActiveOrder(order)
              setActiveView('tracking')
            }}
          />
        ) : activeView === 'manager-live' ? (
          <ManagerAnalyticsSection onBack={() => setActiveView('dashboard')} />
        ) : (
          <section className="space-y-4">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-2">
              {auth.user ? (
                <>
                  <span className="mr-auto text-[10px] uppercase tracking-[0.12em] text-white/55">
                    {auth.user.name} • {auth.user.role}
                  </span>
                  {auth.user.role === 'customer' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveView('order')}
                        className="rounded-md border border-[#7c9af2]/45 bg-[#7c9af2]/18 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#c5d3ff]"
                      >
                        New Order
                      </button>
                      <button
                        type="button"
                        onClick={() => activeOrder && setActiveView('tracking')}
                        className="rounded-md border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/55 hover:border-white/35 hover:text-white/80"
                      >
                        Live Tracking
                      </button>
                    </>
                  ) : null}
                  {auth.user.role === 'manager' || auth.user.role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => setActiveView('manager-live')}
                      className="rounded-md border border-[#7c9af2]/45 bg-[#7c9af2]/18 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#c5d3ff]"
                    >
                      Analytics API
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={async () => {
                      await auth.logout()
                      setActiveView('landing')
                    }}
                    className="rounded-md border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/55 hover:border-white/35 hover:text-white/80"
                  >
                    Logout
                  </button>
                </>
              ) : null}

              {allowedDashboardModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDashboardMode(mode)}
                  className={`rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    dashboardMode === mode
                      ? 'border-[#7c9af2]/45 bg-[#7c9af2]/18 text-[#c5d3ff]'
                      : 'border-white/20 text-white/55 hover:border-white/35 hover:text-white/80'
                  }`}
                >
                  {dashboardLabels[mode]}
                </button>
              ))}
            </div>

            {dashboardMode === 'admin' ? (
              <AdminDashboardSection umbrellaLogo={umbrellaLogo} onBack={async () => {
                await auth.logout()
                setActiveView('landing')
              }} />
            ) : dashboardMode === 'company' ? (
              <CompanyDashboardSection umbrellaLogo={umbrellaLogo} onBack={async () => {
                await auth.logout()
                setActiveView('landing')
              }} />
            ) : dashboardMode === 'user' ? (
              <UserDashboardSection
                umbrellaLogo={umbrellaLogo}
                onBack={async () => {
                  await auth.logout()
                  setActiveView('landing')
                }}
                onPlaceOrder={() => setActiveView('order')}
                onViewAllHistory={() => setActiveView('order-history')}
              />
            ) : (
              <DriverDashboardSection onBack={async () => {
                await auth.logout()
                setActiveView('landing')
              }} />
            )}
          </section>
        )}
      </div>
    </motion.div>
  )
}

export default App
