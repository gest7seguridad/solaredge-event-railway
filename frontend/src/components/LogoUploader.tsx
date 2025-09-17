import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaUpload, FaCheck, FaImage } from 'react-icons/fa'
import { toast } from 'react-toastify'

const LogoUploader = () => {
  const [organizerLogo, setOrganizerLogo] = useState<string>(
    localStorage.getItem('organizerLogo') || ''
  )
  const [collaboratorLogo, setCollaboratorLogo] = useState<string>(
    localStorage.getItem('collaboratorLogo') || ''
  )
  
  const organizerInputRef = useRef<HTMLInputElement>(null)
  const collaboratorInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (type: 'organizer' | 'collaborator', file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (type === 'organizer') {
          setOrganizerLogo(dataUrl)
          localStorage.setItem('organizerLogo', dataUrl)
        } else {
          setCollaboratorLogo(dataUrl)
          localStorage.setItem('collaboratorLogo', dataUrl)
        }
        toast.success(`Logo de ${type === 'organizer' ? 'Solarland' : 'SolarEdge'} actualizado`)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Por favor selecciona un archivo de imagen válido')
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Organizer Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
      >
        <h3 className="font-semibold text-gray-700 mb-4">Logo Organizador (Solarland)</h3>
        
        {organizerLogo ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <img 
                src={organizerLogo} 
                alt="Logo Organizador" 
                className="max-h-24 mx-auto object-contain"
              />
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => organizerInputRef.current?.click()}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cambiar Logo
              </button>
              <button
                onClick={() => {
                  setOrganizerLogo('')
                  localStorage.removeItem('organizerLogo')
                  toast.success('Logo eliminado')
                }}
                className="text-red-600 hover:text-red-700 text-sm py-2 px-4"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => organizerInputRef.current?.click()}
            className="cursor-pointer space-y-2"
          >
            <FaImage className="text-4xl text-gray-400 mx-auto" />
            <p className="text-gray-600">Click para subir logo</p>
            <p className="text-xs text-gray-500">PNG, JPG o SVG (máx. 2MB)</p>
          </div>
        )}
        
        <input
          ref={organizerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleLogoUpload('organizer', file)
          }}
        />
      </motion.div>

      {/* Collaborator Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
      >
        <h3 className="font-semibold text-gray-700 mb-4">Logo Colaborador (SolarEdge)</h3>
        
        {collaboratorLogo ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <img 
                src={collaboratorLogo} 
                alt="Logo Colaborador" 
                className="max-h-24 mx-auto object-contain"
              />
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => collaboratorInputRef.current?.click()}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cambiar Logo
              </button>
              <button
                onClick={() => {
                  setCollaboratorLogo('')
                  localStorage.removeItem('collaboratorLogo')
                  toast.success('Logo eliminado')
                }}
                className="text-red-600 hover:text-red-700 text-sm py-2 px-4"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => collaboratorInputRef.current?.click()}
            className="cursor-pointer space-y-2"
          >
            <FaImage className="text-4xl text-gray-400 mx-auto" />
            <p className="text-gray-600">Click para subir logo</p>
            <p className="text-xs text-gray-500">PNG, JPG o SVG (máx. 2MB)</p>
          </div>
        )}
        
        <input
          ref={collaboratorInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleLogoUpload('collaborator', file)
          }}
        />
      </motion.div>
    </div>
  )
}

export default LogoUploader