import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'

export function findContainerClose(state: StateBlock, startLine: number, endLine: number) {
  const markers = [3]
  let codeMarker = ''
  let codeLength = 0

  for (let line = startLine + 1; line < endLine; line++) {
    const start = state.bMarks[line] + state.tShift[line]
    const end = state.eMarks[line]
    if (start < end && state.sCount[line] < state.blkIndent) return -1
    if (state.sCount[line] - state.blkIndent >= 4) continue
    const content = state.src.slice(start, end).trimEnd()

    const fence = /^(`{3,}|~{3,})(.*)$/.exec(content)
    if (codeMarker) {
      if (fence && fence[1][0] === codeMarker && fence[1].length >= codeLength && !fence[2].trim()) {
        codeMarker = ''
      }
      continue
    }
    if (fence && !(fence[1][0] === '`' && fence[2].includes('`'))) {
      codeMarker = fence[1][0]
      codeLength = fence[1].length
      continue
    }

    const container = /^(:{3,})(.*)$/.exec(content)
    if (!container) continue
    if (container[2].trim()) {
      markers.push(container[1].length)
    } else if (container[1].length >= markers[markers.length - 1]) {
      markers.pop()
      if (markers.length === 0) return line
    }
  }

  return -1
}
