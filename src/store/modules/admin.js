import { login } from '@/api/admin'
import { checkSymbol, setSymbol, removeSymbol } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
	userInfo: {},
	themeInfo: {}
}

const mutations = {
	SET_USER_INFO: (state, userInfo) => {
		state.userInfo = userInfo
	},
	SET_THEME_INFO: (state, themeInfo) => {
		state.themeInfo = themeInfo
	}
}

const actions = {
	// user login
	login({ commit }, userInfo) {
		const { user_no, password, theme_id } = userInfo
		return new Promise((resolve, reject) => {
			login({ user_no: user_no.trim(), password, theme_id }).then(response => {
				const { data } = response
				commit('SET_USER_INFO', data)
				commit('SET_THEME_INFO', data.themes[0])
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

