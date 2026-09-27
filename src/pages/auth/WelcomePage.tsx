import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/PrimaryButton'
import { AuthSplit } from '../../components/AuthSplit'

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <AuthSplit tone="alumni" eyebrow="Alumni Connect" headline="Welcome to the Network">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <motion.img
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src="/logo.png"
          alt="Alumni Connect"
          className="mb-8 h-28 w-auto object-contain lg:hidden"
        />
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome to the Network</h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-muted)]">
          Connecting alumni, students, and administration in one unified platform.
        </p>
        <div className="mt-10 w-full max-w-xs">
          <PrimaryButton onClick={() => navigate('/role')}>Next</PrimaryButton>
        </div>
      </div>
    </AuthSplit>
  )
}
