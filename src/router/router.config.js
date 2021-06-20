export default [
    {
        path: '/',
        redirect: '/location/monitor'
    },
    {
        name: 'location',
        path: '/location',
        component: 'location/Location',
        children: [
            {
                name: 'Monitor',
                path: '/location/monitor',
                component: 'location/monitor/Monitor'
            },

            {
                name: 'AlarmAudit',
                path: '/location/alarmAudit',
                component: 'location/alarmAudit/AlarmAudit'
            },
            {
                name: 'AlarmCheck',
                path: '/location/alarmCheck',
                component: 'location/alarmCheck/AlarmCheck'
            },
            {
                name: 'FilterAlarm',
                path: '/location/filterAlarm',
                component: 'location/alarmCheck/FilterAlarm'
            },
            {
                name: 'AlarmReconsider',
                path: '/location/alarmReconsider',
                component: 'location/alarmReconsider/AlarmReconsider'
            },
            {
                name: 'RealtimeAlarms',
                path: '/location/realtimeAlarms',
                component: 'location/realtimeAlarms/RealtimeAlarms'
            },
            {
                name: 'FindVehicle',
                path: '/location/findVehicle',
                component: 'location/findVehicle/FindVehicle'
            },
            {
                name: 'VehicleTrack',
                path: '/location/vehicleTrack',
                component: 'location/vehicleTrack/VehicleTrack'
            },
            {
                name: 'FatigueDriving', // 疲劳驾驶
                path: '/location/fatigueDriving',
                component: 'location/fatigueDriving/FatigueDriving'
            },
            {
                name: 'NoTraffic', // 夜间禁行
                path: '/location/noTraffic',
                component: 'location/noTraffic/NoTraffic'
            },
            {
                name: 'PlatformAssess',
                path: '/location/platformAssess',
                component: 'location/platformAssess/PlatformAssess'
            },
            {
                name: 'VehicleOff',
                path: '/location/vehicleOff',
                component: 'location/vehicleOff/VehicleOff'
            },
            {
                name: 'PlatformDataTransfer',
                path: '/location/platformDataTransfer',
                component: 'location/platformDataTransfer/PlatformDataTransfer'
            },
            {
                name: 'CommandIssued',
                path: '/location/commandIssued',
                component: 'location/commandIssued/CommandIssued'
            },
            {
                name: 'TerminalSetting',
                path: '/location/terminalSetting',
                component: 'location/terminalSetting/TerminalSetting'
            },
            {
                name: 'TerminalParam',
                path: '/location/terminalParam',
                component: 'location/terminalParam/TerminalParam'
            },
            {
                name: 'LocationTrackControl',
                path: '/location/locationTrackControl',
                component: 'location/locationTrackControl/LocationTrackControl'
            },
            {
                name: 'TerminalControl',
                path: '/location/terminalControl',
                component: 'location/terminalControl/TerminalControl'
            }
        ]
    },
    {
        name: 'intelligentVideo',
        path: '/intelligentVideo',
        component: 'intelligentVideo/IntelligentVideo',
        children: [
            {
                name: 'IntelligentVideoMonitor',
                path: '/intelligentVideo/monitor',
                component: 'intelligentVideo/monitor/Monitor'
            },
            {
                name: 'IntelligentRealtimeAlarms',
                path: '/intelligentVideo/realtimeAlarms',
                component: 'intelligentVideo/realtimeAlarms/RealtimeAlarms'
            },
            {
                name: 'IntelligentAlarmAudit',
                path: '/intelligentVideo/alarmAudit',
                component: 'intelligentVideo/alarmAudit/AlarmAudit'
            },
            {
                name: 'IntelligentAlarmReconsider',
                path: '/intelligentVideo/alarmReconsider',
                component: 'intelligentVideo/alarmReconsider/AlarmReconsider'
            }
        ]
    },

    {
        name: 'LongOffline',
        path: '/config/longOffline',
        component: 'config/LongOffline'
    },
    {
        name: 'TrackTime',
        path: '/config/trackTime',
        component: 'config/TrackTime'
    },
    {
        name: 'TrackStatistics',
        path: '/statistics/trackStatistics',
        component: 'statistics/TrackStatistics'
    },
    {
        name: 'GpsCorrectRate',
        path: '/statistics/gpsCorrectRate',
        component: 'statistics/GpsCorrectRate'
    },
    {
        name: 'ActiveSecurityStatistics',
        path: '/statistics/activeSecurityStatistics',
        component: 'statistics/ActiveSecurityStatistics'
    },
    {
        name: 'VehicleOnlineRate',
        path: '/statistics/vehicleOnlineRate',
        component: 'statistics/VehicleOnlineRate'
    },
    {
        name: 'VehicleMonthOnline',
        path: '/statistics/vehicleMonthOnline',
        component: 'statistics/VehicleMonthOnline'
    },
    {
        name: 'OrgOnlineRate',
        path: '/statistics/orgOnlineRate',
        component: 'statistics/OrgOnlineRate'
    },
    {
        name: 'FatigueDriving',
        path: '/statistics/fatigueDriving',
        component: 'statistics/FatigueDriving'
    },
    {
        name: 'Violations',
        path: '/statistics/violations',
        component: 'statistics/Violations'
    },
    {
        name: 'ActiveSecurity',
        path: '/statistics/activeSecurity',
        component: 'statistics/ActiveSecurity'
    },
    {
        name: 'SatelliteDrift',
        path: '/statistics/satelliteDrift',
        component: 'statistics/SatelliteDrift'
    },
    {
        name: 'OverSpeed',
        path: '/statistics/overSpeed',
        component: 'statistics/OverSpeed'
    },
    {
        name: 'MileageStatistic',
        path: '/statistics/mileageStatistic',
        component: 'statistics/MileageStatistic'
    },
    {
        name: 'OrgAnalysis',
        path: '/statistics/orgAnalysis',
        component: 'statistics/OrgAnalysis'
    },
    {
        name: 'PlatformStatistic',
        path: '/statistics/platformStatistic',
        component: 'statistics/PlatformStatistic'
    },
    {
        name: 'PlatformOperateRecord',
        path: '/statistics/platformOperateRecord',
        component: 'statistics/PlatformOperateRecord'
    },
    // {
    //   name: 'AlarmStatistic',
    //   path: '/statistics/alarmStatistic',
    //   component: 'statistics/AlarmStatistic'
    // },
    {
        name: 'Company',
        path: '/config/company',
        component: 'config/Company'
    },
    {
        name: 'AutoDealAlarm',
        path: '/config/autodealalarm',
        component: 'config/AutoDealAlarm'
    },
    {
        name: 'error',
        path: '/error/:type',
        component: 'Error'
    },
    {
        name: 'allAlarms',
        path: '/allAlarms',
        component: 'location/alarmAudit/AllAlarmAudit',
        props: route => ({defaultApproveStatus: route.query.defaultApproveStatus})
    },
    {
        name: 'InspectionAlarmLedger',
        path: '/inspectionAlarmLedger',
        component: 'videoInspection/InspectionAlarmLedger'
    },
    {
        name: 'TraditionalAlarmAudit',
        path: '/traditional/alarmAudit',
        component: 'traditionalVideo/alarmAudit/AlarmAudit'
    },
    {
        name: 'TraditionalAlarmReconsider',
        path: '/traditional/alarmReconsider',
        component: 'traditionalVideo/alarmReconsider/AlarmReconsider'
    },
    {
        name: 'Preview',
        path: '/traditional/preview',
        component: 'traditionalVideo/Preview'
    },
    {
        name: 'Playback',
        path: '/traditional/playback',
        component: 'traditionalVideo/Playback'
    },
    {
        name: 'NonStandardVideo',
        path: '/traditional/nonStandardVideo',
        component: 'traditionalVideo/NonStandardVideo'
    },
    {
        name: 'FenceInfo',
        path: '/fence/fenceInfo',
        component: 'fence/FenceInfo'
    },
    {
        path: '*',
        component: 'Error'
    }
];
