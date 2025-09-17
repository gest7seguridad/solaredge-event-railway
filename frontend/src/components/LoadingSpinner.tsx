import { motion } from 'framer-motion'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </motion.div>
      <span className="sr-only">Cargando...</span>
    </div>
  )
}

export default LoadingSpinner