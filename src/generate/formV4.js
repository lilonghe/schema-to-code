export default function formSchemaToCode({ schema }) {
    const generateFormLayout = (layout) => {
        let propertys = [];
        Object.keys(layout).map(key=> {
            propertys.push(`${key}={${formatObject(layout[key])}}`);
        });
        return propertys.join(' ');
    }

    const formatObject = (codeObject) => {
        return JSON.stringify(codeObject).
            replace(/([\{])\"/g,"$1").
            replace(/\"([\:])/g,"$1").
            replace(/([\,])\"/g,"$1").
            // form pattern 
            replaceAll(`\"/`, "/").replaceAll(`/\"`, "/");
    }

    const formatArray = (codeArray) => {
        if (codeArray.length === 0) return '[]';
        let code = '[';
        codeArray.map(item=> {
            code += `\n${formatObject(item)},`
        })
        return code + '\n]';
    }

    const formatWrapArray = (codeArray) => {
        if (codeArray.length === 0) return '';
        let code = '';
        codeArray.map(item=> {
            code += `\n${item}`
        })
        return code;
    }

    const generateExportCode = () => {
        return `export default ${schema?.meta?.name || 'Page'};`;
    }

    const generateFieldsCode = (fields) => {
        let code = "";
        
        fields.map(userField=> {
            let field = {
                key: '',
                label: '',
                tag: '',
                ...userField,
            }
            
            let key = tagToComponentKey(field.tag);

            let rules = field.rules || [];
            if (field.required) {
                let rule = { required: true };
                if (field.requiredMessage) {
                    rule.message = field.requiredMessage;
                }
                rules.push(rule);
            }

            let formItem;
            switch(key) {
                case 'Select':
                    formItem = generateSelect(field);
                break;
                default:
                    let attrs = generateAttributes(field);
                    formItem = `<${key}${print(attrs)} />`;
            }

            let propertys = [
                `label='${field.label}'`,
                `name='${field.key}'`,
            ];

            if (rules.length) {
                propertys.push(`rules={${formatArray(rules)}}`)
            }
            if (key === 'Switch') {
                propertys.push(`valuePropName="checked"`);
                propertys.push(`initialValue={false}`);
            }
        
            let template = `<Form.Item${formatWrapArray(propertys)}>
               ${formItem}
            </Form.Item>
            `;
            code += template;
        });
        return code;
    }

    const generateSelect = (field) => {
        if(!field.options) {
            field.options = [];
        }

        let attrs = generateAttributes(field);
        let template = `<Select${print(attrs.join(' '))}>
            ${field.options.map(option=>{
                return `<Select.Option key={'${option.key}'}>${option.label}</Select.Option>`
            })}
        </Select>`
        return template;
    }

    const print = (propertyCode) => {
        return propertyCode ? ' ' + propertyCode : '';
    }

    const generateImportCode = (keys) => {
        return `import React from 'react';
        import { ${keys.join(', ')} } from 'antd';`;
    }

    const generateActionsCode = (actions, layout) => {
        let code = "";
        actions.map((action, i)=> {
            let key = tagToComponentKey(action.tag);
            let propertys = [];
            if (action.submit) {
                propertys.push('htmlType="submit"');
            }
            code += `<${key}${print(propertys.join(' '))}>${action.text}</${key}>`;
            if (i !== actions.length - 1) {
                code += `\n`;
            }
        });
        let offsetLayout;
        if (layout.labelCol) {
            offsetLayout = generateFormLayout({ wrapperCol: { offset: layout.labelCol.span } });
        }
        return `<Form.Item${print(offsetLayout)}>
                ${code}
            </Form.Item>`
    }
    
    const tagToImportKey = (tag) => {
        let key = "";
        switch(tag) {
            case 'input':
            case 'textarea':
                key = 'Input';
                break;
            case 'button':
                key = 'Button';
                break;
            case 'switch':
                key = 'Switch';
                break;
            case 'select':
                key = 'Select';
                break;
        }
        return key;
    }

    const tagToComponentKey = (tag) => {
        let key = "";
        switch(tag) {
            case 'input':
                key = 'Input';
                break;
            case 'textarea':
                key = 'Input.TextArea';
                break;
            case 'button':
                key = 'Button';
                break;
            case 'switch':
                key = 'Switch';
                break;
            case 'select':
                key = 'Select';
                break;
        }
        return key;
    }

    const generateAttributes = (field) => {
        if (!field.attributes) return [];
        let attributeArr = [];
        Object.keys(field.attributes).map(key => {
            let val = field.attributes[key];
            attributeArr.push(`${key}=${typeof(val)==='string' ? `'${val}'` : val}`)
        });
        return attributeArr;
    }

    return () => {
        let importComponentKeys = { 'Form': true };
        schema?.fields?.map(field => {
            let key = tagToImportKey(field.tag);
            importComponentKeys[key] = true;
        });
        schema?.actions?.map(field => {
            let key = tagToImportKey(field.tag);
            importComponentKeys[key] = true;
        });

        let importCode = generateImportCode(Object.keys(importComponentKeys));
        let fieldsCode = generateFieldsCode(schema.fields || []);
        let actionsCode = generateActionsCode(schema.actions || [], schema?.meta?.layout || {});
        let exportCode = generateExportCode(schema);
        let layoutCode = generateFormLayout(schema?.meta?.layout || {});
        let template = `${importCode}
        
        const ${schema?.meta?.name || 'Page'} = () => {
            const [form] = Form.useForm();

            const onFinish = (values) => {
                console.log(values);
            };

            return (
                <Form form={form}${print(layoutCode)} onFinish={onFinish}>
                    ${fieldsCode}
                    ${actionsCode}
                </Form>
            )
        }

        ${exportCode}
        `;

        return template;
    }

}