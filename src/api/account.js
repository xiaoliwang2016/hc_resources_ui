import request from '@/utils/request'
import axios from 'axios'

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

export function authorize(data){
    return request({
		url: '/admin/account/authorize',
		method: 'post',
		data
	})
}