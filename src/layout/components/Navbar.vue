<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
		<el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
			<span style="position: relative;top: -12px;">当前租户：{{$store.state.admin.themeInfo.theme_name}}</span>
           <i class="el-icon-caret-bottom" style="top: 5px;"/>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
			<el-dropdown-item v-for="item in themeList" :key="item.id">
				<span style="display:block;" @click="() => { switchTheme(item) }">{{item.theme_name}}</span>
			</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          	<img src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1566971093061&di=15ab06c14d562c1840c21f23d6b9a917&imgtype=0&src=http%3A%2F%2Fwww.icosky.com%2Ficon%2Fpng%2FSystem%2FScrap%2FClient%25202.png' class="user-avatar">
			<span style="position: relative;top: -12px;">{{$store.state.user.userInfo.user_name}}</span>
		  	<i class="el-icon-caret-bottom" style="top: 15px;"/>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
			<el-dropdown-item>
			<span style="display:block;" @click="logout">退出</span>
			</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { login } from '@/api/admin'
import { getThemeList } from '@/api/admin'

export default {
	components: {
		Breadcrumb,
		Hamburger
	},
	data(){
		return {
			themeList: []
		}
	},
	computed: {
		...mapGetters([
			'sidebar',
			'avatar'
		])
	},
	methods: {
		toggleSideBar() {
			this.$store.dispatch('app/toggleSideBar')
		},
		async logout() {
			await this.$store.dispatch('admin/logout')
			this.$router.push('/login')
		},
		switchTheme(themeInfo){
			this.$store.dispatch('user/switchTheme', themeInfo)
			this.$store.dispatch('admin/login', {
                user_no: this.$store.state.admin.userInfo.user_no.toString(),
                password: this.$store.state.admin.password,
                theme_id: themeInfo.id
			}).then(() => {
				// location.reload()
                this.$store.dispatch("permission/generateRoutes", this.$store.state.admin.roles).then(accessedRoutes => {
					
                    //动态挂载路由
					this.$router.addRoutes(accessedRoutes)
                    this.password = ''
                    this.$router.push({
                        path: '/admin/menu/resources/configuration'
                    })
                })
			})
		}
	},
	mounted(){
		getThemeList({
			id: this.$store.state.admin.userInfo.id
		}).then(res => {
			this.themeList = res.data
		})
	}
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
        }
      }
    }
  }
}
</style>
