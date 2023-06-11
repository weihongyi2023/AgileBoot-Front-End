<template>
  <div class="add-product-wrapper">
    <el-form label-width="108px" ref="pmsProductRef" :model="form" :rules="rules">
      <el-card style="margin: 20px 20px; font-size: 14px">
        <div slot="header">
          <span>基本信息</span>
        </div>
        <el-row>
          <el-col :span="8">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品编码" prop="outProductId">
              <el-input v-model="form.outProductId" placeholder="请输入商品编码"></el-input>
            </el-form-item>
          </el-col>
            <el-col :span="8">
                <el-form-item label="排序" prop="sort">
                    <el-input v-model="form.sort" placeholder="请输入排序"></el-input>
                </el-form-item>
            </el-col>
        </el-row>
          <el-row>
              <el-col :span="8">
                  <el-form-item label="价格" prop="price">
                      <el-input v-model="form.price" placeholder="请输入PRICE"></el-input>
                  </el-form-item>
              </el-col>
              <el-col :span="8">
                  <el-form-item label="单位" prop="unit">
                      <el-input v-model="form.unit" placeholder="请输入单位"></el-input>
                  </el-form-item>
              </el-col>
              <el-col :span="8">
                  <el-form-item label="商品重量" prop="weight">
                      <el-input v-model="form.weight" placeholder="商品重量，默认为克"></el-input>
                  </el-form-item>
              </el-col>
          </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="品牌" prop="brandId">
              <brand-select v-model="form.brandId" @change="onBrandChange"></brand-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="categoryId">
              <product-category-select v-model="form.categoryId" @change="categoryChange"></product-category-select>
            </el-form-item>
          </el-col>
            <el-col :span="8">
                <el-form-item label="上架状态">
                    <el-select v-model="queryParams.publishStatus" placeholder="上架状态">
                        <el-option v-for="dict in pms_publish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
      </el-card>

      <el-card style="margin: 20px 20px; font-size: 14px">
        <div slot="header">
          <span>产品图片</span>
        </div>
        <el-form-item label="主图" prop="pic">
            <image-upload v-model="form.pic" :limit="1"/>
        </el-form-item>
        <el-form-item label="轮播图" prop="albumPics">
            <image-upload v-model="form.albumPics" :limit="5"/>
        </el-form-item>
      </el-card>

      <el-card style="margin: 20px 20px; font-size: 14px">
        <div slot="header">
          <span>产品规格</span>
        </div>
        <el-form-item label="规格类型">
          <div class="sku-wrapper">
            <div class="sku_sorts">
              <div class="sku_sort" v-for="(s, idx0) in productAttr" :key="s.name">
                <div class="label flex-center">
                  <div class="flex-one">
                      <el-select v-model="s.name" clearable>
                          <el-option v-for="item in s.name" :key="item.value" :label="item.label" :value="item.value" />
                      </el-select>
                  </div>

                </div>
                <div class="values" v-if="s.name">
                  <div class="value" v-for="(it2, idx1) in s.options" :key="idx1">
                    <el-input :value="it2.name" @input="changeName(s, idx1, $event)" placeholder="请输入规格名称"></el-input>
                      <a class="red no-break ml8" v-if="idx1 < s.options.length - 1 || (s.options.length === maxOptionNum &amp;&amp; idx1 === 3)" @click="deleteOption(s, idx1)">✕</a>
                  </div>
                </div>
              </div>
            </div>
            <el-button v-if="productAttr.length < 2" @click="addSkuSort">+添加规格类型</el-button>
          </div>
        </el-form-item>
        <el-form-item label="规格信息">
          <el-button @click="refreshSku()" class="mb20">刷新列表</el-button>
          <el-table :data="form.skuList" :max-height="400">
            <el-table-column v-for="s in skuAttr" :label="s.name" :key="s.name" :prop="s.name"></el-table-column>
            <el-table-column label="展示图片">
              <template #default="scope">
                  <image-upload v-model="scope.row.pic" :limit="1" :is-show-tip="false"/>
              </template>
            </el-table-column>
            <el-table-column label="销售价格" >
              <template v-slot="{ row,$index }">
                <el-form-item
                  :rules="{ required: true, message: '请填写价格', trigger: 'blur' }"
                  :prop="'skuList['+$index+'].price'">
                  <el-input v-model="row.price"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="编码">
              <template v-slot="{ row }">
                <el-form-item>
                  <el-input v-model="row.outSkuId"></el-input>
                  <el-input v-model="row.spData" v-show="false"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-card>
      <el-card style="margin: 20px 20px; font-size: 14px">
        <div slot="header">
          <span>详情页</span>
        </div>
        <el-form-item label="移动端" prop="detailMobileHtml">
          <Editor v-model="form.detailMobileHtml" placeholder="请输入内容" type="url"></Editor>
        </el-form-item>
        <el-form-item label="PC端" prop="detailHtml">
          <Editor v-model="form.detailHtml" placeholder="请输入内容" type=""></Editor>
        </el-form-item>

      </el-card>

      <div class="tc">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import * as productApi from "@/api/pms/product";
import {reactive, toRefs} from "vue";

import BrandSelect from "@/views/components/BrandSelect.vue";
import ProductCategorySelect from "@/views/components/ProductCategorySelect.vue";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { pms_publish_status } = proxy.useDict('pms_publish_status');

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
        name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
    },
    skuAttr:[],
    albumPics:null,
    productAttr: [
        {
            name: '颜色',
            options: [
                {name: '红'},
                {name: null}
            ]
        }
    ],
    maxOptionNum: 44
});

let { queryParams, form, rules ,productAttr,albumPics,skuAttr} = toRefs(data);

//生命周期钩子函数 在Vue 3 中取消了 beforeCreate 和 created 两个钩子函数，转而使用setup函数
function queryList(){
    const {id} = proxy.$route.query
    if (id) {
        getInfo(id);
    }else{
        form.sort=1000
        form.publishStatus=0
    }
}
// 执行函数
queryList();


/** 查询商品信息列表 */
function refreshSku() {
    let skus = [];
    let skuMap = new Map()
    skuAttr=[...productAttr]
    if(form.skuList){
       form.skuList.forEach(sku=>{
            skuMap.set(sku.spData,sku)
        })
    }
    this.productAttr.forEach((attr, index) => {
        const attrSku = [];
        attr.options.forEach((option) => {
            if (!option.name) {
                return
            }
            if (index === 0) {
                attrSku.push({[attr.name]: option.name});
            } else {
                skus.forEach(it3 => {
                    attrSku.push({...it3, [attr.name]: option.name })
                })
            }
        })
        skus = attrSku;
    })
    skus.forEach(it => {
        if(it){
            it.spData=JSON.stringify(it)
        }
    })
    skus.forEach(it => {
        let sku = skuMap.get(it.spData);
        if(sku){
            it.outSkuId = sku.outSkuId;
            it.price = sku.price;
            it.pic = sku.pic;
        }else{
            it.outSkuId = null;
            it.price = null;
            it.pic = null;
        }

    })
    form.productAttr = JSON.stringify(productAttr)
    form.skuList= skus
}

function getInfo(id) {
    productApi.getPmsProduct(id).then(response => {
        let {albumPics } = response
        if (albumPics) {
            this.albumPics = albumPics.split(',')
        }
       form = response;
        if(form.productAttr){
            productAttr =JSON.parse(form.productAttr)
        }
        refreshSku()
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["form"].validate(valid => {
        if (valid) {
            if(albumPics){
               form.albumPics = albumPics.toString()
            }
            if(form.categoryId && Array.isArray(form.categoryId)){
                form.categoryId = form.categoryId.pop()
            }
            if (form.id != null) {
                productApi.updatePmsProduct(form).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                });
            } else {
                productApi.addPmsProduct(form).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                });
            }
           cancel();
        }else{
            if(form.name){
                proxy.$alert('请填写规格价格', '提示', {
                    confirmButtonText: '确定',
                });
            }else{
                proxy.$alert('请填写商品名称', '提示', {
                    confirmButtonText: '确定',
                });
            }
        }
    });
}

/** 取消按钮 */
function cancel() {
    proxy.$tab.closeOpenPage({ path: '/pms/product' })
}

</script>

<style lang="stylus">
.add-product-wrapper
  padding 12px
  .content
    margin 0 auto
    width 75%
    min-width 800px
  .sku-wrapper
    background-color #f7f8fa
    padding 12px
    .sku_sorts
      .sku_sort
        background-color white
        margin-bottom 12px
        .label
          padding 8px
        .values
          padding 8px 0 0 8px
          border-top 1px solid $border-color
          display flex
          flex-wrap wrap
          .value
            padding 0 32px 8px 0
            width 200px!important
            display flex
            align-items center
  .img-upload-mini .el-upload--picture-card
    width: 48px;
    height: 48px;
    line-height: 57px;
</style>
