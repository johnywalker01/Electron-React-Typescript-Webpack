import Axios from 'axios'
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import * as lodash from 'lodash'
import logs from 'src/util/logs'

import * as base64 from './base64'
import * as params from './params'
import { Operator } from './params'
import { DataSession, Event, Events, NotificationRequestData, System } from './resources'

// tslint:disable:variable-name

export interface Typed {
  _type: string
}

export interface PostRequestConfig extends AxiosRequestConfig {
  returnLocation?: boolean
}

export type CreateMethod<T> = (data, serenity: Serenity) => T

export interface UsersFilter extends CommonFilters {
  name?: string
}

export class DataSourceSnapshot {
  src: string
  width: number
  height: number
}

export interface CommonFilters {
  start?: number
  count?: number
  embed?: object
}

export interface DataSourcesFilter extends CommonFilters {
  id?: string
  ip?: string
  name?: string
  // q?: Operand<'id' | 'ip' | 'name'>
  modified_since?: string
  q?: Operator
}

export interface ClipsFilter extends CommonFilters {
  search_start_time?: string
  search_end_time?: string
}

export interface DataSessionSettings {
  speed?: number
  time?: string
  x_resolution?: number
  y_resolution?: number
}

export interface NewMjpegDataSession extends DataSessionSettings {
  _type: 'NewMjpegDataSession'
}

export type SerenityCode =
  // 7.1 Data Retrieval
  'CameraUnavailable' |
  'EdgeOfStream' |
  'EndOfStream' |
  'NoAvailableStreams' |
  'StorageUnavailable' |
  // 7.2 Exporting
  'ExportDataUnretrievable' |
  'ExportStorageFull' |
  'ExportStorageUnauthenticated' |
  'ExportStorageUnavailable' |
  // 7.3 General Request
  'Conflict' |
  'InsufficientResources' |
  'NotReady' |
  'NotReadyUnauthenticated' |
  'OperationFailed' |
  'ResponseTooLarge' |
  // 7.4 Licensing
  'ActivationConflict' |
  'FnoHostNotFound' |
  'FnoOperationFailed' |
  'IncompatibleLicense' |
  'InvalidLicense' |
  'LicenseCountExceeded' |
  'LicenseRequired' |
  'LicenseReqLdapAdmin' |
  'NoLicense' |
  // 7.5 Locking / Prioritization
  'CameraInUse' |
  'CameraLocked' |
  'NeedOverride' |
  // 7.6 Resource Editing
  'InvalidValue' |
  'PortInUse' |
  'ReadOnlyField' |
  'ResourceLocked' |
  // 7.7 Security
  'AuthExpired' |
  'PasswordReqMoreDigits' |
  'PasswordReqMoreLower' |
  'PasswordReqMoreSpecial' |
  'PasswordReqMoreUpper' |
  'PasswordTooShort' |
  'PasswordTooSimilar' |
  'PermissionConflict' |
  'Unauthenticated' |
  'Unauthorized'

export interface ErrorEntity {
  code: SerenityCode,
  field: string,
  message: string,
  resource: any,
  _links: {
    '/pelco/rel/new_password': string
  }
}

export interface SerenityError {
  status: number
  errorEntity?: ErrorEntity
  errorMessage?: string
}

export interface VideoResponse {
  data?: any
  session: DataSession
  code: number
  timestamp?: Date
}

export const SERVER_DOES_NOT_SUPPORT_CHANGING_PASSWORD = new Error('The server does not support changing your password')

export default class Serenity {
  private baseUrl: string
  private username: string
  private client: AxiosInstance
  private cookie: string
  private cachedSystemPromise: Promise<System>
  private authFailureHandler: (SerenityError) => void
  get getUsername() { return this.username }

  /**
   * Login to the server, caching the /system call.  Auth failures on login
   * do not call the authFailureHandler.
   * @param baseUrl the base url of the server
   * @param username the username with which to authenticate
   * @param password the password with which to authenticate
   */
  login(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl
    this.username = username
    this.client = Axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/vnd.pelco.resource+json',
        'Accept': 'application/vnd.pelco.resource+json; version=4.5',
      },
      paramsSerializer: params.serialize,
      validateStatus: (status: number) => {return true},
    })

    this.client.interceptors.response.use(this.saveCookie, null)
    this.client.interceptors.request.use(this.sendCookie, null)

    this.client.interceptors.request.use(this.stripSerenityForPost, null)

    logs.SERENITY.debug('Caching system call')

    let headers = {}
    // Use username and password if passed in; otherwise, try using the cookie.
    if (username && password) {
      headers = {
        headers: {
          'X-Serenity-User': base64.encode(username),
          'X-Serenity-Password': base64.encode(password),
        },
      }
    }

    // getSimple() not used in order to avoid treating auth failure as expired session
    this.cachedSystemPromise = this.client.get('/system', headers)
        .then(this.throwSerenityErrors)
        .then(response => System.create(response.data, this)) as Promise<System>
    return this.cachedSystemPromise
  }

  saveCookie = (response: AxiosResponse) => {
    if (response && response.headers && response.headers['set-cookie']) {
      this.cookie = response.headers['set-cookie'][0]
    }
    return response
  }

  sendCookie = (config: AxiosRequestConfig) => {
    return this.cookie
      ? lodash.merge({}, config, {headers: {cookie: this.cookie}})
      : config
  }

  stripSerenityForPost = (config: AxiosRequestConfig) => {
    if (config.data) {
      this._stripSerenityForPostRecursive(config.data)
    }

    return config
  }

  _stripSerenityForPostRecursive(object: any) {
    for (let property in object) {
      if (object.hasOwnProperty(property)) {
        if (property === '_serenity') {
          delete object[property]
        }
        const value = object[property]
        if (value && typeof value !== 'string') {
          if (typeof value === 'object') {
            this._stripSerenityForPostRecursive(object[property])
          } else if (typeof value[Symbol.iterator] === 'function') {
            for (let element of value) {
              this._stripSerenityForPostRecursive(element)
            }
          }
        }
      }
    }
  }

  public getCookie() { return this.cookie }

  public system() {
    return this.cachedSystemPromise
  }

  /**
   * Attempts to change the current user's password.  Tries to navigate
   * System?embed=/pelco/rel/user:/pelco/rel/new_password.  If that throws
   * an 403/AuthExpired, then use the /pelco/rel/new_password link.
   */
  public async changePassword(currentPassword: string, newPassword: string) {
    let newPasswordPath
    try {
      const system = await this.login(this.baseUrl, this.username, currentPassword)
      const user = await system.getUser()
      newPasswordPath = user._links['/pelco/rel/new_password']
    } catch (serenityError) {
      logs.SERENITY.debug('Serenity error in changePassword():', serenityError)
      const errorEntity = (serenityError as SerenityError).errorEntity
      if (errorEntity && errorEntity.code === 'AuthExpired') {
        newPasswordPath = errorEntity._links['/pelco/rel/new_password']
      } else {
        throw serenityError
      }
    }

    if (!newPasswordPath) {
      logs.SERENITY.warn('No /pelco/rel/new_password link found')
      throw SERVER_DOES_NOT_SUPPORT_CHANGING_PASSWORD
    }

    const newPasswordRequest = {
      _type: 'NewPasswordRequest',
      new_password: newPassword,
    }

    await this.postSimple(newPasswordPath, newPasswordRequest, {
      headers: {
        'X-Serenity-User': base64.encode(this.username),
        'X-Serenity-Password': base64.encode(currentPassword),
      },
    })
  }

  public dataSession(endpoint: string, settings: DataSessionSettings) {
    const postData: NewMjpegDataSession = {_type: 'NewMjpegDataSession', ...settings}
    return this.postSimple<NewMjpegDataSession, DataSession>(endpoint, postData, undefined, DataSession.create)
      .then((dataSession) => {
        return {'endpoint': endpoint, 'settings': settings, 'session': dataSession}
      }) as Promise<{endpoint: string, settings: DataSessionSettings, session: DataSession}>
  }

  public dataSessionPatch(dataSession: DataSession, settings: DataSessionSettings) {
    return this.patchSimple(dataSession, settings)
      .then(() => {
        return {'session': dataSession, 'settings': settings}
      }) as Promise<{session: DataSession, settings: DataSessionSettings}>
  }

  public dataSessionData(dataSession: DataSession) {
    // getSimple() not used in order to process response headers
    const now = new Date()
    const url = `${dataSession._links['/pelco/rel/data']}?now=${now.getTime()}`
    return this.client.get(url,
      { responseType: 'arraybuffer', headers: { 'Accept': 'image/jpeg' } })
      .then(this.throwSerenityErrors)
      .then((response): VideoResponse => {
        let timestamp = null
        if (response.headers['x-resource-timestamp']) {
          timestamp = new Date(response.headers['x-resource-timestamp'])
          logs.VIDEO.debug(timestamp)
        }
        return {data: response.data, session: dataSession, code: response.status, timestamp: timestamp}
      })
      .catch(this.handleAuthFailures)
      .catch((error: SerenityError): VideoResponse => {
        return {session: dataSession, code: error.status}
      })
  }

  /**
   * GET the resource and handle errors
   * @param url the url to GET
   * @param config request configuration (ie headers)
   */
  public getSimple<T>(url: string, config?: AxiosRequestConfig, create?: CreateMethod<T>) {
    return this.client.get(url, config)
      .then(this.throwSerenityErrors)
      .then(response => response.data)
      .then(result => {
        if (result instanceof Object) {
          if (create) {
            return create(result, this)
          }
          result._serenity = this
        }
        return result
      })
      .catch(this.handleAuthFailures) as Promise<T>
  }
  /**
   * POST the data and handle errors
   * @param url the url to POST
   * @param data the data to POST
   * @param config request configuration (ie headers)
   */
  public postSimple<T extends Typed, U>(url: string, data: T, config?: PostRequestConfig, create?: CreateMethod<U>) {
    const postConfig = lodash.merge({headers: { 'Content-Type': 'application/vnd.pelco.resource+json' }}, config)
    return this.client.post(url, data, postConfig)
      .then(this.throwSerenityErrors)
      .then(response => {
        if (response.data) {
          return response.data
        } else if (response.headers.location) {
          if (config && config.returnLocation) {
            return response.headers.location
          } else {
            return this.getSimple<U>(response.headers.location, undefined, create)
          }
        } else {
          return null
        }
      })
      .catch(this.handleAuthFailures) as Promise<U>
  }

  /**
   * PATCH the data and handle errors
   * @param object the object whose edit link to PATCH
   * @param data the data to PATCH
   * @param config request configuration (ie headers)
   */
  public patchSimple<T, U>(object: {_links: {edit?: string}}, data: U, config?: AxiosRequestConfig) {
    // Ensure that Content-Type is patch if nothing was specified, but trust incoming config if it has a Content-Type
    const patchConfig = lodash.merge({headers: { 'Content-Type': 'application/vnd.pelco.patch+json' }}, config)
    return this.client.patch(object._links.edit, data, patchConfig)
      .then(this.throwSerenityErrors)
      .then(() => lodash.assign(object, data))
      .catch(this.handleAuthFailures) as Promise<T>
  }

  /**
   * DELETE the object and handle errors
   * @param object the object whose delete link to DELETE
   * @param config request configuration (ie headers)
   */
  public deleteSimple(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config)
      .then(this.throwSerenityErrors)
      .catch(this.handleAuthFailures) as Promise<void>
  }

  /**
   * Sets a handler for any auth failure (besides login).  If any auth failures
   * occur on subsequent calls, the handler will be called.
   * @param authFailureHandler the handler
   */
  public onAuthFailure(authFailureHandler: (serenityError: SerenityError) => void) {
    this.authFailureHandler = authFailureHandler
    return this
  }

  public async subscribeToAnyNotifications
  (
    request: NotificationRequestData,
    onEvent: (e: Event) => void
  ) {
    const system = await this.system()
    let wsUrl: string = await system.postEventWss(request, { returnLocation: true })
    if (!wsUrl.startsWith('ws')) {
      const loc = window.location
      wsUrl = loc.protocol === 'https:' ? 'wss://' : 'ws://' +
        loc.host +
        wsUrl
    }

    const webSocket = new WebSocket(wsUrl)

    webSocket.addEventListener('message', (message) => {
      if (message.data.length > 3) {
        let events = Events.create(JSON.parse(message.data), this)
        events.events.forEach(event => {
          onEvent(event)
        })
      }
    })

    return webSocket
  }

  /**
   * If an error occurred on a call, then construct a SerenityError
   * and throw it.
   */
  private throwSerenityErrors = (response: AxiosResponse) => {
    if (response.status < 300) {
      return response
    } else {
      if (logs.SERENITY.getLevel() <= LogLevel.DEBUG) {
        // tslint:disable-next-line:max-line-length
        logs.SERENITY.error(`Serenity ERROR: ${response.config.method.toUpperCase()} ${response.config.url} ${response.status} (${response.statusText})`, response)
      }
      const serenityError = { status: response.status } as SerenityError
      if (typeof(response.data) === 'object') {
        serenityError.errorEntity = response.data as ErrorEntity
        serenityError.errorMessage = null
      } else {
        serenityError.errorEntity = null
        serenityError.errorMessage = response.data
      }

      throw serenityError
    }
  }

  /**
   * If a request fails due to an auth failure, call the auth failure handler
   * function to allow ending the session.
   */
  private handleAuthFailures = (serenityError: SerenityError) => {
    if (serenityError.errorEntity) {
      const status = serenityError.status
      const code = serenityError.errorEntity.code
      if (this.authFailureHandler && status === 403
        && (code === 'Unauthenticated' || code === 'AuthExpired')) {
        this.authFailureHandler(serenityError)
        return null
      }
    }

    throw serenityError
  }
}
