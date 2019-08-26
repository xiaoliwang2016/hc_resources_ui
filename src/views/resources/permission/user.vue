<template>
    <div>
        <div class="head">
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
                        @click="() => changePermission(scope.row.id)">
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
            <el-form :model="userForm" :rules="rules" ref="userForm" label-width="80px" width="240px">
                <el-form-item label="员工工号" prop="user_no">
                    <el-input v-model="userForm.user_no" width="120"></el-input>
                </el-form-item>
                <el-form-item label="员工姓名" prop="user_name">
                    <el-input v-model="userForm.user_name"></el-input>
                </el-form-item>
                <el-form-item label="邮箱地址">
                    <el-input v-model="userForm.email"></el-input>
                </el-form-item>
                <el-form-item label="所属部门" prop="department">
                    <el-select v-model="userForm.department" placeholder="员工所属部门">
                        <el-option :label="item.title" :value="item.title" v-for="item in departmentArr" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="登录密码" prop="password">
                    <el-input v-model="userForm.password"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="passwordRepeat">
                    <el-input v-model="userForm.passwordRepeat"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="() => { submitForm('userForm') } ">保 存</el-button>
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
            departmentArr: [
                {id: 1, title: '财务部'},
                {id: 2, title: '采购部'},
                {id: 3, title: '人事部'},
                {id: 4, title: '开发部'}
            ],
            userForm: {},
            formTitle: '',
            rules: {
                user_no: [
                    { required: true, message: '请输入员工工号', trigger: 'blur' },
                    { validator: validateNo, trigger: 'blur' }
                ],
                user_name: [
                    { required: true, message: '请输入员工姓名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                passwordRepeat: [
                    { required: true, message: '请再次输入密码', trigger: 'blur' },
                    { validator: validatePass2, trigger: 'blur' }
                ],
                department: [
                    { required: true, message: '请选择部门', trigger: 'blur' }
                ]
            }
        }
    },

    mounted(){
        this.render()
    },

    methods:{
        parseTime,
        render(){
            api.list({
                theme_id: this.$store.state.user.themeInfo.id
            }).then(res => {
                this.userList = res.data
            })
        },
        showDialog(opreate, userData){
            if(opreate == 1){
                this.dialogFormVisible = true
                this.formTitle = '新增员工'
                this.operation = 'create'
                this.userForm = {
                    user_no: '',
                    user_name: '',
                    email: '',
                    department: '',
                    password: '',
                    passwordRepeat: '',
                    remark: ''
                }
            }else if(opreate == 2){
                this.formTitle = '编辑员工信息'
                this.operation = 'edit'
                userData.password = ''
                userData.passwordRepeat = ''
                this.userForm = {
                    ...userData
                }
                this.dialogFormVisible = true
            }   
        },
        submitForm(formName) {
            this.loading = this.$loading({lock: true})
			this.$refs[formName].validate((valid) => {
				if (valid) {
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

				} else {
					this.$message({
						message: '表单提交失败',
						type: 'warning'
                    })
                    this.loading.close()
					return false
				}
			})
		},
    }
}
</script>
<style lang="scss">
.head{
    padding: 15px 0;
    text-align: right;
    .el-select{
        margin-left: 10px;
    }
}
.cell{
    text-align: center;
}
</style>