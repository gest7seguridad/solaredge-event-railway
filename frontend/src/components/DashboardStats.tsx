import { motion } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DashboardStatsProps {
  dailyRegistrations: any[]
  companiesStats: any[]
  recentRegistrations: any[]
}


const DashboardStats = ({ dailyRegistrations, companiesStats, recentRegistrations }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Registrations Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Inscripciones Diarias (Últimos 7 días)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyRegistrations}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: es })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(date) => format(new Date(date), "d 'de' MMMM", { locale: es })}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#709eb5" 
              strokeWidth={2}
              name="Inscripciones"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Companies Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top 5 Empresas
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={companiesStats.slice(0, 5)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="company" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#709eb5" name="Inscritos" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card lg:col-span-2"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Últimas Inscripciones
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Nombre</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Empresa</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Estado</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((reg: any) => (
                <tr key={reg.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-sm">
                    {reg.first_name} {reg.last_name}
                  </td>
                  <td className="py-2 px-4 text-sm">{reg.company}</td>
                  <td className="py-2 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reg.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      reg.status === 'waitlist' ? 'bg-amber-100 text-amber-700' :
                      reg.status === 'attended' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reg.status === 'confirmed' ? 'Confirmado' :
                       reg.status === 'waitlist' ? 'Lista Espera' :
                       reg.status === 'attended' ? 'Asistió' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    {format(new Date(reg.created_at), 'dd/MM HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardStats