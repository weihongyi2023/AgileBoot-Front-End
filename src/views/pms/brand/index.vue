<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px" size="medium" class="ry_form">
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
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item class="flex_one tr">
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
          <el-button
                  type="danger"
                  plain
                  icon="Delete"
                  :disabled="multiple"
                  @click="handleDelete"
                  v-hasPermission="['pms:brand:remove']"
          >删除</el-button>
      </el-col>

    </el-row>

    <el-table v-loading="loading" :data="pmsBrandList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品牌logo" align="center" prop="logo">
          <template #default="scope">
              <image-preview :src="scope.row.logo" :width="50" :height="50"/>
          </template>

      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="showStatus">
          <template #default="scope">
              <dict-tag :options="sys_status" :value="scope.row.showStatus" />
          </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改品牌管理对话框 -->
    <el-dialog :title="title" v-model="open" width="50%" append-to-body>
      <el-form ref="brandRef" :model="form" :rules="rules" label-width="108px" inline class="dialog-form-one">
        <el-form-item label="状态">
            <el-radio-group v-model="form.showStatus">
                <el-radio v-for="dict in sys_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="logo" prop="logo">
            <image-upload v-model="form.logo" :limit="1"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// import { listPmsBrand, getPmsBrand, delPmsBrand, addPmsBrand, updatePmsBrand, exportPmsBrand } from "@/api/pms/brand";
import * as brandApi from "@/api/pms/brand";

const { proxy } = getCurrentInstance();
const { sys_status } = proxy.useDict('sys_status');

// 品牌管理表格数据
const pmsBrandList = ref([]);
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

const data = reactive({
    // 表单参数
    form: {},
    // 查询参数
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        nameLike: null,
        sort: null,
        showStatus: null,
    },
    // 表单校验
    rules: {
    },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询品牌列表 */
function getList() {
    loading.value = true;
    brandApi
        .listPmsBrand(queryParams.value)
        .then((res) => {
            pmsBrandList.value = res.rows;
            total.value = res.total;
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
        name: null,
        sort: null,
        showStatus: 0,
        logo: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
    };
    proxy.resetForm('brandRef');
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
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
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    title.value = '添加品牌管理';
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    const id = row.id;
    brandApi.getPmsBrand(id).then((response) => {
        form.value = response;
        open.value = true;
        title.value = '修改品牌管理';
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs.brandRef.validate((valid) => {
        if (valid) {
            if (form.value.id != null) {
                brandApi.updatePmsBrand(form.value).then((response) => {
                    proxy.$modal.msgSuccess('修改成功');
                    open.value = false;
                    getList();
                });
            } else {
                brandApi.addPmsBrand(form.value).then((response) => {
                    proxy.$modal.msgSuccess('新增成功');
                    open.value = false;
                    getList();
                });
            }
        }
    });
}

/** 删除按钮操作 */
function handleDelete(row) {
    const deleteIds = row.id || ids.value;
    proxy.$modal
        .confirm(`是否确认删除品牌管理编号为"${deleteIds}"的数据项？`)
        .then(() => brandApi.delPmsBrand(deleteIds))
        .then(() => {
            getList();
            proxy.$modal.msgSuccess('删除成功');
        })
        .catch(() => {});
}

getList();
</script>
