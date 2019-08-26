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
					<span class="btn-group">
						<el-button
							type="success"
							size="mini"
							@click="() => createResources({type: 0, id: 0})">
							创建一级菜单
						</el-button>
					</span>
				</div>
				<el-tree
					:data="resourcesList"
					node-key="id"
					default-expand-all
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
								:value="data.status == 1" 
								active-color="#13ce66"
								inactive-color="#ff4949">
							</el-switch>
						</span>
						<span class="grid">
							<el-switch
								:value="data.public == 1" 
								active-color="#13ce66"
								inactive-color="#ff4949">
							</el-switch>
						</span>
						<span class="btn-group">
							<el-button
								v-if="data.type != 3"
								type="success"
								size="mini"
								@click="() => createResources(data)">
								<template v-if="data.type == 1">创建二级菜单</template>
								<template v-else-if="data.type == 2">创建三级菜单</template>
							</el-button>
							<el-button
								type="primary"
								size="mini"
								@click="() => editResources(data)">
								编辑
							</el-button>
							<el-button
								type="warning"
								size="mini"
								@click="() => deleteResources(data.id)">
								删除
							</el-button>
						</span>
					</span>
				</el-tree>
			</div>

			<el-dialog
				:title="layerTitle"
				:visible.sync="dialogVisible"
				width="80%"
				:before-close="handleClose">
				<el-form :model="resourcesForm" :rules="rules" ref="resourcesForm" label-width="100px" class="form demo-ruleForm">
					<el-form-item label="菜单标题" prop="menu_title">
						<el-col :span="12">
							<el-input type="text" v-model="resourcesForm.menu_title" placeholder="请输入菜单标题" maxlength="8" show-word-limit></el-input>
						</el-col>
					</el-form-item>
					<el-form-item label="打开方式" prop="open_type">
						<el-select v-model="resourcesForm.open_type" placeholder="请选择打开方式" :disabled="resourcesForm.type!=3">
							<el-option label="当前窗口" :value="0"></el-option>
							<el-option label="新窗口" :value="1"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="链接地址" prop="url">
						<el-input placeholder="请输入地址" v-model="resourcesForm.url" :disabled="resourcesForm.type != 3">
							<template slot="prepend">Http://</template>
							<el-select v-model="resourcesForm.origin" slot="append" placeholder="请选择">
								<el-option label="Tableau" value="Tableau"></el-option>
								<el-option label="其他系统" value="其他系统"></el-option>
							</el-select>
						</el-input>
					</el-form-item>
					<el-form-item label="备用地址">
						<el-input placeholder="请输入备用地址（选填）" v-model="resourcesForm.back_url" :disabled="resourcesForm.type!=3">
							<template slot="prepend">Http://</template>
							<el-select v-model="resourcesForm.back_origin" slot="append" placeholder="请选择">
								<el-option label="Tableau" value="Tableau"></el-option>
								<el-option label="其他系统" value="其他系统"></el-option>
							</el-select>
						</el-input>
					</el-form-item>
					<el-form-item label="公开">
						<el-switch
							v-model="resourcesForm.public"
							active-color="#13ce66"
							inactive-color="#ff4949">
						</el-switch>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitForm('resourcesForm')">保存</el-button>
						<el-button @click="resetForm('resourcesForm')">重置</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>


		</el-main>
		<el-footer height="50px">

		</el-footer>
	</el-container>
</template>

<script>
import * as api from '@/api/resources'
import { Promise } from 'q';

export default {
	name: 'Configuration',
	data(){
		return{
			dialogVisible: false,
			layerTitle: '编辑菜单',
			resourcesList: [],
			resourcesForm: {
				type: 0,				//一级标题/二级标题/三级标题
				menu_title: '',			
				open_type: 0,			//当前窗口/新窗口
				url: '',
				origin: 'Tableau',
				back_url: '',
				back_origin: 'Tableau',
				public: 0,				//是否公开
				pid: 0
			},
			rules: {
				menu_title: [
					{ required: true, message: '请输入菜单标题', trigger: 'blur' },
					{ min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
				],
				open_type: [
					{ required: true, message: '请选择打开方式', trigger: 'change' }
				]
			}
		}
	},

	mounted(){
		this.render()
	},

	methods: {

		render(){
			return new Promise(resolve => {
				api.getResourcesTree({
					theme_id: this.$store.state.user.themeInfo.id
				}).then(list => {
					this.resourcesList = list.data
					resolve()
				})
			})
		},

		submitForm(formName) {
			this.loading = this.$loading({
				lock: true,
				text: 'Loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			this.$refs[formName].validate((valid) => {
				if (valid) {
					//创建
					if(this.operation == 'create'){
						var data = {
							...this.resourcesForm,
							public: this.resourcesForm.public ? 1 : 0,
							user_id: this.$store.state.user.userInfo.id,
							theme_id: this.$store.state.user.themeInfo.id
						}
						api.addResources(data).then(res => {
							this.dialogVisible = false
							//创建成功后刷新
							this.render().then(() => {
								this.$message({
									message: '菜单创建成功',
									type: 'success'
								})
								this.loading.close()
							})
						})
					//更新
					}else if(this.operation == 'edit'){
						api.editResources(this.resourcesForm).then(res => {
							this.dialogVisible = false
							//更新成功后刷新
							this.render().then(() => {
								this.$message({
									message: '菜单更新成功',
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
						message: '菜单创建失败',
						type: 'warning'
					})
					return false
				}
			})
		},
		/**
		 * 重置表单
		 */
		resetForm(formName) {
			this.$refs[formName].resetFields()
		},
		/**
		 * 创建菜单
		 */
		createResources(data){
			this.resourcesForm = {
				type: data.type + 1,
				menu_title: '',			
				open_type: 0,
				url: '',
				origin: 'Tableau',
				back_url: '',
				back_origin: 'Tableau',
				public: 0,
				pid: data.id
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
		deleteResources(id){
			this.loading = this.$loading({ lock: true })
			api.deleteResources({ id }).then(res => {
				//删除成功后刷新
				this.render().then(() => {
					this.$message({
						message: '菜单删除成功',
						type: 'success'
					})
					this.loading.close()
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
		}
	}
}
</script>

<style lang="scss">
.tips{
	background-color: rgb(198, 226, 255);
	line-height: 50px;
}
.form{

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
		text-align: center;
		margin-left: 20px;
	}
}
.el-tree-node__content{
	height: 40px;
	border-bottom: 1px dotted #eee;
}
</style>