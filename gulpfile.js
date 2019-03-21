/* = Gulp组件
-------------------------------------------------------------- */
    // 引入gulp
    let gulp                = require('gulp'),                      // 基础库
        sass                = require('gulp-sass'),                 // CSS预处理/Sass编译
        autoprefixer        = require('gulp-autoprefixer'),         // 自动添加css浏览器前缀
        uglify              = require('gulp-uglify'),               // JS文件压缩
        imagemin 			= require('gulp-imagemin'),             // 图片压缩
        pngquant 			= require('imagemin-pngquant'),         // 深度压缩
        connect             = require('gulp-connect'),              // 本地服务器
        sourcemaps          = require('gulp-sourcemaps'),			// 来源地图
        changed             = require('gulp-changed'),				// 只操作有过修改的文件
        fileinclude         = require('gulp-file-include'),			// 文件引入
        rename 				= require('gulp-rename'),				// 文件重命名
        gutil               = require('gulp-util'),                 // gulp工具箱（包含了很多 task 会使用到的工具）
        babel               = require('gulp-babel'),                // ES6转换
        base64              = require('gulp-base64'),               // 图片转 base64
        postcss             = require('gulp-postcss'),              // 样式转换插件
        pxtoviewport        = require('postcss-px-to-viewport'),    // PX 转 Viewport
        del                 = require('del');                       // 文件清理

    // 引入配置文件
    let config = require('./gulp.config');

    sass.compiler = require('node-sass');

/* = 配置切换( Config Witch )
-------------------------------------------------------------- */
    if ( gutil.env.test === true ) {
        config.isDev = false;
        config.sourceMap = false;
        config.sassStyle = 'compressed';
        config.pathsDev = config.pathsTest;
    }
    if ( gutil.env.build === true ) {
        config.isDev = false;
        config.sourceMap = false;
        config.sassStyle = 'compressed';
        config.pathsDev = config.pathsBuild;
    }

/* = 开发环境( Ddevelop Task )
-------------------------------------------------------------- */
    // HTML处理
    gulp.task('html', () => {
        return gulp.src( config.paths.html+'/**/!(m_)*.html' )
            .pipe( config.isDev ? changed( config.pathsDev.html ) : gutil.noop() )
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(gulp.dest( config.pathsDev.html ))
            .pipe(connect.reload())
    });

    // 样式处理
    gulp.task('sass', () => {
        let processors = [
            pxtoviewport({
                viewportWidth: 750,
                viewportUnit: 'vmin'
            })
        ];
        return gulp.src(config.paths.css+'/*.scss')
            .pipe(config.isDev ? sourcemaps.init() : gutil.noop())
            .pipe(sass({outputStyle: config.sassStyle}).on('error', sass.logError))
            .pipe(config.pxToViewport ? postcss(processors) : gutil.noop())
            .pipe(autoprefixer(config.autoprefixerConfig))
            .pipe(base64(config.base64Config))
            .pipe(config.sourceMap ? sourcemaps.write('maps') : gutil.noop())
            .pipe(gulp.dest(config.pathsDev.css))
            .pipe(connect.reload())
    });

    // 图片压缩
    gulp.task('images', () => {
        return gulp.src( [config.paths.image+'/**/*','!'+config.paths.image+'/sprite/*'] )
            .pipe( config.isDev ? changed( config.pathsDev.html ) : gutil.noop() )
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(gulp.dest( config.pathsDev.image ))
            .pipe(connect.reload())
    });

    // JS 文件压缩&重命名
    gulp.task('script', () => {
        return gulp.src([config.paths.script+'/*.js'])
            .pipe(config.isDev ? sourcemaps.init() : gutil.noop())
            .pipe(changed( config.pathsDev.script ))
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(config.sourceMap ? sourcemaps.write('maps') : gutil.noop())
            .pipe(gulp.dest( config.pathsDev.script ))
            .pipe(connect.reload())
    });

    // 本地服务器
    gulp.task('connect', () => {
        connect.server({
            name: '当前为：' + (config.isDev ? '开发环境' : '生产环境'),
            root: config.pathsDev.html,
            // host: '192.168.154.97',
            port: 8000,
            livereload: true
        });
    });

    // 拷贝CSS
    gulp.task('copycss', () => {
        return gulp.src( [config.paths.html+'/lib/*.css'] )
            .pipe(gulp.dest( config.pathsDev.css ));
    });

    // 拷贝JS
    gulp.task('copyjs', () => {
        return gulp.src( [config.paths.html+'/lib/*.js'] )
            .pipe(gulp.dest( config.pathsDev.script ));
    });

    // 监听任务
    gulp.task('watch', () => {
        gulp.watch(config.paths.html+'/**/*.html',gulp.series('html'));
        gulp.watch(config.paths.css+'/*.scss',gulp.series('sass'));
        gulp.watch(config.paths.image+'/**/*',gulp.series('images'));
        gulp.watch(config.paths.script+'/*.js',gulp.series('script'));

        gulp.watch(config.paths.html+'/lib/*.css',gulp.series('copycss'));
        gulp.watch(config.paths.html+'/lib/*.js',gulp.series('copyjs'));
    });

    // 清理环境
    gulp.task('clean', () => {
		return del([config.pathsDev.html+'/**']).then(paths => {
			console.log('项目初始化清理完成...');
		});
    });

    // 默认任务
    gulp.task('default',gulp.series(gulp.parallel('connect','watch')));

    // 初始化任务
    gulp.task('init', gulp.series('clean', 'html', 'sass', 'images', 'script', 'copycss','copyjs', () => {
        console.log('项目初始化构建完成...');
    }));