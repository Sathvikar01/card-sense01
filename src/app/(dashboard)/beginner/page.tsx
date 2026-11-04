import { redirect } from 'next/navigation'

// The beginner flow merged into the advisor; keep old links working.
export default function BeginnerPage() {
  redirect('/advisor')
}
