import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center h-full py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link href="/parsers/transaction">
          <Button>
            메인 페이지로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
} 