import React from 'react';
import { Button, Result } from 'antd';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="500"
                    title="Terjadi Kesalahan"
                    subTitle={this.state.error?.message || 'Terjadi kesalahan yang tidak terduga.'}
                    extra={
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Muat Ulang
                        </Button>
                    }
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
