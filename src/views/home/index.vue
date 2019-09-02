<template>
    <div class="bg">
        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            active-text-color="#409EFF"
            :unique-opened="true"
            :style="{left: showMenu ? 0 : '-250px'}">
            <el-menu-item>
                <el-submenu :index="index.toString()" v-for="(item, index) in menuList" :key="item.id">
                    <template slot="title">
                        <span>{{item.menu_title}}</span>
                    </template>   
                    <el-submenu :index="index + '-' + subIndex" v-for="(subItem, subIndex) in item.children" :key="subItem.id">
                        <template slot="title">{{subItem.menu_title}}</template>
                        <el-menu-item 
                            v-for="(cellItem, cellIndex) in subItem.children" 
                            @click="() => changeUrl(cellItem.url)" 
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

            <div class="btn-group">
                <el-select v-model="value" placeholder="切换租户">
                    <el-option
                        v-for="item in themeList"
                        :key="item.id"
                        :label="item.theme_name"
                        :value="item.id">
                    </el-option>
                </el-select>
                <el-button icon="el-icon-setting" circle @click="showDialog"></el-button>
            </div>
        </el-menu>

        <iframe style="width:100vw; height:100vh;" :src="iframeUrl" frameborder="0"></iframe>

        <el-dialog title="登录到后台" :visible.sync="dialogFormVisible" width="25%">
            <el-form>
                <el-form-item label="工号" label-width="60px">
                    <el-input v-model="user_no" autocomplete="off" type="text"></el-input>
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
import { login } from '@/api/admin'
import { debounce } from "debounce"
export default {
    data(){
        return {
            iframeUrl: '',
            menuList: [],
            showMenu: true,
            themeList: [],
            value: this.$store.state.user.themeInfo.id,
            dialogFormVisible: false,
            user_no: '',
            password: ''
        }
    },

    mounted(){
        this.init()
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

            getThemeByUserId({
                id: this.$store.state.user.userInfo.id
            }).then(res => {
                this.themeList = res.data
            })
        },

        showDialog(){
            this.user_no = this.$store.state.user.userInfo.user_no
            this.dialogFormVisible = true
        },

        login(){
            this.$store.dispatch("admin/login", {
                user_no: this.$store.state.user.userInfo.user_no.toString(),
                password: this.password,
                theme_id: this.$store.state.user.themeInfo.id
            }).then(() => {
                this.dialogFormVisible = false
                this.password = ''
                this.$router.push({
                    path: '/admin/menu/resources/configuration'
                })
            }).catch(_ => {
                this.password = ''
                this.dialogFormVisible = false
            })
        },

        changeUrl(url){
            this.iframeUrl = url
            this.showMenu = false
        }
    }
}
</script>
<style lang="scss">
.bg{
    width: 100vw;
    height: 100vh;
    background-color: #fff;
    .el-menu-vertical-demo{
        height: 100vh;
        padding-bottom: 50px;
        width: 250px;
        position: fixed;
        left: 0;
        top: 0;
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