import { login, logout } from '@/api/permission'
import { checkSymbol, setSymbol, removeSymbol } from '@/utils/auth'
import { resetRouter } from '@/router'
import { storeMaker } from '@/utils/index'

const state = storeMaker({
	//当前登录主题ID
	themeInfo: {},
	userInfo: {}
})

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
				setSymbol('home')
				resolve()
			}).catch(error => {
				reject(error)
			})
		})
	},

	//退出登录，清空标识
	logout({ commit, state }) {
		commit('SET_USER_INFO', {})
		commit('SET_THEME_INFO', {})
		removeSymbol('home')
		resetRouter()
	},

	//切换主题
	switchTheme({ commit }, themeInfo){
		commit('SET_THEME_INFO', themeInfo)
	},

	// remove token
	resetToken({ commit }) {
		return new Promise(resolve => {
			commit('SET_USER_INFO', {})
			commit('SET_THEME_INFO', {})
			removeSymbol('home')
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

