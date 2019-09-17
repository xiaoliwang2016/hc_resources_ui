import request from '@/utils/request'

export function save(data){
    return request({
		url: '/admin/account/save',
		method: 'post',
		data
	})
}

export function list(params){
    return request({
		url: '/admin/account/list',
		method: 'get',
		params
	})
}