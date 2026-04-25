import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/futprof/app-shell"

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
