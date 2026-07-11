import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="gradient" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
            <Link href="/tools" className="flex items-center gap-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              Explore Tools
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
