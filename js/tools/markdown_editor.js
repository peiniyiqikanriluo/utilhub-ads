class MarkdownEditor {
            constructor() {
                this.editor = document.getElementById('markdown-input');
                this.preview = document.getElementById('markdown-preview');
                this.editorSplit = document.getElementById('markdown-input-split');
                this.previewSplit = document.getElementById('markdown-preview-split');
                this.downloadBtn = document.getElementById('download-btn');
                this.downloadOptions = document.getElementById('download-options');
                this.themeToggle = document.getElementById('theme-toggle');
                
                this.initEventListeners();
                this.updatePreview();
                
                // 同步分屏编辑器内容
                this.editorSplit.value = this.editor.value;
                this.updateSplitPreview();

                // 初始化主题
                this.initTheme();
            }

            initEventListeners() {
                this.editor.addEventListener('input', () => {
                    this.updatePreview();
                    this.editorSplit.value = this.editor.value;
                    this.updateSplitPreview();
                });

                this.editorSplit.addEventListener('input', () => {
                    this.editor.value = this.editorSplit.value;
                    this.updatePreview();
                    this.updateSplitPreview();
                });

                // 标签切换
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const tabId = button.getAttribute('data-tab');
                        this.switchTab(tabId);
                    });
                });

                // 下载按钮事件
                this.downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.downloadOptions.style.display = 
                        this.downloadOptions.style.display === 'block' ? 'none' : 'block';
                });

                // 下载选项事件
                this.downloadOptions.querySelectorAll('button').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const format = e.target.getAttribute('data-format');
                        this.downloadContent(format);
                        this.downloadOptions.style.display = 'none';
                    });
                });

                // 点击页面其他地方关闭下载选项
                document.addEventListener('click', (e) => {
                    if (e.target !== this.downloadBtn && !this.downloadBtn.contains(e.target)) {
                        this.downloadOptions.style.display = 'none';
                    }
                });

                // 工具栏事件
                document.querySelectorAll('.toolbar button').forEach(button => {
                    button.addEventListener('click', () => {
                        const action = button.getAttribute('data-action');
                        this.toolbarAction(action);
                    });
                });

                // 主题切换事件
                this.themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }

            initTheme() {
                const savedTheme = localStorage.getItem('theme') || 'light';
                if (savedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    this.themeToggle.textContent = '☀️';
                } else {
                    document.documentElement.classList.remove('dark');
                    this.themeToggle.textContent = '🌙';
                }
            }

            toggleTheme() {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                    this.themeToggle.textContent = '🌙';
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    this.themeToggle.textContent = '☀️';
                }
                
                // 更新预览以应用新的主题样式
                this.updatePreview();
                this.updateSplitPreview();
            }

            updatePreview() {
                const markdown = this.editor.value;
                const html = marked.parse(markdown);
                this.preview.innerHTML = html;
                this.highlightCodeBlocks(this.preview);
            }

            updateSplitPreview() {
                const markdown = this.editorSplit.value;
                const html = marked.parse(markdown);
                this.previewSplit.innerHTML = html;
                this.highlightCodeBlocks(this.previewSplit);
            }

            highlightCodeBlocks(container) {
                container.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            }

            switchTab(tabId) {
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
                
                document.querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.add('hidden');
                });
                
                document.getElementById(tabId).classList.remove('hidden');
                
                // 更新当前显示的预览
                if (tabId === 'preview') {
                    this.updatePreview();
                } else if (tabId === 'both') {
                    this.updateSplitPreview();
                }
            }

            downloadContent(format) {
                const content = this.editor.value;
                const filename = `markdown_document_${new Date().toISOString().slice(0, 10)}`;
                
                switch(format) {
                    case 'md':
                        this.downloadFile(content, `${filename}.md`, 'text/markdown');
                        break;
                    case 'html':
                        const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body { font-family: 'Noto Sans SC', sans-serif; line-height: 1.6; margin: 0 auto; max-width: 800px; padding: 20px; }
        pre { background-color: #f6f8fa; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        code { background-color: #f6f8fa; padding: 0.2rem 0.4rem; border-radius: 0.3rem; font-family: monospace; }
        img { max-width: 100%; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 0.5rem; border: 1px solid #ddd; }
        blockquote { border-left: 4px solid #4f46e5; padding-left: 1rem; margin-left: 0; color: #666; }
        h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; }
    </style>
</head>
<body>
    <div class="markdown-body">${marked.parse(content)}</div>
</body>
</html>`;
                        this.downloadFile(htmlContent, `${filename}.html`, 'text/html');
                        break;
                    case 'pdf':
                        this.generatePDF(filename);
                        break;
                }
            }

            downloadFile(content, filename, mimeType) {
                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            async generatePDF(filename) {
                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    
                    // 获取HTML内容
                    const content = marked.parse(this.editor.value);
                    
                    // 创建临时div来保存内容
                    const tempDiv = document.createElement('div');
                    tempDiv.className = 'markdown-body';
                    tempDiv.innerHTML = content;
                    tempDiv.style.width = '800px';
                    tempDiv.style.padding = '20px';
                    tempDiv.style.background = 'white';
                    tempDiv.style.color = 'black';
                    document.body.appendChild(tempDiv);
                    
                    // 使用html2canvas将HTML转换为canvas
                    const canvas = await html2canvas(tempDiv, {
                        scale: 2,
                        useCORS: true,
                        logging: false
                    });
                    
                    // 从canvas创建图像
                    const imgData = canvas.toDataURL('image/png');
                    
                    // 计算PDF尺寸
                    const imgWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    
                    let heightLeft = imgHeight;
                    let position = 0;
                    
                    // 添加第一页
                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    
                    // 添加更多页（如果需要）
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        doc.addPage();
                        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    
                    // 保存PDF
                    doc.save(`${filename}.pdf`);
                    
                    // 清理临时元素
                    document.body.removeChild(tempDiv);
                } catch (error) {
                    console.error('生成PDF时出错:', error);
                    alert('生成PDF时出错，请尝试其他格式或刷新页面重试。');
                }
            }

            toolbarAction(action) {
                const textarea = this.editor;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = textarea.value.substring(start, end);
                let newText = '';

                switch(action) {
                    case 'bold':
                        newText = selectedText ? `**${selectedText}**` : '**粗体文字**';
                        break;
                    case 'italic':
                        newText = selectedText ? `*${selectedText}*` : '*斜体文字*';
                        break;
                    case 'heading':
                        newText = selectedText ? `## ${selectedText}` : '## 标题';
                        break;
                    case 'link':
                        newText = selectedText ? `[${selectedText}](https://example.com)` : '[链接文字](https://example.com)';
                        break;
                    case 'image':
                        newText = selectedText ? `![${selectedText}](https://example.com/image.jpg)` : '![图片描述](https://example.com/image.jpg)';
                        break;
                    case 'code':
                        newText = selectedText ? "```\n" + selectedText + "\n```" : '```\n代码块\n```';
                        break;
                    case 'quote':
                        newText = selectedText ? `> ${selectedText}` : '> 引用文字';
                        break;
                    case 'ul':
                        newText = selectedText ? selectedText.split('\n').map(line => `- ${line}`).join('\n') : '- 列表项';
                        break;
                    case 'ol':
                        newText = selectedText ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') : '1. 列表项';
                        break;
                }

                // 替换选中文本
                textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
                
                // 更新预览
                this.updatePreview();
                this.editorSplit.value = textarea.value;
                this.updateSplitPreview();
                
                // 重新聚焦到文本区域
                textarea.focus();
            }
        }

        // Initialize Markdown Editor
        document.addEventListener('DOMContentLoaded', () => {
            const markdownEditor = new MarkdownEditor();
            window.markdownEditor = markdownEditor;
        });