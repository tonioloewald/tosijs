import { Color } from './color'

type CSSBasicAlign = 'nomal' | 'stretch'
type CSSPositionalAlign = 'center' | 'start' | 'end' | 'flex-start' | 'flex-end'
type CSSDistributedAlign =
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
type CSSSelfAlign = 'self-start' | 'self-end'
type CSSBaselineAlign = 'baseline' | 'first baseline' | 'last baseline'
type CSSOverflowAlign = 'safe center' | 'unsafe center'
type CSSGlobalValues =
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'unset'
  | 'revert-layer'
type CSSAnimationDirection =
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'aternate-reverse'
type CSSAnimationFillMode = 'node' | 'forwards' | 'backwards' | 'both'
type CSSAnimationPlayState = 'paused' | 'running'
type CSSAnimationTimingFunction =
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'linear'
  | 'step-start'
  | 'step-end'
type CSSAppearance = 'none' | 'auto'
type CSSCursor = 'auto' | 'default' | 'none'
type CSSCursorLink = 'context-menu' | 'help' | 'pointer' | 'progress' | 'wait'
type CSSCursorSelection = 'cell' | 'crosshair' | 'text' | 'vertical-text'
type CSSCursorDrag =
  | 'alias'
  | 'copy'
  | 'move'
  | 'no-drop'
  | 'not-allowed'
  | 'grap'
  | 'grabbing'
type CSSCursorCompass =
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'se-resize'
  | 'sw-resize'
  | 'nw-resize'
  | 'nesw-resize'
  | 'nwse-resize'
type CSSCursorResize = 'col-resize' | 'row-resize'
type CSSCursorScroll = 'all-scroll'
type CSSCursorZoom = 'zoom-in' | 'zoom-out'
type CSSDisplay =
  | 'block'
  | 'inline-block'
  | 'none'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'flow-root'
  | 'contents'
type CSSDisplayOther = 'table' | 'table-row' | 'list-item'
type CSSDisplayMulti =
  | 'block flow'
  | 'inline flow'
  | 'inline flow-root'
  | 'block-flex'
  | 'block-grid'
  | 'inline grid'
  | 'block flow-root'
type CSSFloat = 'left' | 'right' | 'none' | 'inline-start' | 'inline-end'
type CSSFlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
type CSSFlexFlow =
  | CSSFlexDirection
  | CSSFlexWrap
  | 'row nowrap'
  | 'column wrap'
  | 'column-reverse wrap-reverse'
type CSSFlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
type CSSPointerEvents = 'auto' | 'none'
type CSSSVGPointerEvents =
  | 'stroke'
  | 'fill'
  | 'visibleFill'
  | 'visibleStroke'
  | 'visible'
  | 'painted'
  | 'fill'
  | 'stroke'
  | 'all'
type CSSOverflow =
  | 'visible'
  | 'hidden'
  | 'clip'
  | 'scroll'
  | 'auto'
  | 'hidden visible'
type CSSPosition = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
type CSSTouchAction =
  | 'auto'
  | 'none'
  | 'pan-x'
  | 'pan-left'
  | 'pan-right'
  | 'pan-y'
  | 'pan-up'
  | 'pan-down'
  | 'pinch-zoom'
  | 'manipulation'
type CSSVisibility = 'visible' | 'hidden'
type CSSWhiteSpace =
  | 'normal'
  | 'nowrap'
  | 'pre'
  | 'pre-wrap'
  | 'pre-line'
  | 'break-spaces'
type CSSWordBreak = 'normal' | 'break-all' | 'keep-all'

export interface XinStyleRule {
  accentColor?: Color | string
  alignContent?:
    | CSSBasicAlign
    | CSSBaselineAlign
    | CSSDistributedAlign
    | CSSPositionalAlign
    | CSSGlobalValues
    | string
  alignItems?:
    | CSSBasicAlign
    | CSSPositionalAlign
    | CSSBaselineAlign
    | CSSOverflowAlign
    | CSSGlobalValues
    | CSSSelfAlign
    | string
  alignSelf?:
    | 'auto'
    | CSSBasicAlign
    | CSSPositionalAlign
    | CSSBaselineAlign
    | CSSOverflowAlign
    | CSSGlobalValues
    | string
  all?: CSSGlobalValues | string
  animation?: string
  animationDelay?: string
  animationDirection?: CSSAnimationDirection | string
  animationDuration?: string
  animationFillMode?: CSSAnimationFillMode | string
  animationIterationCount?: string | number
  animationName?: string
  animationPlayState?: CSSAnimationPlayState | CSSGlobalValues | string
  animationTimingFunction?:
    | CSSAnimationTimingFunction
    | CSSGlobalValues
    | string
  appearance?: CSSAppearance | CSSGlobalValues | string
  aspectRatio?: 'auto' | CSSGlobalValues | string
  backdropFilter?: 'none' | string | CSSGlobalValues | string
  backfaceVisibility?: CSSVisibility | CSSGlobalValues | string
  background?: Color | string
  backgroundAttachment?: string | number
  backgroundBlendMode?: string
  backgroundClip?: string | number
  backgroundColor?: Color | string
  backgroundImage?: string
  backgroundOrigin?: string | number
  backgroundPosition?: string | number
  backgroundRepeat?: string | number
  backgroundSize?: string | number
  border?: string | number
  borderBottom?: string | number
  borderBottomColor?: Color | string
  borderBottomLeftRadius?: string | number
  borderBottomRightRadius?: string | number
  borderBottomStyle?: string | number
  borderBottomWidth?: string | number
  borderCollapse?: string | number
  borderColor?: Color | string
  borderImage?: string
  borderImageOutset?: string | number
  borderImageRepeat?: string | number
  borderImageSlice?: string | number
  borderImageSource?: string | number
  borderImageWidth?: string | number
  borderLeft?: string | number
  borderLeftColor?: Color | string
  borderLeftStyle?: string | number
  borderLeftWidth?: string | number
  borderRadius?: string | number
  borderRight?: string | number
  borderRightColor?: Color | string
  borderRightStyle?: string | number
  borderRightWidth?: string | number
  borderSpacing?: string | number
  borderStyle?: string | number
  borderTop?: string | number
  borderTopColor?: Color | string
  borderTopLeftRadius?: string | number
  borderTopRightRadius?: string | number
  borderTopStyle?: string | number
  borderTopWidth?: string | number
  borderWidth?: string | number
  bottom?: string | number
  boxShadow?: string | number
  boxSizing?: string | number
  captionSide?: string | number
  caretColor?: Color | string
  clear?: string | number
  clip?: string | number
  clipPath?: string | number
  color?: Color | string
  columnCount?: string | number
  columnFill?: string | number
  columnGap?: string | number
  columnRule?: string | number
  columnRuleColor?: Color | string
  columnRuleStyle?: string | number
  columnRuleWidth?: string | number
  columnSpan?: string | number
  columnWidth?: string | number
  columns?: string | number
  content?: string | number
  counterIncrement?: string | number
  counterReset?: string | number
  cursor?:
    | CSSCursor
    | CSSCursorDrag
    | CSSCursorLink
    | CSSCursorResize
    | CSSCursorCompass
    | CSSCursorSelection
    | CSSCursorScroll
    | CSSCursorZoom
    | CSSGlobalValues
    | string
  direction?: string | number
  display?:
    | CSSDisplay
    | CSSDisplayOther
    | CSSDisplayMulti
    | CSSGlobalValues
    | string
  emptyCells?: 'show' | 'hide' | CSSGlobalValues | string
  filter?: string | CSSGlobalValues | string
  flex?: string | number
  flexBasis?: string | number
  flexDirection?: CSSFlexDirection | CSSGlobalValues | string
  flexFlow?: CSSFlexFlow | CSSGlobalValues
  flexGrow?: string | number
  flexShrink?: string | number
  flexWrap?: CSSFlexWrap | CSSGlobalValues
  float?: CSSFloat | CSSGlobalValues
  font?: string | number
  fontFamily?: string | number
  fontKerning?: string | number
  fontSize?: string | number
  fontSizeAdjust?: string | number
  fontStretch?: string | number
  fontStyle?: string | number
  fontVariant?: string | number
  fontWeight?: string | number
  grid?: string | number
  gridArea?: string | number
  gridAutoColumns?: string | number
  gridAutoFlow?: string | number
  gridAutoRows?: string | number
  gridColumn?: string | number
  gridColumnEnd?: string | number
  gridColumnGap?: string | number
  gridColumnStart?: string | number
  gridGap?: string | number
  gridRow?: string | number
  gridRowEnd?: string | number
  gridRowGap?: string | number
  gridRowStart?: string | number
  gridTemplate?: string | number
  gridTemplateAreas?: string | number
  gridTemplateColumns?: string | number
  gridTemplateRows?: string | number
  height?: string | number
  hyphens?: string | number
  justifyContent?: string | number
  left?: string | number
  letterSpacing?: string | number
  lineHeight?: string | number
  listStyle?: string | number
  listStyleImage?: string
  listStylePosition?: string | number
  listStyleType?: string | number
  margin?: string | number
  marginBottom?: string | number
  marginLeft?: string | number
  marginRight?: string | number
  marginTop?: string | number
  maxHeight?: string | number
  maxWidth?: string | number
  minHeight?: string | number
  minWidth?: string | number
  objectFit?: string | number
  objectPosition?: string | number
  opacity?: string | number
  order?: string | number
  outline?: string | number
  outlineColor?: Color | string
  outlineOffset?: string | number
  outlineStyle?: string | number
  outlineWidth?: string | number
  overflow?: CSSOverflow | CSSGlobalValues | string
  overflowX?: CSSOverflow | CSSGlobalValues | string
  overflowY?: CSSOverflow | CSSGlobalValues | string
  padding?: string | number
  paddingBottom?: string | number
  paddingLeft?: string | number
  paddingRight?: string | number
  paddingTop?: string | number
  pageBreakAfter?: string | number
  pageBreakBefore?: string | number
  pageBreakInside?: string | number
  perspective?: string | number
  perspectiveOrigin?: string | number
  pointerEvents?:
    | CSSPointerEvents
    | CSSSVGPointerEvents
    | CSSGlobalValues
    | string
  position?: CSSPosition | CSSGlobalValues | string
  quotes?: string
  right?: string | number
  scrollBehavior?: string | number
  tableLayout?: string | number
  textAlign?: string | number
  textAlignLast?: string | number
  textDecoration?: string | number
  textDecorationColor?: Color | string
  textDecorationLine?: string | number
  textDecorationStyle?: string | number
  textIndent?: string | number
  textJustify?: string | number
  textOverflow?: string | number
  textShadow?: string | number
  textTransform?: string | number
  top?: string | number
  touchAction?: CSSTouchAction | CSSGlobalValues | string
  transform?: string
  transformOrigin?: string
  transformStyle?: string
  transition?: string
  transitionDelay?: string
  transitionDuration?: string
  transitionProperty?: string
  transitionTimingFunction?: string
  userSelect?: string | number
  verticalAlign?: string
  visibility?: CSSVisibility | 'collapse' | CSSGlobalValues | string
  whiteSpace?: CSSWhiteSpace | CSSGlobalValues | string
  width?: string | number
  widows?: string | number
  wordBreak?: CSSWordBreak | CSSGlobalValues | string
  wordSpacing?: string | number
  wordWrap?: string | number
  writingMode?: string
  zIndex?: string | number
  [key: string]: Color | string | number | undefined
}

export interface XinStyleMap {
  [key: string]: XinStyleRule
}

export interface XinStyleSheet {
  [key: string]: XinStyleRule | XinStyleMap | string
}
