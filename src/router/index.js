import Vue from 'vue';
import Router from 'vue-router';
import routes from './router.config.js';

Vue.use(Router);

const createRoute = routes => {
  return routes.reduce((processedRoutes, currentRoute) => {
    processedRoutes.push(processRouteObj(currentRoute));
    return processedRoutes;
  }, []);
};

const processRouteObj = ({ children, component, ...args }) => {
  return Object.assign(
    {
      component: () =>
        import(/* webpackInclude: /\.(js|vue)$/ */ `@/pages/${component}`),
      children: children ? createRoute(children) : []
    },
    args
  );
};
const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: createRoute(routes)
});

router.beforeEach(async (to, form, next) => {
  // 防止死循环跳出
  if (to.path.indexOf('error') > -1) {
    next();
    return;
  }
  next();
});

export default router;
