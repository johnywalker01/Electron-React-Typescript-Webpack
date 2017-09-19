// ============================================================================
// CInterval - A helper class to manipulate time intervals.
// ============================================================================

import { Clip } from 'src/serenity/resources'
import { RecordType } from 'src/serenity/primitives'
import * as common from './common'

export enum RECORDTYPE {
    CONTINUOUS,
    MOTION,
    ALARM,
    MANUAL,
    ANALYTIC,
    MARKED,
    MAX
}

// Time relationship between two intervals.  Note that they are symmetrical.
// If A IS_BEFORE B, then B IS_AFTER A.
// If A ENDS_DURING B, then B STARTS_DURING A.
// If A COVERS B, then B IS_DURING A.
// Thus the relation R(A,B) = -R(B,A)
enum RELATION {
    IS_BEFORE     = -3,
    ENDS_DURING   = -2,
    COVERS        = -1,
    MATCHES       =  0,
    IS_DURING     =  1,
    STARTS_DURING =  2,
    IS_AFTER      =  3,
}

const SEG_LEVELS = common.GAP_WIDTHS.length

export class CInterval {
    clip: Clip
    type: RECORDTYPE
    startTimeUTC: Date
    endTimeUTC: Date

    pNext: CInterval
    pPrev: CInterval
    pSegOwner: CInterval
    segOwnerLevel: number
    bAddHead: boolean
    pSegBegins: CInterval[] // SEG_LEVELS

    constructor(clip: Clip) {
        this.clip = clip
        this.type = this.recordTypeFromClipType(clip.event)
        this.startTimeUTC = new Date(clip.start_time)
        this.endTimeUTC = new Date(clip.end_time)
        this.pNext = null
        this.pPrev = null
        this.pSegOwner = null
        this.segOwnerLevel = SEG_LEVELS
        this.bAddHead = true
        this.pSegBegins = new Array<CInterval>(SEG_LEVELS)
        for (let i = 0; i < SEG_LEVELS; i++) {
            this.pSegBegins[i] = this
        }
    }

    SegStartTime(segLevel: number) { return this.SegStartInterval(segLevel).startTimeUTC }
    SegStopTime(segLevel: number) { return this.SegStopInterval(segLevel).endTimeUTC }

    recordTypeFromClipType(clipType: RecordType): RECORDTYPE {
        switch (clipType) {
            default:
            case 'analytic':
                return RECORDTYPE.ANALYTIC
            case 'alarm':
            case 'event':
                return RECORDTYPE.ALARM
            case 'manual':
                return RECORDTYPE.MANUAL
            case 'motion':
                return RECORDTYPE.MOTION
            case 'timed':
                return RECORDTYPE.CONTINUOUS
        }
    }

    SegLevelOwner(segLevel: number) {
        let pOwner: CInterval = this
        while (segLevel >= pOwner.segOwnerLevel) {
            pOwner = pOwner.pSegOwner
        }
        return pOwner
    }

    SegStartInterval(segLevel: number) {
        let pOwner = this.SegLevelOwner(segLevel)
        return pOwner.pSegBegins[segLevel]
    }

    SegStopInterval(segLevel: number) {
        let pOwner = this.SegLevelOwner(segLevel)
        return pOwner
    }

    TimeRelation(pNext: CInterval): number {
        if (this.endTimeUTC   <=  pNext.startTimeUTC) {return RELATION.IS_BEFORE}
        if (this.startTimeUTC   > pNext.startTimeUTC) {return -(pNext.TimeRelation(this))}
        if (this.endTimeUTC     > pNext.endTimeUTC)   {return RELATION.COVERS}

        if (this.startTimeUTC ===  pNext.startTimeUTC) {
            if (this.endTimeUTC   <   pNext.endTimeUTC) {
              return RELATION.IS_DURING
            } else {
              return RELATION.MATCHES
            }
        } else { // (startTimeUTC <  pNext.startTimeUTC)
            if (this.endTimeUTC   <   pNext.endTimeUTC) {
               return RELATION.ENDS_DURING
            } else {
              return RELATION.COVERS
            }
        }
    }

    AddNext(pNext: CInterval) {
        // First, trivial cases

        // If this interval is less than one second, ignore it
        if (this.endTimeUTC.getTime() - this.startTimeUTC.getTime() <= 1000) {
            this.bAddHead = false
            return
        }

        // If there's no list to add to, so become the new head
        if (!pNext) {
            this.bAddHead = true
            return
        }

        let relation = this.TimeRelation(pNext)
        if ((relation === RELATION.IS_BEFORE) || (relation === RELATION.ENDS_DURING)) {
            // Normal case:
            //    This interval is before the reset of the list.
            //        Link up, and become the new head of the list
            this.LinkNextInterval(pNext)
            this.bAddHead = true
            return
        }

        // Save this before we start traversing through the list.
        let pHead = pNext

        // We'll have to traverse the list. Since it is ordered, 
        // the relations between this and each interval in the list 
        // will follow this pattern (zero or more of each type)
        // Segment 1:
        //     RELATION.IS_AFTER
        //     RELATION.STARTS_DURING
        // Segment 2:
        //     RELATION.COVERS or RELATION.MATCHES
        // Segment 3:
        //     RELATION.ENDS_DURING
        //     RELATION.IS_BEFORE
        // Exception: This interval may be DURING another interval,
        // in which case, we'll just toss it out since it doesn't
        // give us any more information. We'll check for it as we go.
        // 
        // This interval will replace Segment 2:
        // ... -> pSeg1Last -> pSeg2 -> pSeg3First -> ...
        //    will become
        // ... -> pSeg1Last -> this  -> pSeg3First -> ...
        // We need to find the last interval in Segment 1 and the
        // first element in Segment 3.
        // Note: NULL of these are guaranteed to exist, but we've 
        // determined that the list contains at least one element
        // and it's not in Segment 3
        //
        // First, let's find the interval that will be 
        // to the left of this interval.
        let pSeg1LastFound = false
        let pSeg1Last: CInterval = null

        // While there are intervals to check, but we haven't found the right one...
        while (pNext && !pSeg1LastFound) {
            switch (this.TimeRelation(pNext)) {
                // This is the exceptional case mentioned above.
                // Nothing to do but bail out.
                case RELATION.MATCHES:
                case RELATION.IS_DURING:
                    this.bAddHead = false
                    return

                // This interval starts later than pNext, which means pNext
                // is in Segment 1, but we don't know if it is the last interval
                // in Segment 1.
                case RELATION.IS_AFTER:
                case RELATION.STARTS_DURING:
                    pSeg1Last = pNext
                    pNext = pNext.pNext
                    break

                // This interval starts before pNext, so we're now past Segment 1.
                // If pSeg1Last exists, we've already found it.
                // Don't increment here, as we don't know if pNext is in
                // Segment 2 or Segment 3.
                default:
                    pSeg1LastFound = true
                    break
            }
        }

        let pSeg3First: CInterval = null
        while (pNext && !pSeg3First) {
            switch (this.TimeRelation(pNext)) {
                // This is the exceptional case mentioned above.
                // Nothing to do but bail out.
                case RELATION.MATCHES:
                case RELATION.IS_DURING:
                    this.bAddHead = false
                    return

                case RELATION.IS_BEFORE:
                case RELATION.ENDS_DURING:
                    pSeg3First = pNext
                    break

                default:
                    break
            }
            pNext = pNext.pNext
        }

        // Segment 2 (if it exists) starts at either 
        // the head of the list or
        // right after the end of Segment 1
        let pSeg2First = pHead
        if (pSeg1Last) {
            pSeg2First = pSeg1Last.pNext
            // At this point, the existance of any element in Segment 1
            // marks the fact that this will not be the new head of the list.
            this.bAddHead = false
        }

        // First, replace Segment 2 with this interval by 
        // linking this to Segment 3...
        if (pSeg3First) {
            this.LinkNextInterval(pSeg3First)
        }

        // ...and then linking Segment 1 to this.
        if (pSeg1Last) {
            pSeg1Last.LinkNextInterval(this)
        }

        // Go through each element of Segment 2 until you get to Segment 3.
        // Note: there are eight possible combinations of the existence of Segments.
        // Exists? Seg1 Seg2 Seg3
        //          No   No   No  - Empty list, wouldn't get this far
        //          No   No   Yes - p2 == p3 == pHead
        //          No   Yes  No  - p2 == pHead, p3 == NULL
        //          No   Yes  Yes - p2 == pHead, p3 == some later interval
        //          Yes  No   No  - p2 == p3 == NULL
        //          Yes  No   Yes - p2 == p3
        //          Yes  Yes  No  - p2 == some interval, p3 == NULL
        //          Yes  Yes  Yes - p2 == some interval, p3 == some later interval
        // In all cases, when Seg2 exists, p3 is later in the list than p2 or
        // it is NULL (which is functionally later in the list)
        // and when Seg2 doesn't exists, p2 and p3 are equal.

        while (pSeg2First !== pSeg3First) {
            pSeg2First.pSegOwner = this
            pSeg2First.segOwnerLevel = 0
            pSeg2First = pSeg2First.pNext
        }

    }

    LinkNextInterval(pNext: CInterval): CInterval {
        if (!pNext) { return null }

        this.pNext = pNext
        pNext.pPrev = this

        // Find the level where these intervals link
        let linkLevel = SEG_LEVELS
        for (let segLevel = 0; segLevel < SEG_LEVELS; segLevel++) {
            let dist = (pNext.SegStartTime(segLevel).getTime() - this.SegStopTime(segLevel).getTime()) / 1000
            if ((dist > common.GAP_WIDTHS[segLevel])) {
                continue
            }
            linkLevel = segLevel
            break
        }

        if (linkLevel === SEG_LEVELS) {
            // These intervals are too far apart to currently affect each other
            return
        }

        for (let segLevel = linkLevel; segLevel < SEG_LEVELS; segLevel++) {
            let pSegOwner = pNext.SegLevelOwner(segLevel)
            if (this.SegStartTime(segLevel) < pSegOwner.SegStartTime(segLevel)) {
                pSegOwner.pSegBegins[segLevel] = this.SegStartInterval(segLevel)
            }
        }

        this.pSegOwner = pNext.SegLevelOwner(linkLevel)
        this.segOwnerLevel = linkLevel
    }

    NextSegLevelOwner(segLevel: number): CInterval {
        if (this.pNext) {return this.pNext.SegLevelOwner(segLevel)}
        return null
    }

    PrevSegLevelOwner(segLevel: number): CInterval {
        let pPossiblePrevious = this.pSegBegins[segLevel].pPrev
        while (pPossiblePrevious && (pPossiblePrevious.SegLevelOwner(segLevel) === this)) {
            pPossiblePrevious = pPossiblePrevious.pPrev
        }
        return pPossiblePrevious
    }

    FirstSegLevelOwner(segLevel: number, startTime: Date): CInterval {
        let pCurr: CInterval = this
        let currSegLevel = SEG_LEVELS
        while (pCurr && currSegLevel > segLevel) {
            currSegLevel--
            pCurr = pCurr.SegLevelOwner(segLevel)
            while (pCurr && startTime > pCurr.SegStopTime(currSegLevel)) {
                pCurr = pCurr.SegLevelOwner(currSegLevel).pNext
            }
        }
        return pCurr
    }
}
