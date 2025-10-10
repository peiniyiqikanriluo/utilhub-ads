
// minimalist_toolbox/frontend/js/tools/color_picker.js
class ColorPicker {
    constructor() {
        this.currentColor = '#3b82f6';
        this.currentFormat = 'hex';
        this.initElements();
        this.bindEvents();
        this.updateColor(this.currentColor);
    }

    initElements() {
        this.colorPicker = document.getElementById('color-picker');
        this.redSlider = document.getElementById('red-slider');
        this.greenSlider = document.getElementById('green-slider');
        this.blueSlider = document.getElementById('blue-slider');
        this.alphaSlider = document.getElementById('alpha-slider');
        this.colorPreview = document.getElementById('color-preview');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.hexCode = document.getElementById('hex-code');
        this.rgbCode = document.getElementById('rgb-code');
        this.hslCode = document.getElementById('hsl-code');
        this.cmykCode = document.getElementById('cmyk-code');
        this.copyBtn = document.getElementById('copy-btn');
        this.whiteContrast = document.getElementById('white-contrast');
        this.blackContrast = document.getElementById('black-contrast');
    }

    bindEvents() {
        this.colorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.updateSlidersFromHex(this.currentColor);
            this.updateColor(this.currentColor);
        });

        [this.redSlider, this.greenSlider, this.blueSlider, this.alphaSlider].forEach(slider => {
            slider.addEventListener('input', () => this.updateColorFromSliders());
        });

        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentFormat = button.getAttribute('data-format');
                this.updateCodeDisplay();
            });
        });

        this.copyBtn.addEventListener('click', () => this.copyColorCode());
    }

    updateColor(color) {
        this.colorPreview.style.backgroundColor = color;
        this.colorPicker.value = color;
        this.updateCodeValues();
        this.updateContrastTest();
    }

    updateColorFromSliders() {
        const r = this.redSlider.value;
        const g = this.greenSlider.value;
        const b = this.blueSlider.value;
        const a = this.alphaSlider.value / 100;
        
        this.currentColor = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
        this.colorPicker.value = this.rgbToHex(r, g, b);
        this.updateColor(this.currentColor);
    }

    updateSlidersFromHex(hex) {
        const rgb = this.hexToRgb(hex);
        if (rgb) {
            this.redSlider.value = rgb.r;
            this.greenSlider.value = rgb.g;
            this.blueSlider.value = rgb.b;
        }
    }

    updateCodeValues() {
        const rgb = this.hexToRgb(this.currentColor);
        if (!rgb) return;

        this.hexCode.textContent = this.currentColor;
        this.rgbCode.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        this.hslCode.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

        const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);
        this.cmykCode.textContent = `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`;
    }

    updateCodeDisplay() {
        [this.hexCode, this.rgbCode, this.hslCode, this.cmykCode].forEach(el => el.classList.add('hidden'));
        document.getElementById(`${this.currentFormat}-code`).classList.remove('hidden');
    }

    updateContrastTest() {
        const rgb = this.hexToRgb(this.currentColor);
        if (!rgb) return;

        const contrastWhite = this.getContrastRatio(rgb, {r: 255, g: 255, b: 255});
        const contrastBlack = this.getContrastRatio(rgb, {r: 0, g: 0, b: 0});

        this.whiteContrast.style.backgroundColor = this.currentColor;
        this.whiteContrast.style.color = contrastWhite >= 4.5 ? '#000' : '#fff';
        this.whiteContrast.innerHTML = `<span class="font-medium">AA: ${contrastWhite >= 4.5 ? '通过' : '不通过'}</span><br>${contrastWhite.toFixed(2)}:1`;

        this.blackContrast.style.backgroundColor = this.currentColor;
        this.blackContrast.style.color = contrastBlack >= 4.5 ? '#000' : '#fff';
        this.blackContrast.innerHTML = `<span class="font-medium">AA: ${contrastBlack >= 4.5 ? '通过' : '不通过'}</span><br>${contrastBlack.toFixed(2)}:1`;
    }

    copyColorCode() {
        const codeToCopy = document.getElementById(`${this.currentFormat}-code`).textContent;
        navigator.clipboard.writeText(codeToCopy).then(() => {
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<span class="text-xl mr-2">✅</span>已复制';
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
            }, 2000);
        });
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    rgbToCmyk(r, g, b) {
        if (r === 0 && g === 0 && b === 0) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }

        let c = 1 - (r / 255);
        let m = 1 - (g / 255);
        let y = 1 - (b / 255);
        let k = Math.min(c, m, y);

        c = (c - k) / (1 - k) * 100;
        m = (m - k) / (1 - k) * 100;
        y = (y - k) / (1 - k) * 100;
        k = k * 100;

        return { c, m, y, k };
    }

    getContrastRatio(color1, color2) {
        const luminance1 = this.getLuminance(color1);
        const luminance2 = this.getLuminance(color2);
        return (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
    }

    getLuminance(color) {
        const r = color.r / 255;
        const g = color.g / 255;
        const b = color.b / 255;
        
        const sr = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const sg = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const sb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        
        return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
    }
}

// Initialize Color Picker
document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = new ColorPicker();
    window.colorPicker = colorPicker;
});
