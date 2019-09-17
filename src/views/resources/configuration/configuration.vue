<template>
	<el-container>
		<el-header height="50px" class="tips"><b>温馨提示!</b> 本模块功能配置主题门户首页和左侧菜单；菜单深度为3.</el-header>
		<el-main>
			  <div class="block">
				<div class="row tree-head">
					<span class="title title_0">菜单名称</span>
					<span class="grid">菜单类型</span>
					<span class="grid">启用</span>
					<span class="grid">公开</span>
					<span class="grid">系统来源</span>
					<!-- <span class="btn-group">
						<el-button
							type="success"
							size="mini"
							v-identify="{name: 'add_resources_2'}"
							@click="() => createResources({type: 0, id: 0})">
							创建一级菜单
						</el-button>
					</span> -->
				</div>
				<div class="row home">
					<span class="title title_0">首页</span>
					<span class="grid">首页</span>
					<span class="grid">
						<el-switch
							:disabled="true"
							:value="true">
						</el-switch>
					</span>
					<span class="grid">
						<el-switch
							:disabled="true"
							:model="true">
						</el-switch>
					</span>
					<span class="grid" style="margin-right: 6px;"></span>
					<span class="btn-group" style="text-align:left;">
						<el-button
							type="success"
							size="mini"
							v-identify="{name: 'add_resources_2'}"
							@click="() => createResources({type: 0, id: 0})">
							创建一级菜单
						</el-button>
						<el-button
							type="primary"
							size="mini"
							v-identify="{name: 'add_resources_2'}"
							@click="toEditHome">
							编辑
						</el-button>
					</span>
				</div>
				<el-tree
					:data="resourcesList"
					node-key="id"
					default-expand-all
					:draggable="true" 
					:expand-on-click-node="false"
					@node-drag-end="dragEndHandler"
					:allow-drop="(draggingNode, dropNode, type) => draggingNode.data.pid == dropNode.data.pid && (type == 'prev' || type == 'next')"
					:indent = 24 >
					<span class="row" slot-scope="{ node, data }">
						<span :class="['title', 'title_' + data.type]">{{ data.menu_title }}</span>
						<span class="grid">
							<template v-if="data.type == 1">一级菜单</template>
							<template v-else-if="data.type == 2">二级菜单</template>
							<template v-else>三级菜单</template>
						</span>
						<span class="grid">
							<el-switch
								v-model="data.status" 
								:active-value="1" 
								:inactive-value="0"
								@change="value => switchChangeHandler(data, value, 'status')"
								v-identify="{name: 'edit_resources'}"
							>
							</el-switch>
						</span>
						<span class="grid">
							<el-switch
								v-model="data.public" 
								:active-value="1" 
								:inactive-value="0"
								@change="value => switchChangeHandler(data, value, 'public')"
								v-identify="{name: 'edit_resources'}"
							>
							</el-switch>
						</span>
						<span class="grid">{{data.origin}}</span>
						<span class="btn-group">
							<el-button
								v-if="data.type == 1"
								type="success"
								size="mini" 
								v-identify="{name: 'add_resources_2'}"
								@click="() => createResources(data)">
								创建二级菜单
							</el-button>
							<el-button
								v-if="data.type == 2"
								type="success"
								size="mini"
								v-identify="{name: 'add_resources_3'}"
								@click="() => createResources(data)">
								创建三级菜单
							</el-button>
							<el-button
								type="primary"
								size="mini"
								v-identify="{name: 'edit_resources'}"
								@click="() => editResources(data)">
								编辑
							</el-button>
							<el-button
								type="warning"
								size="mini"
								v-identify="{name: 'delete_resources'}"
								@click="() => deleteResources(data)">
								删除
							</el-button>
						</span>
					</span>
				</el-tree>
			</div>

			<el-dialog
				:title="layerTitle"
				:visible.sync="dialogVisible"
				width="1200px"
				:before-close="handleClose">
				<el-form :model="resourcesForm" ref="resourcesForm" label-width="80px" class="form demo-ruleForm">
					<el-form-item label="菜单标题">
						<el-col :span="12">
							<el-input type="text" v-model="resourcesForm.menu_title" placeholder="请输入菜单标题" maxlength="8" show-word-limit></el-input>
						</el-col>
					</el-form-item>

					<el-form-item label="打开方式">
						<el-select v-model="resourcesForm.open_type" placeholder="请选择打开方式" :disabled="resourcesForm.type!=3">
							<el-option label="当前窗口" :value="0"></el-option>
							<el-option label="新窗口" :value="1"></el-option>
						</el-select>
					</el-form-item>

					<el-form-item label="链接地址" :inline="true" v-for="(link, index) in resourcesForm.links" :key="index" v-show="resourcesForm.type == 3 || resourcesForm.type == 0">
						<el-row type="flex" justify="space-between">
							<el-col :span="10">
								<el-input placeholder="请输入地址" v-model="link.url">
									<template slot="prepend">Http://</template>
								</el-input>
							</el-col>
							
							<el-col :span="4">
								<el-select v-model="link.origin" placeholder="系统来源">
									<el-option label="空模板" value=""></el-option>
									<el-option label="Tableau" value="Tableau"></el-option>
								</el-select>
							</el-col>

							<el-col :span="7">
								<el-switch 
									:disabled="link.origin == ''"
									:active-value="1" 
									:inactive-value="0"
									v-model="link.verify" 
									active-text="登录"
									inactive-text="免登录">
								</el-switch>
								<el-select style="width: 180px;" v-model="link.verify_account" :disabled="!link.verify" placeholder="登录账号" @change="value => { changeVerifyStatus(value, index) }">
									<el-option :label="item.account" :value="item.account" v-for="item in accountList" :key="item.account"></el-option>
									<el-option label="create one" :value="0"></el-option>
								</el-select>
							</el-col>

							<el-col :span="1.5">
								<el-button 
									@click="addLink"
									:disabled="!link.url"
									icon="el-icon-plus" 
									circle >
								</el-button> 
								<el-button 
									@click="() => { resourcesForm.links.splice(index, 1) }"
									v-if="index != 0"
									icon="el-icon-delete" 
									circle >
								</el-button>
							</el-col>
						</el-row>
					</el-form-item>

					<el-form-item label="公开">
						<el-switch
							v-model="resourcesForm.public"
							:active-value="1" 
							:inactive-value="0">
						</el-switch>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitForm()">保存</el-button>
						<el-button @click="() => { dialogVisible = false }">取消</el-button>
					</el-form-item>
				</el-form>

				    <el-dialog
						width="30%"
						title="请登录"
						:visible.sync="innerVisible"
						append-to-body>
						<el-form label-width="80px">
							<el-form-item label="用户名">
								<el-input v-model="accountForm.account"></el-input>
							</el-form-item>
							<el-form-item label="密码">
								<el-input v-model="accountForm.password"></el-input>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" size="small" @click="verifyAccount">登录</el-button>
								<el-button size="small" @click="() => { innerVisible = false }">取消</el-button>
							</el-form-item>
						</el-form>
					</el-dialog>
			</el-dialog>

		</el-main>
		<el-footer height="50px">

		</el-footer>
	</el-container>
</template>

<script>
import * as api from '@/api/resources'
import * as accountApi from '@/api/account'
import { getHomeInfo } from '@/api/theme'
import { RecursiveSearch } from '@/utils/index'
import eventBus from '@/utils/eventBus'
export default {
	name: 'Configuration',
	data(){
		return{
			dialogVisible: false,
			innerVisible: false,
			layerTitle: '编辑菜单',
			resourcesList: [],
			resourcesForm: {},
			accountList: [],
			accountForm: {}
		}
	},

	mounted(){
		this.init()
		this.render()
		eventBus.$on('change-theme', () => {
			this.init()
			this.render()
		}) 
	},

	beforeDestroy(){
		eventBus.$off('change-theme')
	},

	methods: {

		init(){
			accountApi.list({
				theme_id: this.$store.state.admin.themeInfo.id
			}).then(res => {
				this.accountList = res.data
			})
		},

		render(){
			return new Promise(resolve => {
				api.getResourcesTree({
					theme_id: this.$store.state.admin.themeInfo.id,
					tree: 1
				}).then(list => {
					this.resourcesList = list.data
					resolve()
				})
			})
		},

		submitForm() {
			if(this.resourcesForm.type == 3){
				var legalWithLinks = this.resourcesForm.links.reduce((accumlator, accruentValue) => (accumlator && accruentValue.url), true)
				if(!legalWithLinks){
					return this.$message({
						type: 'warning',
						message: '请不要输入空链接'
					})
				}
			}
			this.loading = this.$loading()
			api.addOrUpResources(this.resourcesForm).then(res => {
				this.dialogVisible = false
				//创建成功后刷新
				this.render().then(() => {
					this.$message({
						message: '操作成功',
						type: 'success'
					})
					this.loading.close()
				})
			})
		},

		switchChangeHandler(data, value, key){
			if(value == 0 && data.type != 3){
				var root = RecursiveSearch(this.resourcesList, 'id', data.id)
				if(root.children && root.children.length > 0){
					var res = RecursiveSearch(root.children, key, 1)
					if(res !== false){
						data[key] = 1
						return this.$message({
							message: '尚有未关闭的子节点，请先关闭子节点',
							type: 'warning'
						})
					}
				}
			}
			this.resourcesForm = data
			this.submitForm()
		},

		
		/**
		 * 创建菜单
		 */
		createResources(data){
			this.resourcesForm = {
				type: data.type + 1,
				menu_title: '',
				open_type: 0,
				public: 0,
				pid: data.id,
				links: [
					{
						url: '',
						origin: 'Tableau',
						verify: 0,
						verify_account: ''
					}
				],
				user_id: this.$store.state.admin.userInfo.id,
				theme_id: this.$store.state.admin.themeInfo.id
			}
			switch(data.type){
				case 0:
					this.layerTitle = '添加一级菜单'
					break;
				case 1:
					this.layerTitle = data.menu_title + '：添加二级菜单'
					break;
				case 2:
					this.layerTitle = data.menu_title + '：添加三级菜单'
					break;
			}
			this.operation = 'create'
			this.dialogVisible = true
		},
		/**
		 * 编辑菜单
		 */
		editResources(data){
			this.layerTitle = '编辑菜单：' + data.menu_title
			this.resourcesForm = data
			this.operation = 'edit'
			this.dialogVisible = true
		},
		/**
		 * 删除菜单
		 */
		deleteResources(data){
			if(data.type != 3){
				var root = RecursiveSearch(this.resourcesList, 'id', data.id)
				if(root.children && root.children.length > 0){
					var res = RecursiveSearch(root.children, 'theme_id', this.$store.state.admin.themeInfo.id)
					if(res !== false){
						return this.$message({
							message: '尚有未删除的子节点，请先删除子节点',
							type: 'warning'
						})
					}
				}
			}
			this.$confirm('您确定要删除该选项吗？', '提示', {
				confirmButtonText: '删除',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				api.deleteResources({ id: data.id }).then(res => {
					//删除成功后刷新
					this.render().then(() => {
						this.$message({
							message: '菜单删除成功',
							type: 'success'
						})
					})
				})
			})
		},

		handleClose(){
			if(this.resourcesForm.menu_title){
				return this.$confirm('数据尚未保存，确定要关闭吗？')
				.then(_ => {
					this.dialogVisible = false
				}).catch(_=> {})
			}
			this.dialogVisible = false
		},

		dragEndHandler(draggingNode, dropNode, type){
			this.resourcesForm = draggingNode.data
			if(type == 'after'){
				this.resourcesForm.resources_order = dropNode.data.resources_order - 1
			}else if(type == 'before'){
				this.resourcesForm.resources_order = dropNode.data.resources_order + 1
			}
			this.submitForm()
		},

		/**
		 * 编辑首页
		 */
		toEditHome(){
			this.loading = this.$loading()
			getHomeInfo({
				theme_id: this.$store.state.admin.themeInfo.id
			}).then(res => {
				if(res.data){
					this.resourcesForm = res.data
				}else{
					this.resourcesForm = {
						type: 0,
						menu_title: '首页',
						open_type: 0,
						public: 1,
						pid: -1,
						links: [
							{
								url: '',
								origin: 'Tableau',
								verify: 0,
								verify_account: ''
							}
						],
						user_id: this.$store.state.admin.userInfo.id,
						theme_id: this.$store.state.admin.themeInfo.id
					}
				}
				this.layerTitle = '编辑首页'
				this.operation = 'edit'
				this.dialogVisible = true
				this.loading.close()
			})
		},

		/**
		 * 添加一条链接
		 */
		addLink(){
			this.resourcesForm.links.push({
				url: '',
				origin: 'Tableau',
				verify: 0,
				verify_account: ''
			})
		},

		changeVerifyStatus(value, index){
			if(value == 0){
				this.accountForm = {
					account: '',
					password: ''
				}
				this.innerVisible = true
				this.selectIndex = index
			}
		},
		/**
		 * 验证账号是否正确
		 */
		verifyAccount(){
			if(this.accountForm.password == '123'){
				accountApi.save({
					account: this.accountForm.account,
					password: this.accountForm.password,
					theme_id: this.$store.state.admin.themeInfo.id,
					admin_id: this.$store.state.admin.userInfo.id
				}).then(() => {
					accountApi.list({
						theme_id: this.$store.state.admin.themeInfo.id
					}).then(res => {
						this.accountList = res.data
					})
				})
				this.resourcesForm.links[this.selectIndex].verify_account = this.accountForm.account
				this.innerVisible = false
			}
		}
	}
}
</script>

<style lang="scss">
.tips{
	background-color: rgb(198, 226, 255);
	line-height: 50px;
}
.tree-head{
	height: 40px;
	border-bottom: 1px solid #eee;
	margin-bottom: 10px;
}
.row{
	width: 100%;
	.title{
		display: inline-block;
		width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.title_0{
		width: 192px;
		text-align: center;
	}
	.title_1{
		margin-right: 48px;
	}
	.title_2{
		margin-right: 24px;
	}
	.grid{
		display: inline-block;
		width: 100px;
		text-align: center;
	}
	.btn-group{
		display: inline-block;
		width: 250px;
		text-align: right;
		margin-left: 20px;
	}
}
.el-tree-node__content{
	height: 40px;
	border-bottom: 1px dotted #eee;
}
.home{
	padding-bottom: 5px;
	border-bottom: 1px solid #eee;
}
</style>