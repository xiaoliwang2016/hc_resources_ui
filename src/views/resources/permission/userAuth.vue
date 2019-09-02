<template>
    <div>
        <div class="head">当前用户：<b>{{userName}}</b></div>
        <div class="body clearfix">
            <div class="left">
                <div class="head">角色分配</div>
                <el-table
                    :data="roleData"
                    style="width: 100%">
                    <el-table-column
                        prop="id"
                        label="操作"
                        width="100">
                        <template slot-scope="scope">
                            <el-checkbox v-model="scope.row.selected" @change="e => roleChangeHandler(scope.row.id, e)">{{scope.row.id}}</el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="role_name"
                        label="角色名称"
                        width="120">
                    </el-table-column>
                    <el-table-column
                        prop="role_desc"
                        label="职能描述">
                    </el-table-column>
                </el-table>
            </div>
            <div class="right">
                <div class="head">资源分配</div>
                <el-tree 
                    ref="tree" 
                    :data="resourcesTree"
                    show-checkbox 
                    @check="clickHandler" 
                    :default-expand-all="true"
                    node-key="id">
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                        <span>{{ data.menu_title }}</span>
                    </span>
                </el-tree>
            </div>
        </div>
        <div class="foot">
            <el-button size="small" type="primary" @click="save">保存</el-button>
            <el-button size="small" @click="() => { this.$router.go(-1) }">返回</el-button>
        </div>
    </div>
</template>
<script>
import * as userApi from '@/api/user'
import { listRole, assignRoleToUser, getResourcesByRoleId } from '@/api/role'
import { getResourcesTree, assignToRole, assignToUser } from '@/api/resources'
import { uniqueArr } from '@/utils/index'
export default {
    data(){
        return {
            userName: '',
            roleData: [],
            resources: [],
            resourcesTree: [],
            selectedResources: [],
            initResources: []
        }
    },

    mounted(){
        this.userName = this.$route.query.name
        this.init()
    },

    methods: {
        init(){
            //获取角色列表
            listRole({
                theme_id: this.$store.state.admin.themeInfo.id,
                role_group: 0
            }).then(roles => {
                //读取该用户的角色列表
                userApi.getRolesByUserId({
                    id: this.$route.query.id
                }).then(res => {
                    var hadRoles = res.data
                    roles.data.map((item, index) => {
                        roles.data[index].selected = hadRoles.indexOf(item.id) != -1
                    })
                    this.roleData = roles.data
                })
            })

            //读取资源列表 -- 树状展示
            getResourcesTree({
                theme_id: this.$store.state.admin.themeInfo.id,
                tree: 1
            }).then(res => {            
                this.resourcesTree = res.data
            })

            //读取资源列表
            getResourcesTree({
                theme_id: this.$store.state.admin.themeInfo.id
            }).then(res => {
                this.resources = res.data
            })

            //读取用户拥有资源ID
            userApi.getResourcesByUserId({
                id: this.$route.query.id,
                theme_id: this.$store.state.admin.themeInfo.id
            }).then(res => {
                var initResources = [], selectedResources = []
                res.data.map(item => {
                    if(item.type == 3){
                        initResources.push(item.id)
                    }
                    selectedResources.push(item.id)
                })
                this.selectedResources = selectedResources
                this.initResources = initResources
                this.$refs.tree.setCheckedKeys(initResources)
            })
        },

        clickHandler(item, data, c){
            this.initResources = data.checkedKeys
            this.selectedResources = data.checkedKeys.concat(data.halfCheckedKeys)
        },

        roleChangeHandler(roleId, value){
            var initResources = [...this.initResources], 
                selectedResources = [...this.selectedResources]
            getResourcesByRoleId({
                role_id: roleId
            }).then(res => {
                if(!value){
                    res.data.map(item => {
                        if(selectedResources.indexOf(item.id) != -1){
                            selectedResources.splice(selectedResources.indexOf(item.id), 1)
                            if(item.type == 3){
                                initResources.splice(initResources.indexOf(item.id), 1)
                            }
                        }
                    })
                }else{
                    res.data.map(item => {
                        selectedResources.push(item.id)
                        if(item.type == 3){
                            initResources.push(item.id)
                        }
                    })
                }
                this.initResources = uniqueArr(initResources)
                this.selectedResources = uniqueArr(selectedResources)
                this.$refs.tree.setCheckedKeys(this.initResources)
            })
        },

        save(){
            this.loading = this.$loading({ lock: true })
            var role_id = [], task = []
            this.roleData.map(item => {
                if(item.selected){
                    role_id.push(item.id)
                }
            })
            task.push(
                assignRoleToUser({
                    role_id,
                    user_id: this.$route.query.id
                }),
                assignToUser({
                    resources_id: this.selectedResources,
                    user_id: this.$route.query.id
                })
            )
            Promise.all(task).then(_ => {
                this.$message({
                    message: '权限设置成功',
                    type: 'success'
                })
                this.$router.go(-1)
                this.loading.close()
            }).catch(_ => {
                this.$message({
                    message: '请求失败',
                    type: 'warning'
                })
                this.loading.close()
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.head{
    padding: 15px;
    border-bottom: 1px solid #eee;
}
.body{
    padding: 15px;
    .left{
        width: 50%;
        float: left;
    }
    .right{
        width: 40%;
        float: right;
    }
    .head{
        padding: 10px 15px;
        margin-bottom: 15px;
        font-weight: 600;
    }
}

.foot{
    text-align: center;
}
</style>