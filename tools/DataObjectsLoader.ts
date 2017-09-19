// Run using ts-node

import Serenity from 'src/serenity'
import { CollectionHeader } from 'src/serenity/resources'
import { BASE_URL } from 'src/util/constants'

export interface DataObject {
  client_type: string,
  data: any,
  id: string,
  owner: string
}

export interface DataObjects {
  collection_header: CollectionHeader
  data_objects: DataObject[]
}

// tslint:disable:no-console
class DataObjectLoader {
  serenity: Serenity
  async doStuff() {
    this.serenity = new Serenity()
    await this.serenity.login(BASE_URL, 'admin', 'pel2899100')
    let system = await this.serenity.system()
    let dataObjectsCollection = await this.serenity.getSimple<DataObjects>(system._links['/pelco/rel/data_objects'])
    dataObjectsCollection.data_objects.forEach(dataObject => {
      console.log(`Owner: ${dataObject.owner}, Client Type: ${dataObject.client_type}`)
    })
  }
}

if (require.main === module) {
  let c = new DataObjectLoader()
  c.doStuff()
}
