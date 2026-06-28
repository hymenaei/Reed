import type { SVGProps } from 'react'

/**
 * Icon set styled after miguelsolorio/symbols — minimalist, 16px optical,
 * 1.5px stroke, square caps. Curated subset covering all icons used by
 * the editor chrome, palette, and recents rail.
 *
 * Each icon accepts standard SVG props. Use `className` to size/color via Tailwind.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 16, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </Base>
)

export const IconFile = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 2.5h6L13 6.5V13.5H3Z" />
    <path d="M9 2.5V6.5H13" />
  </Base>
)

export const IconFilePlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 2.5h6L13 6.5V13.5H3Z" />
    <path d="M9 2.5V6.5H13" />
    <path d="M8 9.5V12M6.5 10.75H9.5" />
  </Base>
)

export const IconFolder = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 4.5h4l1.5 1.5H14V12.5H2Z" />
  </Base>
)

export const IconSave = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3.5h10V12.5H3Z" />
    <path d="M5.5 3.5V8H11V3.5" />
    <path d="M5.5 12.5V10H10.5V12.5" />
  </Base>
)

export const IconSun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.3 3.3 4.4 4.4M11.6 11.6 12.7 12.7M3.3 12.7 4.4 11.6M11.6 4.4 12.7 3.3" />
  </Base>
)

export const IconMoon = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 8.5A5 5 0 1 1 7.5 3 4 4 0 0 0 13 8.5Z" />
  </Base>
)

export const IconCommand = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6.5h8M4 9.5h8M6.5 4v8M9.5 4v8" />
    <path d="M5.5 6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM13.5 6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM5.5 9.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM13.5 9.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
  </Base>
)

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4 12 12M12 4 4 12" />
  </Base>
)

export const IconMinimize = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 8h9" />
  </Base>
)

export const IconMaximize = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="9" height="9" />
  </Base>
)

export const IconRestore = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="7.5" height="7.5" />
    <path d="M5.5 5V3.5H13V11H11.5" />
  </Base>
)

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 4.5V8L10.5 9.5" />
  </Base>
)

export const IconText = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3.5h10M3 5.5h10M5 8.5h6M5 10.5h6M3 12.5h10" />
  </Base>
)

export const IconHash = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 2 5 14M11 2 9 14M3 6h11M2 10h11" />
  </Base>
)

export const IconBold = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 3.5h4.5a2.5 2.5 0 0 1 0 5H4.5ZM4.5 8h5a2.5 2.5 0 0 1 0 5H4.5Z" />
  </Base>
)

export const IconItalic = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3.5h6M4 12.5h6M10 3.5 6 12.5" />
  </Base>
)

export const IconStrike = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8h10" />
    <path d="M5.5 4.5C5.5 3.7 6.5 3 8 3s2.5.6 2.5 1.5c0 .8-.7 1.3-1.5 1.7M4.5 11c.4 1.2 1.7 2 3.5 2 2 0 3.5-1 3.5-2.3 0-.8-.5-1.4-1.2-1.7" />
  </Base>
)

export const IconCode = (p: IconProps) => (
  <Base {...p}>
    <path d="M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4" />
  </Base>
)

export const IconCodeBlock = (p: IconProps) => (
  <Base {...p}>
    <rect x="2" y="3" width="12" height="10" />
    <path d="M6 6 4.5 8 6 10M10 6l1.5 2L10 10" />
  </Base>
)

export const IconQuote = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 4h4v4H4l-1 4V4ZM9 4h4v4h-3l-1 4V4Z" />
  </Base>
)

export const IconList = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4h9M5 8h9M5 12h9" />
    <circle cx="2.5" cy="4" r="0.75" fill="currentColor" />
    <circle cx="2.5" cy="8" r="0.75" fill="currentColor" />
    <circle cx="2.5" cy="12" r="0.75" fill="currentColor" />
  </Base>
)

export const IconListOrdered = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4h8M6 8h8M6 12h8" />
    <path d="M2.5 3.5h1v3M2.5 6.5h2M2.5 9.5h1.5l-1.5 1.5h1.5V8.5M2.5 11.5h2" />
  </Base>
)

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8.5 6.5 12 13 4.5" />
  </Base>
)

export const IconCheckbox = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="2.5" width="11" height="11" />
    <path d="M5 8.5 7 10.5 11 5.5" />
  </Base>
)

export const IconTable = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="3" width="11" height="10" />
    <path d="M2.5 6.5h11M2.5 9.5h11M6 3v10M10 3v10" />
  </Base>
)

export const IconHr = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 4h10M3 8h10M3 12h10" />
  </Base>
)

export const IconH1 = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3v10M8 3v10M3 8h5M11 3l3 1M13 4v9" />
  </Base>
)

export const IconH2 = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3v10M8 3v10M3 8h5M11 5c0-1 1-2 2-2s2 1 2 2-1 1.5-2 2-2 1-2 2.5h4" />
  </Base>
)

export const IconH3 = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3v10M8 3v10M3 8h5M11 3.5h4l-2 3.5c1 0 2 .5 2 2s-1 2-2 2-2-.5-2-1.5" />
  </Base>
)

export const IconLink = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 9.5 9.5 6.5" />
    <path d="M5 7 3.5 8.5a2.5 2.5 0 0 0 3.5 3.5L8.5 10.5M7.5 5 9 3.5a2.5 2.5 0 0 1 3.5 3.5L11 8.5" />
  </Base>
)

export const IconUndo = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6.5h6a3.5 3.5 0 0 1 0 7H6" />
    <path d="M6 4 3.5 6.5 6 9" />
  </Base>
)

export const IconRedo = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6.5H6a3.5 3.5 0 0 0 0 7h4" />
    <path d="M10 4l2.5 2.5L10 9" />
  </Base>
)

export const IconHistory = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6a5.5 5.5 0 1 1-1 3.5" />
    <path d="M3 3v3h3" />
    <path d="M8 5v3l2 1.5" />
  </Base>
)

export const IconTrash = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8h6l.5-8" />
  </Base>
)

export const IconChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3.5 10.5 8 6 12.5" />
  </Base>
)

export const IconChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 6 8 10.5 12.5 6" />
  </Base>
)

export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8h9M9 4.5 13 8 9 11.5" />
  </Base>
)

export const IconDot = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none" />
  </Base>
)

export const IconSettings = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M3.3 12.7l1.4-1.4M11.3 4.7l1.4-1.4" />
  </Base>
)

export const IconReload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12.5 4v3h-3" />
    <path d="M12.5 7A5 5 0 1 0 13 10" />
  </Base>
)

export const IconExport = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3v10h10V8" />
    <path d="M8 1.5v7M5 4.5 8 1.5l3 3" />
  </Base>
)

export const IconReader = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 3.5h5v9h-5ZM8.5 3.5h5v9h-5Z" />
  </Base>
)

export const IconEdit = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 13l3-.5L13 5l-2-2L4 10.5Z" />
    <path d="M11 4l2 2" />
  </Base>
)

export const IconTheme = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 2.5v11" />
    <path d="M8 2.5A5.5 5.5 0 0 0 8 13.5Z" fill="currentColor" stroke="none" />
  </Base>
)

export const IconDragHandle = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="4" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="4" r="1" fill="currentColor" stroke="none" />
    <circle cx="6" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="12" r="1" fill="currentColor" stroke="none" />
  </Base>
)

export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 3.5v9M3.5 8h9" />
  </Base>
)
