export default {
  computed: {
    i18nBreadcrumb() {
      if (localStorage.getItem('portal_config_crumbs')) {
        return localStorage.getItem('portal_config_crumbs').split('/');
      } else {
        return [this.$t('common.breadcrumb.systemManage')];
      }
    }
  }
};
