<template>
    <div class="bg">
        <el-menu 
            class="el-menu-demo" 
            mode="horizontal" 
            background-color="#303133" 
            text-color="#F2F6FC" 
            active-text-color="#FFFFFF" 
            :style="{top: showTopBar ? 0 : '-50px'}">
            <div class="avatar fl">
                <img src="@/assets/img/logo.png"/>
                <b>数据管理系统</b>
            </div>
            <el-submenu index="2">
                <template slot="title">{{$store.state.user.themeInfo.theme_name}}</template>
                <el-menu-item 
                    v-for="(item, index) in themeList"
                    :key="item.id"
                    :index="'2-' + index"
                    @click="() => switchTheme(index)"
                    >{{item.theme_name}}
                </el-menu-item>
            </el-submenu>
            <div class="avatar" @click="fullscreen" title="全屏"><svg-icon icon-class="screen" style="font-size: 20px;"/></div>
            <div class="avatar" @click="() => { changeMenu(homeResources) }" title="首页"><svg-icon icon-class="home" style="font-size: 20px;"/></div>
            <div class="avatar user-info" ref="dashboard">
                <svg-icon icon-class="user" />
                <div class="dashboard" v-show="dashboard_visiable">
                    <div>工号：<b>{{$store.state.user.userInfo.user_no}}</b></div>
                    <div>姓名：<b>{{$store.state.user.userInfo.user_name}}</b></div>
                    <div>公司：<b>{{$store.state.user.userInfo.company_desc ? $store.state.user.userInfo.company_desc : '未知'}}</b></div>
                    <div>部门：<b>{{$store.state.user.userInfo.department_desc ? $store.state.user.userInfo.department_desc : '未知'}}</b></div>
                    <div>当前IP：<b>{{ip_address}}</b></div>
                    <div>上次登录时间：<b>{{$store.state.user.userInfo.last_login}}</b></div>
                    <div> <el-button type="text" @click="login"><svg-icon icon-class="admin" style="font-size: 20px;"/> &nbsp 登录后台</el-button> </div>
                </div>
            </div>
            <div class="avatar" @click="logout" title="退出"><svg-icon icon-class="logout" style="font-size: 20px;"/></div>

        </el-menu>

        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            background-color="#303133"
            text-color="#F2F6FC" 
            active-text-color="#FFFFFF"
            :unique-opened="true"
            :style="{left: showMenu ? 0 : '-250px', top: showTopBar ? '50px' : 0, height: showTopBar ? 'calc(100vh - 50px)' : '100vh'}">
            <el-menu-item>
                <el-submenu :index="index.toString()" v-for="(item, index) in menuList" :key="item.id">
                    <template slot="title">
                        <span>{{item.menu_title}}</span>
                    </template>   
                    <el-submenu :index="index + '-' + subIndex" v-for="(subItem, subIndex) in item.children" :key="subItem.id">
                        <template slot="title">{{subItem.menu_title}}</template>
                        <el-menu-item 
                            v-for="(cellItem, cellIndex) in subItem.children" 
                            @click="() => changeMenu(cellItem)" 
                            :index="index + '-' + subIndex + '-' + cellIndex" 
                            :key="cellItem.id">
                        {{cellItem.menu_title}}</el-menu-item>
                    </el-submenu>
                </el-submenu>
            </el-menu-item>

            <div class="icon-1" @click="() => showMenu = !showMenu">
                <i v-if="showMenu" class="el-icon-arrow-left"></i>
                <i v-else class="el-icon-arrow-right"></i>
            </div>

        </el-menu>
        <!-- 无需登录地址 通过ifrmae直接展示 -->
        <template v-if="isFree">
            <iframe v-if="iframeUrl" :style="{width: '100vw', height:(showTopBar ? 'calc(100vh - 50px)' : '100vh'), marginTop: (showTopBar ? '50px' : 0)}" :src="iframeUrl" frameborder="0"></iframe>
            <div v-else class="empty">
                <svg-icon icon-class="empty" style="font-size: 80px;"/>
                <p>当前页面为空，请联系管理员重新设置</p>
            </div>
        </template>
        <div v-else ref="vizContainer" :style="{marginTop: (showTopBar ? '50px' : 0)}"></div>
    </div>
</template>
<script>
import { getResourcesTree } from '@/api/resources'
import { getThemeByUserId, getResourcesByUserId } from '@/api/user'
import { getHomeInfo } from '@/api/theme'
import { getToken } from '@/api/permission'
import { login } from '@/api/admin'
import { debounce } from "debounce"
import { getYourIP, foowwLocalStorage } from '@/utils/index'

export default {
    data(){
        return {
            iframeUrl: '',
            menuList: [],
            showMenu: true,
            showTopBar: true,
            themeList: [],
            ip_address: '',
            homeResources: null,
            isFree: false,
            dashboard_visiable: false,
            isFull: false
        }
    },

    mounted(){
        this.render()
        this.init()
        this.$refs.dashboard.addEventListener('mouseenter', this.switchDashboard.bind(this))
        this.$refs.dashboard.addEventListener('mouseover', () => {
            this.dashboard_visiable = true
        })
        this.$refs.dashboard.addEventListener('mouseout', this.switchDashboard.bind(this))

    },

    beforeDestroy(){
        this.$refs.dashboard.removeEventListener('mouseenter', this.switchDashboard)
        this.$refs.dashboard.removeEventListener('mouseout', this.switchDashboard)
        window.removeEventListener('resize', this.windowResizeHandler)
    },

    methods: {
        /**
         * 初始化
         */
        init(){
            //监听全屏切换
            window.addEventListener('resize', this.windowResizeHandler)
            //获取该用户的所有主题
            getThemeByUserId({
                id: this.$store.state.user.userInfo.id
            }).then(res => {
                this.themeList = res.data
            })
            //获取当前内网IP地址
            getYourIP().then(ip_address => {
                this.ip_address = ip_address
            })
        },

        render(){
            //获取首页信息
            getHomeInfo({
                theme_id: this.$store.state.user.themeInfo.id
            }).then(res => {
                if(!res.data){
                    this.isFree = true
                    this.iframeUrl = ''
                    this.homeResources = {}
                    return
                }
                this.homeResources = res.data
                this.changeMenu(res.data)
            })
            //查询用户可以查看的资源
            getResourcesByUserId({
                theme_id: this.$store.state.user.themeInfo.id,
                user_id: this.$store.state.user.userInfo.id,
                isOwner: this.$store.state.user.userInfo.isOwner || this.$store.state.user.userInfo.admin ? 1 : 0,
                tree: 1
            }).then(res => {
                this.menuList = res.data
            })
        },

        /**
         * 登录后台
         */
        login(){
            this.loading = this.$loading()
            this.$store.dispatch("admin/login", {
                user_no: this.$store.state.user.userInfo.user_no.toString(),
                theme_id: this.$store.state.user.themeInfo.id
            }).then(() => {
                var roles = []
                this.loading.close()
                this.$store.dispatch("permission/generateRoutes", this.$store.state.admin.roles).then(accessedRoutes => {
                    //动态挂载路由
                    this.$router.addRoutes(accessedRoutes)
                    this.password = ''
                    this.$router.push({
                        path: '/admin/menu/resources/configuration'
                    })
                })
            }).catch(_ => {
                this.loading.close()
            })
        },

        /**
         * 退出登录
         */
        logout(){
            clearInterval(this.timer)
            this.$store.dispatch('user/logout')
            this.$router.push({
                path: '/login'
            })
        },

        /**
         * 切换菜单
         */
        changeMenu(resources){
            //当前选线为空
            if(!resources){
                this.isFree = true
                this.iframeUrl = ''
                return
            }
            document.title = `${resources.menu_title} - ${this.$store.state.user.themeInfo.theme_name} - 数据管理系统`
            clearInterval(this.timer)
            var links = resources.links, counter = 0
            if(!links || links.length == 0) return
            if(links.length == 1){
                this.changeLink(links[0])
            }
            if(links.length > 1){
                this.changeLink(links[counter++])
                this.timer = setInterval(() => {
                    if(counter >= links.length){
                        counter = 0
                    }
                    this.changeLink(links[counter])
                    counter ++
                }, 20000)
            }
        },

        /**
         * 切换地址
         */
        changeLink(link){
            //免登录
            if(!link.origin){
                this.isFree = true
                this.$nextTick(() => {
                    this.iframeUrl = link.url.startsWith('http') ? link.url : 'http://' + link.url
                })
                return
            }

            //登录
            this.isFree = false
            this.$nextTick(() => {
                this.$refs.vizContainer.innerHTML = ''
                var subContainer = window.document.createElement('div')
                this.$refs.vizContainer.appendChild(subContainer)
                var documentWidth = document.documentElement.clientWidth || document.body.clientWidth,
                    documentHeight = document.documentElement.clientHeight|| document.body.clientHeight
                var options = {
                    width: documentWidth,
                    height: documentHeight,
                    hideTabs: true,
                    onFirstInteractive: function () {
                        yearFilter();
                        setInterval(refreshReport, 60*1000*30);
                    }
                }
                var subUrl = link.url.slice(link.url.indexOf('views/') + 6)
                this.getToken(link.verify_account).then(token => {
                    var url = `http://192.172.1.240/trusted/${token}/t/HC_Tableau_Server/views/${subUrl}`
                    window.viz = new window.tableau.Viz(subContainer, url, options)
                    window.viz.addEventListener(window.tableau.TableauEventName.STORY_POINT_SWITCH, yearFilter);
                    this.showMenu = false
                })
            })
        },

        /**
         * 全屏
         */
        fullscreen(){
            document.documentElement.requestFullscreen()
            if(!this.isFree){
                window.viz.setFrameSize(parseInt(window.screen.width), parseInt(window.screen.height))
            }
        },

        /**
         * 切换主题
         */
        switchTheme(index){
            clearInterval(this.timer)
            this.$store.dispatch('user/switchTheme', this.themeList[index]).then(() => {
                this.render()
            })
        },

        /**
         * 鉴权
         */
        getToken(account){
            return new Promise(resolve => {
                getToken({
                    ip: this.ip_address,
                    account
                }).then(res => {
                    resolve(res.data)
                })
            })
        },
        switchDashboard(){
            this.dashboard_visiable = !this.dashboard_visiable
        },
        windowResizeHandler(){
            var isFull = Math.abs(window.screen.height-window.document.documentElement.clientHeight) <= 17
            if(isFull != this.isFull){
                this.isFull = isFull
                let status = !this.showTopBar
                this.showTopBar = status
                this.showMenu = status
            }
        }
    }
}

function refreshReport(){
    /*var sheet = viz.getWorkbook().getActiveSheet();
    alert(sheet.getName());*/ 
    console.log("12")    
    window.viz.refreshDataAsync();
    //yearFilter()
}

function yearFilter(year) {
    var _YesterDay = moment().subtract(2,'days'); //昨天
    var workbook = window.viz.getWorkbook()
    var worksheet = workbook.getActiveSheet();
    //console.log(worksheet.getActiveStoryPoint())
    workbook.changeParameterValueAsync("开始日期", new Date(Date.UTC(_YesterDay.format("YYYY"), '1'-1, '1')));
    //workbook.changeParameterValueAsync("开始日期", '2018/1/1');
    console.log(new Date(Date.UTC(moment().format("YYYY"), moment().format("MM")-1, moment().format("DD"))))
    workbook.changeParameterValueAsync("结束日期", new Date(Date.UTC(moment().format("YYYY"), moment().format("MM")-1, moment().format("DD"))));
}

</script>
<style lang="scss">
.bg{
    width: 100vw;
    height: 100vh;
    background-color: #fff;
    .el-menu.el-menu--horizontal{
        border-bottom: none;
    }
    .el-menu-demo{
        position: fixed;
        left: 0;
        width: 100%;
        height: 50px;
        text-align: right;
        display: flex;
        justify-content: flex-end;
        transition: top 1s;
        .el-submenu__title{
            height: 49px;
            line-height: 48px;
        }
        .el-menu-item{
            height: 49px;
            line-height: 48px; 
            color: #fff;
        }
        i{
            margin: 0 2px;
            color: #C0C4CC;
            font-size: 20px;
        }
        .avatar{
            height: 49px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            color: #fff;
            margin: 0 12px;
            cursor: pointer;
        }
        .fl{
            position: absolute;
            left: 10px;
            font-size: 16px;
            img{
                height: 50px;
                margin-right: 10px;
            }
        }
    }
    .el-menu-vertical-demo{
        padding-bottom: 50px;
        width: 250px;
        position: fixed;
        left: 0;
        transition: left 1s;
    }
    .icon-1{
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: calc(50vh - 30px);
        left: 250px;
        width: 40px;
        height: 60px;
        font-size: 30px;
        background-color: rgba(0,0,0,.1)
    }
    .btn-group{
        width: 100%;
        position: absolute;
        bottom: 20px;
        display: flex;
        justify-content: space-around;
        .el-select{
            width: 70%;
        }
        .el-button{
            font-size: 26px;
            padding: 8px;
        }
    }
    .user-info{
        position: relative;
        .dashboard{
            position: absolute;
            top: 49px;
            right: -80px;
            background-color: rgb(48, 49, 51);
            color: #fff;
            padding: 10px 20px;
            text-align: center;
            width: 240px;
            line-height: 30px;
            border:1px solid #eee;
            box-shadow: 0 0 5px #eee;
            div{
                display: flex;
                justify-content: center;
            }
            div:nth-last-child(1){
                margin-top: 10px;
                border-top: 1px solid #ccc;
            }
        }
    }
}
.empty{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
}
</style>