import request from '@/utils/request'

// 查询商品分类列表
export function listPmsProductCategory(query) {
  return request({
    url: '/pms/category/list',
    method: 'post',
    data:query
  })
}

// 查询商品分类详细
export function getPmsProductCategory(id) {
  return request({
    url: '/pms/category/' + id,
    method: 'get'
  })
}

// 新增商品分类
export function addPmsProductCategory(data) {
  return request({
    url: '/pms/category/add',
    method: 'post',
    data: data
  })
}

// 修改商品分类
export function updatePmsProductCategory(data) {
  return request({
    url: '/pms/category/update',
    method: 'put',
    data: data
  })
}

// 删除商品分类
export function delPmsProductCategory(id) {
  return request({
    url: '/pms/category/' + id,
    method: 'delete'
  })
}
