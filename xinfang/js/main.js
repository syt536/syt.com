// 鞍山市公安局民意感知中心平台主要JS功能

// 默认用户数据 - 实际应用中应从服务器获取
const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', level: 'city', name: '系统管理员' },
    { id: 2, username: 'city1', password: '123456', role: 'user', level: 'city', name: '市级用户1' },
    { id: 3, username: 'county1', password: '123456', role: 'user', level: 'county', name: '县级用户1' }
];

// 初始化用户数据到本地存储
function initializeUsers() {
    // 检查本地存储中是否已有用户数据
    if (!localStorage.getItem('users')) {
        // 将默认用户数据存储到本地存储
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// 获取所有用户
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// 权限控制
const permissions = {
    city: ['register', 'query', 'dispatch', 'transfer', 'supervise', 'feedback', 'approve', 'return', 'stats', 'manage'],
    county: ['process', 'report', 'conclusion']
};

// 当前登录用户
let currentUser = null;

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户数据
    initializeUsers();
    
    // 检查用户登录状态
    checkLoginStatus();
    
    // 注册事件监听器
    registerEventListeners();
});

// 检查登录状态
function checkLoginStatus() {
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    } else {
        // 如果当前不是登录页，重定向到登录页
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'index.html' && !window.location.href.endsWith('/')) {
            window.location.href = '../index.html';
        }
    }
}

// 更新已登录用户的UI
function updateUIForLoggedInUser() {
    // 更新导航栏显示用户名
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    // 根据用户级别显示不同功能模块
    showModulesForUserLevel();
}

// 根据用户级别显示功能模块
function showModulesForUserLevel() {
    const moduleGrid = document.querySelector('.module-grid');
    if (!moduleGrid) return;
    
    moduleGrid.innerHTML = ''; // 清空现有模块
    
    const userPermissions = permissions[currentUser.level];
    
    // 根据权限添加功能模块
    if (userPermissions.includes('register')) {
        addModuleCard('register', '信息登记录入', '录入新的信息到系统', 'edit');
    }
    
    if (userPermissions.includes('query')) {
        addModuleCard('query', '信息编辑查询', '搜索和编辑系统中的信息', 'search');
    }
    
    if (userPermissions.includes('dispatch')) {
        addModuleCard('dispatch', '受理派发流转', '处理和分配案件到相关部门', 'share');
    }
    
    if (userPermissions.includes('transfer')) {
        addModuleCard('transfer', '移交办理', '将案件移交给督察/法制/纪检部门', 'forward');
    }
    
    if (userPermissions.includes('supervise')) {
        addModuleCard('supervise', '督办计时', '跟踪案件处理时间和进度', 'time');
    }
    
    if (userPermissions.includes('feedback')) {
        addModuleCard('feedback', '接收反馈', '查看和处理各部门反馈信息', 'message');
    }
    
    if (userPermissions.includes('approve')) {
        addModuleCard('approve', '落实审批', '审批办结和延期申请', 'check');
    }
    
    if (userPermissions.includes('return')) {
        addModuleCard('return', '差件退回', '退回不合格案件处理', 'return');
    }
    
    if (userPermissions.includes('stats')) {
        addModuleCard('stats', '统计报表', '生成和查看各类统计报表', 'chart');
    }
    
    if (userPermissions.includes('manage')) {
        addModuleCard('manage', '账号管理', '管理系统用户和权限', 'users');
    }
    
    if (userPermissions.includes('process')) {
        addModuleCard('process', '开始办理', '接收和开始处理案件', 'play');
    }
    
    if (userPermissions.includes('report')) {
        addModuleCard('report', '落办反馈', '提交处理结果和反馈', 'upload');
    }
    
    if (userPermissions.includes('conclusion')) {
        addModuleCard('conclusion', '审批结论', '查看审批结果和结论', 'file');
    }
}

// 添加功能模块卡片
function addModuleCard(id, title, description, icon) {
    const moduleGrid = document.querySelector('.module-grid');
    if (!moduleGrid) return;
    
    const moduleCard = document.createElement('div');
    moduleCard.className = 'module-card';
    moduleCard.dataset.module = id;
    
    moduleCard.innerHTML = `
        <div class="module-icon">
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-${icon}"></use>
            </svg>
        </div>
        <h3 class="module-title">${title}</h3>
        <p class="module-description">${description}</p>
    `;
    
    moduleCard.addEventListener('click', function() {
        navigateToModule(id);
    });
    
    moduleGrid.appendChild(moduleCard);
}

// 导航到功能模块
function navigateToModule(moduleId) {
    window.location.href = `pages/${moduleId}.html`;
}

// 注册事件监听器
function registerEventListeners() {
    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 注销按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 文件上传区域
    const fileUploadAreas = document.querySelectorAll('.file-upload');
    fileUploadAreas.forEach(area => {
        area.addEventListener('change', handleFileUpload);
    });
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // 获取所有用户
    const users = getAllUsers();
    
    // 验证用户名和密码
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // 登录成功
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // 重定向到主页
        window.location.href = 'pages/dashboard.html';
    } else {
        // 登录失败
        alert('用户名或密码错误');
    }
}

// 处理注销
function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = '../index.html';
}

// 处理文件上传
function handleFileUpload(event) {
    const files = event.target.files;
    const fileList = event.target.closest('.form-group').querySelector('.file-list');
    
    if (files.length > 0 && fileList) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 验证文件类型和大小
            if (validateFile(file)) {
                addFileToList(file, fileList);
            } else {
                alert('文件格式或大小不符合要求');
            }
        }
    }
}

// 验证文件
function validateFile(file) {
    // 允许的文件类型
    const allowedTypes = [
        'video/mp4',
        'image/jpeg',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    // 最大文件大小 (100MB)
    const maxSize = 100 * 1024 * 1024;
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
}

// 添加文件到列表
function addFileToList(file, fileList) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // 显示文件名和大小
    const fileSize = (file.size / (1024 * 1024)).toFixed(2); // 转换为MB
    
    fileItem.innerHTML = `
        <span>${file.name} (${fileSize} MB)</span>
        <button type="button" class="btn-remove">删除</button>
    `;
    
    // 添加删除按钮事件
    const removeBtn = fileItem.querySelector('.btn-remove');
    removeBtn.addEventListener('click', function() {
        fileItem.remove();
    });
    
    fileList.appendChild(fileItem);
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 格式化日期
function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 添加图标库支持
function loadIcons() {
    // 这里可以加载图标库，如Font Awesome或自定义SVG图标
} 