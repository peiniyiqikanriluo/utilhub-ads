// minimalist_toolbox/frontend/js/tools/qr_generator.js
class QRGenerator {
    constructor() {
        this.qrCode = null;
        this.currentType = 'text';
        this.currentShape = 'square';
        this.initEventListeners();
        this.initDarkMode();
        this.initParticles();
    }

    initEventListeners() {
        // 生成按钮事件
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateQRCode();
        });

        // 下载按钮事件
        document.getElementById('download-png').addEventListener('click', () => {
            this.downloadQRCode('png');
        });

        document.getElementById('download-svg').addEventListener('click', () => {
            this.downloadQRCode('svg');
        });

        // 二维码类型切换
        document.querySelectorAll('.qr-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchType(e.target.dataset.type);
            });
        });

        // 形状选择事件
        document.querySelectorAll('.shape-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.switchShape(e.currentTarget.dataset.shape);
            });
        });

        // 尺寸滑块事件
        document.getElementById('qr-size').addEventListener('input', (e) => {
            document.getElementById('size-value').textContent = e.target.value;
        });

        // 实时预览选项变化
        document.getElementById('qr-size').addEventListener('change', () => {
            if (this.qrCode) this.generateQRCode();
        });

        document.getElementById('qr-color').addEventListener('change', () => {
            if (this.qrCode) this.generateQRCode();
        });

        document.getElementById('qr-bgcolor').addEventListener('change', () => {
            if (this.qrCode) this.generateQRCode();
        });

        document.getElementById('qr-ecc').addEventListener('change', () => {
            if (this.qrCode) this.generateQRCode();
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

    switchType(type) {
        this.currentType = type;
        
        // 更新按钮状态
        document.querySelectorAll('.qr-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.qr-type-btn[data-type="${type}"]`).classList.add('active');
        
        // 更新输入框提示和示例
        const textarea = document.getElementById('qr-content');
        const exampleDiv = document.getElementById('template-example');
        
        switch(type) {
            case 'text':
                textarea.placeholder = '输入要生成二维码的文本内容';
                exampleDiv.innerHTML = '示例: 这是一段示例文本';
                break;
            case 'url':
                textarea.placeholder = '输入完整的网址 (包含 https:// 或 http://)';
                exampleDiv.innerHTML = '示例: https://example.com';
                break;
            case 'wifi':
                textarea.placeholder = '输入WiFi信息，格式: WIFI:T:加密类型;S:网络名称;P:密码;;';
                exampleDiv.innerHTML = '示例: WIFI:T:WPA;S:MyNetwork;P:MyPassword;;';
                break;
            case 'contact':
                textarea.placeholder = '输入联系方式，格式: 姓名、电话、邮箱等信息';
                exampleDiv.innerHTML = '示例: 姓名: 张三\\n电话: 13800138000\\n邮箱: example@example.com';
                break;
        }
        
        exampleDiv.classList.remove('hidden');
    }

    switchShape(shape) {
        this.currentShape = shape;
        
        // 更新形状选项状态
        document.querySelectorAll('.shape-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`.shape-option[data-shape="${shape}"]`).classList.add('active');
        
        // 重新生成二维码
        if (this.qrCode) {
            this.generateQRCode();
        }
    }

    generateQRCode() {
        const content = document.getElementById('qr-content').value.trim();
        if (!content) {
            this.showNotification('请输入要生成二维码的内容', 'error');
            return;
        }

        // 显示加载状态
        const generateBtn = document.getElementById('generate-btn');
        const generateText = document.getElementById('generate-text');
        const generateSpinner = document.getElementById('generate-spinner');
        
        generateText.textContent = '生成中...';
        generateSpinner.classList.remove('hidden');
        generateBtn.disabled = true;

        // 清除旧的二维码
        const qrPreview = document.getElementById('qr-preview');
        qrPreview.innerHTML = '';
        
        // 获取选项值
        const size = parseInt(document.getElementById('qr-size').value);
        const color = document.getElementById('qr-color').value;
        const bgColor = document.getElementById('qr-bgcolor').value;
        const ecc = document.getElementById('qr-ecc').value;

        // 创建临时容器用于生成二维码数据
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);

        try {
            // 生成二维码数据
            this.qrCode = new QRCode(tempContainer, {
                text: content,
                width: size,
                height: size,
                colorDark: color,
                colorLight: bgColor,
                correctLevel: QRCode.CorrectLevel[ecc]
            });

            // 获取二维码模块数据
            const moduleCount = this.qrCode._oQRCode.moduleCount;
            const modules = this.qrCode._oQRCode.modules;
            const moduleSize = size / moduleCount;

            // 创建canvas用于自定义绘制
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            qrPreview.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            
            // 绘制背景
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, size, size);
            
            // 根据选择的形状绘制二维码
            ctx.fillStyle = color;
            
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (modules[row][col]) {
                        const x = col * moduleSize;
                        const y = row * moduleSize;
                        
                        this.drawModule(ctx, x, y, moduleSize);
                    }
                }
            }

            // 保存canvas用于下载
            this.qrCanvas = canvas;

            // 延迟显示下载按钮，确保二维码渲染完成
            setTimeout(() => {
                document.getElementById('qr-download').classList.remove('hidden');
                this.showNotification('二维码生成成功', 'success');
                
                // 恢复按钮状态
                generateText.textContent = '生成二维码';
                generateSpinner.classList.add('hidden');
                generateBtn.disabled = false;
                
                // 移除临时容器
                document.body.removeChild(tempContainer);
            }, 300);
        } catch (error) {
            this.showNotification('生成二维码时出错: ' + error.message, 'error');
            
            // 恢复按钮状态
            generateText.textContent = '生成二维码';
            generateSpinner.classList.add('hidden');
            generateBtn.disabled = false;
            
            // 移除临时容器
            document.body.removeChild(tempContainer);
        }
    }

    drawModule(ctx, x, y, size) {
        switch (this.currentShape) {
            case 'square':
                ctx.fillRect(x, y, size, size);
                break;
                
            case 'circle':
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI);
                ctx.fill();
                break;
                
            case 'rounded':
                const radius = size / 4;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + size - radius, y);
                ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
                ctx.lineTo(x + size, y + size - radius);
                ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
                ctx.lineTo(x + radius, y + size);
                ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'dots':
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/3, 0, 2 * Math.PI);
                ctx.fill();
                break;
                
            default:
                ctx.fillRect(x, y, size, size);
        }
    }

    downloadQRCode(format) {
        if (!this.qrCanvas) {
            this.showNotification('请先生成二维码', 'error');
            return;
        }

        try {
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = this.qrCanvas.toDataURL('image/png');
                link.click();
                this.showNotification('PNG图片下载成功', 'success');
            } else if (format === 'svg') {
                // 获取SVG代码
                const svgCode = this.getQRCodeSVG();
                const blob = new Blob([svgCode], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.download = 'qrcode.svg';
                link.href = url;
                link.click();
                
                // 清理URL对象
                setTimeout(() => URL.revokeObjectURL(url), 100);
                this.showNotification('SVG图片下载成功', 'success');
            }
        } catch (error) {
            this.showNotification('下载二维码时出错: ' + error.message, 'error');
        }
    }

    getQRCodeSVG() {
        const color = document.getElementById('qr-color').value;
        const bgColor = document.getElementById('qr-bgcolor').value;
        const size = parseInt(document.getElementById('qr-size').value);
        
        // 获取二维码模块数据
        const moduleCount = this.qrCode._oQRCode.moduleCount;
        const modules = this.qrCode._oQRCode.modules;
        
        // 计算每个模块的大小
        const moduleSize = size / moduleCount;
        
        // 构建SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
        svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
        
        // 添加二维码模块
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (modules[row][col]) {
                    const x = col * moduleSize;
                    const y = row * moduleSize;
                    
                    switch (this.currentShape) {
                        case 'square':
                            svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${color}"/>`;
                            break;
                            
                        case 'circle':
                            svg += `<circle cx="${x + moduleSize/2}" cy="${y + moduleSize/2}" r="${moduleSize/2}" fill="${color}"/>`;
                            break;
                            
                        case 'rounded':
                            const radius = moduleSize / 4;
                            svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${radius}" ry="${radius}" fill="${color}"/>`;
                            break;
                            
                        case 'dots':
                            svg += `<circle cx="${x + moduleSize/2}" cy="${y + moduleSize/2}" r="${moduleSize/3}" fill="${color}"/>`;
                            break;
                            
                        default:
                            svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${color}"/>`;
                    }
                }
            }
        }
        
        svg += '</svg>';
        return svg;
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

// 初始化二维码生成器
document.addEventListener('DOMContentLoaded', () => {
    const qrGenerator = new QRGenerator();
    window.qrGenerator = qrGenerator;
});