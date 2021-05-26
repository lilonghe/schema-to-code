import React, { useEffect, useState, useRef } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';
import config from '../../build/config';
loader.config({
    paths: {
      vs: config.publicPath + 'monaco-editor/min/vs'
    }
});

export default function FinalCodeEditor({ value, onChange }) {
    const finalCodeEditor = useRef();

    const handleEditorDidMount = (editor) => {
        finalCodeEditor.current = editor;
    }

    useEffect(()=>{
        if (finalCodeEditor.current) {
            finalCodeEditor.current.getAction("editor.action.formatDocument").run();
            setTimeout(()=>{
                // formatDocument 执行完后莫名其妙自动滚动到最下面
                // 返回顶部
                finalCodeEditor.current.setScrollTop(0);
            })
        }
    }, [value])

    return (
    <div>
        <MonacoEditor
            width="100%"
            height="calc(100vh - 30px)"
            language="javascript"
            theme='vs-dark'
            value={value}
            onChange={val => onChange(val)}
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
    </div>)
}