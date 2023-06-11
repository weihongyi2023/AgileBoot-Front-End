<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
      size="medium"
      class="ry_form">
        <el-form-item label="状态" prop="showStatus">
            <el-select v-model="queryParams.showStatus" placeholder="状态" clearable>
                <el-option v-for="dict in sys_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
        </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.nameLike"
          placeholder="名称"
          clearable
          size="small"
          @click="handleQuery"
        />
      </el-form-item>

      <el-form-item class="flex_one tr">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
            <el-button
                    type="primary"
                    plain icon="Plus"
                    @click="handleAdd"
                    v-hasPermission="['pms:category:add']">新增</el-button>
        </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="pmsProductCategoryList"
      :tree-props="{ hasChildren: 'hasChildren', children: 'children' }"
      @selection-change="handleSelectionChange"
      row-key="id">
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="图片" align="center" prop="icon">
          <template #default="scope">
              <image-preview :src="scope.row.icon" :width="50" :height="50"/>
          </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="showStatus">
          <template #default="scope">
              <dict-tag :options="sys_status" :value="scope.row.showStatus" />
          </template>
      </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
                <el-button
                        link
                        type="primary"
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        v-hasPermission="['pms:category:edit']">修改</el-button>
                <el-button
                        link type="primary"
                        icon="Plus"
                        @click="handleAdd(scope.row)"
                        v-hasPermission="['pms:category:add']">新增</el-button>
                <el-button
                        v-if="scope.row.parentId != 0"
                        link
                        type="primary"
                        icon="Delete"
                        @click="handleDelete(scope.row)"
                        v-hasPermission="['pms:category:remove']">删除</el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 添加或修改商品分类对话框 -->
    <el-dialog  :title="title" v-model="open" width="500px">
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="108px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="图片" prop="icon">
            <image-upload v-model="form.icon" :limit="1"/>
        </el-form-item>
        <el-form-item label="状态">
            <el-radio-group v-model="form.showStatus">
                <el-radio v-for="dict in sys_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-input v-model="form.level" placeholder="层级" />
        </el-form-item>
        <el-col :span="24" v-if="form.parentId !== 0">
        <el-form-item label="上级分类" prop="parentId">
            <el-tree-select
                    v-model="form.parentId"
                    :data="categoryOptions"
                    :props="{ value: 'id', label: 'name', children: 'children' }"
                    node-key="id"
                    placeholder="上级分类"
                    check-strictly
                    :current-node-key="form.parentId"
            />
        </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import * as categoryApi from "@/api/pms/category";
import * as deptApi from "@/api/system/deptApi";

const { proxy } = getCurrentInstance();
const { sys_status } = proxy.useDict('sys_status');

// 商品分类表格数据
const pmsProductCategoryList = ref([]);
// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 是否显示弹出层
const open = ref(false);
// 遮罩层
const loading = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 弹出层标题
const title = ref('');
// 总条数
const total = ref(0);

const categoryOptions = ref([]);

const data = reactive({
    // 表单参数
    form: {},
    // 查询参数
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        parentId: null,
        nameLike: null,
        level: null,
        showStatus: null,
        sort: null
    },
    // 表单校验
    rules: {
    },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商品分类列表 */
function getList() {
    loading.value = true;
    categoryApi
        .listPmsProductCategory(queryParams.value)
        .then((res) => {
            pmsProductCategoryList.value = proxy.handleTree(res, 'id');
        })
        .finally(() => {
            loading.value = false;
        });
}

/** 取消按钮 */
function cancel() {
    open.value = false;
    reset();
}

/** 表单重置 */
function reset() {
    form.value = {
        id: null,
        parentId: null,
        name: null,
        level: null,
        showStatus: null,
        sort: null,
        icon: null,
    };
    proxy.resetForm('categoryRef');
}

/** 搜索按钮操作 */
function handleQuery() {
    getList();
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm('queryRef');
    handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
    ids.value = selection.map((item) => item.id);
    single.value = selection.length !== 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd(row) {
    reset();
    categoryApi.listPmsProductCategory().then((response) => {
        categoryOptions.value = proxy.handleTree(response, 'id');
    });
    if (row != undefined) {
        form.value.parentId = row.id;
    }
    open.value = true;
    title.value = '添加商品分类';
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    categoryApi.listPmsProductCategory(row.id).then((response) => {
        const categoryListExcludeItSelf = response.filter((category) => {
            return category.id !== row.id;
        });
        categoryOptions.value = proxy.handleTree(categoryListExcludeItSelf, 'id');
    });

    categoryApi.getPmsProductCategory(row.id).then((response) => {
        form.value = response;
        open.value = true;
        title.value = '修改商品分类';
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs.categoryRef.validate((valid) => {
        if (valid) {
            if (form.value.id != undefined) {
                categoryApi.updatePmsProductCategory(form.value).then((response) => {
                    proxy.$modal.msgSuccess('修改成功');
                    open.value = false;
                    getList();
                });
            } else {
                categoryApi.addPmsProductCategory(form.value).then((response) => {
                    proxy.$modal.msgSuccess('新增成功');
                    open.value = false;
                    getList();
                });
            }
        }
    })
}

/** 删除按钮操作 */
function handleDelete(row) {
    if (row.children && row.children.length > 0) {
        this.$message.error("请先删除子目录");
        return;
    }
    const deleteIds = row.id || ids.value;
    proxy.$modal
        .confirm(`是否确认删除商品分类编号为"${deleteIds}"的数据项？`)
        .then(() => categoryApi.delPmsProductCategory(deleteIds))
        .then(() => {
            getList();
            proxy.$modal.msgSuccess('删除成功');
        })
        .catch(() => {});
}
getList();
</script>
