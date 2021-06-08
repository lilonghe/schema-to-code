import React, { useEffect, useRef, useState } from "react";
import { message, Dropdown, Menu, Button } from 'antd';
import ConfigEditor from './editor/configEditor';
import FinalCodeEditor from "./editor/finalCodeEditor";
import formGenerate from './generate/form';
import formV4Generate from './generate/formV4';

const SchemaToCode = () => {
    const [schema, setSchema] = useState();
    const [code, setCode] = useState('');
    const [finalCode, setFinalCode] = useState('');
    const [targetAntdVersion, setTargetAntdVersion] = useState('4');

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
            let code = targetAntdVersion === '3' ? formGenerate({ schema }) : formV4Generate({ schema });
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

    const handleChangeANTDTargetVersion = ({ key }) => {
        setTargetAntdVersion(key);
    }

    return <div>
        <div>
            <input accept='.json' type='file' onChange={handleFileUpload} />
            <Dropdown overlay={<Menu onClick={handleChangeANTDTargetVersion}>
                <Menu.Item key='3'>3</Menu.Item>
                <Menu.Item key='4'>4</Menu.Item>
            </Menu>}>
                <Button>ANTD Version: {targetAntdVersion}</Button>
            </Dropdown>
        </div>
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