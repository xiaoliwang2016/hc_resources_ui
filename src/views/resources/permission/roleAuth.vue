<template>
    <div>
        <div>当前编辑角色：{{roleName}}</div>
        <el-tree
            :data="resourcesTree"
            show-checkbox 
            @check-change="clickHandler" 
            
            node-key="id">
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ data.menu_title }}</span>
            </span>
        </el-tree>
    </div>
</template>
<script>
import * as roleApi from '@/api/role'
import { getResourcesTree } from '@/api/resources'
export default {
    data(){
        return {
            roleId: '',
            roleName: '',
            resourcesTree: [],
            selectedArr: []
        }
    },

    mounted(){
        this.roleId = this.$route.query.id
        this.roleName = this.$route.query.name
        getResourcesTree({
            theme_id: this.$store.state.user.themeInfo.id
        }).then(res => {
            this.resourcesTree = res.data
        })
    },

    methods: {
        clickHandler(a,b,c){
            console.log(a,b,c);
            
        }
    }
}
</script>