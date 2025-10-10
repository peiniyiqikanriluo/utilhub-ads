// minimalist_toolbox/frontend/js/tools/base64_converter.js
class Base64Converter {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('encode-btn').addEventListener('click', () => {
            this.encodeText();
        });

        document.getElementById('decode-btn').addEventListener('click', () => {
            this.decodeText();
        });

        document.getElementById('copy-base64-btn').addEventListener('click', () => {
            this.copyToClipboard('encode-output');
        });

        document.getElementById('copy-text-btn').addEventListener('click', () => {
            this.copyToClipboard('decode-output');
        });

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // 输入框变化时自动转换
        document.getElementById('encode-input').addEventListener('input', () => {
            this.autoEncode();
        });

        document.getElementById('decode-input').addEventListener('input', () => {
            this.autoDecode();
        });
    }

    encodeText() {
        const text = document.getElementById('encode-input').value;
        if (!text) {
            this.showError('请输入要编码的文本');
            return;
        }
        
        try {
            // 处理Unicode字符
            const utf8Text = unescape(encodeURIComponent(text));
            const base64 = btoa(utf8Text);
            document.getElementById('encode-output').value = base64;
        } catch (e) {
            document.getElementById('encode-output').value = '编码失败: 输入包含非ASCII字符';
        }
    }

    decodeText() {
        const base64 = document.getElementById('decode-input').value.trim();
        if (!base64) {
            this.showError('请输入Base64编码');
            return;
        }
        
        // 移除可能的数据URI前缀
        const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
        
        try {
            // 处理Unicode字符
            const utf8Text = atob(cleanBase64);
            const text = decodeURIComponent(escape(utf8Text));
            document.getElementById('decode-output').value = text;
        } catch (e) {
            document.getElementById('decode-output').value = '解码失败: 无效的Base64编码';
        }
    }

    autoEncode() {
        const text = document.getElementById('encode-input').value;
        if (!text) {
            document.getElementById('encode-output').value = '';
            return;
        }
        
        try {
            const utf8Text = unescape(encodeURIComponent(text));
            const base64 = btoa(utf8Text);
            document.getElementById('encode-output').value = base64;
        } catch (e) {
            // 输入过程中可能产生无效字符，不显示错误
        }
    }

    autoDecode() {
        const base64 = document.getElementById('decode-input').value.trim();
        if (!base64) {
            document.getElementById('decode-output').value = '';
            return;
        }
        
        const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
        
        try {
            const utf8Text = atob(cleanBase64);
            const text = decodeURIComponent(escape(utf8Text));
            document.getElementById('decode-output').value = text;
        } catch (e) {
            // 输入过程中可能产生无效Base64，不显示错误
        }
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element.value) {
            this.showError('没有内容可复制');
            return;
        }
        
        element.select();
        element.setSelectionRange(0, 99999); // 对于移动设备
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast('已复制到剪贴板');
            } else {
                this.showError('复制失败');
            }
        } catch (err) {
            // 使用现代 Clipboard API
            navigator.clipboard.writeText(element.value).then(() => {
                this.showToast('已复制到剪贴板');
            }).catch(err => {
                this.showError('复制失败: ' + err);
            });
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        document.getElementById(tabId).classList.remove('hidden');
    }

    showToast(message) {
        // 创建或显示Toast通知
        let toast = document.getElementById('base64-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'base64-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            toast.style.color = 'white';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = '1000';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    showError(message) {
        this.showToast(message);
    }
}

// Initialize Base64 Converter
document.addEventListener('DOMContentLoaded', () => {
    const base64Converter = new Base64Converter();
    window.base64Converter = base64Converter;
});