interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  }

  return <span className={`${sizes[size]} font-black tracking-tight text-foreground`}>HABALUNA</span>
}
