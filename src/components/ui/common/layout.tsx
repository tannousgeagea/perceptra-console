import { FC, Suspense } from 'react';
// import Navbar from './navbar';
import Navbar from '@/components/layout/AppNavBar';
import { PageFallback } from '@/components/layout/PageFallback';
import './layout.css';
import { Outlet } from 'react-router-dom';

const Layout: FC = () => {
  return (
    <div className="layout">
      <div className='layout-navbar'>
        <Navbar />
      </div>
      <div className="flex-1 overflow-auto">
          <div className='layout-content'>
            {/* The next page loads here; the navbar stays. */}
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
    </div>
  );
};

export default Layout;