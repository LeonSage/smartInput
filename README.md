# smartInput
基于Vue的智能输入框组件，支持输入筛选等功能。
    
包含的功能大同小异：

 1. 获得焦点时显示所有备选项
 2. 失去焦点时隐藏备选项面板
 3. 输入字符后，检索可能的备选项
 4. 支持上下键和回车键进行选中
 5. 支持点击选中
 6. 支持多选
 7. 以逗号进行多选的分割
 1. 支持徽章的展示方式
 
 具体示例参考：demo/base-input

## 更新日志
### 2019-06-11
1. 新增数据的徽章展示方式：`dataDisplay: 'badge'`
1. 优化搜索逻辑，降低搜索的延时
1. 拆分组件传参，现在使用`v-bind="provinceList"`
1. 返回的数据从字符串变为数组

### 2019-06-10
1. 取消依赖jQuery和bootstrap
1. 上传到github进行代码管理
1. 增加示例文件和使用说明

### 2018-06-06
1. 优化了部分代码逻辑
1. 将组件代码拆分为独立smartInput.js和smartInput.css
1. 新增图例和示例代码

## 依赖
依赖`vue`，可以使用`CDN`：https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.min.js。

## 使用方式
 1. 在页面中引入`vue.js`
 2. 在页面中引入`smartInput.js`和`smartInput.css`
 3. 在你的页面中建立vue对象：`new Vue({el: '#root'})`
 4. 在root根组件里直接添加<smart-input>标签即可调用该组件

```
# 调用组件
<smart-input :props="provinceList" @collect="collectProvince"></smart-input>
```

## 接口文档

我们只需要在初始化的vue对象里设置好该组件需要的相关属性即可生效：
```
# 暂时只支持这3个参数。
provinceList: {
    list: ['北京市','天津市','上海市','重庆市','河北省','山西省','辽宁省','吉林省'],
    multiple: true || false,
    value: '我是初始值',
    dataDisplay: 'badge' || 'text'（默认）
},
```
同时需要提供一个函数用于支持数据收集和回传：
```
methods: {
    // 跟智能输入框同步选中的业务
    collectProvince(data) {
        console.log(data);
    }
}
```

后续需要完善的功能:
 2. 支持数据校验（不合法的不允许输入），添加参数`stric: true`
 3. 完善接口文档和补充在线测试用例
