<template>
    <div>
        <div class="head-r">
            <el-button type="info" size="small" @click="() => { showDialog(1) }">添加用户</el-button>
            <el-select v-model="pageSize" placeholder="显示条数" size="small">
                <el-option label="10条" :value="10"></el-option>
                <el-option label="20条" :value="20"></el-option>
                <el-option label="50条" :value="50"></el-option>
            </el-select>
            <el-select v-model="orderBy" placeholder="排序方式" size="small" :disabled="true">
                <el-option label="登录时间" :value="1"></el-option>
                <el-option label="创建时间" :value="2"></el-option>
            </el-select>
        </div>
        <el-table :data="userList" style="width: 100%" cell-class-name="cell">
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
                prop="company_desc"
                label="公司">
            </el-table-column>
            <el-table-column
                prop="department_desc"
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
                        v-identify="{name: 'assign_resources_user'}"
                        @click="() => changePermission(scope.row)">
                        权限设置
                    </el-button>
                    <el-button
                        type="primary"
                        size="mini" 
                        v-identify="{name: 'edit_user'}"
                        @click="() => showDialog(2, scope.row)">
                        编辑
                    </el-button>
                    <el-button
                        type="warning"
                        size="mini" 
                         v-identify="{name: 'delete_user'}"
                        @click="() => remove(scope.row.id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="formTitle" :visible.sync="dialogFormVisible" width="400px">
            <el-form :model="userForm" ref="userForm" label-width="80px" width="240px">
                <el-form-item label="员工工号">
                    <el-row type="flex" justify="space-between">
                        <el-col :span="14">
                            <el-input v-model="userForm.user_no" :disabled="existed"></el-input>
                        </el-col>
                        <el-col :span="3">
                            <el-button type="text" @click="search" :disabled="existed">搜索</el-button>
                        </el-col>
                        <el-col :span="3">
                            <el-button type="text" @click="clear" :disabled="operation == 'edit'">清空</el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="员工姓名">
                    <el-input v-model="userForm.user_name" disabled></el-input>
                </el-form-item>
                <el-form-item label="所属公司">
                    <el-input v-model="userForm.company_desc" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱地址">
                    <el-input v-model="userForm.email"></el-input>
                </el-form-item>
                <el-form-item label="所属部门" >
                    <el-input v-model="userForm.department_desc" disabled></el-input>
                </el-form-item>
                <el-form-item label="岗位">
                    <el-input v-model="userForm.job_desc" disabled></el-input>
                </el-form-item>
                <el-form-item label="登录密码">
                    <el-input v-model="userForm.password"></el-input>
                </el-form-item>
                <el-form-item label="确认密码">
                    <el-input v-model="userForm.passwordRepeat"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="() => { submitForm('userForm') }" :disabled="!existed">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import * as api from '@/api/user'
import { parseTime } from '@/utils/index'
export default {
    name: 'User',
    data(){
        var validatePass2 = (rule, value, callback) => {
            if (value != this.userForm.password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        }
        var validateNo = (rule, value, callback) => {
            var reg = /^[0-9]*$/
            if (!reg.test(value) || value.toString().length != 8) {
                callback(new Error('请输入8位数字工号'));
            } else {
                callback();
            }
        }
        return {
            userList: [],
            pageSize: 20,
            orderBy: 1,
            formTitle: '',
            dialogFormVisible: false,
            userForm: {},
            existed: false,
            operation: ''
        }
    },

    mounted(){
        this.render()
    },

    methods:{
        parseTime,
        render(){
            api.list({
                theme_id: this.$store.state.admin.themeInfo.id
            }).then(res => {
                this.userList = res.data
            })
        },
        showDialog(opreate, userData){
            if(opreate == 1){
                this.dialogFormVisible = true
                this.formTitle = '新增员工'
                this.operation = 'create'
                this.clear()
            }else if(opreate == 2){
                this.formTitle = '编辑员工信息'
                this.operation = 'edit'
                userData.password = ''
                userData.passwordRepeat = ''
                this.userForm = {
                    ...userData
                }
                this.existed = true
                this.dialogFormVisible = true
            }   
        },
        changePermission(userData){
            this.$router.push({
                path: '/admin/menu/permission/userAuth',
                query: {
                    name: userData.user_name,
                    id: userData.id
                }
            })
        },
        submitForm(formName) {
            if(!(this.userForm.password == this.userForm.passwordRepeat && this.userForm.password != '')){
                return this.$message({
                    message: '密码不能为空，切两次输入密码必须一致',
                    type: 'warning'
                })
            }
            this.loading = this.$loading({lock: true})
            //创建
            if(this.operation == 'create'){
                var data = {
                    ...this.userForm,
                    status: 1,
                    theme_id: this.$store.state.user.themeInfo.id
                }
                api.addUser(data).then(res => {
                    this.dialogFormVisible = false
                    //创建成功后刷新
                    this.render().then(() => {
                        this.$message({
                            message: '用户创建成功',
                            type: 'success'
                        })
                        this.loading.close()
                    })
                }).catch(() => {
                    this.loading.close()
                })
            //更新
            }else if(this.operation == 'edit'){
                api.updateUser(this.userForm).then(res => {
                    this.dialogFormVisible = false
                    this.render().then(() => {
                        this.$message({
                            message: '员工信息更新成功',
                            type: 'success'
                        })
                        this.loading.close()
                    })
                }).catch(err => {
                    this.loading.close()
                })
            }
        },
        /**
         * 通过工号去employee检索数据
         */
        search(){
            api.searchUser({
                user_no: this.userForm.user_no
            }).then(res => {
                var { data } = res
                if(data){
                    this.existed = true
                    this.userForm.user_name = data.SNAME
                    this.userForm.department = data.ZZ_SIJI
                    this.userForm.department_desc = data.ZZ_SIJI_DESC
                    this.userForm.company = data.BUKRS
                    this.userForm.company_desc = data.BUKRS_DESC
                    this.userForm.job = data.PLANS
                    this.userForm.job_desc = data.PLANS_DESC
                }else{
                    this.$message({
                        message: '系统中找不到该用户',
                        type: 'warning'
                    })
                }
            })
        },
        remove(user_id){
            this.$confirm('确认删除此用户吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                api.removeUser({
                    theme_id: this.$store.state.user.themeInfo.id,
                    user_id
                }).then(res => {
                    this.$message({
                        message: '员工删除成功',
                        type: 'success'
                    })
                    this.render()
                })
            })
        },  
        clear(){
            this.existed = false
            this.userForm = {
                user_no: '',
                user_name: '',
                email: null,
                department: '',
                password: '',
                passwordRepeat: '',
                remark: '',
                employee_id: ''
            }
        }
    }
}
</script>
<style lang="scss">
.cell{
    text-align: center;
}
</style>
