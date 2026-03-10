import React from 'react';
import { Drawer, Form, Button, Space, Spin } from 'antd';
import { FormInstance } from 'antd';

interface FormDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void | null>;
  form: FormInstance;
  loading?: boolean;
  width?: number;
  children: React.ReactNode;
}

export const FormDrawer: React.FC<FormDrawerProps> = ({
  title,
  open,
  onClose,
  onSubmit,
  form,
  loading = false,
  width = 500,
  children,
}) => {
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch (error) {
      // Validation errors handled by Form
    }
  };

  return (
    <Drawer
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      width={width}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>Batal</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          {children}
        </Form>
      </Spin>
    </Drawer>
  );
};

export default FormDrawer;
