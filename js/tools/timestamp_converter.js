
<!-- minimalist_toolbox/frontend/js/tools/timestamp_converter.js -->
class TimestampConverter {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('convert-to-date-btn').addEventListener('click', () => {
            this.convertToDate();
        });

        document.getElementById('convert-to-timestamp-btn').addEventListener('click', () => {
            this.convertToTimestamp();
        });
    }

    convertToDate() {
        const timestamp = document.getElementById('timestamp-input').value.trim();
        const unit = document.getElementById('timestamp-unit').value;
        
        if (!timestamp) {
            document.getElementById('date-result').textContent = '请输入时间戳';
            return;
        }

        let date;
        if (unit === 'seconds') {
            date = new Date(parseInt(timestamp) * 1000);
        } else {
            date = new Date(parseInt(timestamp));
        }

        if (isNaN(date.getTime())) {
            document.getElementById('date-result').textContent = '无效的时间戳';
            return;
        }

        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        document.getElementById('date-result').textContent = date.toLocaleString('zh-CN', options);
    }

    convertToTimestamp() {
        const dateString = document.getElementById('date-input').value;
        
        if (!dateString) {
            document.getElementById('timestamp-result').textContent = '请选择日期';
            return;
        }

        const date = new Date(dateString);
        const unit = document.getElementById('output-unit').value;
        
        let timestamp;
        if (unit === 'seconds') {
            timestamp = Math.floor(date.getTime() / 1000);
        } else {
            timestamp = date.getTime();
        }

        document.getElementById('timestamp-result').textContent = timestamp;
    }
}

// Initialize Timestamp Converter
document.addEventListener('DOMContentLoaded', () => {
    const timestampConverter = new TimestampConverter();
    window.timestampConverter = timestampConverter;
    
    // Set current date as default
    document.getElementById('date-input').valueAsDate = new Date();
});
