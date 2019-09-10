import { login, logout } from '@/api/admin'
import { checkSymbol, setSymbol, removeSymbol } from '@/utils/auth'
import { resetRouter } from '@/router'
import { storeMaker } from '@/utils/index'

const state = storeMaker({
	userInfo: {},
	themeInfo: {},
	roles: [],
	access: [],
	password: ''
})

const mutations = {
	SET_USER_INFO: (state, userInfo) => {
		state.userInfo = userInfo
	},
	SET_THEME_INFO: (state, themeInfo) => {
		state.themeInfo = themeInfo
	},
	SET_USER_ROLE: (state, roleInfo) => {
		state.roles = roleInfo
	},
	SET_USER_ACCESS: (state, accessInfo) => {
		state.access = accessInfo
	},
	SET_PASSWORD: (state, password) => {
		state.password = password
	}
}

const actions = {
	// user login
	login({ commit }, userInfo) {
		const { user_no, password, theme_id } = userInfo
		return new Promise((resolve, reject) => {
			login({ user_no: user_no.trim(), password, theme_id }).then(response => {
				const { data } = response
				const theme = this.state.user.themeInfo
				var roles = []
				//判断是否位超级管理员
				if(data.super == 1){
					roles.push('super')
				}
				//判断是否为租户管理员
				if(theme.manager_id == data.user_no){
					roles.push('owner')
				}
				commit('SET_PASSWORD', password)				
				commit('SET_USER_INFO', data)
				commit('SET_THEME_INFO', theme)
				commit('SET_USER_ROLE', roles)
				commit('SET_USER_ACCESS', data.accesses ? data.accesses : [])
				//设置登录标识
				setSymbol('admin')
				resolve()
			}).catch(error => {
				reject(error)
			})
		})
	},

	//退出登录，清空标识
	logout({ commit, state }) {
		return new Promise((resolve, reject) => {
			logout(state.token).then(() => {
				commit('SET_USER_INFO', {})
				commit('SET_THEME_INFO', {})
				removeSymbol('admin')
				resetRouter()
				resolve()
			}).catch(error => {
				reject(error)
			})
		})
	},

	// remove token
	resetToken({ commit }) {
		return new Promise(resolve => {
			commit('SET_USER_INFO', {})
			commit('SET_THEME_INFO', {})
			removeSymbol('admin')
			resolve()
		})
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}

