import request from '@/utils/request'

export function login(data) {
	return request({
		url: '/home/user/login',
		method: 'post',
		data
	})
}

export function logout() {
	return request({
		url: '/home/user/logout',
		method: 'post'
	})
}

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