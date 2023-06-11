import request from '@/utils/request'

// 查询品牌管理列表
export function listPmsBrand(query) {
  return request({
    url: '/pms/brand/list',
    method: 'post',
    data:query
  })
}

// 查询品牌管理详细
export function getPmsBrand(id) {
  return request({
    url: '/pms/brand/' + id,
    method: 'get'
  })
}

// 新增品牌管理
export function addPmsBrand(data) {
  return request({
    url: '/pms/brand/add',
    method: 'post',
    data
  })
}

// 修改品牌管理
export function updatePmsBrand(data) {
  return request({
    url: '/pms/brand/update',
    method: 'put',
    data
  })
}

// 删除品牌管理
export function delPmsBrand(id) {
  return request({
    url: '/pms/brand/' + id,
    method: 'delete'
  })
}

export function allBrand(query) {
  return request({
    url: '/pms/brand/all',
    method: 'post',
    data: query
  })
}
