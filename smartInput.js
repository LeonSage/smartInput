// 智能输入框Vue组件
Vue.component('smart-input', {
    template: `<div class="friendSearchContainer">
        <div v-if="dataDisplay==='badge'" contenteditable="true" class="smartInput-input smartInput"
            placeholder="输入文本自动检索，上下键选取，回车选中，可点选"
            @click="initBadgeInput"
            >
            <ul class="smartInput-badge-list">
                <li v-for="item in selected" class="smartInput-badge">
                    <span>{{item}}</span>
                    <span class="smartInput-badge-icon">
                        <svg viewBox="64 64 896 896" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
                    </span>
                </li>
                <li class="smartInput-badge">
                    <input v-model="searchString" @blur="blur" @keydown="keyboardDown" class="smartInput-search" />
                </li>
            </ul>
        </div>
        <input v-else v-model="input" class="smartInput-input smartInput"
            placeholder="输入文本自动检索，上下键选取，回车选中，可点选"
            @click="init" @keydown="keyboardDown" @blur="blur" />
        <div v-if="invalidData" class="invalid-msg">{{invalidData}}</div>
        <ul v-show="searching" class="friendSearchList">
            <p v-if="!filtered.length">空数据</p>
            <li v-else v-for="(item, index) in filtered"
                :class="{active: selected.includes(item)}"
                @click.stop="clickOne">{{ item }}
            </li>
        </ul>
        <div v-show="searching" class="friendSearchModal" @click="searching=false"></div>
    </div>`,
    // 接收list/multiple/value参数
    props: ['value', 'list', 'multiple', 'dataDisplay'],
    data() {
        return {
            searching: false,
            searchString: '',
            timer: null,
            filtered: [],
            input: '',
            selected: [],
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
        this.input = this.value || '';
        this.filtered = this.list;
    },
    methods: {
        // 调整联想搜索面板的大小和位置
        init(e) {
            this.searching = true;
            this.filtered = this.list;
        },
        // 调整联想搜索面板的大小和位置
        initBadgeInput(e) {
            this.searching = true;
            this.$el.querySelector('.smartInput-search').focus();
        },
        // 失去焦点时关闭面板，主要是按下tab键切换时的作用，随之带来的是所有相关的事件都要清除该定时器
        blur() {
            this.timer = setTimeout(() => {
                this.searching = false;
            }, 200);
        },
        // 在上下键索引后调整视口
        scrollViewport() {
            const ul = this.$el.querySelector('.friendSearchList');
            const activeHoverLi = ul.querySelector('li.hover');
            if (activeHoverLi) {
                activeHoverLi.classList.remove('hover');
            }
            ul.querySelectorAll('li')[this.focusIndex].classList.add('hover');
            this.$el.querySelector('.friendSearchList').scrollTop = (this.focusIndex - 1) * 26;
        },
        // 联想搜索的主体功能函数，这里使用keydown是为了保证持续性的上下键能够保证执行
        keyboardDown(e) {
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
                Vue.nextTick(() => {
                    this.searchString = this.key;
                });
            }
        },
        // 过滤
        filterData(str = this.searchString) {
            // 延时搜索，降低卡顿
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                // 进行可选项过滤
                this.filtered = this.list.filter(item => {
                    return item.toLowerCase().includes(str.toLowerCase());
                });
                this.focusIndex = 0;
            }, 500);
        },
        // 触发选中事件
        chooseOne(target) {
            const value = target.innerText;
            if (this.multiple) {
                let selected = this.selected.slice();
                if (selected.includes(value)) {
                    let index = selected.indexOf(value);
                    selected.splice(index, 1);
                    this.selected = selected;
                } else {
                    this.selected.push(value);
                }
            } else {
                this.selected = [value];
                
                this.searching = false;
            }
        },
        // 鼠标点击一个选项
        clickOne(e) {
            let target = e.target;
            clearTimeout(this.timer);
            this.focusIndex = [].indexOf.call(target.parentElement.children, target);
            this.chooseOne(target);
        },
        // 键盘选择一个选项
        selectOne(e) {
            clearTimeout(this.timer);
            const target = this.$el.querySelectorAll('.friendSearchList li')[this.focusIndex];
            this.chooseOne(target);
        }
    },
    watch: {
        input(val) {
            let inputArr = val.split(',');
            if (this.multiple) {
                inputArr.pop();
                let invalidData = [];
                inputArr.forEach(item => {
                    if (!this.list.includes(item)) {
                        invalidData.push(item);
                    }
                });
                if (invalidData.length) {
                    this.invalidData = invalidData.join(',') + '数据不合法';
                }
            }
            // 触发标签内声明的sync函数，用于传递数据给父组件
            this.$emit('collect', this.selected);
        },
        searchString(val) {
            if (val === '') {
                this.filtered = this.list;
            } else {
                this.filterData(val);
            }
        },
        selected() {
            this.input = this.selected.join(',');
            if (this.multiple) {
                this.input += ',';
            }
        }
    }
});