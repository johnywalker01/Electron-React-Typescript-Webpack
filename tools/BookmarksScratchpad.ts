import { MSECONDS_PER_MINUTE } from '../src/util/constants'
import { BASE_URL } from '../src/util/constants'
// Run using ts-node
import Serenity from '../src/serenity'

// tslint:disable:no-console
class BookmarksScratchpad {
  serenity: Serenity
  async doStuff() {
    this.serenity = new Serenity()
    // await this.serenity.login('http://10.221.213.232', 'jcromwell', 'jcromwell111')
    await this.serenity.login(BASE_URL, 'admin', 'pelco123')
    let system = await this.serenity.system()
    let marksSet = await system.getBookmarks({time: '2017-05-24T21:02:55.000Z'})
    console.log(marksSet.bookmarks)
    // marksSet.postAddBookmark({
    //   data_source_id: 'uuid:c8397ab2-4331-eb76-eca8-f0ac4579cd04:video',
    //   time: '2017-05-31T21:02:55.000Z',
    // })
    const now = new Date()
    const startTime = new Date(now.getTime() - (MSECONDS_PER_MINUTE * 5))
    const endTime = new Date(now.getTime() - (MSECONDS_PER_MINUTE * 4))
    marksSet.postAddLockedBookmark({
      data_source_id: 'uuid:c8397ab2-4331-eb76-eca8-f0ac4579cd04:video',
      start_time: startTime,
      end_time: endTime,
    })

  }
}

if (require.main === module) {
  let c = new BookmarksScratchpad()
  c.doStuff()
}
