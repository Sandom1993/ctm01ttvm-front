<template>
  <h-page id="app" class="main-wrapper">
    <keep-alive v-if="$route.meta.keepAlive">
      <router-view />
    </keep-alive>
    <router-view v-else />
  </h-page>
</template>

<script>
import navList from './router/nav.config.js';

export default {
  name: 'App',
  computed: {
    menu() {
      navList.forEach(nav => {
        nav.title = this.$t(nav.title);
      });
      // 运行态不展示
      if (process.env.NODE_ENV !== 'development') {
        return [];
        // 开发模式菜单isApp为true全展示
      } else {
        navList.filter(nav => {
          const menuKeys = nav.menuKeys;
          if (menuKeys && menuKeys.length) {
            menuKeys.map(key => {
              if (!nav.children) nav.children = [];
              nav.children.push({
                router: `${nav.router}/${key}`,
                title: key
              });
            });
          }
        });
        return navList.filter(nav => nav.isApp);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import '~@agr/themes/var.scss';
.main-wrapper {
  height: 100%;
}
</style>
