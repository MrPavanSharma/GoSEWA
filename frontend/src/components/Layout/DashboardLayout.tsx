import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';
import { 
    LayoutDashboard, 
    User, 
    Package, 
    ShoppingCart, 
    LogOut,
    Menu,
    X,
    BarChart2,
    ChevronDown,
    ChevronRight,
    Activity,
    Droplets,
    HeartPulse,
    Wheat,
    Users as UsersIcon,
    DollarSign,
    FileText
} from 'lucide-react';
import styles from './DashboardLayout.module.css';

const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const [expandedItems, setExpandedItems] = React.useState<string[]>(['Gaushala Management']);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleExpand = (label: string) => {
        setExpandedItems(prev => 
            prev.includes(label) 
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const userType = user?.user_type || 'ENTREPRENEUR';

    const navItems = [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { label: 'Marketplace', path: '/marketplace', icon: <ShoppingCart size={20} /> },
        { label: 'Profile', path: '/profile', icon: <User size={20} /> },
        // Entrepreneur Specific
        ...(userType === 'ENTREPRENEUR' ? [
            { label: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
            { label: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
            { label: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
        ] : []),
        // Gaushala Specific
        ...(userType === 'GAUSHALA' ? [
            { 
                label: 'Gaushala Management', 
                icon: <Package size={20} />,
                children: [
                    { label: 'Gauvansh Record', path: '/gaushala/animals', icon: <Package size={18} /> },
                    { label: 'Milk Production', path: '/gaushala/milk', icon: <Droplets size={18} /> },
                    { label: 'Breeding', path: '/gaushala/breeding', icon: <Activity size={18} /> },
                    { label: 'Health', path: '/gaushala/health', icon: <HeartPulse size={18} /> },
                    { label: 'Feed', path: '/gaushala/feed', icon: <Wheat size={18} /> },
                    { label: 'Workforce', path: '/gaushala/workforce', icon: <UsersIcon size={18} /> },
                    { label: 'Finance', path: '/gaushala/finance', icon: <DollarSign size={18} /> },
                    { label: 'Reports', path: '/gaushala/reports', icon: <FileText size={18} /> },
                ]
            },
            { label: 'Waste Log', path: '/waste', icon: <Package size={20} /> }, 
            { label: 'Production', path: '/production', icon: <Package size={20} /> },
        ] : []),
        // Admin Specific
        ...(userType === 'ADMIN' ? [
            { label: 'Users', path: '/admin/users', icon: <User size={20} /> },
            { label: 'System', path: '/admin/system', icon: <BarChart2 size={20} /> },
        ] : [])
    ];

    const renderNavItem = (item: any) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.label);
        const isActive = item.path === location.pathname || (hasChildren && item.children.some((child: any) => child.path === location.pathname));

        return (
            <div key={item.label}>
                {hasChildren ? (
                    <div 
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        onClick={() => toggleExpand(item.label)}
                        style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                ) : (
                    <Link 
                        to={item.path} 
                        className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                )}

                {hasChildren && isExpanded && (
                    <div style={{paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                        {item.children.map((child: any) => (
                            <Link 
                                key={child.path}
                                to={child.path} 
                                className={`${styles.navItem} ${location.pathname === child.path ? styles.active : ''}`}
                                onClick={() => setIsMobileOpen(false)}
                                style={{fontSize: '0.9rem', padding: '0.5rem 0.75rem'}}
                            >
                                {child.icon}
                                <span>{child.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.logoContainer}>
                    <span className={styles.logoText}>GoSEWA</span>
                    <button className={styles.closeBtn} onClick={() => setIsMobileOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                
                <nav className={styles.nav}>
                    {navItems.map(renderNavItem)}
                </nav>

                <div className={styles.footer}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{user?.email?.charAt(0).toUpperCase()}</div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{user?.full_name || 'User'}</span>
                            <span className={styles.userRole}>{userType}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <button className={styles.menuBtn} onClick={() => setIsMobileOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <h2 className={styles.pageTitle}>
                        {navItems.find(i => i.path === location.pathname)?.label || 
                         navItems.flatMap(i => i.children || []).find(i => i.path === location.pathname)?.label || 
                         'Dashboard'}
                    </h2>
                </header>
                
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>

            {isMobileOpen && <div className={styles.overlay} onClick={() => setIsMobileOpen(false)} />}
        </div>
    );
};

export default DashboardLayout;
