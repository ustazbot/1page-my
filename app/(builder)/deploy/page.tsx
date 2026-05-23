import AppProvider from '@/components/AppProvider'
import DeployModule from '@/components/deploy/DeployModule'

export default function DeployPage() {
  return (
    <AppProvider>
      <DeployModule />
    </AppProvider>
  )
}
