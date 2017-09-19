export default class UrlParser {
  public static REG_EXP = new RegExp('(https?://)(.+@)?(.+)')
  public static USER_PASS_REG_EXP = new RegExp('(https?://)(.+@)?(.+)')

  public username?: string
  public password?: string
  public url: string

  parse(fullUrl: string) {
    const matches = UrlParser.REG_EXP.exec(fullUrl)
    if (!matches) {
      throw new Error('Invalid URL')
    }

    const protocol = matches[1]
    const hostPath = matches[3]
    this.url = protocol + hostPath

    const userPass = matches[2]
    if (userPass) {
      const colonIndex = userPass.indexOf(':')
      if (colonIndex >= 0) {
        this.username = userPass.slice(0, colonIndex)
        this.password = userPass.slice(userPass.indexOf(':') + 1, userPass.length - 1)
      } else {
        this.username = userPass.slice(0, userPass.length - 1)
      }
    }
  }
}
