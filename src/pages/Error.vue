<template>
  <error-page
    :code="$route.params.type"
    :text="errorText[$route.params.type || '404']"
  />
</template>

<script>
import { t } from '@hui-pro/locale';

export default {
  name: 'Error',
  data() {
    return {
      errorText: {
        '403': t('errorPage.error403'), // 您无权访问该页面
        '404': t('errorPage.error404'), // 您访问的页面不存在
        '500': t('errorPage.error500') // 服务器异常，请联系管理员
      }
    };
  }
};
</script>
