// minimalist_toolbox/frontend/js/tools/file_converter.js
class FileConverter {
    constructor() {
        this.supportedFormats = {
            'jpg': ['png', 'webp', 'gif'],
            'png': ['jpg', 'webp', 'gif'],
            'webp': ['jpg', 'png', 'gif'],
            'gif': ['jpg', 'png', 'webp', 'mp4'],
            'mp4': ['avi', 'mov', 'webm', 'gif'],
            'avi': ['mp4', 'mov', 'webm'],
            'mov': ['mp4', 'avi', 'webm'],
            'webm': ['mp4', 'avi', 'mov']
        };

        this.currentFile = null;
        this.selectedFormat = null;
        this.initEventListeners();
    }

    initEventListeners() {
        // 文件拖放区域事件
        const dropzone = document.getElementById('dropzone');
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.unhighlight, false);
        });

        dropzone.addEventListener('drop', this.handleDrop.bind(this), false);

        // 文件选择按钮
        document.getElementById('select-file-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleFile(e.target.files[0]);
            }
        });

        // 移除文件按钮
        document.getElementById('remove-file-btn').addEventListener('click', () => {
            this.resetConverter();
        });

        // 格式选择
        document.querySelectorAll('.format-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectFormat(e.currentTarget.getAttribute('data-format'));
            });
        });

        // 转换按钮
        document.getElementById('convert-btn').addEventListener('click', () => {
            this.startConversion();
        });

        // 下载按钮
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadFile();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        document.getElementById('dropzone').classList.add('active');
    }

    unhighlight() {
        document.getElementById('dropzone').classList.remove('active');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        this.handleFile(file);
    }

    handleFile(file) {
        // 检查文件类型是否为图片或视频
        const fileType = file.type;
        if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
            alert('请选择图片或视频文件！');
            return;
        }

        this.currentFile = file;
        this.updateFileInfo(file);
        this.showFileInfo();
        this.enableConvertButton();
        this.filterFormatOptions(fileType);
    }

    updateFileInfo(file) {
        document.getElementById('filename').textContent = file.name;
        document.getElementById('filesize').textContent = this.formatFileSize(file.size);
        document.getElementById('filetype').textContent = `文件类型: ${file.type}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showFileInfo() {
        document.getElementById('file-info').classList.remove('hidden');
        document.getElementById('conversion-options').classList.remove('hidden');
    }

    enableConvertButton() {
        document.getElementById('convert-btn').disabled = false;
    }

    filterFormatOptions(fileType) {
        // 根据文件类型显示/隐藏相关格式选项
        const isImage = fileType.startsWith('image/');
        const imageOptions = document.querySelectorAll('.format-option[data-format="jpg"], .format-option[data-format="png"], .format-option[data-format="webp"], .format-option[data-format="gif"]');
        const videoOptions = document.querySelectorAll('.format-option[data-format="mp4"], .format-option[data-format="avi"], .format-option[data-format="mov"], .format-option[data-format="webm"]');
        
        if (isImage) {
            imageOptions.forEach(opt => opt.style.display = 'block');
            videoOptions.forEach(opt => opt.style.display = 'none');
        } else {
            imageOptions.forEach(opt => opt.style.display = 'none');
            videoOptions.forEach(opt => opt.style.display = 'block');
        }
    }

    selectFormat(format) {
        this.selectedFormat = format;
        document.querySelectorAll('.format-option').forEach(option => {
            option.classList.remove('bg-indigo-100', 'dark:bg-indigo-900');
        });
        document.querySelector(`.format-option[data-format="${format}"]`).classList.add('bg-indigo-100', 'dark:bg-indigo-900');
    }

    startConversion() {
        if (!this.currentFile || !this.selectedFormat) return;

        this.showProgressBar();
        this.simulateConversion();
    }

    showProgressBar() {
        document.getElementById('progress-container').classList.remove('hidden');
        document.getElementById('convert-btn').disabled = true;
    }

    simulateConversion() {
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');

        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.showResult();
                }, 500);
            }
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.round(progress)}%`;
        }, 300);
    }

    showResult() {
        document.getElementById('result-container').classList.remove('hidden');
    }

    downloadFile() {
        if (!this.currentFile) return;
        
        const originalName = this.currentFile.name;
        const extension = originalName.split('.').pop();
        const newName = originalName.replace(`.${extension}`, `.${this.selectedFormat}`);
        
        // 在实际应用中，这里应该调用后端API进行文件转换
        // 这里只是模拟下载原始文件
        const url = URL.createObjectURL(this.currentFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = newName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetConverter() {
        this.currentFile = null;
        this.selectedFormat = null;
        
        document.getElementById('file-info').classList.add('hidden');
        document.getElementById('conversion-options').classList.add('hidden');
        document.getElementById('progress-container').classList.add('hidden');
        document.getElementById('result-container').classList.add('hidden');
        document.getElementById('convert-btn').disabled = true;
        document.getElementById('file-input').value = '';
        
        document.querySelectorAll('.format-option').forEach(option => {
            option.classList.remove('bg-indigo-100', 'dark:bg-indigo-900');
            option.style.display = 'block'; // 重置显示所有选项
        });
    }
}

// 初始化文件转换器
document.addEventListener('DOMContentLoaded', () => {
    const fileConverter = new FileConverter();
    window.fileConverter = fileConverter;
});