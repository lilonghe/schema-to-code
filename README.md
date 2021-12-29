# Schema to code
1. 通过编写 JSON 定义 Schema 快速转为代码开发。
2. 提供配置界面配置 Schema。

# Schema
```
{
    "meta": {
        "name": "CreateUser",
        "layout": {
            "labelCol":{ "span": 4},
            "wrapperCol":{ "span": 14}
        }
    },
    "fields": [
        {
            "tag": "input",
            "key": "name",
            "label": "名称",
            "rules": [
                {"pattern": "/abc/", "message": "haha"},
                {"required": true, "message": "need"}
            ]
        },
        {
            "tag": "textarea",
            "label": "介绍",
            "key": "description"
        },
        {
            "tag": "switch",
            "label": "启用",
            "key": "enable"
        },
        {
            "tag": "select",
            "label": "city",
            "key": "city",
            "options": [
                {"key": "shanghai", "label": "上海"}
            ],
            "attributes": {
                "placeholder": "please select city."
            }
        }
    ],
    "actions": [
        {
            "tag": "button",
            "text": "back"
        },
        {
            "tag": "button",
            "text": "save",
            "submit": true
        }
    ]
}
```