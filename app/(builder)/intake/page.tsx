import AppProvider from '@/components/AppProvider'
import IntakeModule from '@/components/intake/IntakeModule'

export default function IntakePage() {
  return (
    <AppProvider>
      <IntakeModule />
    </AppProvider>
  )
}
