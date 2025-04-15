import { ConnectButton } from "@/components/wallet/connect-button"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center gap-8">
        <Logo className="w-32 h-32 md:w-48 md:h-48" />
        <h1 className="text-4xl md:text-6xl font-bold text-center">TPulseFi</h1>
        <p className="text-xl text-center text-muted-foreground max-w-2xl">
          Decentralized Finance on World Chain and PulseChain with World App integration
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <ConnectButton />
          <Button variant="outline" asChild>
            <Link href="https://worldcoin.org/download" target="_blank">
              Download World App
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
