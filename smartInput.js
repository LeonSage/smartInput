/**
 * @file 智能输入框Vue组件
 */

 /*
    global Vue
 */

Vue.component('smart-input', {
    template: `
        <div class="friendSearchContainer">
            <div
                v-if="multiple===true"
                contenteditable="true"
                class="smartInput-input smartInput"
                :placeholder="placeholder"
                @click="initBadgeInput"
            >
                <ul class="smartInput-badge-list">
                    <li v-for="item in selected" class="smartInput-badge">
                        <span>{{item}}</span>
                        <span class="smartInput-badge-icon" @click.stop="deleteOne">
                            <svg viewBox="64 64 896 896" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
                        </span>
                    </li>
                    <li class="smartInput-badge">
                        <input
                            v-model="searchString"
                            @keyup="keyboardDown"
                            class="smartInput-search"
                            v-focus
                            ref="autoFocus"
                            @blur="blur"
                        />
                    </li>
                </ul>
            </div>
            <input v-else v-model="searchString" class="smartInput-input smartInput"
                :placeholder="placeholder"
                @click="init"
                @keyup="keyboardDown"
                @blur="blur"
            />
            <div v-if="invalidData" class="invalid-msg">{{invalidData}}</div>
            <ul v-show="searching" class="friendSearchList">
                <p v-if="!filtered.length">空数据</p>
                <li v-else v-for="(item, index) in filtered"
                    :class="{'smartInput-active': selected.includes(item)}"
                    @click.stop="clickOne"
                    @mouseover="hoverOn"
                >{{ item }}
                </li>
            </ul>
            <div v-show="searching" class="friendSearchModal" @click="searching=false"></div>
        </div>
    `,
    // 接收list/multiple/value参数
    props: {
        value: Array,
        list: {
            type: Array,
            default() {
                return [];
            }
        },
        multiple: Boolean,
        placeholder: {
            type: String,
            default: '输入文本自动检索，上下键选取，回车选中，可点选'
        }
    },
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
        if (this.multiple === true && typeof this.value === 'object' && this.value.length) {
            this.selected = this.value.filter(item => {
                return this.list.includes(item);
            });
            this.searchString = '';
        } else if (this.value) {
            if (this.list.includes(this.value)) {
                this.searchString = this.value;
                this.selected = [this.value];
            }
        }
        this.filtered = this.list;
    },
    methods: {
        // 调整联想搜索面板的大小和位置
        init(e) {
            this.searching = true;
            this.$emit('focus');
            if (this.searchString === this.selected[0]) {
                this.filtered = this.list;
            }
        },
        // 调整联想搜索面板的大小和位置
        initBadgeInput(e) {
            clearTimeout(this.timer);
            this.$emit('focus');
            this.searching = true;
            this.$el.querySelector('.smartInput-search').focus();
        },
        // 失去焦点时关闭面板，主要是按下tab键切换时的作用，随之带来的是所有相关的事件都要清除该定时器
        blur() {
            console.log('blur');
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
        // 鼠标hover到下拉list
        hoverOn(e) {
            const ul = this.$el.querySelector('.friendSearchList');
            const activeHoverLi = ul.querySelector('li.hover');
            if (activeHoverLi) {
                activeHoverLi.classList.remove('hover');
            }
            e.target.classList.add('hover');
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
            }
        },
        // 过滤
        filterData(str = this.searchString) {
            // 进行可选项过滤
            this.filtered = this.list.filter(item => {
                return item.toLowerCase().includes(str.toLowerCase());
            });
            this.focusIndex = 0;
            
        },
        // 触发选中事件
        chooseOne(target) {
            const value = target.innerText;
            if (value.includes(this.searchString)) {
                this.searchString = '';
            }
            if (this.multiple) {
                this.$refs.autoFocus.focus();
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
                this.searchString = value;
            }
        },
        // 鼠标点击一个选项
        clickOne(e) {
            let target = e.target;
            clearTimeout(this.timer);
            this.searching = true;
            this.focusIndex = [].indexOf.call(target.parentElement.children, target);
            this.chooseOne(target);
        },
        // 删除一个选项
        deleteOne(e) {
            // 点击删除选项时清除blur的回调，保持下拉框显示
            clearTimeout(this.timer);
            this.chooseOne(e.currentTarget.parentElement.children[0]);
        },
        // 键盘选择一个选项
        selectOne(e) {
            clearTimeout(this.timer);
            const target = this.$el.querySelectorAll('.friendSearchList li')[this.focusIndex];
            this.chooseOne(target);
        }
    },
    watch: {
        searchString(val) {
            // 延时搜索，降低卡顿
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                if (val === '') {
                    if (!this.multiple) {
                        this.selected = [];
                    }
                    this.filtered = this.list;
                }
                // 自动分词
                else if (val.includes(',')) {
                    let arr = val.split(',');
                    let invalidArr = [];
                    let flag = false;
                    arr.forEach(item => {
                        if (this.list.includes(item) && !this.selected.includes(item)) {
                            this.selected.push(item);
                            flag = true;
                        }
                        else if (!this.list.includes(item)) {
                            invalidArr.push(item);
                        }
                    })
                    flag && (this.searchString = invalidArr.join(','));
                }
                else {
                    this.filterData(val);
                }
            }, 200);
        },
        selected() {
            this.input = this.selected.join(',');
            if (this.multiple) {
                this.input += ',';
                this.$emit('collect', this.selected);
            } else {
                if (this.list.includes(this.searchString)) {
                    this.$emit('collect', this.searchString);
                } else {
                    this.$emit('collect', '');
                }
            }
        },
        list() {
            this.filtered = this.list;
        }
    },
    directives: {
        focus: {
            // 指令的定义
            inserted: function (el) {
                el.focus()
            }
        }
    }
});
