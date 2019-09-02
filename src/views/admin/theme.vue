<template>
    <div class="container">
        <div class="header">
            <el-button size="small" @click="() => { showDialog(1) }">添加租户</el-button>
        </div>
        <el-table :data="themeList" style="width: 100%" cell-class-name="cell">
            <el-table-column
                prop="id"
                width="80"
                label="租户ID">
            </el-table-column>
            <el-table-column
                prop="theme_name"
                label="租户名称">
            </el-table-column>
            <el-table-column
                prop="department"
                label="部门">
            </el-table-column>
            <el-table-column
                prop="manager"
                label="创建者">
            </el-table-column>
            <el-table-column
                prop="status"
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
                prop="update_time"
                label="创建时间">
                <template slot-scope="scope">
                    {{parseTime(scope.row.update_time, '{y}-{m}-{d}')}}
                </template>
            </el-table-column>
            <el-table-column
                label="操作">
                <template slot-scope="scope">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="() => showDialog(2, scope.row)">
                        编辑
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="formTitle" :visible.sync="dialogFormVisible" width="400px">
            <el-form :model="themeForm" :rules="rules" ref="themeForm" label-width="80px" width="240px">
                <el-form-item label="租户名称" prop="theme_name">
                    <el-input v-model="themeForm.theme_name" width="120"></el-input>
                </el-form-item>
                <el-form-item label="所属部门" prop="department">
                    <el-select v-model="themeForm.department" placeholder="租户所属部门">
                        <el-option :label="item.title" :value="item.title" v-for="item in departmentArr" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="创建者" prop="manager">
                    <el-input v-model="themeForm.manager"></el-input>
                </el-form-item>
                <el-form-item label="租户描述">
                    <el-input v-model="themeForm.remark" resize="none"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="() => { submitForm('themeForm') } ">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import * as api from '@/api/theme'
import { parseTime } from '@/utils/index'
export default {
    data(){
        return{
            themeList: [],
            dialogFormVisible: false,
            themeForm: {},
            rules: {
                theme_name: [
                    { required: true, message: '请输入员工姓名', trigger: 'blur' }
                ],
                manager: [
                    { required: true, message: '请输入员工创建者', trigger: 'blur' }
                ],
                department: [
                    { required: true, message: '请选择部门', trigger: 'blur' }
                ]
            },
            departmentArr: [
                {id: 1, title: '财务部'},
                {id: 2, title: '采购部'},
                {id: 3, title: '人事部'},
                {id: 4, title: '开发部'}
            ],
            formTitle: ''
        }
    },

    mounted(){
        this.init()
    },

    methods: {
        parseTime,

        init(){
            api.listTheme({
                pageNo: 1,
                pageSize: 10
            }).then(res => {
                this.themeList = res.data.rows
            })
        },

        showDialog(opreate, themeData){
            if(opreate == 1){
                this.dialogFormVisible = true
                this.formTitle = '新增租户'
                this.operation = 'create'
                this.themeForm = {
                    theme_name: '',
                    department: '',
                    manager: '',
                    remark: ''
                }
            }else if(opreate == 2){
                this.formTitle = '编辑租户'
                this.operation = 'edit'
                this.userForm = {
                    ...themeData
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
                            ...this.themeForm,
                            status: 1
						}
						api.addTheme(data).then(res => {
							this.dialogFormVisible = false
							//创建成功后刷新
							this.render().then(() => {
								this.$message({
									message: '租户创建成功',
									type: 'success'
								})
								this.loading.close()
							})
						}).catch(() => {
                            this.loading.close()
                        })
					//更新
					}else if(this.operation == 'edit'){
						api.updateUser(this.themeForm).then(res => {
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
        }
    }
}
</script>
<style lang="scss">
.header{
    padding: 15px 50px;
    text-align: right;
}
</style>