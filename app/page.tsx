import Whiteboard from './whiteboard'
import { ClientOnly } from './components/client-only'

export default function Page() {
  return (
    <>
      <ClientOnly>
        <Whiteboard />
      </ClientOnly>
    </>
  )
}