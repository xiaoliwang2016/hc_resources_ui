<template>
    <div>
        <div class="head">当前角色：{{roleName}}</div>
        <el-tree 
            class="body"
            :data="resourcesTree"
            show-checkbox 
            @check="clickHandler" 
            :default-expand-all="true"
            :default-checked-keys="initResources"
            node-key="id">
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ data.menu_title }}</span>
            </span>
        </el-tree>
        <div class="foot">
            <el-button size="small" type="primary" @click="save">保存</el-button>
            <el-button size="small" @click="() => { this.$router.go(-1) }">返回</el-button>
        </div>
    </div>
</template>
<script>
import * as roleApi from '@/api/role'
import { getResourcesTree, assignToRole } from '@/api/resources'
export default {
    data(){
        return {
            roleName: '',
            resources: [],
            resourcesTree: [],
            selectedArr: [],
            initResources: []
        }
    },

    mounted(){
        this.roleName = this.$route.query.name
        this.render()
    },

    methods: {
        render(){
            getResourcesTree({
                theme_id: this.$store.state.user.themeInfo.id,
                tree: 1
            }).then(res => {            
                this.resourcesTree = res.data
            })

            //初始化数据
            roleApi.getResourcesByRoleId({
                role_id: this.$route.query.id
            }).then(res => {
                var initResources = [], selectedArr = []
                res.data.map(item => {
                    if(item.type == 3){
                        initResources.push(item.id)
                    }
                    selectedArr.push(item.id)
                })
                this.initResources = initResources
                this.selectedArr = selectedArr
            })

            //获取所有资源数据
            getResourcesTree({
                theme_id: this.$store.state.user.themeInfo.id
            }).then(res => {
                this.resources = res.data
            })
        },

        clickHandler(item, data){
            this.selectedArr = data.checkedKeys.concat(data.halfCheckedKeys)
        },

        save(){
            this.loading = this.$loading({ lock: true })
            assignToRole({
                role_id: this.$route.query.id,
                resources_id: this.selectedArr
            }).then(res => {
                this.loading.close()
                this.$message({
                    message: '权限设置成功',
                    type: 'success'
                })
                this.$router.go(-1)
            }).catch(() => {
                this.loading.close()
                this.$message({
                    message: '请求失败',
                    type: 'warning'
                })
            })
        }

        /**
         * 找出当前子项对应所有的父项
         */
        // findParentId(id){
        //     var arr = [id], item
        //     for (let index = 0; index < this.resources.length; index++) {
        //         const element = this.resources[index]
        //         if(element.id == id){
        //             item = element
        //         }
        //     }

        //     if(item.pid != 0){
        //         arr = arr.concat(this.selectItem(item.pid))
        //     }
        //     return arr
        // },

        /**
         * 找出当前父项拥有的所有子项
        */
        // findSonId(id){
        //     var arr = []
        //     for (let index = 0; index < this.resources.length; index++) {
        //         const element = this.resources[index]
        //         if(element.pid == id){
        //             arr.push(element.id)
        //             arr = arr.concat(this.findSonId(element.id))
        //         }
        //     }
        //     return arr
        // }
    }
}
</script>
<style lang="scss" scoped>
.head{
    padding: 15px;
    border-bottom: 1px solid #eee;
}
.body{
    padding: 30px;
}
.foot{
    text-align: center;
}
</style>