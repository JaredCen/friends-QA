## 模板关系链

```
index.xtpl ——html“包皮”

create-init.xtpl ——创建问题初始页

create.xtpl ——创建问题页面
    └── components/question-list.xtpl

answer-init.xtpl ——回答问题初始页

answer.xtpl ——回答问题页面
    └── components/question-list.xtpl

visit-others.xtpl ——其他人访问个人主页

visit-self.xtpl ——自己访问个人主页
    └── components/user-list.xtpl

result.xtpl ——答题结束页面
    └── components/user-list.xtpl

result-compare.xtpl ——查看正确答案页面

qrcode.xtpl ——二维码页面

```

缩减后的xtpl：

```
    init.xtpl ——ans/ques的init页面

    begin.xtpl ——ans/ques答题/出题页面

    visit.xtpl ——访问自己/访问别人（已答题）

    check.xtpl ——查看正确答案页面

    finish.xtpl ——出题完成诱导分享页面

    loading.xtpl ——仿微信loading交互组件

    index.xtpl ——测试用
```
