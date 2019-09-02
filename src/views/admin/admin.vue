<template>
    <div class="container">
        <div class="head">
            <el-button type="info" size="small" @click="() => { showDialog(1) }">添加管理员</el-button>
        </div>
        <el-table :data="adminList" style="width: 100%" cell-class-name="cell">
            <el-table-column
                prop="user_no"
                width="110px"
                label="工号">
            </el-table-column>
            <el-table-column
                prop="user_name"
                label="姓名">
            </el-table-column>
            <el-table-column
                prop="email"
                label="地址">
            </el-table-column>
            <el-table-column
                prop="department"
                label="部门">
            </el-table-column>
            <el-table-column
                prop="email"
                width="80px"
                label="是否启用">
                <template slot-scope="scope">
                    <el-switch
                        :value="scope.row.status == 1"
                        active-color="#13ce66"
                        inactive-color="#ff4949">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column
                prop="last_login"
                label="最后登录时间">
                <template slot-scope="scope">
                    {{parseTime(scope.row.update_time, '{y}-{m}-{d}')}}
                </template>
            </el-table-column>
            <el-table-column
                prop="update_time"
                label="创建时间">
                <template slot-scope="scope">
                    {{parseTime(scope.row.update_time, '{y}-{m}-{d}')}}
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                width="260px">
                <template slot-scope="scope">
                    <el-button
                        type="success"
                        size="mini"
                        @click="() => changePermission(scope.row)">
                        权限设置
                    </el-button>
                    <el-button
                        type="primary"
                        size="mini"
                        @click="() => showDialog(2, scope.row)">
                        编辑
                    </el-button>
                    <el-button
                        type="warning"
                        size="mini"
                        @click="() => remove(scope.row.id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="formTitle" :visible.sync="dialogFormVisible" width="400px">
            <el-form label-width="80px" width="240px">
                <el-form-item label="用户">
                    <el-select :value="adminForm.user_name" @change="index => { adminForm = userList[index] }" placeholder="选择用户">
                        <el-option :label="item.user_name" :value="index" v-for="(item, index) in userList" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="登录密码">
                    <el-input v-model="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="() => { submitForm() } ">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import * as adminApi from '@/api/admin'
import * as userApi from '@/api/user'
import { parseTime } from '@/utils/index'
import { Promise } from 'q';
export default {
    name: 'Admin',

    data(){
        return{
            adminList: [],
            userList: [],
            formTitle: '',
            dialogFormVisible: false,
            password: '',
            adminForm: {}
        }
    },

    mounted(){
        userApi.list({
            theme_id: this.$store.state.admin.themeInfo.id
        }).then(res => {
            this.userList = res.data
        })
        this.init()
    },

    methods: {

        parseTime,

        init(){
            return new Promise(resolve => {
                adminApi.getAdminList({
                    theme_id: this.$store.state.admin.themeInfo.id
                }).then(res => {
                    this.adminList = res.data
                    resolve()
                })
            })
        },

        changePermission(adminData){
            this.$router.push({
                path: '/admin/setting/adminAuth',
                query: {
                    name: adminData.user_name,
                    id: adminData.id
                }
            })
        },

        showDialog(type, adminInfo){
            if(type == 1){
                this.dialogFormVisible = true
            }else if(type == 2){
                this.adminForm = adminInfo
                this.dialogFormVisible = true
            }
        },

        submitForm(){
            if(!this.password){
                return 	this.$message({
                    message: '登录密码不能为空',
                    type: 'warning'
                })
            }
            var { user_no, user_name, email, department} = this.adminForm
            this.loading = this.$loading({ lock: true })
            adminApi.addAdmin({
                theme_id: this.$store.state.admin.themeInfo.id,
                user_no,
                user_name,
                email,
                department,
                password: this.password
            }).then(() => {
                this.init().then(_ => {
                    this.loading.close()
                    this.dialogFormVisible = false
                    this.$message({
                        message: '创建管理员成功',
                        type: 'success'
                    })
                })
            })
        },

        remove(id){
            adminApi.removeAdmin({
                id,
                theme_id: this.$store.state.admin.themeInfo.id 
            }).then(_ => {
                this.init().then(() => {
                    this.$message({
                        message: '删除成功',
                        type: 'success'
                    })
                })
            })
        }
    }
}
</script>