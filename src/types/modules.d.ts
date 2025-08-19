declare module 'turndown' {
  interface TurndownOptions {
    headingStyle?: 'setext' | 'atx'
    hr?: string
    bulletListMarker?: '-' | '+' | '*'
    codeBlockStyle?: 'indented' | 'fenced'
    fence?: '```' | '~~~'
    emDelimiter?: '_' | '*'
    strongDelimiter?: '**' | '__'
    linkStyle?: 'inlined' | 'referenced'
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut'
  }

  class TurndownService {
    constructor(options?: TurndownOptions)
    turndown(html: string): string
  }

  export = TurndownService
}

declare module 'showdown' {
  interface ConverterOptions {
    omitExtraWLInCodeBlocks?: boolean
    noHeaderId?: boolean
    prefixHeaderId?: string | boolean
    rawPrefixHeaderId?: boolean
    ghCompatibleHeaderId?: boolean
    rawHeaderId?: boolean
    headerLevelStart?: number
    parseImgDimensions?: boolean
    simplifiedAutoLink?: boolean
    excludeTrailingPunctuationFromURLs?: boolean
    literalMidWordUnderscores?: boolean
    literalMidWordAsterisks?: boolean
    strikethrough?: boolean
    tables?: boolean
    tablesHeaderId?: boolean
    ghCodeBlocks?: boolean
    tasklists?: boolean
    smoothLivePreview?: boolean
    smartIndentationFix?: boolean
    disableForced4SpacesIndentedSublists?: boolean
    simpleLineBreaks?: boolean
    requireSpaceBeforeHeadingText?: boolean
    ghMentions?: boolean
    ghMentionsLink?: string
    encodeEmails?: boolean
    openLinksInNewWindow?: boolean
    backslashEscapesHTMLTags?: boolean
    emoji?: boolean
    underline?: boolean
    completeHTMLDocument?: boolean
    metadata?: boolean
    splitAdjacentBlockquotes?: boolean
  }

  export class Converter {
    constructor(options?: ConverterOptions)
    makeHtml(text: string): string
    makeMarkdown(html: string): string
  }
}
