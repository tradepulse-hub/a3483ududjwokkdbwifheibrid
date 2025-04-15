import Image from "next/image"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo1-hRzfW2ThLdFMsZopq7IzpkblPICgTF.png"
        alt="TPulseFi Logo"
        width={200}
        height={200}
        className="w-full h-full"
      />
    </div>
  )
}
