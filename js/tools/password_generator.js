
<!-- minimalist_toolbox/frontend/js/tools/password_generator.js -->
class PasswordGenerator {
    constructor() {
        this.charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generatePassword();
        });

        document.getElementById('copy-btn').addEventListener('click', () => {
            this.copyToClipboard();
        });

        document.getElementById('length-range').addEventListener('input', (e) => {
            document.getElementById('length-value').textContent = e.target.value;
        });
    }

    generatePassword() {
        const length = parseInt(document.getElementById('length-range').value);
        const includeUppercase = document.getElementById('uppercase').checked;
        const includeLowercase = document.getElementById('lowercase').checked;
        const includeNumbers = document.getElementById('numbers').checked;
        const includeSymbols = document.getElementById('symbols').checked;

        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            alert('请至少选择一种字符类型');
            return;
        }

        let charset = '';
        if (includeUppercase) charset += this.charSets.uppercase;
        if (includeLowercase) charset += this.charSets.lowercase;
        if (includeNumbers) charset += this.charSets.numbers;
        if (includeSymbols) charset += this.charSets.symbols;

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        document.getElementById('password-output').value = password;
        this.updatePasswordStrength(password);
        this.addToHistory(password);
    }

    updatePasswordStrength(password) {
        let strength = 0;
        
        // 长度评分
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // 字符多样性评分
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // 限制最大强度为4
        strength = Math.min(strength, 4);
        
        // 更新UI
        const strengthMeter = document.getElementById('strength-meter');
        strengthMeter.className = `strength-meter rounded-full mb-2 strength-${strength}`;
        
        const strengthLabels = ['非常弱', '弱', '中等', '强', '非常强'];
        document.getElementById('strength-text').textContent = strengthLabels[strength];
    }

    addToHistory(password) {
        if (this.passwordHistory.includes(password)) return;
        
        this.passwordHistory.push(password);
        if (this.passwordHistory.length > 10) {
            this.passwordHistory = this.passwordHistory.slice(-10);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyContainer = document.getElementById('history-container');
        
        if (this.passwordHistory.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">暂无历史记录</p>';
            return;
        }

        historyContainer.innerHTML = '';
        this.passwordHistory.slice().reverse().forEach((password, index) => {
            if (index >= 5) return;
            
            const historyItem = document.createElement('div');
            historyItem.className = 'flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600';
            
            const passwordText = document.createElement('span');
            passwordText.className = 'font-mono text-sm';
            passwordText.textContent = password;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300';
            copyBtn.innerHTML = '<span class="text-sm">📋</span>';
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(password);
                this.showCopyFeedback(copyBtn);
            });
            
            historyItem.appendChild(passwordText);
            historyItem.appendChild(copyBtn);
            historyContainer.appendChild(historyItem);
        });
    }

    copyToClipboard(text = null) {
        const password = text || document.getElementById('password-output').value;
        if (!password) return;

        navigator.clipboard.writeText(password).then(() => {
            this.showCopyFeedback();
        }).catch(err => {
            console.error('无法复制文本: ', err);
        });
    }

    showCopyFeedback(element = null) {
        const btn = element || document.getElementById('copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="text-xl">✅</span>';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }
}

// 初始化密码生成器
document.addEventListener('DOMContentLoaded', () => {
    const passwordGenerator = new PasswordGenerator();
    passwordGenerator.generatePassword();
    passwordGenerator.updateHistoryDisplay();
    window.passwordGenerator = passwordGenerator;
});
