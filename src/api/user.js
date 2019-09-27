import request from '@/utils/request'

export function list(params){
	return request({
		url: '/admin/user/list',
		method: 'get',
		params
	})
}

export function addUser(data){
	return request({
		url: '/admin/user/add',
		method: 'post',
		data
	})
}

export function updateUser(data){
	return request({
		url: '/admin/user/update',
		method: 'post',
		data
	})
}

export function getResourcesByUserId(params){
	return request({
		url: '/admin/user/listResources',
		method: 'get',
		params
	})
}

export function getRolesByUserId(params){
	return request({
		url: '/admin/user/listRole',
		method: 'get',
		params
	})
}

export function getThemeByUserId(params){
	return request({
		url: '/home/user/listTheme',
		method: 'get',
		params
	})
}

export function searchUser(params){
	return request({
		url: '/admin/employee/search',
		method: 'get',
		params
	})
}

export function removeUser(data){
	return request({
		url: '/admin/user/delete',
		method: 'post',
		data
	})
}