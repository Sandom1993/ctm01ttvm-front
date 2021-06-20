import deepmerge from 'deepmerge';
import empty from '@hui-pro/empty/lang/zh_CN';
import errorDialog from '@hui-pro/error-dialog/lang/zh_CN';
import locale from '@hui-pro/locale/lang/zh_CN';
const h = deepmerge.all([{}, empty, errorDialog, locale]);
export default h;
