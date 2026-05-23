import AppProvider from '@/components/AppProvider'
import BuildModule from '@/components/build/BuildModule'

export default function BuildPage() {
  return (
    <AppProvider>
      <BuildModule />
    </AppProvider>
  )
}
