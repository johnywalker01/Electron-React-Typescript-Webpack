export default class FieldSorter {
  private static DEFAULT_WEIGHT = 50
  private static WEIGHTS = {
    _type: 5,
    id: 10,
    name: 15,
    start_time: 16,
    end_time: 17,
    self: 20,
    edit: 25,
    delete: 30,

    data: 85,
    data_interfaces: 86,
    _system_id: 88,
    _limits: 89,
    _links: 90,
    _embedded: 95,
  }

  sort = (obj: any) => {
    if (obj) {
      delete obj._serenity

    }

    if (obj instanceof Array) {
      return obj.map(this.sort)
    }

    if (obj == null || typeof obj === 'string') {
      return obj
    }

    const unsortedKeys = Object.keys(obj)
    if (unsortedKeys.length === 0) {
      return obj
    }

    const sortedKeys = unsortedKeys.sort(this.compare)

    return sortedKeys
      .reduce((sorted, key) => {
        const sortedValue = this.sort(obj[key])
        sorted[key] = sortedValue
        return sorted
      }, {})
  }

  compare = (a: string, b: string) => {
    const aWeight = FieldSorter.WEIGHTS[a] || FieldSorter.DEFAULT_WEIGHT
    const bWeight = FieldSorter.WEIGHTS[b] || FieldSorter.DEFAULT_WEIGHT
    const weight = aWeight + -1 * bWeight
    return weight !== 0 ? weight : a.localeCompare(b)
  }
}
