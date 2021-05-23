import React, { useState } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';
import config from '../build/config';
loader.config({
    paths: {
      vs: config.publicPath + 'monaco-editor/min/vs'
    }
});


export default function ConfigEditor({ value, onChange }) {
    return (
    <div>
        <MonacoEditor
            width="100%"
            height="calc(100vh - 30px)"
            language="json"
            theme='vs-dark'
            value={value}
            onChange={val => onChange(val)}
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