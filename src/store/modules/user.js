import { login, logout } from '@/api/user'
import { checkSymbol, setSymbol, removeSymbol } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
	//当前登录主题ID
	themeInfo: {},
	userInfo: {}
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
		const { user_no, password } = userInfo
		return new Promise((resolve, reject) => {
			login({ user_no: user_no.trim(), password: password }).then(response => {
				const { data } = response
				commit('SET_USER_INFO', data)
				commit('SET_THEME_INFO', data.themes[0])
				//设置登录标识
				setSymbol()
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
				removeSymbol()
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
			removeSymbol()
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

