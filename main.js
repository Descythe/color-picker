/** ******************************** */
/** ********** VARIABLES *********** */
/** ******************************** */

let _rgb = [
    document.querySelector('#r'),
    document.querySelector('#g'),
    document.querySelector('#b')
];

let hex = document.querySelector('#hex'),
    rgb = document.querySelector('#rgb'),
    hsl = document.querySelector('#hsl'),
    cmyk = document.querySelector('#cmyk');
    
let colorPicker = document.querySelector('input[type=color]');

/** ******************************** */
/** ************ IMAGE ************* */
/** ******************************** */

let canvas = document.querySelector('#canvas'),
    ctx = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 720;

function displayImage(file) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var reader = new FileReader();
    reader.onload = (e) => {
        var img = new Image();
            img.onload = () => {
                let hRatio = canvas.width / img.width,
                    vRatio = canvas.height / img.height,
                    ratio = Math.min(hRatio, vRatio),
                    centerShift_x = (canvas.width - img.width * ratio) / 2,
                    centerShift_y = (canvas.height - img.height * ratio) / 2;  
                ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
            }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

canvas.addEventListener('click', (e) => {
    let rect = e.target.getBoundingClientRect(),
        data = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1).data;

    for(let [i, element] of _rgb.entries()) {
        element.value = data[i];
    }
    display();
})

/** ******************************** */
/** ********* DRAG & DROP ********** */
/** ******************************** */

document.querySelector('#image').addEventListener('change', (e) => {
    displayImage(e.target.files[0]);
});

let dragAndDrop = document.querySelector('.dragAndDrop');

dragAndDrop.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; 
}, false);

dragAndDrop.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();

    displayImage(e.dataTransfer.files[0]);
}, false);

/** ******************************** */
/** ********** FUNCTIONS *********** */
/** ******************************** */

function display(call) {
    let r = parseInt(_rgb[0].value), g = parseInt(_rgb[1].value), b = parseInt(_rgb[2].value);
    rgb.value = `rgb(${r}, ${g}, ${b})`;

    if(call != 'hex') {
        hex.value = _RGBtoHEX(r, g, b);
    }

    if(call != 'hsl') {
        let _hsl = _RGBtoHSL(r, g, b);
        hsl.value = `hsl(${_hsl[0]}, ${_hsl[1]}%, ${_hsl[2]}%)`;
    }

    if(call != 'cmyk') {
        let _cmyk = _RGBtoCMYK(r, g, b);
        cmyk.value = `cmyk(${_cmyk[0]}%, ${_cmyk[1]}%, ${_cmyk[2]}%, ${_cmyk[3]}%)`;
    }

    colorPicker.value = `#${_RGBtoHEX(r, g, b)}`;
}

function verify(min, max, elements) {
    for(let e of elements) {
        if(typeof e !== 'number') {
            return false;
        }
        if(isNaN(e) || (e < min || e > max)) {
            return false;
        }
    }
    return true;
}

async function copy(field) {
    let clipboardText = document.querySelector(`#${field}`).value;
    if(field == 'hex') clipboardText = `#${clipboardText}`;

    await navigator.clipboard.writeText(clipboardText + ';');
}

for(let element of _rgb) {
    element.addEventListener('input', () => {
        let r = parseInt(_rgb[0].value), g = parseInt(_rgb[1].value), b = parseInt(_rgb[2].value);
        document.querySelector('#hex').value = _RGBtoHEX(r, g, b);
        display();
    });
}

hex.addEventListener('input', () => {
    for(let [i, color] of _HEXtoRGB(hex.value).entries()) {
        _rgb[i].value = color || 0
    }
    display('hex');
});

hsl.addEventListener('input', () => {
    let _hsl = hsl.value.replace(/\D+/gm, ' ').trim().split(' ');

    console.log(_hsl);

    for(let [i, color] of _HSLtoRGB(_hsl[0], _hsl[1], _hsl[2]).entries()) {
        _rgb[i].value = color || 0
    }
    display('hsl');
});

cmyk.addEventListener('input', () => {
    let _cmyk = cmyk.value.replace(/\D+/gm, ' ').trim().split(' ');

    for(let [i, color] of _CMYKtoRGB(_cmyk[0], _cmyk[1], _cmyk[2], _cmyk[3]).entries()) {
        console.log(color);
        _rgb[i].value = color || 0
    }

    display('cmyk');
});

colorPicker.addEventListener('input', () => {
    for(let [i, color] of _HEXtoRGB(colorPicker.value.substr(1)).entries()) {
        _rgb[i].value = color || 0
    }
    display();
});

display();

/** ******************************** */
/** ************* HEX ************** */
/** ******************************** */

function toHEX(c) {
    return ("0" + parseInt(c).toString(16)).slice(-2).toUpperCase();
}

function _RGBtoHEX(r, g, b) {
    if(verify(0, 255, [r, g, b])) {
        return toHEX(r) + toHEX(g) + toHEX(b);
    }
    return '000000';
}

function _HEXtoRGB(hex) {
    hex = hex.match(/.{1,2}/g);
    return [
        parseInt(hex[0], 16),
        parseInt(hex[1], 16),
        parseInt(hex[2], 16)
    ];
}

/** ******************************** */
/** ************* HSL ************** */
/** ******************************** */

function _HSLtoRGB(h, s, l){
    if(verify(0, 360, [h, s, l])) {
        h /= 100, s /= 100, l /= 100;
        let r, g, b;
    
        if(s == 0){
            r = g = b = l; 
        } else {
            let _HUEtoRGB = (p, q, t) => {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1 / 6) return p + (q - p) * 6 * t;
                if(t < 1 / 2) return q;
                if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
    
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                p = 2 * l - q;
            r = _HUEtoRGB(p, q, h + 1 / 3);
            g = _HUEtoRGB(p, q, h);
            b = _HUEtoRGB(p, q, h - 1 / 3);
        }
    
        return [
            Math.round(r * 255), 
            Math.round(g * 255), 
            Math.round(b * 255)
        ];
    }

    return [
        0,
        0,
        0
    ]
}

function _RGBtoHSL(r, g, b) {
    if(verify(0, 255, [r, g, b])) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; 
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    return [
        0,
        0,
        0
    ]
}

/** ******************************** */
/** ************* CMYK ************* */
/** ******************************** */

function _RGBtoCMYK(r, g, b) {
    if(verify(0, 255, [r, g, b])) {
        if (r == 0 && g == 0 && b == 0) {
            return [0, 0, 0, 100];
        }
    
        let c = 1 - (r / 255), m = 1 - (g / 255), y = 1 - (b / 255), k = 0,
            min = Math.min(c, Math.min(m, y));
       
        return [
            Math.floor(((c - min) / (1 - min)) * 100), 
            Math.floor(((m - min) / (1 - min)) * 100), 
            Math.floor(((y - min) / (1 - min)) * 100),
            Math.floor(min * 100),
        ];
    }
   
    return [
        0,
        0,
        0,
        0,
    ];
}

function _CMYKtoRGB(c, m, y, k) {
    if(verify(0, 100, [c, m, y, k])) {
        c /= 100, m /= 100, y /= 100, k /= 100;
    
        c = (c * (1 - k)) + k;
        m = (m * (1 - k)) + k;
        y = (y * (1 - k)) + k;
    
        return [
            Math.round(255 * (1 - c)),
            Math.round(255 * (1 - m)),
            Math.round(255 * (1 - y))
        ];
    }

    return [
        0,
        0,
        0
    ]
}