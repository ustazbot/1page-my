import AppProvider from '@/components/AppProvider'
import Dashboard from '@/components/Dashboard'

export default function OperatorPage() {
  return (
    <div className="operator-layout">
      <AppProvider>
        <Dashboard />
      </AppProvider>
    </div>
  )
}
