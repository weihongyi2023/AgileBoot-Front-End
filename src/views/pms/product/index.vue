<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px" size="medium" class="ry_form">
            <el-form-item label="上架状态" prop="publishStatus">
                <el-select v-model="queryParams.publishStatus" placeholder="状态" clearable>
                    <el-option v-for="dict in pms_publish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="名称" prop="name">
                <el-input
                        v-model="queryParams.nameLike"
                        placeholder="请输入商品名称"
                        clearable
                        size="small"
                        @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="品牌" prop="brandName">
                <el-input
                        v-model="queryParams.brandNameLike"
                        placeholder="请输入品牌名称"
                        clearable
                        size="small"
                        @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="分类" prop="productCategoryName">
                <el-input
                        v-model="queryParams.productCategoryNameLike"
                        placeholder="请输入分类名称"
                        clearable
                        size="small"
                        @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="编码" prop="outProductId">
                <el-input
                        v-model="queryParams.outProductId"
                        placeholder="请输入商品编码"
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

        <el-table v-loading="loading" :data="pmsProductList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="主图" align="center" prop="pic">
                <template #default="scope">
                    <image-preview :src="scope.row.pic" :preview-src-list="[scope.row.pic]" :width="50" :height="50"/>
                </template>
            </el-table-column>
            <el-table-column label="名称/编码" min-width="200" align="center" prop="outProductId">
                <template #default="scope">
                    <div>名称：{{scope.row.name}}</div>
                    <div v-if="scope.row.outProductId">编码：{{scope.row.outProductId}}</div>
                </template>
            </el-table-column>
            <el-table-column label="品牌/分类" align="center" prop="brandName">
                <template #default="scope">
                    <div v-if="scope.row.brandName">品牌：{{scope.row.brandName}}</div>
                    <div v-if="scope.row.productCategoryName">分类：{{scope.row.productCategoryName}}</div>
                </template>
            </el-table-column>
            <el-table-column label="价格/排序" align="center" prop="price">
                <template #default="scope">
                    <div v-if="scope.row.price">价格：{{scope.row.price}}</div>
                    <div v-if="scope.row.sort">排序：{{scope.row.sort}}</div>
                </template>
            </el-table-column>
            <el-table-column label="上架状态" align="center" prop="publishStatus">
                <template #default="scope">
                    <dict-tag :options="pms_publish_status" :value="scope.row.publishStatus" />
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
    </div>
</template>

<script setup>
    import * as productApi from "@/api/pms/product";
    import {toRefs} from "vue";
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const { pms_publish_status } = proxy.useDict('pms_publish_status');

    // 商品信息表格数据
    const pmsProductList = ref([]);
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
            brandId: null,
            categoryId: null,
            outProductId: null,
            name: null,
            pic: null,
            albumPics: null,
            publishStatus: null,
            sort: null,
            price: null,
            unit: null,
            weight: null,
            detailHtml: null,
            detailMobileHtml: null,
            brandName: null,
            productCategoryName: null,
        },
        // 表单校验
        rules: {
        },
    });

    const { queryParams, form, rules } = toRefs(data);

    /** 查询商品信息列表 */
    function getList() {
        loading.value = true;
        productApi
            .listPmsProduct(queryParams.value)
            .then((res) => {
                pmsProductList.value = res.rows;
                total.value = res.total;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    /** 重置按钮操作 */
    function resetQuery() {
        proxy.resetForm('queryForm');
        handleQuery();
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        queryParams.value.pageNum = 1;
        getList();
    }

    /** 多选框选中数据 */
    function handleSelectionChange(selection) {
        ids.value = selection.map((item) => item.id);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }

    /** 新增按钮操作 */
    function handleAdd() {
        router.push(`/pms/product/index/edit`);
    }

    /** 修改按钮操作 */
    function handleUpdate(row) {
        router.push({ path: '/pms/product/edit', query: { id: row.id } });
    }

    /** 删除按钮操作 */
    function handleDelete(row) {
        const deleteIds = row.id || ids.value;
        proxy.$modal
            .confirm(`是否确认删除商品信息编号为"${deleteIds}"的数据项？`)
            .then(() => productApi.delPmsProduct(deleteIds))
            .then(() => {
                getList();
                proxy.$modal.msgSuccess('删除成功');
            })
            .catch(() => {});
    }
    getList();
</script>
