import { login, logout } from '@/api/permission'
import { setSymbol, removeSymbol } from '@/utils/auth'
import { resetRouter } from '@/router'
import { storeMaker } from '@/utils/index'
import { getResourcesDetail } from '@/api/resources'

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
		const { user_no, password, theme_id } = userInfo
		return new Promise((resolve, reject) => {
			login({ user_no: user_no.trim(), password: password, theme_id }).then(async response => {
				const { data } = response
				//保存账号密码到cookie中
				setSymbol('home_user_no', user_no)
				setSymbol('home_psd', password)

				var theme_id
				if(window.location.hash.indexOf("id=") != -1){
					var resources_id = window.location.hash.slice(window.location.hash.indexOf("id=") + 3)
					var res = await getResourcesDetail({ id: resources_id })
					theme_id = res.code == 1 ? res.data.theme_id : ''
				}

				//多个主题，默认展示第一个
				if(data.themes.length > 0){
					var themeInfo
					data.themes.map(theme => {
						if(theme.id == theme_id){
							themeInfo = theme
						}
					})
					themeInfo = themeInfo ? themeInfo : data.themes[0]
					commit('SET_THEME_INFO', themeInfo)
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
		removeSymbol('home_user_no')
		removeSymbol('home_password')
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
			removeSymbol('home_user_no')
			removeSymbol('home_password')
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

