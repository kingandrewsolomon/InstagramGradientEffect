const jimp = require('jimp');
const Color = require('color');

function map(n, start1, stop1, start2, stop2, withinBounds) {
    var newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return this.constrain(newval, start2, stop2);
    } else {
        return this.constrain(newval, stop2, start2);
    }
}

function lerp(start, stop, amt) {
    return amt * (stop - start) + start;
}


function lerpColor(color1, color2, amt) {
    l0 = lerp(color1.red(), color2.red(), amt);
    l1 = lerp(color1.green(), color2.green(), amt);
    l2 = lerp(color1.blue(), color2.blue(), amt);
    return Color.rgb(l0, l1, l2);
}

function main() {
    if (process.argv[2]) {
        let imgFile = process.argv[2];
        let name = imgFile.slice(0, -4) + '_gradient.png';
        new jimp(1125, 2436, 0x0, (err, image) => {
            jimp.read(imgFile).then(img => {
                let w = img.getWidth();
                let ratio = 1;
                if (w != image.getWidth()) {
                    ratio = image.getWidth() / w;
                }
                img.resize(img.getWidth() * ratio, img.getHeight() * ratio);

                let colorTop = 0;
                let rBucketTop = 0;
                let gBucketTop = 0;
                let bBucketTop = 0;
                for (let x = 0; x < img.getWidth() / 2; x++) {
                    for (let y = 0; y < img.getHeight() / 2; y++) {
                        let c = img.getPixelColor(x, y);
                        let sc = c.toString(16);
                        while (sc.length < 8) sc = "0" + sc;
                        let color = new Color("#" + sc, "hex");

                        colorTop++;
                        rBucketTop += color.red();
                        gBucketTop += color.green();
                        bBucketTop += color.blue();
                    }
                }
                let averageColorTop = Color.rgb(rBucketTop / colorTop, gBucketTop / colorTop, bBucketTop / colorTop, 255);

                let colorBottom = 0;
                let rBucketBottom = 0;
                let gBucketBottom = 0;
                let bBucketBottom = 0;
                for (let x = img.getWidth() / 2; x < img.getWidth(); x++) {
                    for (let y = img.getHeight() / 2; y < img.getHeight(); y++) {
                        let c = img.getPixelColor(x, y);
                        let sc = c.toString(16);
                        while (sc.length < 8) sc = "0" + sc;
                        let color = new Color("#" + sc, "hex");

                        colorBottom++;
                        rBucketBottom += color.red();
                        gBucketBottom += color.green();
                        bBucketBottom += color.blue();
                    }
                }
                let averageColorBottom = Color.rgb(rBucketBottom / colorBottom, gBucketBottom / colorBottom, bBucketBottom / colorBottom);

                for (let y = 0; y < image.getHeight(); y++) {
                    let inter = map(y, 0, image.getHeight(), 0, 1);
                    let newCol = lerpColor(averageColorTop, averageColorBottom, inter);

                    for (let x = 0; x < image.getWidth(); x++) {
                        let t = newCol.rgbNumber() * 256;
                        image.setPixelColor((t + 255), x, y);
                    }
                }
                image.composite(img, (image.getWidth() / 2) - (img.getWidth() / 2), (image.getHeight() / 2) - (img.getHeight() / 2));
                image.write(name);
            }).catch(err => {
                console.log(err);
            });
        });
    }

}

main();