import request from '@/utils/request'

export function listTheme(params){
    return request({
        url: '/admin/theme/list',
        method: 'get',
        params
    })
}

export function addOrUpdateTheme(data){
    return request({
        url: '/admin/theme/addOrUpdate',
        method: 'post',
        data
    })
}

export function getHomeInfo(params){
    return request({
        url: '/admin/theme/homeInfo',
        method: 'get',
        params
    })
}