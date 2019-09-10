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
            <el-form :model="themeForm" ref="themeForm" label-width="100px" width="240px">
                <el-form-item label="员工工号">
                    <el-row type="flex" justify="space-between">
                        <el-col :span="14">
                            <el-input v-model="themeForm.manager_id" :disabled="existed"></el-input>
                        </el-col>
                        <el-col :span="3">
                            <el-button type="text" @click="search" :disabled="existed">搜索</el-button>
                        </el-col>
                        <el-col :span="3">
                            <el-button type="text" @click="clear" :disabled="operation == 'edit'">清空</el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="租户名称">
                    <el-input v-model="themeForm.theme_name" width="120"></el-input>
                </el-form-item>
                <el-form-item label="管理员名称">
                    <el-input v-model="themeForm.manager" width="120" disabled></el-input>
                </el-form-item>
                <el-form-item label="所属部门">
                    <el-input v-model="themeForm.department" width="120" disabled></el-input>
                </el-form-item>
                <el-form-item label="租户描述">
                    <el-input v-model="themeForm.remark" resize="none"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="() => { submitForm('themeForm') } " :disabled="!(existed && themeForm.theme_name)">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import * as api from '@/api/theme'
import { searchUser } from '@/api/user'
import { parseTime } from '@/utils/index'
export default {
    data(){
        return{
            themeList: [],
            dialogFormVisible: false,
            themeForm: {},
            formTitle: '',
            existed: false,
            operation: ''
        }
    },

    mounted(){
        this.render()
    },

    methods: {
        parseTime,

        render(){
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
                this.clear()
            }else if(opreate == 2){
                this.formTitle = '编辑租户'
                this.operation = 'edit'
                this.existed = false
                this.themeForm = {
                    ...themeData
                }
                this.dialogFormVisible = true
            }   
        },

        submitForm(formName) {
            this.loading = this.$loading()
            //创建
            if(this.operation == 'create'){
                api.addOrUpdateTheme(this.themeForm).then(res => {
                    this.dialogFormVisible = false
                    //创建成功后刷新
                    this.render()
                    this.$message({
                        message: '租户创建成功',
                        type: 'success'
                    })
                    this.loading.close()
                }).catch(() => {
                    this.loading.close()
                })
            //更新
            }else if(this.operation == 'edit'){
                api.addOrUpdateTheme(this.themeForm).then(res => {
                    this.dialogFormVisible = false
                    this.render()
                    this.$message({
                        message: '员工信息更新成功',
                        type: 'success'
                    })
                    this.loading.close()
                }).catch(err => {
                    this.loading.close()
                })
            }
        },

        /**
         * 通过工号去employee检索数据
         */
        search(){
            searchUser({
                user_no: this.themeForm.manager_id
            }).then(res => {
                var { data } = res
                if(data){
                    this.existed = true
                    this.themeForm.manager = data.SNAME ? data.SNAME  : '佚名'
                    this.themeForm.department = data.ZZ_SIJI_DESC ? data.ZZ_SIJI_DESC  : '未知'
                }else{
                    this.$message({
                        message: '系统中找不到该用户',
                        type: 'warning'
                    })
                }
            })
        },
        /**
         * 清空表单
         */
        clear(){
            this.existed = false
            this.themeForm = {
                theme_name: '',
                department: '',
                manager_id: '',
                manager: ''
            }
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