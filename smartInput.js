// 智能输入框Vue组件
Vue.component('smart-input', {
    template: `<div class="friendSearchContainer">
        <input v-model="input" class="form-control smartInput"
            placeholder="输入文本自动检索，上下键选取，回车选中，可点选"
            data-toggle="tooltip" @click="init" @keydown="search" @blur="blur" />
        <ul v-show="searching" class="friendSearchList">
            <p v-if="!filtered.length">空数据</p>
            <li v-else v-for="(item, index) in filtered" @click.stop="clickOne">{{ item }}</li>
        </ul>
        <div v-show="searching" class="friendSearchModal" @click="searching=false"></div>
    </div>`,
    // 接收list/multiple/value参数
    props: ['props'],
    data() {
        return {
            searching: false,
            timer: null,
            filtered: {},
            input: '',
            focusIndex: 0,
            invalidData: ''
        };
    },
    computed: {
        listLength() {
            return this.filtered.length;
        },
        key() {
            return /(?:.*,)*(.*)$/.exec(this.input)[1];
        }
    },
    mounted() {
        // 支持初始化参数值
        this.input = this.props.value || '';
    },
    methods: {
        // 调整联想搜索面板的大小和位置
        init(e) {
            this.searching = true;
            this.filtered = this.props.list;
        },
        // 失去焦点时关闭面板，主要是按下tab键切换时的作用，随之带来的是所有相关的事件都要清除该定时器
        blur() {
            this.timer = setTimeout(() => {
                this.searching = false;
            }, 200);
        },
        // 在上下键索引后调整视口
        scrollViewport() {
            let ul = $(this.$el).find('ul');
            ul.find('li.hover').removeClass('hover');
            ul.find('li').eq(this.focusIndex).addClass('hover');
            $('.friendSearchList').scrollTop(this.focusIndex * 26 - 26);
        },
        // 联想搜索的主体功能函数，这里使用keydown是为了保证持续性的上下键能够保证执行
        search(e) {
            let preSearching = this.searching;
            // 非搜索状态进行点击，则呼出面板
            if (!this.searching) {
                this.searching = true;
            }
            e = e || window.event;
            // 通过上下键和回车选择
            if (e.keyCode === 38) {
                this.focusIndex = (this.focusIndex - 1 + this.listLength) % this.listLength;
                this.scrollViewport();
            } else if (e.keyCode === 40) {
                this.focusIndex = (this.focusIndex + 1 + this.listLength) % this.listLength;
                this.scrollViewport();
            } else if (e.keyCode === 13) {
                if (preSearching && this.focusIndex < this.listLength) {
                    this.selectOne();
                }
            } else {
                // 延时搜索，降低卡顿
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    // 进行可选项过滤
                    this.filtered = this.props.list.filter(item => {
                        return item.toLowerCase().includes(this.key.toLowerCase());
                    });
                    this.focusIndex = 0;
                }, 800);
            }
        },
        clickOne(e) {
            let target = $((e || event).target);
            clearTimeout(this.timer);
            e = e || window.event;
            let value = target.text();
            this.focusIndex = target.index();
            if (this.props.multiple) {
                let arr = this.input.split(',');
                let has = target.hasClass('active');
                if (has) {
                    target.removeClass('active');
                    let index = arr.indexOf(value);
                    arr.splice(index, 1);
                    this.input = arr.join(',');
                } else {
                    target.addClass('active');
                    arr.splice(arr.length - 1, 1, value);
                    this.input = arr.join(',') + ',';
                }
            } else {
                target.addClass('active').siblings('li').removeClass('active');
                this.input = value;
                this.searching = false;
            }
        },
        // 选择一个参数
        selectOne(e) {
            clearTimeout(this.timer);
            let target = $(this.$el).find('ul li').eq(this.focusIndex);
            let value = target.text();
            if (this.props.multiple) {
                let arr = this.input.split(',');
                let has = target.hasClass('active');
                if (has) {
                    target.removeClass('active');
                    let index = arr.indexOf(value);
                    arr.splice(index, 1);
                    this.input = arr.join(',');
                } else {
                    target.addClass('active');
                    arr.splice(arr.length - 1, 1, value);
                    this.input = arr.join(',') + ',';
                }
            } else {
                target.addClass('active').siblings('li').removeClass('active');
                this.input = value;
                this.searching = false;
            }
        }
    },
    watch: {
        input(val) {
            let inputArr = val.split(',');
            if (this.props.multiple) {
                inputArr.pop();
                let invalidData = [];
                inputArr.forEach(item => {
                    if (!this.props.list.includes(item)) {
                        invalidData.push(item);
                    }
                });
                let $input = $('input', $(this.$el));
                if (invalidData.length) {
                    $input.attr('title', invalidData.join(',') + '数据不合法');
                    $input.tooltip();
                } else {
                    $input.tooltip('hide');
                }
            }
            // 触发标签内声明的sync函数，用于传递数据给父组件
            this.$emit('sync', this.input);
        }
    }
});
