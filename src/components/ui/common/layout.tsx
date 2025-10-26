import { FC } from 'react';
// import Navbar from './navbar';
import Navbar from '@/components/layout/AppNavBar';
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
            <Outlet />
          </div>
        </div>
    </div>
  );
};

export default Layout;