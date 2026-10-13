self.onmessage = (event) => {
  const { id, buffer, width, height, settings } = event.data;
  const pixels = new Uint8ClampedArray(buffer);
  const {
    brightness, contrast, saturation, hueRotate, temperature, exposure,
    gamma, highlights, shadows, sharpen, noise, grain, activeFilter
  } = settings;
  const brightnessScale = brightness / 100;
  const contrastOffset = (contrast - 100) / 100;
  const contrastFactor = (259 * (contrastOffset * 255 + 255)) / (255 * (259 - contrastOffset * 255));
  const saturationScale = saturation / 100;
  const gammaExponent = 100 / Math.max(1, gamma);
  const exposureScale = 2 ** (exposure / 50);
  const hue = (hueRotate * Math.PI) / 180;
  const cosHue = Math.cos(hue);
  const sinHue = Math.sin(hue);
  const temperatureScale = temperature / 50;

  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i] * exposureScale * brightnessScale;
    let g = pixels[i + 1] * exposureScale * brightnessScale;
    let b = pixels[i + 2] * exposureScale * brightnessScale;
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const highlightMask = Math.max(0, (luma - 128) / 127);
    const shadowMask = Math.max(0, (128 - luma) / 128);
    const tone = (highlights * highlightMask + shadows * shadowMask) * 0.8;
    r += tone + temperatureScale * 30;
    g += tone + temperatureScale * 10;
    b += tone - temperatureScale * 30;

    if (gamma !== 100) {
      r = 255 * Math.pow(Math.max(0, r) / 255, gammaExponent);
      g = 255 * Math.pow(Math.max(0, g) / 255, gammaExponent);
      b = 255 * Math.pow(Math.max(0, b) / 255, gammaExponent);
    }

    if (hueRotate) {
      const nr = r * (0.299 + 0.701 * cosHue + 0.168 * sinHue) + g * (0.587 - 0.587 * cosHue + 0.330 * sinHue) + b * (0.114 - 0.114 * cosHue - 0.497 * sinHue);
      const ng = r * (0.299 - 0.299 * cosHue - 0.328 * sinHue) + g * (0.587 + 0.413 * cosHue + 0.035 * sinHue) + b * (0.114 - 0.114 * cosHue + 0.292 * sinHue);
      const nb = r * (0.299 - 0.300 * cosHue + 1.250 * sinHue) + g * (0.587 - 0.588 * cosHue - 1.050 * sinHue) + b * (0.114 + 0.886 * cosHue - 0.203 * sinHue);
      r = nr; g = ng; b = nb;
    }

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + saturationScale * (r - gray);
    g = gray + saturationScale * (g - gray);
    b = gray + saturationScale * (b - gray);

    if (activeFilter === 'grayscale') r = g = b = gray;
    else if (activeFilter === 'sepia') {
      const [sr, sg, sb] = [r, g, b];
      r = sr * 0.393 + sg * 0.769 + sb * 0.189;
      g = sr * 0.349 + sg * 0.686 + sb * 0.168;
      b = sr * 0.272 + sg * 0.534 + sb * 0.131;
    } else if (activeFilter === 'invert') { r = 255 - r; g = 255 - g; b = 255 - b; }
    else if (activeFilter === 'warm') { r = r * 1.1 + 15; g *= 1.02; b *= 0.85; }
    else if (activeFilter === 'cool') { r *= 0.85; g *= 0.95; b = b * 1.15 + 10; }
    else if (activeFilter === 'vintage') { r = r * 0.9 + 30; g = g * 0.85 + 15; b = b * 0.7 + 10; }
    else if (activeFilter === 'dramatic') {
      r = gray + 1.5 * (r - gray); g = gray + 1.5 * (g - gray); b = gray + 1.5 * (b - gray);
      r = 1.3 * (r - 128) + 128; g = 1.3 * (g - 128) + 128; b = 1.3 * (b - 128) + 128;
    } else if (activeFilter === 'fade') { r = r * 0.8 + 40; g = g * 0.8 + 40; b = b * 0.8 + 45; }

    if (noise || grain) {
      // A stable hash keeps the grain pattern consistent while the user edits.
      const pixel = i / 4;
      let hash = (pixel + 1) * 374761393;
      hash = (hash ^ (hash >>> 13)) * 1274126177;
      const random = ((hash ^ (hash >>> 16)) >>> 0) / 4294967295 - 0.5;
      const texture = random * (noise + grain * 0.5) * 2.5;
      r += texture; g += texture; b += texture;
    }

    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }

  if (sharpen > 0 && width > 2 && height > 2) {
    const source = new Uint8ClampedArray(pixels);
    const amount = Math.min(0.65, sharpen / 180);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3; c += 1) {
          const neighbors = source[i - width * 4 + c] + source[i + width * 4 + c] + source[i - 4 + c] + source[i + 4 + c];
          pixels[i + c] = source[i + c] + amount * (source[i + c] - neighbors / 4);
        }
      }
    }
  }

  self.postMessage({ id, buffer: pixels.buffer, width, height }, [pixels.buffer]);
};
