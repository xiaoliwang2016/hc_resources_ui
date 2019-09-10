<template>
    <div class="bg">
        <el-menu 
            class="el-menu-demo" 
            mode="horizontal" 
            background-color="#303133" 
            text-color="#F2F6FC" 
            active-text-color="#FFFFFF" 
            :style="{top: showTopBar ? 0 : '-50px'}">
            <div class="avatar fl">欢迎回来，<b>{{$store.state.user.userInfo.user_name}}</b></div>
            <div class="avatar">当前IP：<b>{{ip_address}}</b></div>
            <div class="avatar" @click="showDialog">后台<i class="el-icon-setting"></i></div>
            <el-submenu index="2">
                <template slot="title"> 租户</template>
                <el-menu-item 
                    v-for="(item, index) in themeList"
                    :key="item.id"
                    :index="'2-' + index"
                    @click="() => switchTheme(index)"
                    >{{item.theme_name}}
                </el-menu-item>
            </el-submenu>
            <div class="avatar" @click="logout">退出</div>
            <div class="avatar" @click="fullscreen">全屏</div>
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
                            @click="() => changeUrl(cellItem)" 
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

        <!-- <iframe :style="{width: '100vw', height:(showTopBar ? 'calc(100vh - 50px)' : '100vh'), marginTop: (showTopBar ? '50px' : 0)}" :src="iframeUrl" frameborder="0"></iframe> -->

        <div ref="vizContainer" :style="{width: '100vw', height:(showTopBar ? 'calc(100vh - 50px)' : '100vh'), marginTop: (showTopBar ? '50px' : 0)}"></div>

        <el-dialog title="登录到后台" :visible.sync="dialogFormVisible" width="25%">
            <el-form>
                <el-form-item label="工号" label-width="60px">
                    <el-input v-model="user_no" autocomplete="off" type="text" disabled></el-input>
                </el-form-item>
                <el-form-item label="密码" label-width="60px">
                    <el-input v-model="password" autocomplete="off" type="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="() => { login() }">登 录</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { getResourcesTree } from '@/api/resources'
import { getThemeByUserId, getResourcesByUserId } from '@/api/user'
import { getToken } from '@/api/permission'
import { login } from '@/api/admin'
import { debounce } from "debounce"
import { getYourIP, foowwLocalStorage } from '@/utils/index'
import { Promise } from 'q';

export default {
    data(){
        return {
            iframeUrl: '',
            menuList: [],
            showMenu: true,
            showTopBar: true,
            themeList: [],
            value: this.$store.state.user.themeInfo.id,
            dialogFormVisible: false,
            user_no: '',
            password: '',
            ip_address: ''
        }
    },

    mounted(){
        this.init()
        //监听全屏切换
        document.onfullscreenchange = () => { 
            if(!this.showTopBar){
                this.showTopBar = true
            }
        }
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

    methods: {
        init(){
            getResourcesByUserId({
                id: this.$store.state.user.userInfo.id,
                theme_id: this.$store.state.user.themeInfo.id,
                tree: 1
            }).then(res => {
                this.menuList = res.data
            })
        },

        showDialog(){
            this.user_no = this.$store.state.user.userInfo.user_no
            this.dialogFormVisible = true
        },

        /**
         * 登录后台
         */
        login(){
            this.$store.dispatch("admin/login", {
                user_no: this.$store.state.user.userInfo.user_no.toString(),
                password: this.password,
                theme_id: this.$store.state.user.themeInfo.id
            }).then(() => {
                var roles = []
                this.dialogFormVisible = false
                this.$store.dispatch("permission/generateRoutes", this.$store.state.admin.roles).then(accessedRoutes => {
                    //动态挂载路由
                    this.$router.addRoutes(accessedRoutes)
                    this.password = ''
                    this.$router.push({
                        path: '/admin/menu/resources/configuration'
                    })
                })
            }).catch(_ => {
                this.password = ''
                this.dialogFormVisible = false
            })
        },

        /**
         * 退出登录
         */
        logout(){
            this.$store.dispatch('user/logout')
            this.$router.push({
                path: '/login'
            })
        },

        changeUrl(resources){
            this.$refs.vizContainer.innerHTML = ''
            var subContainer = window.document.createElement('div')
            this.$refs.vizContainer.appendChild(subContainer)
            var options = {
                width: document.documentElement.clientWidth || document.body.clientWidth,
                height:document.documentElement.clientHeight|| document.body.clientHeight,
                hideTabs: true,
                onFirstInteractive: function () {
                    yearFilter();
                    setInterval(refreshReport, 60*1000*30);
                }
            };

            var { url } = resources
            var subUrl = url.slice(url.indexOf('views/') + 6)
            this.getToken(resources.verify_id).then(token => {
                var url = `http://192.172.1.240/trusted/${token}/t/HC_Tableau_Server/views/${subUrl}`
                window.viz = new window.tableau.Viz(subContainer, url, options)
                window.viz.addEventListener(window.tableau.TableauEventName.STORY_POINT_SWITCH, yearFilter);
                // this.iframeUrl = url
                this.showMenu = false
            })
        },

        fullscreen(){
            document.documentElement.requestFullscreen()
            setTimeout(() => {
                this.showTopBar = false
            }, 500);
        },

        /**
         * 切换主题
         */
        switchTheme(index){
            this.$store.dispatch('user/switchTheme', this.themeList[index]).then(() => {
                this.init()
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

}
</style>