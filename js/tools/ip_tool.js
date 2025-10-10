// minimalist_toolbox/frontend/js/tools/ip_tool.js
class IPTool {
    constructor() {
        this.apiUrl = 'https://ipapi.co';
        this.initEventListeners();
        this.initDarkMode();
        this.initParticles();
        this.getCurrentIP();
    }

    initEventListeners() {
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchIP();
        });

        document.getElementById('ip-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchIP();
            }
        });
    }

    initDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const darkIcon = document.getElementById('dark-icon');
        const lightIcon = document.getElementById('light-icon');
        
        if (localStorage.getItem('theme') === 'dark' || 
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        }
        
        darkModeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                darkIcon.classList.add('hidden');
                lightIcon.classList.remove('hidden');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                darkIcon.classList.remove('hidden');
                lightIcon.classList.add('hidden');
            }
        });
    }

    initParticles() {
        particlesJS('particles-js', {
            particles: {
                number: { value: 60, density: { enable: true, value_area: 800 } },
                color: { value: "#6366f1" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#8b5cf6", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" }
                }
            }
        });
    }

    async getCurrentIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            
            document.getElementById('my-ip').textContent = data.ip;
            
            // 检测IP类型
            const isIPv6 = data.ip.includes(':');
            const ipTypeElement = document.getElementById('ip-type');
            ipTypeElement.innerHTML = isIPv6 ? 
                '<span class="ip-type-badge ipv6-badge">IPv6</span>' : 
                '<span class="ip-type-badge ipv4-badge">IPv4</span>';
                
        } catch (error) {
            document.getElementById('my-ip').textContent = '获取失败';
            console.error('获取IP失败:', error);
        }
    }

    async searchIP() {
        const ipInput = document.getElementById('ip-input').value.trim();
        const searchBtn = document.getElementById('search-btn');
        const searchText = document.getElementById('search-text');
        const searchSpinner = document.getElementById('search-spinner');
        
        // 显示加载状态
        searchText.textContent = '查询中...';
        searchSpinner.classList.remove('hidden');
        searchBtn.disabled = true;
        
        // 隐藏之前的结果和错误
        document.getElementById('ip-info-container').classList.add('hidden');
        document.getElementById('error-container').classList.add('hidden');
        
        try {
            let url;
            if (!ipInput) {
                // 查询当前IP
                url = `${this.apiUrl}/json/`;
            } else {
                // 验证输入是否为IP地址或域名
                if (this.isValidIP(ipInput) || this.isValidDomain(ipInput)) {
                    url = `${this.apiUrl}/${ipInput}/json/`;
                } else {
                    throw new Error('请输入有效的IP地址或域名');
                }
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.reason || 'IP查询失败');
            }
            
            this.displayIPInfo(data);
            this.showNotification('查询成功', 'success');
            
        } catch (error) {
            this.showError(error.message);
            console.error('IP查询错误:', error);
        } finally {
            // 恢复按钮状态
            searchText.textContent = '查询';
            searchSpinner.classList.add('hidden');
            searchBtn.disabled = false;
        }
    }

    isValidIP(ip) {
        // 简单的IP地址验证
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    isValidDomain(domain) {
        // 简单的域名验证
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain);
    }

    displayIPInfo(data) {
        document.getElementById('ip-address').textContent = data.ip || '-';
        document.getElementById('ip-location').textContent = `${data.city || '-'}, ${data.region || '-'}, ${data.country_name || '-'}`;
        document.getElementById('ip-city').textContent = data.city || '-';
        document.getElementById('ip-country').textContent = `${data.country_name || '-'} (${data.country_code || '-'})`;
        document.getElementById('ip-isp').textContent = data.org || data.asn || '-';
        document.getElementById('ip-timezone').textContent = data.timezone || '-';

        // 更新地图显示
        if (data.latitude && data.longitude) {
            this.updateMap(data.latitude, data.longitude, data.city, data.country_name);
        } else {
            this.updateMap(null, null, '未知位置');
        }

        // 显示结果容器
        document.getElementById('ip-info-container').classList.remove('hidden');
    }

    updateMap(lat, lng, city, country) {
        const mapElement = document.getElementById('map');
        
        if (lat && lng) {
            // 在实际应用中，这里应该集成地图API
            // 这里使用简单的静态地图作为示例
            mapElement.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full p-4 text-center">
                    <span class="text-5xl mb-4">📍</span>
                    <h3 class="font-semibold mb-2">${city}, ${country}</h3>
                    <p class="text-sm">纬度: ${lat}<br>经度: ${lng}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">实际应用中这里会显示交互式地图（本网站仅供测试使用）</p>
                </div>
            `;
        } else {
            mapElement.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full p-4">
                    <span class="text-5xl mb-4">❓</span>
                    <p class="text-center">无法获取地理位置信息</p>
                </div>
            `;
        }
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-container').classList.remove('hidden');
    }

    showNotification(message, type = 'success') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="text-lg mr-2">${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// 初始化IP工具
document.addEventListener('DOMContentLoaded', () => {
    const ipTool = new IPTool();
    window.ipTool = ipTool;
});