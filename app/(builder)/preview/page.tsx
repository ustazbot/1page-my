import AppProvider from '@/components/AppProvider'
import PreviewModule from '@/components/preview/PreviewModule'

export default function PreviewPage() {
  return (
    <AppProvider>
      <PreviewModule />
    </AppProvider>
  )
}
