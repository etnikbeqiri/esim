import { Loader2Icon } from "lucide-react"

import { useTrans } from "@/hooks/use-trans"
import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const { trans } = useTrans()

  return (
    <Loader2Icon
      role="status"
      aria-label={trans("common.loading")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
