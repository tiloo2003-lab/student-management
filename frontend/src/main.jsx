import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UnsavedChangesProvider } from './UnsavedChanges';
import { PortalDataProvider } from './PortalData';
import App from './App';
import { AuthProvider } from './auth';
import { ToastProvider } from './components/ui';
import './index.css';
import './public.css';
import './theme.css';

const router = createBrowserRouter([{ path: '*', element:
    <AuthProvider>
      <UnsavedChangesProvider>
      <PortalDataProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
      </PortalDataProvider>
      </UnsavedChangesProvider>
    </AuthProvider>
}]);
createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
