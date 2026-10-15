import type { ReactElement, SVGProps } from 'react'

type Name = 'close' | 'arrow-left' | 'chat' | 'zoom-in' | 'zoom-out' | 'check' | 'minimize' | 'send' | 'bookmark' | 'directions' | 'message'

const paths: Record<Name, ReactElement> = {
  close: <path d="M5 5l10 10M15 5L5 15" />,
  'arrow-left': <path d="M12.5 4.5L7 10l5.5 5.5M7 10h9" />,
  chat: <path d="M4 5.5h12v8H9l-3.5 3v-3H4z" />,
  'zoom-in': <path d="M9 4a5 5 0 100 10A5 5 0 009 4zm3.6 8.6L16 16M9 7v4M7 9h4" />,
  'zoom-out': <path d="M9 4a5 5 0 100 10A5 5 0 009 4zm3.6 8.6L16 16M7 9h4" />,
  check: <path d="M4.5 10.5l3.5 3.5 7.5-8" />,
  minimize: <path d="M5 10h10" />,
  send: <path d="M4 10l12-6-4 12-2.5-4.5L4 10z" />,
  bookmark: <path d="M6 3.5h8v13l-4-3-4 3z" />,
  directions: <path d="M10 3l7 7-7 7-7-7 7-7zm-1.5 5h3.5v3.5M12 8l-4 4" />,
  message: <path d="M3.5 5.5h13v9h-13zM3.5 5.5L10 11l6.5-5.5" />,
}

export function Icon({ name, size = 16, ...rest }: { name: Name; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
