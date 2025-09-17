import { motion } from 'framer-motion'
import { FaClock, FaCoffee, FaChalkboardTeacher, FaNetworkWired, FaGlassCheers } from 'react-icons/fa'

interface AgendaItem {
  time: string
  title: string
  description?: string
}

interface EventAgendaProps {
  agenda: AgendaItem[]
}

const getIcon = (title: string) => {
  if (title.toLowerCase().includes('café') || title.toLowerCase().includes('pausa')) {
    return <FaCoffee className="text-amber-600" />
  }
  if (title.toLowerCase().includes('cóctel') || title.toLowerCase().includes('networking')) {
    return <FaGlassCheers className="text-primary-600" />
  }
  if (title.toLowerCase().includes('registro')) {
    return <FaNetworkWired className="text-green-600" />
  }
  return <FaChalkboardTeacher className="text-primary-600" />
}

const EventAgenda = ({ agenda }: EventAgendaProps) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="card"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Agenda del Evento</h2>
      <div className="space-y-4">
        {agenda.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary-100 rounded-full">
              {getIcon(item.title)}
            </div>
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 text-gray-600 text-sm">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-primary-600 font-medium">
                  <FaClock className="text-sm" />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default EventAgenda