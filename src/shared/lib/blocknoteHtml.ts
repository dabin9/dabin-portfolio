const EMPTY_BLOCKNOTE_PARAGRAPH_RE =
  /<div\b(?=[^>]*\bbn-block-outer\b)[^>]*>\s*<div\b(?=[^>]*\bbn-block\b)[^>]*>\s*<div\b(?=[^>]*\bbn-block-content\b)(?=[^>]*\bdata-content-type=["']paragraph["'])[^>]*>\s*<p\b(?=[^>]*\bbn-inline-content\b)[^>]*>\s*(?:<span\b(?=[^>]*\bProseMirror-trailingBreak\b)[^>]*>\s*<\/span>|&nbsp;|\s)*<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/gi;

export function stripEmptyBlockNoteBlocks(html: string): string {
  return html.replace(EMPTY_BLOCKNOTE_PARAGRAPH_RE, "").trim();
}
