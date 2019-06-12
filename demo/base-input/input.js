const provinceList = ['北京市','天津市','上海市','重庆市','河北省','山西省','辽宁省','吉林省','黑龙江省','江苏省','浙江省','安徽省','福建省','江西省','山东省','河南省','湖北省','湖南省','广东省','海南省','四川省','贵州省','云南省','陕西省','甘肃省','青海省','台湾省','内蒙古自治区','广西壮族自治区','西藏自治区','宁夏回族自治区','新疆维吾尔自治区','香港特别行政区','澳门特别行政区'];
    let vueDemos = new Vue({
        el: '#demos',
        data: {
            provinceList1: {
                list: provinceList,
            },
            province1: '',
            provinceList2: {
                list: provinceList,
                // 支持参数多选
                multiple: true
            },
            province2: '',
            provinceList3: {
                list: provinceList,
                multiple: true,
                value: ['河南省', '错误值']
            },
            province3: ''
        },
        methods: {
            // 跟智能输入框同步选中的业务
            collectProvince1(data) {
                this.province1 = data;
            },
            collectProvince2(data) {
                this.province2 = data;
            },
            collectProvince3(data) {
                this.province3 = data;
            }
        }
    });
