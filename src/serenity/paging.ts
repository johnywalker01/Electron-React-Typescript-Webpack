import { SerenityCollectionBase, SerenityObjectBase } from './resources'

export async function forEachX<Collection extends SerenityCollectionBase<Collection>,
                               Singular extends SerenityObjectBase>
                      (collectionFieldName: string, initialCollection: Collection,
                       callbackfn: (Singular) => void): Promise<void> {
    let collection = initialCollection

    while (true) {
      for (let x of collection[collectionFieldName]) {
        callbackfn(x)
      }

      if (collection.getNext) {
        collection = await collection.getNext({ count: collection[collectionFieldName].length })
      } else {
        break
      }
    }

    return
}

export async function getAllX<Collection extends SerenityCollectionBase<Collection>,
                                  Singular extends SerenityObjectBase>
                      (collectionFieldName: string, initialCollection: Collection): Promise<Array<Singular>> {
    const allItems = new Array<Singular>()

    forEachX(collectionFieldName, initialCollection, x => {
      allItems.push(x)
    })

    return allItems
}
