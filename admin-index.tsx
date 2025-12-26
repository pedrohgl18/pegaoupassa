import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminRouter from './admin/AdminRouter';
import './index.css';

const AdminApp = () => {
    return (
        <div className="min-h-screen bg-zinc-50">
            <AdminRouter onClose={() => window.location.href = '/'} />
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AdminApp />
        </React.StrictMode>
    );
}
