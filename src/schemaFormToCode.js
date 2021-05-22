import React, { useEffect, useRef, useState } from "react";
import { message } from 'antd';
import MonacoEditor, { loader } from '@monaco-editor/react';
import ConfigEditor from './configEditor';

loader.config({
    paths: {
      vs: '/monaco-editor/min/vs'
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
        let actionsCode = generateActionsCode(schema.actions || []);
        let exportCode = generateExportCode();

        let template = `${importCode}
        
        const Page = ({ form }) => {
            const { getFieldDecorator } = form;

            const handleSubmit = e => {
                e.preventDefault();
                this.props.form.validateFields((err, values) => {
                  if (!err) {
                    console.log('Received values of form: ', values);
                  }
                });
            };

            return (
                <Form>
                    ${fieldsCode}
                    ${actionsCode}
                </Form>
            )
        }

        ${exportCode}
        `;
        setFinalCode(template);
    }

    const generateExportCode = () => {
        return `export default Form.create()(Page);`;
    }

    const generateFieldsCode = (fields) => {
        let code = "";
        
        fields.map(action=> {
            let key = tagToComponentKey(action.tag); 
            let decorator = `{`;
            let valuePropName = key === 'Switch' ? `valuePropName:'checked'`:'';
            let required = action.required ? 'rules: [{ required: true }]':'';
            if (valuePropName || required) {
                decorator += "\n";
                if (valuePropName) {
                    decorator += valuePropName;
                }
                if (required) {
                    decorator += required;
                }
                decorator += "\n}";
            } else {
                decorator += "}";
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

    const generateImportCode = (keys) => {
        return `import React from 'react';
        import { ${keys.join(', ')} } from 'antd';`;
    }

    const generateActionsCode = (actions) => {
        let code = "";
        actions.map((action, i)=> {
            let key = tagToComponentKey(action.tag);
            code += `<${key}`;
            if (action.value) {
                code += ` value=${action.value} `
            }
            if (!action.text) {
                code += ` />
                `
            } else {
                code += `>${action.text}</${key}>`
            }
            if (i !== actions.length - 1) {
                code += `
                `;
            }
        });
        return `<div className='actions'>
                ${code}
            </div>`
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