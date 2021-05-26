import React, { useEffect, useRef, useState } from "react";
import { message } from 'antd';
import ConfigEditor from './editor/configEditor';
import FinalCodeEditor from "./editor/finalCodeEditor";
import formGenerate from './generate/form';

const SchemaToCode = () => {
    const [schema, setSchema] = useState();
    const [code, setCode] = useState('');
    const [finalCode, setFinalCode] = useState('');

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

    useEffect(()=>{
        if (schema) {
            let code = formGenerate({ schema });
            setFinalCode(code);
        }
    }, [schema]);

    const handleChangeFinalCode = (val) => {
        setFinalCode(val);
    }

    const handleChangeCode = (val) => {
        setCode(val);
        try {
            let json = JSON.parse(val);
            setSchema(json);
        } catch (err) {}
    }

    return <div>
        <input accept='.json' type='file' onChange={handleFileUpload} />
        <div style={{display: 'flex', flexDirection: 'row', border: '1px solid #CCC'}}>
            <div style={{flex: 1}}>
                <ConfigEditor value={code} onChange={handleChangeCode} />
            </div>
            <div style={{flex: 1}}>
                <FinalCodeEditor value={finalCode} onChange={handleChangeFinalCode} />
            </div>
        </div>
    </div>
}

export default SchemaToCode;