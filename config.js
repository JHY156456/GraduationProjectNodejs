module.exports = {
    server_port: 3000,
    db_url: 'mongodb://jhy156456:vmflsxj1@ds237192.mlab.com:37192/graduation_project',
    fcm_api_key: 'AAAA8DqEKz4:APA91bFAUQyFFHh9lCioSr2VZc2mhaDjvqt-J8B3-lRzyxnmcHj42X50ibVg_Eo7rdiCXLfmTeOYMz6F4kDSc01GhBdT5G9W_W1gYi0s3q9Qn1GbhLwRktxW35cM4vujR4e_RkwEvoJz',
    db_schemas: [
        {
            file: './device_schema',
            collection: 'devices',
            schemaName: 'DeviceSchema',
            modelName: 'DeviceModel'
        },

        {
            file: './buy_software_info_schema',
            collection: 'software',
            schemaName: 'SoftwareInfoSchema',
            modelName: 'SoftwareInfoModel'
        },

        {
            file: './buy_software_info_image_schema',
            collection: 'softwareimage',
            schemaName: 'SoftwareInfoImageSchema',
            modelName: 'SoftwareInfoImageModel'
        },

        {
            file: './buy_software_keep_schema',
            collection: 'softwarekeep',
            schemaName: 'SoftwareKeepSchema',
            modelName: 'SoftwareKeepModel'
        },
        {
            file: './user',
            collection: 'user',
            schemaName: 'UserSchema',
            modelName: 'UserModel'
        },
        {
            file: './bestfood_member_schema',
            collection: 'bestfood_member',
            schemaName: 'bestfood_memberschema',
            modelName: 'bestfood_membermodel'
        },
	],

    route_info: [
        {
            file: './device',
            path: '/process/adddevice',
            method: 'adddevice',
            type: 'post'
        }
	    , {
            file: './device',
            path: '/process/listdevice',
            method: 'listdevice',
            type: 'post'
        }
	    , {
            file: './device',
            path: '/process/register',
            method: 'register',
            type: 'post'
        }
	    , {
            file: './device',
            path: '/process/sendall',
            method: 'sendall',
            type: 'post'
        }

        , {
            file: './member',
            path: '/member/:email',
            method: 'email',
            type: 'get'
        }
	    , {
            file: './member',
            path: '/member/phone',
            method: 'member_phone',
            type: 'post'
        }
        , {
            file: './member',
            path: '/member/info',
            method: 'member_info',
            type: 'post'
        }
        , {
            file: './member',
            path: '/member/icon_upload',
            method: 'member_icon_upload',
            type: 'post'
        }

	    , {
            file: './buy_software',
            path: '/food/info',
            method: 'info',
            type: 'post'
        }
        , {
            file: './buy_software',
            path: '/food/info/image',
            method: 'info_image',
            type: 'post'
        }
        , {
            file: './buy_software',
            path: '/food/info/:seq',
            method: 'info_seq',
            type: 'get'
        }
        , {
            file: './buy_software',
            path: '/food/list',
            method: 'list',
            type: 'get'
        }
        , {
            file: './buy_software',
            path: '/food/postedlist',
            method: 'postedList',
            type: 'get'
        }
        , {
            file: './buy_keep',
            path: '/keep/list',
            method: 'keep_list',
            type: 'get'
        }
        , {
            file: './buy_keep',
            path: '/keep/:member_seq/:info_seq',
            method: 'keep_info_seq_post',
            type: 'post'
        }
        , {
            file: './buy_keep',
            path: '/keep/:member_seq/:info_seq',
            method: 'keep_info_seq_delete',
            type: 'delete'
        }
        ////////////////////////////////////////////로그인

                        , {
            file: './loginRoutes',
            path: '/users/:seq',
            method: 'getUser',
            type: 'get'
        }
                , {
            file: './loginRoutes',
            path: '/',
            method: 'one',
            type: 'get'
        }
                , {
            file: './loginRoutes',
            path: '/authenticate',
            method: 'two',
            type: 'post'
        }
                , {
            file: './loginRoutes',
            path: '/users',
            method: 'three',
            type: 'post'
        }
                , {
            file: './loginRoutes',
            path: '/users/:id',
            method: 'four',
            type: 'get'
        }
                , {
            file: './loginRoutes',
            path: '/users/:id',
            method: 'five',
            type: 'put'
        }
                , {
            file: './loginRoutes',
            path: '/users/:id/password',
            method: 'six',
            type: 'post'
        }
        ]
}
