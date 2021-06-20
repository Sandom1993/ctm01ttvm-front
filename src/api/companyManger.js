import http from '@/core/httpInstance';

export default {
  getVehicleTree: (data) => http.post({url: 'tree/getVehicleTree', data}),
addCompany: (data) => http.post({url: 'company/addCompany', data}),
  updateCompany: (data) => http.post({url: 'company/updateCompany', data}),
  deleteCompanys: (data) => http.post({url: 'company/deleteCompanys', data}),
  findCompanyPage: (data) => http.post({url: 'company/findCompanyPage', data}),
  findByIndexCode: (data) => http.post({url: 'company/findByIndexCode', data}),
  findImgByCompanyIndexCode: (data) => http.post({url: 'company/findImgByCompanyIndexCode', data})
}
//
// export function findCompanyPage(param) {
//   return http.post({
//     url: '/company/findCompanyPage',
//     data: param
//   });
// }
//
// export function addCompany(param) {
//   return http.upload({
//     url: '/company/addCompany',
//     data: param
//   });
// }
//
// export function updateCompany(param) {
//   return http.post({
//     url: 'company/updateCompany',
//     data: param
//   });
// }
//
// export function deleteCompanys(param) {
//   return http.post({
//     url: 'company/deleteCompanys',
//     data: param
//   });
// }
//
// export function findByIndexCode(param) {
//   return http.post({
//     url: 'company/findByIndexCode',
//     data: param
//   });

