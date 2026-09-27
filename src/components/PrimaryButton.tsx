import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface PrimaryButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  loading?: boolean
}

export function PrimaryButton({
  children,
  loading,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: PrimaryButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`btn-primary w-full ${className}`}
      disabled={disabled || loading}
      type={type}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
