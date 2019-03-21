// API 配置
const api = {
    // 基础：短信发送模块
    sms_send: '/api/sms/send',
    // 基础：发送手机验证码
    roter_validCode: '/api/send_mobile_code',
    // 注册：获取微信用户授权登陆
    roter_login: '/api/login',
    // 注册：老用户登录绑定
    router_login: '/api/login_register',
    // 注册：用户注册绑定
    router_register: '/api/register',
    // 活动：活动列表
    activity_list: '/api/frontward/show/activeList',
    // 活动：活动详情
    activity_detail: '/api/frontward/show/activeDetail',
    // 活动：活动报名
    activity_enroll: '/api/frontward/show/activeEnroll',
    // 活动：城市列表
    activity_city_list: '/api/frontward/show/areasList',
    // 活动：活动报名成功
    activity_enroll_detail: '/api/frontward/show/activeEnrollDetail',
    // 用户：获取用户信息
    user_info: '/api/get_user_info',
    // 用户：修改会员信息
    user_change_info: '/api/change_user_info',
    // 用户：获取用户信息
    user_change_change: '/api/change_mobile',
    // 用户：咨询预约记录
    user_consult_list: '/api/frontward/show/crmCustomerDoingProjectList',
    // 产品：产品列表
    product_list: '/api/frontward/show/projectsList',
    // 产品：国家列表
    product_country: '/api/frontward/show/countryList',
    // 产品：标签列表
    product_types: '/api/frontward/show/projectTypes',
    // 咨询：咨询预约
    consult_bespeak: '/api/frontward/show/bespeakCustomer',
    // 签约：确定签约接口
    order_create: '/api/createOrder',
    // 签约：签约详情接口
    order_detail: '/api/getOrderDetail',
    // 获取顾问接口
    consult_info: '/api/get_consult_info',
    //----------------------------------
    api_token : "7ee97cfe4aa9a8d5e7b7dbc2f75efde6",
    //资讯标签
    articles_list: '/api/articles/parent_types',
    //获取所有资讯地区
    articles_areas: '/api/articles/areas',
    //资讯搜索
    articles_search: '/api/articles/search',
    //获取资讯详情
    articles_detail: '/api/articles/detail',
    //获取子标题
    articles_chlid:'/api/articles/chlid_types',
    //国家地区标签
    articles_tags:'/api/articles/tags'
    //----------------------------------
}

// 运行模式：dev | test | pro
let ENV = 'dev'
// 环境变量
let CONFIG = {}
// 开发环境
let CONFIG_DEV = {
    ENV: 'development',
    APP_ID: 'wx83b20df6734e3d05', // 个人
    BASE_API: 'http://city-partner-api.leapoon.com',
    BASE_URL: 'http://192.168.154.102:8000/'
}
// 测试环境
let CONFIG_TEST = {
    ENV: 'test',
    APP_ID: 'wx05280b415964d82f', // 立芃科技
    BASE_API: 'http://test-city-partner-api.wailianvisa.com',
    BASE_URL: 'http://test-city-partner.wailianvisa.com/'
}
// 生产环境
let CONFIG_PRO = {
    ENV: 'production',
    APP_ID: 'wxe579e8173e6987f5', // 移民说
    BASE_API: 'http://city-partner-api.wailianvisa.com',
    BASE_URL: 'http://city-partner.wailianvisa.com/'
}

// localStorage.setItem('token', '2419c51e336ff808f4da0d433105eae7')

// 环境判断
switch (ENV) {
    case 'dev':
        CONFIG = CONFIG_DEV
        break;
    case 'test':
        CONFIG = CONFIG_TEST
        break;
    default:
        CONFIG = CONFIG_PRO
}
// 打印模式
console.log('%c ' + CONFIG.ENV + ' ', 'background:black;color:yellow')

// 访问入口
const prodRedirectUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + CONFIG.APP_ID + '&redirect_uri=' + CONFIG.BASE_URL + 'index.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
// https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx83b20df6734e3d05&redirect_uri=http://192.168.154.102:8000/index.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect

// Axios Config
const service = axios.create({
    baseURL: CONFIG.BASE_API
});

// 处理并发
service.spread = axios.spread
service.all = axios.all

service.interceptors.response.use((res) => {
    const data = res.data;
    if (data.status_code == 0 || data.status_code == 200) {
        return data
    } else {
        return Promise.reject(data.message)
    }
}, (error) => {
    if (error.status >= 400 && error.status < 500) {
        return Promise.reject(error.data.message);
    } else {
        if (error.status == 404 || error.status == 500) {
            error.message = '服务器拒绝了请求。'
        } else {
            error.message = '系统繁忙，请稍后再试。'
        }
        return Promise.reject(error.message);
    }
});

// Validate Config
let validateRegExp = {
    email: /\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
    mobile: /^13[0-9]{9}|15[012356789][0-9]{8}|18[0256789][0-9]{8}|147[0-9]{8}$/,
    newmobile: /^1[0-9]{10}$/,
}

// base64解码
function base64Decode(input){
    let rv = window.atob(input);
    rv = escape(rv);
    rv = decodeURIComponent(rv);
    return rv;
}

// Component：ActionSheet
Vue.component('actionsheet', {
    template: `
        <transition name="fade">
            <div class="wl-actionsheet" v-if="show">
            <div class="wl-mask" @click="actionsheetOpen"></div>
                <div class="wl-actionsheet-wrap wl-actionsheet-wrap_bottom">
                    <div class="wl-actionsheet-wrap__close" @click="actionsheetOpen">
                        <i class="ui-icon ui-icon-close_gary"></i>
                    </div>
                    <div class="wl-actionsheet-wrap__hd">
                        {{title}}
                    </div>
                    <div class="wl-actionsheet-wrap__bd">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </transition>`,
    props: {
        title: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            title: this.title,
            show: false
        }
    },
    methods: {
        actionsheetOpen() {
            this.show = !this.show
        },
        actionsheetClose() {
            this.show = false
        }
    }
})

// Component：LoadMore
Vue.component('loadmore', {
    template: `
        <div class="wl-loadmore">
            <div class="wl-loadmore__line"></div>
            <div class="wl-loadmore__text">我也是有底线的</div>
            <div class="wl-loadmore__line"></div>
        </div>`,
    data() {
        return {

        }
    },
    methods: {

    }
})

// Component：NoticeBar
let NoticeBar = Vue.extend({
    template: `
        <transition name="slideOutUp">
            <div class="wl-notice-bar" v-if="closed">
                <div class="wl-notice-bar__content">
                    <p class="wl-notice-bar__title">{{title}}</p>
                    <p class="wl-notice-bar__desc" v-if="description">{{description}}</p>
                </div>
                <div class="wl-notice-bar__extra" v-if="closable">
                    <i class="ui-icon ui-icon-close" @click="onClose"></i>
                </div>
            </div>
        </transition>`,
    props: {
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        closable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            closed: true
        }
    },
    methods: {
        onClose() {
            this.closed = false
        }
    }
})
Vue.component('notice-bar', NoticeBar)

// Plugin：Toast
const Toast = {};
Toast.install = (Vue) => {
    Vue.prototype.$toast = (tips) => {
        if (document.getElementsByClassName('wl-toast').length) {
            return;
        }
        let ToastTpl = Vue.extend({
            template: `
            <div class="wl-toast">
                <div class="wl-toast__mask"></div>
                <div class="wl-toast__text">${tips}</div>
            </div>
            `
        });
        let tpl = new ToastTpl().$mount().$el;
        document.body.appendChild(tpl);
        setTimeout(() => {
            document.body.removeChild(tpl);
        }, 2500)
    }
}
Vue.use(Toast);

// Plugin：Modal
const Modal = {};
let ModalVM = null;
Modal.install = (Vue) => {
    const opt = {
        title: '',
        message: '',
        redirect: ''
    }
    Vue.prototype.$modal = (config) => {
        const options = JSON.parse(JSON.stringify(opt))
        if (typeof config === 'object') {
            for (const property in config) {
                options[property] = config[property]
            }
        } else {
            return false
        }
        
        let ModalTpl = Vue.extend({
            template: `
            <div class="wl-modal-wrap" v-show="closed">
            <div class="wl-mask wl-mask_animation"></div>
                <div class="wl-modal wl-modal_alert">
                    <div class="wl-modal__hd">${options.title}</div>
                    <div class="wl-modal__bd">${options.message}</div>
                    <div class="wl-modal__ft">
                        <button class="ui-btn ui-btn_primary wl-modal__alert" @click="onClose">确认</button>
                    </div>
                </div>
            </div>
            `,
            data () {
                return {
                    closed: true
                }
            },
            methods: {
                onClose () {
                    this.closed = false
                    document.body.removeChild(tpl);
                    if (options.redirect) {
                        window.location.href = 'product.html';
                    }
                }
            }
        });
        let tpl = new ModalTpl().$mount().$el
        document.body.appendChild(tpl)
    }
}
Vue.use(Modal);