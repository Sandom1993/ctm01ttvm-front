import ErrorPage from './src';

ErrorPage.install = function(Vue) {
  Vue.component(ErrorPage.name, ErrorPage);
};

export default ErrorPage;
