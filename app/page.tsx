import Whiteboard from './whiteboard'
import { ClientOnly } from './components/client-only'

export default function Page() {
  return (
    <>
      <ClientOnly>
        <Whiteboard />
      </ClientOnly>
      <div className="fixed bottom-2 right-2 text-xs text-gray-400">
        Whiteboard App v1.0.0
      </div>
    </>
  )
}