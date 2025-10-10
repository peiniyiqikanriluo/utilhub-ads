// minimalist_toolbox/frontend/js/tools/json_formatter.js
class JSONFormatter {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.initEditor();
    }

    initElements() {
        this.jsonInput = document.getElementById('json-input');
        this.jsonOutput = document.getElementById('json-output');
        this.formatBtn = document.getElementById('format-btn');
        this.minifyBtn = document.getElementById('minify-btn');
        this.validateBtn = document.getElementById('validate-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.errorContainer = document.getElementById('error-container');
        this.errorMessage = document.getElementById('error-message');
    }

    bindEvents() {
        this.formatBtn.addEventListener('click', () => this.formatJSON());
        this.minifyBtn.addEventListener('click', () => this.minifyJSON());
        this.validateBtn.addEventListener('click', () => this.validateJSON());
        this.copyBtn.addEventListener('click', () => this.copyJSON());
        
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.formatJSON();
            }
        });
        
        // 输入变化时自动验证
        this.jsonInput.addEventListener('input', () => {
            this.clearError();
        });
    }

    initEditor() {
        // 示例JSON
        const exampleJson = {
            "name": "极简工具箱",
            "description": "多功能在线工具集合",
            "version": 1.0,
            "features": ["JSON格式化", "密码生成", "文件转换"],
            "active": true,
            "metadata": {
                "author": "开发者",
                "created": "2023-01-01"
            }
        };
        this.jsonInput.value = JSON.stringify(exampleJson, null, 2);
        this.formatJSON();
    }

    formatJSON() {
        try {
            const jsonObj = JSON.parse(this.jsonInput.value);
            const formattedJson = JSON.stringify(jsonObj, null, 2);
            this.jsonOutput.textContent = formattedJson;
            this.clearError();
            this.highlightJSON();
        } catch (e) {
            this.showError(e.message);
            this.highlightError(e);
        }
    }

    minifyJSON() {
        try {
            const jsonObj = JSON.parse(this.jsonInput.value);
            const minifiedJson = JSON.stringify(jsonObj);
            this.jsonOutput.textContent = minifiedJson;
            this.clearError();
            this.highlightJSON();
        } catch (e) {
            this.showError(e.message);
            this.highlightError(e);
        }
    }

    validateJSON() {
        try {
            JSON.parse(this.jsonInput.value);
            this.jsonOutput.textContent = '✅ JSON格式正确';
            this.clearError();
        } catch (e) {
            this.showError(e.message);
            this.highlightError(e);
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorContainer.classList.remove('hidden');
    }
    
    clearError() {
        this.errorContainer.classList.add('hidden');
    }

    highlightError(error) {
        if (error instanceof SyntaxError) {
            const match = error.message.match(/position (\d+)/);
            if (match) {
                const pos = parseInt(match[1]);
                this.jsonInput.focus();
                
                // 尝试滚动到错误位置
                this.jsonInput.setSelectionRange(pos, pos + 1);
                
                // 计算错误所在行
                const textBeforeError = this.jsonInput.value.substring(0, pos);
                const lineNumber = textBeforeError.split('\n').length;
                const lines = textBeforeError.split('\n');
                const columnNumber = lines[lines.length - 1].length + 1;
                
                // 在错误信息中添加行号和列号
                this.errorMessage.textContent += ` (行: ${lineNumber}, 列: ${columnNumber})`;
                
                // 滚动到错误行
                const lineHeight = this.jsonInput.scrollHeight / this.jsonInput.rows;
                this.jsonInput.scrollTop = (lineNumber - 5) * lineHeight;
            }
        }
    }

    highlightJSON() {
        const jsonText = this.jsonOutput.textContent;
        if (!jsonText) return;

        // 改进的语法高亮
        this.jsonOutput.innerHTML = jsonText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, match => {
                // 键
                if (/:$/.test(match)) {
                    return `<span class="text-indigo-600 dark:text-indigo-400">${match}</span>`;
                }
                // 字符串值
                return `<span class="text-green-600 dark:text-green-400">${match}</span>`;
            })
            .replace(/\b(true|false)\b/g, match => {
                // 布尔值
                return `<span class="text-blue-600 dark:text-blue-400">${match}</span>`;
            })
            .replace(/\b(null)\b/g, match => {
                // null值
                return `<span class="text-gray-600 dark:text-gray-400">${match}</span>`;
            })
            .replace(/-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, match => {
                // 数字
                return `<span class="text-purple-600 dark:text-purple-400">${match}</span>`;
            });
    }

    copyJSON() {
        const textToCopy = this.jsonOutput.textContent;
        if (!textToCopy || textToCopy === '格式化后的JSON将显示在这里') return;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<span class="text-xl mr-2">✅</span>已复制';
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            // 备用复制方法
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<span class="text-xl mr-2">✅</span>已复制';
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
            }, 2000);
        });
    }
}

// Initialize JSON Formatter
document.addEventListener('DOMContentLoaded', () => {
    const jsonFormatter = new JSONFormatter();
    window.jsonFormatter = jsonFormatter;
});