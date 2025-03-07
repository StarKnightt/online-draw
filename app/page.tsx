import Whiteboard from './whiteboard'

export default function Page() {
  return (
    <>
      <Whiteboard />
      <div className="fixed bottom-2 right-2 text-xs text-gray-400">
        Whiteboard App v1.0.0
      </div>
    </>
  )
}