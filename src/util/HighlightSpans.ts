import { TruncateInfo } from 'src/components/StringTruncator'

export class HighlightSpans {
  spans: Array<string> = ['']

  addSegment(str: string, odd: boolean) {
    if (!str.length) {
      return
    }
    const lastOdd = this.spans.length % 2 === 1
    if (lastOdd === odd) {
      this.spans[this.spans.length - 1] += str
    } else {
      this.spans.push(str)
    }
  }

  buildFromPieces(pieces: RegExpExecArray, gaps: Array<TruncateInfo>) {
    if (!pieces) { return }
    let pos = 0
    const ellipsesAdded = new Set<TruncateInfo>()
    pieces.forEach((piece, i) => {
      // The first piece not really a piece, and there maybe empty pieces
      if (i === 0 || !piece) {
        return
      }

      // Matched pieces (to be highlighted) have even indexes, the inbetween pieces are odd
      const isMatchingPiece = i % 2 === 0

      // If the piece overlaps a gap
      let gap = gaps.find(
        testGap =>
          testGap.truncated && pos + piece.length >= testGap.gapStart && pos < testGap.gapEnd
      )

      if (gap) {
        if (pos < gap.gapStart) {
          this.addSegment(piece.slice(0, gap.gapStart - pos), isMatchingPiece)
        }
        if (!ellipsesAdded.has(gap)) {
          this.addSegment('...', false)
          ellipsesAdded.add(gap)
        }
        if (pos + piece.length > gap.gapEnd) {
          this.addSegment(piece.slice(gap.gapEnd - pos), isMatchingPiece)
        }
      } else {
        this.addSegment(piece, isMatchingPiece)
      }
      pos += piece.length
    })
  }

  splitSpans(splitPos: number): Array<HighlightSpans> {
    let firstSpans = new HighlightSpans()
    let lastSpans = new HighlightSpans()
    let pos = 0
    this.spans.forEach((span, i) => {
      let odd = i % 2 === 1
      let endPos = pos + span.length
      if (endPos <= splitPos) {
        firstSpans.addSegment(span, odd)
      } else if (pos > splitPos) {
        lastSpans.addSegment(span, odd)
      } else {
        firstSpans.addSegment(span.slice(0, splitPos - pos), odd)
        lastSpans.addSegment(span.slice(splitPos - pos), odd)
      }
      pos = endPos
    })
    return [firstSpans, lastSpans]
  }
}
