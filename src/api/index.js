import http from '@/core/httpInstance';

function getUserInfo() {
  return http.get({
    url: '/getUserInfo',
    successNotify: true,
    errorTitle: 'hello.title'
  });
}
export { getUserInfo };
