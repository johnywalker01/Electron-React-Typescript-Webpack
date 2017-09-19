// Run using ts-node
import Serenity from '../src/serenity'
import { DataSource, Tag } from '../src/serenity/resources'
import { BASE_URL } from '../src/util/constants'

interface TagArray {
  [index: number]: Tag
}

// tslint:disable:no-console
class TagsScratchpad {
  serenity: Serenity
  async doStuff() {
    this.serenity = new Serenity()
    await this.serenity.login(BASE_URL, 'admin', 'pel2899100')
    let system = await this.serenity.system()
    let tags = await system.getTags({embed: {'/pelco/rel/resources': {}}})
    let tagSet: Map<string, Array<Tag>> = new Map()
    await tags.tags.forEach(async tag => {
      let resources = await tag.getResources()
      await resources.resources.forEach((rawDataSource: DataSource) => {
        console.log(`tag: ${tag.name}, ds: ${rawDataSource.name}`)
        let tagArray = tagSet.get(rawDataSource.id)
        if (!tagArray) {
          tagArray = new Array()
          tagSet.set(rawDataSource.id, tagArray)
        }
        tagArray.push(tag)
      })
    })
    console.log(tagSet)
  }
}

if (require.main === module) {
  let c = new TagsScratchpad()
  c.doStuff()
}
