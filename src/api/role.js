import request from '@/utils/request'

export function listRole(params){
    return request({
        url: '/admin/role/list',
        method: 'get',
        params
    })
}

export function addRole(data){
    return request({
        url: '/admin/role/add',
        method: 'post',
        data
    })
}