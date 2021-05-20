import { Form, Input, Switch, Button } from 'antd';

const Page = ({ form }) => {
    const { getFieldDecorator } = form;
    return (
        <Form>
            <Form.Item label={Intl.t({ id: 'undefined' })}>
                {getFieldDecorator('name', {
                    rules: [{ required: true }]
                })(
                    <Input />
                )}
            </Form.Item>
            <Form.Item label={Intl.t({ id: 'undefined' })}>
                {getFieldDecorator('description', {})(
                    <Input.TextArea />
                )}
            </Form.Item>
            <Form.Item label={Intl.t({ id: 'undefined' })}>
                {getFieldDecorator('enable', {
                    valuePropName: 'checked'
                })(
                    <Switch />
                )}
            </Form.Item>

            <div className="actions">
                <Button >{Intl.t({ id: 'back' })}</Button>
                <Button >{Intl.t({ id: 'save' })}</Button>

            </div>
        </Form>
    )
}

export default Form.create(Page);
