import request from '@/utils/request'

export function login(data){
    return request({
		url: '/admin/admin/login',
		method: 'post',
		data
	})
}

export function getAdminList(params){
	return request({
		url: '/admin/admin/list',
		method: 'get',
		params
	})
}

export function getRoleByAdminId(params){
	return request({
		url: '/admin/admin/listRole',
		method: 'get',
		params
	})
}

export function getAccessList(params){
	return request({
		url: '/admin/access/list',
		method: 'get',
		params
	})
}

export function addAdmin(data){
	return request({
		url: '/admin/admin/add',
		method: 'post',
		data
	})
}

export function removeAdmin(params){
	return request({
		url: '/admin/admin/remove',
		method: 'get',
		params
	})
}

export function assignAccessToRole(data){
	return request({
		url: '/admin/access/assignToRole',
		method: 'post',
		data
	})
}

export function assignAccessToAdmin(data){
	return request({
		url: '/admin/access/assignToAdmin',
		method: 'post',
		data
	})
}