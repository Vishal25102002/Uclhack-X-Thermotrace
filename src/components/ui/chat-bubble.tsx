import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chatBubbleVariant = cva(
  "flex gap-2 max-w-[80%] items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  }
)

const chatBubbleMessageVariant = cva("p-4 rounded-lg", {
  variants: {
    variant: {
      received: "bg-gray-100 text-gray-900 rounded-bl-none",
      sent: "bg-blue-600 text-white rounded-br-none",
    },
    layout: {
      default: "",
      ai: "border-t rounded-none bg-transparent p-4",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
})

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "received" | "sent"
  layout?: "default" | "ai"
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, layout, children, ...props }, ref) => (
    <div
      className={cn(chatBubbleVariant({ variant, layout, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
)
ChatBubble.displayName = "ChatBubble"

interface ChatBubbleAvatarProps {
  src?: string
  fallback?: string
  className?: string
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({
  src,
  fallback,
  className,
}) => (
  <div className={cn("flex items-center justify-center", className)}>
    {src ? (
      <img
        src={src}
        alt="Avatar"
        className="w-8 h-8 rounded-full object-cover"
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
        {fallback}
      </div>
    )}
  </div>
)

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariant> {}

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(({ className, variant, layout, children, ...props }, ref) => (
  <div
    className={cn(chatBubbleMessageVariant({ variant, layout, className }))}
    ref={ref}
    {...props}
  >
    {children}
  </div>
))
ChatBubbleMessage.displayName = "ChatBubbleMessage"

interface ChatBubbleTimestampProps extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => (
  <div className={cn("text-xs text-gray-500 mt-1", className)} {...props}>
    {timestamp}
  </div>
)

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  chatBubbleVariant,
  chatBubbleMessageVariant,
}
