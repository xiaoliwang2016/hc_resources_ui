import request from '@/utils/request'

export function getResourcesTree(params){
    return request({
        url: '/admin/resources/list',
        method: 'get',
        params
    })
}

export function addResources(data){
    return request({
        url: '/admin/resources/add',
        method: 'post',
        data
    })
}

export function editResources(data){
    return request({
        url: '/admin/resources/edit',
        method: 'post',
        data
    }) 
}

export function deleteResources(data){
    return request({
        url: '/admin/resources/delete',
        method: 'post',
        data
    }) 
}

export function assignToRole(data){
    return request({
        url: '/admin/resources/assignToRole',
        method: 'post',
        data
    }) 
}

export function assignToUser(data){
    return request({
        url: '/admin/resources/assignToUser',
        method: 'post',
        data
    }) 
}