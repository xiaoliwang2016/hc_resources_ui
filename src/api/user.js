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
		url: '/user/logout',
		method: 'post'
	})
}
