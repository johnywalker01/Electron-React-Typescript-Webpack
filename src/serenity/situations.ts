/**
 * This file was generated by running this command:
 * ts-node tools\generators\generateSerenityResources.ts
 * on 8/29/2017, 1:28:00 PM
 * from serenity/latex/tex/situations.tex (branch master, commit 29f1886)
 * (if modified by hand, replace this line with modification description)
 */
import messages from './messages'

export type SituationType =
 | 'admin/cert_expired'
 | 'admin/cert_modified'
 | 'admin/clips_removed'
 | 'admin/core_db_backup_failed'
 | 'admin/core_db_backup_halted'
 | 'admin/core_db_backup_removed'
 | 'admin/core_db_backup_restore'
 | 'admin/core_db_backup_started'
 | 'admin/core_db_backup_success'
 | 'admin/data_source_modified'
 | 'admin/data_storage_modified'
 | 'admin/device_added'
 | 'admin/device_assigned'
 | 'admin/device_commissioned'
 | 'admin/device_decommissioned'
 | 'admin/device_modified'
 | 'admin/device_rebooted'
 | 'admin/device_removed'
 | 'admin/device_reset'
 | 'admin/device_unassigned'
 | 'admin/drawing_added'
 | 'admin/drawing_image_retrieved'
 | 'admin/drawing_image_modified'
 | 'admin/drawing_image_removed'
 | 'admin/drawing_marker_added'
 | 'admin/drawing_marker_modified'
 | 'admin/drawing_marker_removed'
 | 'admin/drawing_modified'
 | 'admin/drawing_removed'
 | 'admin/drawings_modified'
 | 'admin/export_path_modified'
 | 'admin/license_added'
 | 'admin/license_expired'
 | 'admin/license_failure'
 | 'admin/log_added'
 | 'admin/log_downloaded'
 | 'admin/log_removed'
 | 'admin/member_added'
 | 'admin/member_modified'
 | 'admin/member_removed'
 | 'admin/monitor_added'
 | 'admin/monitor_cell_modified'
 | 'admin/monitor_modified'
 | 'admin/monitor_removed'
 | 'admin/monitorwall_added'
 | 'admin/monitorwall_modified'
 | 'admin/monitorwall_removed'
 | 'admin/new_export_keys'
 | 'admin/notification_added'
 | 'admin/notification_added_role'
 | 'admin/notification_removed'
 | 'admin/notification_removed_role'
 | 'admin/privilege_added'
 | 'admin/privilege_modified'
 | 'admin/privilege_removed'
 | 'admin/ptz_preset_added'
 | 'admin/ptz_preset_removed'
 | 'admin/role_added'
 | 'admin/role_modified'
 | 'admin/role_removed'
 | 'admin/rule_added'
 | 'admin/rule_modified'
 | 'admin/rule_removed'
 | 'admin/schedule_added'
 | 'admin/schedule_modified'
 | 'admin/schedule_removed'
 | 'admin/situation_added'
 | 'admin/situation_modified'
 | 'admin/situation_notification_added'
 | 'admin/situation_notification_removed'
 | 'admin/situation_removed'
 | 'admin/ssh_enabled'
 | 'admin/ssh_disabled'
 | 'admin/timetable_added'
 | 'admin/timetable_modified'
 | 'admin/timetable_removed'
 | 'admin/user_added'
 | 'admin/user_modified'
 | 'admin/user_new_password'
 | 'admin/user_removed'
 | 'admin/user_role_added'
 | 'admin/user_role_removed'
 | 'admin/vxs_db_rebuild'
 | 'admin/vxs_db_restore'
 | 'admin/vxs_reconfigured'
 | 'analytic/abandoned_object'
 | 'analytic/no_abandoned_object'
 | 'analytic/adaptive_motion'
 | 'analytic/no_adaptive_motion'
 | 'analytic/directional_motion'
 | 'analytic/no_directional_motion'
 | 'analytic/loitering'
 | 'analytic/no_loitering'
 | 'analytic/motion'
 | 'analytic/no_motion'
 | 'analytic/object_count'
 | 'analytic/no_object_count'
 | 'analytic/object_removal'
 | 'analytic/no_object_removal'
 | 'analytic/sabotage'
 | 'analytic/no_sabotage'
 | 'analytic/stopped_vehicle'
 | 'analytic/no_stopped_vehicle'
 | 'client/logoff'
 | 'client/logon'
 | 'client/saved_view_accepted'
 | 'client/saved_view_received'
 | 'client/saved_view_sent'
 | 'client/snooze'
 | 'client/tab_added'
 | 'client/tab_modified'
 | 'client/tab_removed'
 | 'client/workspace_added'
 | 'client/workspace_modified'
 | 'client/workspace_removed'
 | 'hardware/cpu_load'
 | 'hardware/disk_failure'
 | 'hardware/fan_failure'
 | 'hardware/input_loss'
 | 'hardware/input_restored'
 | 'hardware/link_speed'
 | 'hardware/memory_load'
 | 'hardware/network_volume_full'
 | 'hardware/network_volume_offline'
 | 'hardware/network_volume_online'
 | 'hardware/packet_loss'
 | 'hardware/ps_failure'
 | 'hardware/temperature'
 | 'hardware/ups_low'
 | 'hardware/volume_full'
 | 'hardware/volume_offline'
 | 'hardware/volume_online'
 | 'system/alarm_active'
 | 'system/alarm_inactive'
 | 'system/authentication_failure'
 | 'system/authorization_failure'
 | 'system/bookmark_added'
 | 'system/bookmark_lock_enabled'
 | 'system/bookmark_lock_modified'
 | 'system/bookmark_lock_disabled'
 | 'system/bookmark_modified'
 | 'system/bookmark_removed'
 | 'system/client_push'
 | 'system/client_push_ack'
 | 'system/clip_added'
 | 'system/clip_failed'
 | 'system/data_source_offline'
 | 'system/data_source_online'
 | 'system/device_offline'
 | 'system/device_online'
 | 'system/device_status_initialized'
 | 'system/device_status_unauthenticated'
 | 'system/export_deleted'
 | 'system/export_downloaded'
 | 'system/export_failure'
 | 'system/export_modified'
 | 'system/export_restored'
 | 'system/export_started'
 | 'system/export_success'
 | 'system/export_trashed'
 | 'system/failover_completed'
 | 'system/failover_started'
 | 'system/fault'
 | 'system/manual_recording_added'
 | 'system/manual_recording_removed'
 | 'system/member_offline'
 | 'system/member_online'
 | 'system/ptz_lock'
 | 'system/ptz_pattern_triggered'
 | 'system/ptz_preset_triggered'
 | 'system/ptz_unlock'
 | 'system/qlog_downloaded'
 | 'system/qreport_downloaded'
 | 'system/recording_failure_bandwidth'
 | 'system/relay_active'
 | 'system/relay_inactive'
 | 'system/retention_low'
 | 'system/script_failure'
 | 'system/script_started'
 | 'system/script_success'
 | 'system/stream_loss'
 | 'system/stream_restored'
 | 'system/stream_view_denied'
 | 'system/stream_view_started'
 | 'system/stream_view_stopped'
 | 'system/stream_view_timeout'
 | 'system/tag_added'
 | 'system/tag_linked'
 | 'system/tag_merged'
 | 'system/tag_modified'
 | 'system/tag_removed'
 | 'system/tag_unlinked'

export const SituationTypeMap = {
  'admin/cert_expired': messages.admin_certExpired,
  'admin/cert_modified': messages.admin_certModified,
  'admin/clips_removed': messages.admin_clipsRemoved,
  'admin/core_db_backup_failed': messages.admin_coreDbBackupFailed,
  'admin/core_db_backup_halted': messages.admin_coreDbBackupHalted,
  'admin/core_db_backup_removed': messages.admin_coreDbBackupRemoved,
  'admin/core_db_backup_restore': messages.admin_coreDbBackupRestore,
  'admin/core_db_backup_started': messages.admin_coreDbBackupStarted,
  'admin/core_db_backup_success': messages.admin_coreDbBackupSuccess,
  'admin/data_source_modified': messages.admin_dataSourceModified,
  'admin/data_storage_modified': messages.admin_dataStorageModified,
  'admin/device_added': messages.admin_deviceAdded,
  'admin/device_assigned': messages.admin_deviceAssigned,
  'admin/device_commissioned': messages.admin_deviceCommissioned,
  'admin/device_decommissioned': messages.admin_deviceDecommissioned,
  'admin/device_modified': messages.admin_deviceModified,
  'admin/device_rebooted': messages.admin_deviceRebooted,
  'admin/device_removed': messages.admin_deviceRemoved,
  'admin/device_reset': messages.admin_deviceReset,
  'admin/device_unassigned': messages.admin_deviceUnassigned,
  'admin/drawing_added': messages.admin_drawingAdded,
  'admin/drawing_image_retrieved': messages.admin_drawingImageRetrieved,
  'admin/drawing_image_modified': messages.admin_drawingImageModified,
  'admin/drawing_image_removed': messages.admin_drawingImageRemoved,
  'admin/drawing_marker_added': messages.admin_drawingMarkerAdded,
  'admin/drawing_marker_modified': messages.admin_drawingMarkerModified,
  'admin/drawing_marker_removed': messages.admin_drawingMarkerRemoved,
  'admin/drawing_modified': messages.admin_drawingModified,
  'admin/drawing_removed': messages.admin_drawingRemoved,
  'admin/drawings_modified': messages.admin_drawingsModified,
  'admin/export_path_modified': messages.admin_exportPathModified,
  'admin/license_added': messages.admin_licenseAdded,
  'admin/license_expired': messages.admin_licenseExpired,
  'admin/license_failure': messages.admin_licenseFailure,
  'admin/log_added': messages.admin_logAdded,
  'admin/log_downloaded': messages.admin_logDownloaded,
  'admin/log_removed': messages.admin_logRemoved,
  'admin/member_added': messages.admin_memberAdded,
  'admin/member_modified': messages.admin_memberModified,
  'admin/member_removed': messages.admin_memberRemoved,
  'admin/monitor_added': messages.admin_monitorAdded,
  'admin/monitor_cell_modified': messages.admin_monitorCellModified,
  'admin/monitor_modified': messages.admin_monitorModified,
  'admin/monitor_removed': messages.admin_monitorRemoved,
  'admin/monitorwall_added': messages.admin_monitorwallAdded,
  'admin/monitorwall_modified': messages.admin_monitorwallModified,
  'admin/monitorwall_removed': messages.admin_monitorwallRemoved,
  'admin/new_export_keys': messages.admin_newExportKeys,
  'admin/notification_added': messages.admin_notificationAdded,
  'admin/notification_added_role': messages.admin_notificationAddedRole,
  'admin/notification_removed': messages.admin_notificationRemoved,
  'admin/notification_removed_role': messages.admin_notificationRemovedRole,
  'admin/privilege_added': messages.admin_privilegeAdded,
  'admin/privilege_modified': messages.admin_privilegeModified,
  'admin/privilege_removed': messages.admin_privilegeRemoved,
  'admin/ptz_preset_added': messages.admin_ptzPresetAdded,
  'admin/ptz_preset_removed': messages.admin_ptzPresetRemoved,
  'admin/role_added': messages.admin_roleAdded,
  'admin/role_modified': messages.admin_roleModified,
  'admin/role_removed': messages.admin_roleRemoved,
  'admin/rule_added': messages.admin_ruleAdded,
  'admin/rule_modified': messages.admin_ruleModified,
  'admin/rule_removed': messages.admin_ruleRemoved,
  'admin/schedule_added': messages.admin_scheduleAdded,
  'admin/schedule_modified': messages.admin_scheduleModified,
  'admin/schedule_removed': messages.admin_scheduleRemoved,
  'admin/situation_added': messages.admin_situationAdded,
  'admin/situation_modified': messages.admin_situationModified,
  'admin/situation_notification_added': messages.admin_situationNotificationAdded,
  'admin/situation_notification_removed': messages.admin_situationNotificationRemoved,
  'admin/situation_removed': messages.admin_situationRemoved,
  'admin/ssh_enabled': messages.admin_sshEnabled,
  'admin/ssh_disabled': messages.admin_sshDisabled,
  'admin/timetable_added': messages.admin_timetableAdded,
  'admin/timetable_modified': messages.admin_timetableModified,
  'admin/timetable_removed': messages.admin_timetableRemoved,
  'admin/user_added': messages.admin_userAdded,
  'admin/user_modified': messages.admin_userModified,
  'admin/user_new_password': messages.admin_userNewPassword,
  'admin/user_removed': messages.admin_userRemoved,
  'admin/user_role_added': messages.admin_userRoleAdded,
  'admin/user_role_removed': messages.admin_userRoleRemoved,
  'admin/vxs_db_rebuild': messages.admin_vxsDbRebuild,
  'admin/vxs_db_restore': messages.admin_vxsDbRestore,
  'admin/vxs_reconfigured': messages.admin_vxsReconfigured,
  'analytic/abandoned_object': messages.analytic_abandonedObject,
  'analytic/no_abandoned_object': messages.analytic_noAbandonedObject,
  'analytic/adaptive_motion': messages.analytic_adaptiveMotion,
  'analytic/no_adaptive_motion': messages.analytic_noAdaptiveMotion,
  'analytic/directional_motion': messages.analytic_directionalMotion,
  'analytic/no_directional_motion': messages.analytic_noDirectionalMotion,
  'analytic/loitering': messages.analytic_loitering,
  'analytic/no_loitering': messages.analytic_noLoitering,
  'analytic/motion': messages.analytic_motion,
  'analytic/no_motion': messages.analytic_noMotion,
  'analytic/object_count': messages.analytic_objectCount,
  'analytic/no_object_count': messages.analytic_noObjectCount,
  'analytic/object_removal': messages.analytic_objectRemoval,
  'analytic/no_object_removal': messages.analytic_noObjectRemoval,
  'analytic/sabotage': messages.analytic_sabotage,
  'analytic/no_sabotage': messages.analytic_noSabotage,
  'analytic/stopped_vehicle': messages.analytic_stoppedVehicle,
  'analytic/no_stopped_vehicle': messages.analytic_noStoppedVehicle,
  'client/logoff': messages.client_logoff,
  'client/logon': messages.client_logon,
  'client/saved_view_accepted': messages.client_savedViewAccepted,
  'client/saved_view_received': messages.client_savedViewReceived,
  'client/saved_view_sent': messages.client_savedViewSent,
  'client/snooze': messages.client_snooze,
  'client/tab_added': messages.client_tabAdded,
  'client/tab_modified': messages.client_tabModified,
  'client/tab_removed': messages.client_tabRemoved,
  'client/workspace_added': messages.client_workspaceAdded,
  'client/workspace_modified': messages.client_workspaceModified,
  'client/workspace_removed': messages.client_workspaceRemoved,
  'hardware/cpu_load': messages.hardware_cpuLoad,
  'hardware/disk_failure': messages.hardware_diskFailure,
  'hardware/fan_failure': messages.hardware_fanFailure,
  'hardware/input_loss': messages.hardware_inputLoss,
  'hardware/input_restored': messages.hardware_inputRestored,
  'hardware/link_speed': messages.hardware_linkSpeed,
  'hardware/memory_load': messages.hardware_memoryLoad,
  'hardware/network_volume_full': messages.hardware_networkVolumeFull,
  'hardware/network_volume_offline': messages.hardware_networkVolumeOffline,
  'hardware/network_volume_online': messages.hardware_networkVolumeOnline,
  'hardware/packet_loss': messages.hardware_packetLoss,
  'hardware/ps_failure': messages.hardware_psFailure,
  'hardware/temperature': messages.hardware_temperature,
  'hardware/ups_low': messages.hardware_upsLow,
  'hardware/volume_full': messages.hardware_volumeFull,
  'hardware/volume_offline': messages.hardware_volumeOffline,
  'hardware/volume_online': messages.hardware_volumeOnline,
  'system/alarm_active': messages.system_alarmActive,
  'system/alarm_inactive': messages.system_alarmInactive,
  'system/authentication_failure': messages.system_authenticationFailure,
  'system/authorization_failure': messages.system_authorizationFailure,
  'system/bookmark_added': messages.system_bookmarkAdded,
  'system/bookmark_lock_enabled': messages.system_bookmarkLockEnabled,
  'system/bookmark_lock_modified': messages.system_bookmarkLockModified,
  'system/bookmark_lock_disabled': messages.system_bookmarkLockDisabled,
  'system/bookmark_modified': messages.system_bookmarkModified,
  'system/bookmark_removed': messages.system_bookmarkRemoved,
  'system/client_push': messages.system_clientPush,
  'system/client_push_ack': messages.system_clientPushAck,
  'system/clip_added': messages.system_clipAdded,
  'system/clip_failed': messages.system_clipFailed,
  'system/data_source_offline': messages.system_dataSourceOffline,
  'system/data_source_online': messages.system_dataSourceOnline,
  'system/device_offline': messages.system_deviceOffline,
  'system/device_online': messages.system_deviceOnline,
  'system/device_status_initialized': messages.system_deviceStatusInitialized,
  'system/device_status_unauthenticated': messages.system_deviceStatusUnauthenticated,
  'system/export_deleted': messages.system_exportDeleted,
  'system/export_downloaded': messages.system_exportDownloaded,
  'system/export_failure': messages.system_exportFailure,
  'system/export_modified': messages.system_exportModified,
  'system/export_restored': messages.system_exportRestored,
  'system/export_started': messages.system_exportStarted,
  'system/export_success': messages.system_exportSuccess,
  'system/export_trashed': messages.system_exportTrashed,
  'system/failover_completed': messages.system_failoverCompleted,
  'system/failover_started': messages.system_failoverStarted,
  'system/fault': messages.system_fault,
  'system/manual_recording_added': messages.system_manualRecordingAdded,
  'system/manual_recording_removed': messages.system_manualRecordingRemoved,
  'system/member_offline': messages.system_memberOffline,
  'system/member_online': messages.system_memberOnline,
  'system/ptz_lock': messages.system_ptzLock,
  'system/ptz_pattern_triggered': messages.system_ptzPatternTriggered,
  'system/ptz_preset_triggered': messages.system_ptzPresetTriggered,
  'system/ptz_unlock': messages.system_ptzUnlock,
  'system/qlog_downloaded': messages.system_qlogDownloaded,
  'system/qreport_downloaded': messages.system_qreportDownloaded,
  'system/recording_failure_bandwidth': messages.system_recordingFailureBandwidth,
  'system/relay_active': messages.system_relayActive,
  'system/relay_inactive': messages.system_relayInactive,
  'system/retention_low': messages.system_retentionLow,
  'system/script_failure': messages.system_scriptFailure,
  'system/script_started': messages.system_scriptStarted,
  'system/script_success': messages.system_scriptSuccess,
  'system/stream_loss': messages.system_streamLoss,
  'system/stream_restored': messages.system_streamRestored,
  'system/stream_view_denied': messages.system_streamViewDenied,
  'system/stream_view_started': messages.system_streamViewStarted,
  'system/stream_view_stopped': messages.system_streamViewStopped,
  'system/stream_view_timeout': messages.system_streamViewTimeout,
  'system/tag_added': messages.system_tagAdded,
  'system/tag_linked': messages.system_tagLinked,
  'system/tag_merged': messages.system_tagMerged,
  'system/tag_modified': messages.system_tagModified,
  'system/tag_removed': messages.system_tagRemoved,
  'system/tag_unlinked': messages.system_tagUnlinked,
}
