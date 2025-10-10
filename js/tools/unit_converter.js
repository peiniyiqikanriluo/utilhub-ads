// minimalist_toolbox/frontend/js/tools/unit_converter.js
class UnitConverter {
    constructor() {
        this.initEventListeners();
        this.setupInputHandlers();
    }

    initEventListeners() {
        // 长度转换
        document.getElementById('length-convert-btn').addEventListener('click', () => {
            this.convertLength();
        });

        // 重量转换
        document.getElementById('weight-convert-btn').addEventListener('click', () => {
            this.convertWeight();
        });

        // 温度转换
        document.getElementById('temp-convert-btn').addEventListener('click', () => {
            this.convertTemperature();
        });

        // 时间转换
        document.getElementById('time-convert-btn').addEventListener('click', () => {
            this.convertTime();
        });

        // 数据存储转换
        document.getElementById('data-convert-btn').addEventListener('click', () => {
            this.convertData();
        });

        // 速度转换
        document.getElementById('speed-convert-btn').addEventListener('click', () => {
            this.convertSpeed();
        });
    }

    setupInputHandlers() {
        // 为所有输入框添加回车键支持
        const inputs = [
            'length-input', 'weight-input', 'temp-input', 
            'time-input', 'data-input', 'speed-input'
        ];
        
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // 找到对应的转换按钮并触发点击
                    const type = id.split('-')[0];
                    document.getElementById(`${type}-convert-btn`).click();
                }
            });
        });
    }

    convertLength() {
        const value = parseFloat(document.getElementById('length-input').value);
        if (isNaN(value)) {
            this.showError('length-result', '请输入有效数字');
            return;
        }
        
        const from = document.getElementById('length-from').value;
        const to = document.getElementById('length-to').value;
        const result = this.calculateLength(value, from, to);
        document.getElementById('length-result').textContent = this.formatResult(result);
    }

    calculateLength(value, from, to) {
        const units = {
            mm: 1,
            cm: 10,
            m: 1000,
            km: 1000000,
            in: 25.4,
            ft: 304.8,
            yd: 914.4,
            mi: 1609344
        };
        return (value * units[from]) / units[to];
    }

    convertWeight() {
        const value = parseFloat(document.getElementById('weight-input').value);
        if (isNaN(value)) {
            this.showError('weight-result', '请输入有效数字');
            return;
        }
        
        const from = document.getElementById('weight-from').value;
        const to = document.getElementById('weight-to').value;
        const result = this.calculateWeight(value, from, to);
        document.getElementById('weight-result').textContent = this.formatResult(result);
    }

    calculateWeight(value, from, to) {
        const units = {
            mg: 1,
            g: 1000,
            kg: 1000000,
            t: 1000000000,
            oz: 28349.5,
            lb: 453592
        };
        return (value * units[from]) / units[to];
    }

    convertTemperature() {
        const value = parseFloat(document.getElementById('temp-input').value);
        if (isNaN(value)) {
            this.showError('temp-result', '请输入有效数字');
            return;
        }
        
        const from = document.getElementById('temp-from').value;
        const to = document.getElementById('temp-to').value;
        const result = this.calculateTemperature(value, from, to);
        document.getElementById('temp-result').textContent = this.formatResult(result);
    }

    calculateTemperature(value, from, to) {
        if (from === to) return value;
        
        // 先转换为摄氏度
        let celsius;
        if (from === 'c') {
            celsius = value;
        } else if (from === 'f') {
            celsius = (value - 32) * 5 / 9;
        } else if (from === 'k') {
            celsius = value - 273.15;
        }
        
        // 从摄氏度转换为目标单位
        if (to === 'c') {
            return celsius;
        } else if (to === 'f') {
            return celsius * 9 / 5 + 32;
        } else if (to === 'k') {
            return celsius + 273.15;
        }
    }

    convertTime() {
        const value = parseFloat(document.getElementById('time-input').value);
        if (isNaN(value)) {
            this.showError('time-result', '请输入有效数字');
            return;
        }
        
        const from = document.getElementById('time-from').value;
        const to = document.getElementById('time-to').value;
        const result = this.calculateTime(value, from, to);
        document.getElementById('time-result').textContent = this.formatResult(result);
    }

    calculateTime(value, from, to) {
        const units = {
            ms: 1,
            s: 1000,
            min: 60000,
            h: 3600000,
            d: 86400000
        };
        return (value * units[from]) / units[to];
    }

    convertData() {
        const value = parseFloat(document.getElementById('data-input').value);
        if (isNaN(value)) {
            this.showError('data-result', '请输入有效数字');
            return;
        }
        
        const from = document.getElementById('data-from').value;
        const to = document.getElementById('data-to').value;
        const result = this.calculateData(value, from, to);
        document.getElementById('data-result').textContent = this.formatResult(result);
    }

    calculateData(value, from, to) {
        const units = {
            b: 1,
            B: 8,
            KB: 8 * 1024,
            MB: 8 * 1024 * 1024,
            GB: 8 * 1024 * 1024 * 1024,
            TB: 8 * 1024 * 1024 * 1024 * 1024
        };
        return (value * units[from]) / units[to];
    }

    convertSpeed() {
        const value = parseFloat(document.getElementById('speed-input').value);
        if (isNaN(value)) {
            this.showError('speed-result', '请输入有效数字');
            return;
        }
        
        const from = document.getElementById('speed-from').value;
        const to = document.getElementById('speed-to').value;
        const result = this.calculateSpeed(value, from, to);
        document.getElementById('speed-result').textContent = this.formatResult(result);
    }

    calculateSpeed(value, from, to) {
        const units = {
            mps: 1,
            kph: 0.277778,
            mph: 0.44704,
            knot: 0.514444
        };
        return (value * units[from]) / units[to];
    }

    formatResult(value) {
        // 处理极大或极小的数字，使用科学计数法显示
        if (value !== 0 && (Math.abs(value) >= 1e6 || Math.abs(value) <= 1e-6)) {
            return value.toExponential(6);
        }
        
        // 处理小数点后多位零的情况
        const fixed = value.toFixed(10);
        const withoutTrailingZeros = fixed.replace(/\.?0+$/, '');
        
        // 如果小数点后位数超过6位，限制为6位
        if (withoutTrailingZeros.includes('.')) {
            const parts = withoutTrailingZeros.split('.');
            if (parts[1].length > 6) {
                return value.toFixed(6);
            }
        }
        
        return withoutTrailingZeros;
    }

    showError(elementId, message) {
        document.getElementById(elementId).textContent = message;
        document.getElementById(elementId).classList.add('text-red-500');
        
        // 3秒后恢复原状
        setTimeout(() => {
            document.getElementById(elementId).classList.remove('text-red-500');
            document.getElementById(elementId).textContent = '0';
        }, 3000);
    }
}

// 初始化单位转换器
document.addEventListener('DOMContentLoaded', () => {
    const unitConverter = new UnitConverter();
    window.unitConverter = unitConverter;
});