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
				//设置登录标识
				setSymbol('home')
				//多个主题，默认展示第一个
				if(data.themes.length > 0){
					commit('SET_THEME_INFO', data.themes[0])
					data.isOwner = data.user_no == data.themes[0].manager_id
				}
				commit('SET_USER_INFO', data)
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
	switchTheme({ commit, state }, themeInfo){
		var userInfo = { ...state.userInfo }
		userInfo.isOwner = userInfo.user_no == themeInfo.manager_id
		commit('SET_THEME_INFO', themeInfo)
		commit('SET_USER_INFO', userInfo)
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

