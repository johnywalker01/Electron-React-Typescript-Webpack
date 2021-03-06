/**
 * This file was generated by running this command:
 * ts-node tools\generators\generateSerenityPrimitives.ts
 * on 8/29/2017, 1:28:06 PM
 * from serenity/pyserenity/util/primitive.py (branch master, commit 29f1886)
 * (if modified by hand, replace this line with modification description)
 */
export type AckState =
 | 'acked'
 | 'auto_acked'
 | 'ack_needed'
 | 'no_ack_needed'
 | 'silenced'
export type AddressMode =
 | 'auto'
 | 'auto_address_only'
 | 'disabled'
 | 'manual'
export type AlarmState =
 | 'active'
 | 'inactive'
 | 'unknown'
export type ArchType =
 | 'x86-32'
 | 'x86-64'
export type AuthProtocol =
 | 'md5'
 | 'sha'
 | 'none'
export type BackupStatus =
 | 'failed'
 | 'halted'
 | 'inprogress'
 | 'successful'
 | 'unknown'
export type BackupStatusReason =
 | 'backup_storage_full'
 | 'backup_storage_unauthenticated'
 | 'backup_storage_unavailable'
 | 'shadow_copy_creation_failure'
 | 'shadow_copy_mount_failure'
 | 'unknown'
export type BalancerType =
 | 'active_passive'
 | 'external'
 | 'nlb'
 | 'none'
export type Boolean = string
export type CellLayout =
 | '1x1'
 | '1x2'
 | '2x1'
 | '2x2'
 | '2x3'
 | '3x2'
 | '3x3'
 | '4x3'
 | '4x4'
 | '8x8'
 | '1+12'
 | '2+8'
 | '3+4'
 | '1+5'
 | '1+7'
 | '12+1'
 | '8+2'
 | '1+4tall'
 | '1+4wide'
export type DateTime = string
export type DataSourceType =
 | 'video'
 | 'audio'
export type DataStorageType =
 | 'ds'
 | 'edge'
 | 'nsm'
 | 'vxs'
export type DayOfWeek =
 | 'mon'
 | 'tue'
 | 'wed'
 | 'thu'
 | 'fri'
 | 'sat'
 | 'sun'
export type DbStatus =
 | 'failed'
 | 'ok'
 | 'rebuilding'
 | 'recovering'
export type DeviceState =
 | 'online'
 | 'offline'
export type DeviceStatus =
 | 'id_inconsistent'
 | 'initializing'
 | 'unauthenticated'
export type DeviceType =
 | 'acc'
 | 'all_in_one'
 | 'camera'
 | 'core'
 | 'core_mg'
 | 'decoder'
 | 'encoder'
 | 'external'
 | 'manager'
 | 'mg'
 | 'monitor'
 | 'recorder'
 | 'vcd'
 | 'udi'
 | 'ui'
 | 'unknown'
export type DhcpMode =
 | 'enabled'
 | 'disabled'
export type DhcpMode6 =
 | 'stateless'
 | 'stateful'
 | 'disabled'
export type EmbedParams = string
export type ExportFormat = string
export type ExportStatus =
 | 'exporting'
 | 'failed'
 | 'pending'
 | 'successful'
export type ExportStatusReason =
 | 'export_data_unretrievable'
 | 'export_storage_full'
 | 'export_storage_unauthenticated'
 | 'export_storage_unavailable'
export type FeatureName =
 | 'E1-COR-SUP'
 | 'E1-COR-SVR'
 | 'E1-COR-SW'
 | 'E1-MGW-SUP'
 | 'E1-MGW-SVR'
 | 'E1-MGW-SW'
 | 'E1-NSM'
 | 'E1-OPS'
 | 'E1-VSM'
 | 'E1-VXS-SVR'
 | 'E1-VXS-SW'
 | 'E2-1C-ADD'
 | 'E2-1C-SUP1'
 | 'E2-1C-SUP3'
 | 'E2-AGG-1CP'
 | 'E2-AGG-1C'
 | 'E2-AGG-1P'
 | 'E2-COR-SVR'
 | 'E2-COR-SW'
 | 'E2-DSS-1UP'
 | 'E2-EVAL'
 | 'E2-EVAL-EXT'
 | 'E2-MGW-SVR'
 | 'E2-MGW-SW'
 | 'E2-NSM-1UP'
 | 'E2-SUP-EXT-1C1D'
 | 'E2-VSM-SVR'
 | 'E2-VXS-SVR'
 | 'E2-VXS-SW'
 | 'P2-1C-ADD'
 | 'P2-1C-SUP1'
 | 'P2-1C-SUP3'
 | 'P2-EVAL'
 | 'P2-LITE-EXT'
 | 'P2-LITE'
 | 'P2-PRO-SVR'
 | 'P2-PRO-SW'
 | 'P2-SUP-EXT-1C1D'
 | 'U1-AGG'
 | 'U1-COR-SUP'
 | 'U1-COR-SVR'
 | 'U1-COR-SW'
 | 'U1-MGW-SUP'
 | 'U1-MGW-SVR'
 | 'U1-MGW-SW'
 | 'U1-NSM'
 | 'U1-OPS'
 | 'U1-VSM'
 | 'U1-VXS-SVR'
 | 'U1-VXS-SW'
 | 'VX-DEVICE-GRACE'
 | 'VX-SITE-GRACE'
export type Float = string
export type FocusDirection =
 | 'near'
 | 'far'
 | 'stop'
export type GapReason =
 | 'camera_offline'
 | 'invalid_camera_credentials'
 | 'storage_offline'
 | 'stream_loss'
 | 'stream_source_changed'
 | 'time_jump'
 | 'transport_changed'
 | 'write_error'
 | 'unknown'
export type HddStatus =
 | 'failed'
 | 'ok'
 | 'missing'
 | 'rebuilding'
export type Host = string
export type Integer = string
export type IP = string
export type IPv4 = string
export type IPv4Range = string
export type IPv6 = string
export type IPv6ap = string
export type IPInfo =
 | 'ntp_server'
 | 'present'
 | 'sm5200_primary'
 | 'sm5200_secondary'
export type IrisDirection =
 | 'open'
 | 'close'
 | 'stop'
export type KJObject = string
export type KVObject = string
export type Limits = string
export type Link = string
export type List = string
export type Map = string
export type MediaType = string
export type MemberState =
 | 'online'
 | 'pending'
 | 'removing'
 | 'unauthorized'
 | 'unavailable'
 | 'unknown'
export type MemberTranscast =
 | 'multicast-multicast'
 | 'unicast-unicast'
export type MgTranscast =
 | 'multicast-multicast'
 | 'multicast-unicast'
 | 'unicast-unicast'
export type MonitorPosition = string
export type OsType =
 | 'linux'
 | 'windows'
export type PermissionID =
 | '/internal/admin'
 | '/internal/user'
 | '/surveil/video'
 | '/surveil/video/ptz'
 | '/surveil/video/ptz/lock'
 | '/surveil/video/record'
 | '/surveil/video/alarms'
 | '/surveil/video/relays'
 | '/surveil/video/launchtabs'
 | '/invest/clips'
 | '/invest/clips/marks'
 | '/invest/clips/marks/locks'
 | '/invest/clips/priexports'
 | '/invest/clips/exports'
 | '/plugin/usemap'
 | '/plugin/usemap/view'
 | '/plugin/usemap/view/markers'
 | '/plugin/usemap/view/config'
 | '/plugin/useec'
 | '/super/reports'
 | '/super/ptzpresets'
 | '/super/tours'
 | '/super/viewworkspaces'
 | '/super/workspaces'
 | '/super/viewusrevents'
 | '/super/multiview'
 | '/events/viewsysevents'
 | '/events/handle'
 | '/events/settings'
 | '/usr/accounts'
 | '/usr/accounts/assignroles'
 | '/usr/accounts/aggregator'
 | '/usr/resetpw'
 | '/usr/roles'
 | '/dev/tags'
 | '/dev/io'
 | '/dev/licenses'
 | '/dev/software'
 | '/dev/settings'
 | '/dev/displays'
 | '/dev/monitorwalls'
 | '/sys/licenses'
 | '/sys/locale'
 | '/sys/shortcuts'
 | '/sys/recording'
 | '/sys/viewhealth'
 | '/sys/servers'
 | '/sys/servers/members'
export type QuickLogStatus =
 | 'failed'
 | 'inprogress'
 | 'successful'
export type QuickReportStatus =
 | 'failed'
 | 'inprogress'
 | 'successful'
export type PhoneNumber = string
export type PhoneType =
 | 'home'
 | 'home_fax'
 | 'mobile'
 | 'other'
 | 'pager'
 | 'work'
 | 'work_fax'
export type PrivacyProtocol =
 | 'aes'
 | 'des'
 | 'none'
export type RecordFramerate =
 | 'low'
 | 'normal'
export type RecordType =
 | 'alarm'
 | 'analytic'
 | 'event'
 | 'manual'
 | 'motion'
 | 'timed'
export type RecurrenceType =
 | 'daily'
 | 'monthly'
 | 'yearly'
 | 'weekly'
export type RelayState =
 | 'active'
 | 'inactive'
 | 'unknown'
export type RenderType =
 | 'evo'
 | 'optera.180'
 | 'optera.270'
 | 'optera.360'
 | 'standard'
export type ReportContent =
 | 'camera_config'
 | 'device_info'
 | 'event_history'
 | 'online_offline'
 | 'recorder_config'
 | 'recorder_diag'
 | 'user_actions'
 | 'vx_cluster_config'
export type Resource = string
export type ResourceRef = string
export type RetentionPriority =
 | 'low'
 | 'medium'
 | 'high'
export type RtspCapability =
 | 'tcp'
 | 'tcp|udp'
 | 'tcp|udp|multicast'
export type SASLString = string
export type ScheduleAction =
 | 'eventsourcerecord'
 | 'record'
export type SearchStatus =
 | 'complete'
 | 'inprogress'
export type SerenityCode = string
export type SnmpVersion =
 | 'none'
 | 'snmp2c'
 | 'snmp3'
export type StreamFormat =
 | 'h264'
 | 'h265'
 | 'mpeg4'
 | 'jpeg'
 | 'g711'
export type StreamPreference =
 | 'quality'
 | 'framerate'
export type StreamProtocol =
 | 'mjpeg-pull'
 | 'rtsp/rtp'
export type StreamSource =
 | 'primary'
 | 'primary+secondary'
 | 'secondary'
export type String = string
export type SystemType =
 | 'ent'
 | 'pro'
 | 'ult'
 | 'unlicensed'
export type Time = string
export type TimeOfDay = string
export type TimeOffset = string
export type TimeRange = string
export type UPN = string
export type URI = string
export type VxConfigStatus =
 | 'configured'
 | 'configuring'
 | 'failed'
 | 'unconfigured'
export type VxNodeType =
 | 'core'
 | 'support'
export type XCast =
 | 'multicast'
 | 'unicast'
