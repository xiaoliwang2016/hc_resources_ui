import request from '@/utils/request'

export function listTheme(params){
    return request({
        url: '/admin/theme/list',
        method: 'get',
        params
    })
}

export function addTheme(data){
    return request({
        url: '/admin/theme/add',
        method: 'post',
        data
    })
}