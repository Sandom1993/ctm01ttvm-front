const env = process.env.NODE_ENV;
const isDev = env === 'development';
const page = isDev ? 'index.html' : '../templates/index.ftl';
const projectThemeEntry = './src/style/project.scss';

const main = {
    indexPath: page,
    chainWebpack: config => {
        // svg
        const svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule
            .use('babel-loader')
            .loader('babel-loader')
            .end()
            .oneOf('svg')
            .resourceQuery(/svg/)
            .use('vue-svg-loader')
            .loader('vue-svg-loader')
            .end()
            .end()
            .oneOf('sprite')
            .resourceQuery(/raw/)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
            .end()
            .oneOf('img')
            .resourceQuery(/img/)
            .use('url-loader')
            .loader('url-loader')
            .options({
                name: 'static/img/[name].[hash:8].[ext]'
            })
            .end()
            .end()
            .oneOf()
            .use('file-loader')
            .loader('file-loader')
            .options({
                name: 'static/file/[name].[ext]'
            });

        config.plugin('html').tap(args => {
            let meta = {
                _csrf: {
                    name: '_csrf',
                    content: '${_csrf.token}' // eslint-disable-line
                },
                lang: {
                    name: 'lang',
                    language: '{{ helper.lang() }}'
                },
                skin: {
                    name: 'skin',
                    skin: '{{ helper.skin() }}'
                }
            };
            if (isDev) {
                meta = '';
            }
            args[0].meta = meta;
            return args;
        });
    },
    publicPath: isDev ? '/' : process.env.VUE_APP_CONTEXT,
    assetsDir: process.env.VUE_APP_ASSETS,
    outputDir: 'dist/static/',
    runtimeCompiler: true,
    // 默认babel-loader会忽略node_modules中的文件，需要转化的在此处填写
    transpileDependencies: ['dolphin-plugin-tools', /@hui-pro/, /hui/],
    // 用于开发环境下与后端联调
    devServer: {
        proxy: {
            [`${process.env.VUE_APP_CONTEXT}/*`]: {
                // target: `http://${ip.address()}:8341`,
                // target: 'http://10.196.42.59:17001',
                // target: 'https://183.230.82.18:400', // 正式环境
                target: 'https://183.230.82.16:400', // 测试环境
                // target: 'http://10.100.2.178:17001', // yangbo
                changeOrigin: true,
                onProxyReq(proxyReq, req, res) {
                    proxyReq.setHeader(
                        'Cookie',
                        'JSESSIONID=voUllhU7r2fCBRk9X91-Nvq-iY7v0nkZ5TXWiOQS; portal_locale_cookie=zh-cn; csrfToken=WmeL5mZdDgwMGfrYZ-hQnUqs; xfronthik_sess=qTVtuX-zI-vrtVERtV0TB4aTM8z8VqlgeLNm_9XxHJgNkYa19ySi_zfGig4HSdE6; CASTGC=TGT-137-VjGJVeG3csNQ7IeHsF6gVXTlqHat3z0bYaq26ORfsokFkUBMdf-cas; portal_sess=-xfm67jk5hpif0x67k2KZdJ5Hd9wJscZ4_zB2xc4Vzy05ACZYdT2kLGIn-Wwk6g0'
                    )
                }
            },
            '/alarmupload-acs': {
                // target: 'http://10.196.42.59:17001',
                target: 'https://183.230.82.16:400',
                // target: 'https://183.230.82.18:400',
                // target: 'http://10.100.2.178:17001', // yangbo
                changeOrigin: true
            },
            '/ctm01ttvm-acs': {
                // target: 'http://10.196.42.59:17001',
                // target: 'https://183.230.82.18:400',
                target: 'https://183.230.82.16:400',
                // target: 'http://10.100.2.178:17001', // yangbo
                changeOrigin: true
            },
            '/hgis-web': {
                // target: 'http://10.196.42.59:17001',
                // target: 'https://183.230.82.18:400',
                target: 'https://183.230.82.16:400',
                // target: 'http://10.196.44.62:17001',
                // target: 'http://10.100.2.178:17001', // yangbo
                changeOrigin: true
            },
            '/hgis-services': {
                // target: 'https://10.19.155.166',
                target: 'https://183.230.82.16:400',
                // target: 'https://183.230.82.18:400',
                // target: 'http://10.196.42.59:17001',
                // target: 'http://10.100.2.178:17001', // yangbo
                changeOrigin: true
            }
        }
    },
    configureWebpack: {
        entry: isDev ? [projectThemeEntry, './src/main.js'] : './src/main.js',
        resolve: {
            alias: {
                '@var': '@agr/themes/var.scss'
            }
        }
    }
};

module.exports = main;
