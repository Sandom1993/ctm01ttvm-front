import deepmerge from 'deepmerge';
import empty from '@hui-pro/empty/lang/en_US';
import errorDialog from '@hui-pro/error-dialog/lang/en_US';
import locale from '@hui-pro/locale/lang/en_US';
const h = deepmerge.all([{}, empty, errorDialog, locale]);
export default h;
