import React, { useEffect, useRef, useState } from "react";
import { message } from 'antd';
import MonacoEditor, { loader } from '@monaco-editor/react';
import ConfigEditor from './configEditor';
import config from '../build/config';

loader.config({
    paths: {
      vs: config.publicPath + 'monaco-editor/min/vs'
    }
});

const SchemaToCode = () => {
    const [schema, setSchema] = useState();
    const [code, setCode] = useState('');
    const [finalCode, setFinalCode] = useState();
    const finalCodeEditor = useRef();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        let text = await file.text();
        try{
            setCode(text);
            let json = JSON.parse(text);
            setSchema(json);
        }catch(err) {
            message.error('格式错误');
        }
    }

    const generateCode = () => {
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
        let exportCode = generateExportCode();
        let layoutCode = generateFormLayout(schema?.meta?.layout || {});
        let template = `${importCode}
        
        const Page = ({ form }) => {
            const { getFieldDecorator } = form;

            const handleSubmit = e => {
                e.preventDefault();
                form.validateFields((err, values) => {
                  if (!err) {
                    console.log('Received values of form: ', values);
                  }
                });
            };

            return (
                <Form${print(layoutCode)}>
                    ${fieldsCode}
                    ${actionsCode}
                </Form>
            )
        }

        ${exportCode}
        `;
        setFinalCode(template);
    }

    const generateFormLayout = (layout) => {
        let propertys = [];
        Object.keys(layout).map(key=> {
            propertys.push(`${key}={${formatObject(layout[key])}}`);
        });
        return propertys.join(' ');
    }

    const formatObject = (codeObject) => {
        return JSON.stringify(codeObject).replace(/([\{])\"/g,"$1").replace(/\"([\:])/g,"$1").replace(/([\,])\"/g,"$1");
    }

    const formatArray = (codeArray) => {
        let code = '[';
        codeArray.map(item=> {
            code += `\n${formatObject(item)},`
        })
        return code + '\n]';
    }

    const generateExportCode = () => {
        return `export default Form.create()(Page);`;
    }

    const generateFieldsCode = (fields) => {
        let code = "";
        
        fields.map(action=> {
            let key = tagToComponentKey(action.tag); 
            let decorator = `{}`;
            let valuePropName = key === 'Switch' ? `valuePropName:'checked'`:'';

            let rules = action.rules || [];
            if (action.required) {
                let rule = { required: true };
                if (action.requiredMessage) {
                    rule.message = action.requiredMessage;
                }
                rules.push(rule);
            }
            let rulesCode = rules.length > 0 ? "rules:" + formatArray(rules) : '';

            let decoratorPropertys = [];
            valuePropName && decoratorPropertys.push(valuePropName);
            rulesCode && decoratorPropertys.push(rulesCode);

            if (decoratorPropertys.length > 0) {
                decorator = `{\n${decoratorPropertys.join(', ')}\n}`;
            }
        

            let template = `<Form.Item label='${action.label}'>
                {getFieldDecorator('${action.key}', ${decorator})(
                    <${key} />
                )}
            </Form.Item>
            `;
            code += template;
        });
        return code;
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
                propertys.push('onClick={handleSubmit}');
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
        }
        return key;
    }

    useEffect(()=>{
        if (schema) {
            generateCode();
        }
    }, [schema]);

    useEffect(()=>{
        if (finalCode) {
            formatFinalCode();
        }
    }, [finalCode]);

    const handleChangeFinalCode = (val) => {
        setFinalCode(val);
    }

    const handleEditorDidMount = async (editor) => {
        finalCodeEditor.current = editor;
    }

    const handleChangeCode = (val) => {
        setCode(val);
        try {
            let json = JSON.parse(val);
            setSchema(json);
        } catch (err) {}
    }

    const formatFinalCode = () => {
        finalCodeEditor.current.getAction("editor.action.formatDocument").run();
    }

    return <div>
        <input accept='.json' type='file' onChange={handleFileUpload} />
        <div style={{display: 'flex', flexDirection: 'row', border: '1px solid #CCC'}}>
            <div style={{flex: 1, borderRight: '1px solid #CCC'}}>
                <ConfigEditor value={code} onChange={handleChangeCode} />
            </div>
            <div style={{flex: 1}}>
                <MonacoEditor
                    height="calc(100vh - 30px)"
                    language="javascript"
                    theme='vs-dark'
                    value={finalCode || ''}
                    onChange={handleChangeFinalCode}
                    onMount={handleEditorDidMount}
                    options={{
                        formatOnType: true,
                        formatOnPaste: true,
                        autoIndent: true,
                        minimap: {
                            enabled: false,
                        },
                    }}
                />
            </div>
        </div>
    </div>
}

export default SchemaToCode;