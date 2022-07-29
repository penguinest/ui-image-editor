import { LayoutDefinitions, LayoutUtils } from '../../helpers/layout';

export default async (src: string): Promise<ReturnType<typeof operations>> => {
  const dataCanvasId = `tmp_canvas_${Math.round(Math.random() * 10000)}`;

  const dataCanvas = document.createElement('canvas');

  const ctx = dataCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Data context not available for manipulation.');
  }

  dataCanvas.id = dataCanvasId;

  document.body.appendChild(dataCanvas);

  const image = await loadImage(src);

  //const { image, edition } = snapshot;
  /*
  const imageData = context.getImageData(0, 0, image.width, image.height);

  dataCanvas.width = snap;
  dataCanvas.height = context.canvas.height;
  dataContext.putImageData(imageData, 0, 0);
*/

  /*
  const cutArea: LayoutDefinitions.Area = edition.cut ?? { top: 0, right: image.width, bottom: image.height, left: 0 };
  const { height, width, x, y } = LayoutUtils.area.toCardinal(cutArea);
  const scale = edition.restrictions.lockedOutputSize ?? image;

  dataContext.drawImage(canvas, x, y, width, height, 0, 0, scale.width, scale.height);
*/
  return operations({ el: dataCanvas, id: dataCanvasId }, image);
};

const operations = (canvas: { el: HTMLCanvasElement; id: string }, image: HTMLImageElement, convertedToGrey?: boolean) => ({
  crop: (cropArea: LayoutDefinitions.Area) => {
    const ctx = canvas.el.getContext('2d')!;

    const { height, width, x, y } = LayoutUtils.area.toCardinal(cropArea);
    const size = canvas.el;

    if (width <= 0 || height <= 0) {
      throw new Error('Image sizes must be positive numbers.');
    }

    canvas.el.width = width;
    canvas.el.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, size.width, size.height);

    return operations(canvas, image, convertedToGrey);
  },
  blur: () => {
    const filter = [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9]
    ];

    const { width, height } = canvas.el;
    const ctx = canvas.el.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, width, height);

    for (let i = 0; i < imageData.data.length; i = i + 4) {
      const row = i / 4 / width;
      const col = (i / 4) % width;
      if (row == 0 || col == 0 || row == height - 1 || col == width - 1) continue;

      let finalR = 0;
      let finalG = 0;
      let finalB = 0;
      let finalA = 0;

      const { alphaPixel, bluePixel, greenPixel, redPixel } = generatePixel(imageData, width);

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (redPixel[row + (x - 1)] == undefined) {
            continue;
          }
          if (redPixel[row + (x - 1)][col + (y - 1)] == undefined) {
            continue;
          }
          finalR += filter[x][y] * redPixel[row + (x - 1)][col + (y - 1)];
          finalG += filter[x][y] * greenPixel[row + (x - 1)][col + (y - 1)];
          finalB += filter[x][y] * bluePixel[row + (x - 1)][col + (y - 1)];
          finalA += filter[x][y] * alphaPixel[row + (x - 1)][col + (y - 1)];
        }
      }

      if (convertedToGrey) {
        imageData.data[i] = (finalR + finalG + finalB) / 3;
        imageData.data[i + 1] = (finalR + finalG + finalB) / 3;
        imageData.data[i + 2] = (finalR + finalG + finalB) / 3;
        imageData.data[i + 3] = finalA;
      } else {
        imageData.data[i] = finalR;
        imageData.data[i + 1] = finalG;
        imageData.data[i + 2] = finalB;
        imageData.data[i + 3] = finalA;
      }
    }
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
    return operations(canvas, image, convertedToGrey);
  },
  grayscale() {
    const ctx = canvas.el.getContext('2d')!;

    const imageData = ctx.getImageData(0, 0, canvas.el.width, canvas.el.height);
    for (let i = 0; i < imageData.data.length; i = i + 4) {
      const red = imageData.data[i];
      const green = imageData.data[i + 1];
      const blue = imageData.data[i + 2];
      const alpha = imageData.data[i + 3];

      imageData.data[i] = (red + green + blue) / 3;
      imageData.data[i + 1] = (red + green + blue) / 3;
      imageData.data[i + 2] = (red + green + blue) / 3;
      imageData.data[i + 3] = alpha;
    }
    ctx.putImageData(imageData, 0, 0);
    return operations(canvas, image, true);
  },
  async scale(size: LayoutDefinitions.Size) {
    const ctx = canvas.el.getContext('2d')!;

    const imageCopy = await loadImage(canvas.el.toDataURL());

    canvas.el.width = size.width;
    canvas.el.height = size.height;

    ctx.drawImage(imageCopy, 0, 0, canvas.el.width, canvas.el.height);
    return operations(canvas, image, convertedToGrey);
  },
  url: (format: 'jpg' | 'jpeg' | 'png' | 'webp', quality?: number) => {
    const url = canvas.el.toDataURL(`image/${format}`, quality && format !== 'png' ? quality ?? 1 : undefined);

    console.log(document.getElementById(canvas.id));
    const element = document.getElementById(canvas.id);
    if (element) {
      document.body.removeChild(element);
      element.remove();
    }

    return url;
  }
});

/**
 * Deconstruct image data color schema into and RGB matrix model.
 */
const generatePixel = (imageData: ImageData, imageWidth: number) => {
  let r = [],
    g = [],
    b = [],
    a = [];
  const redPixel = [];
  const greenPixel = [];
  const bluePixel = [];
  const alphaPixel = [];
  for (let i = 0; i < imageData.data.length; i = i + 4) {
    if ((i / 4) % imageWidth == 0) {
      if (i != 0) {
        redPixel.push(r);
        greenPixel.push(g);
        bluePixel.push(b);
        alphaPixel.push(a);
      }
      r = [];
      g = [];
      b = [];
      a = [];
    }
    r.push(imageData.data[i]);
    g.push(imageData.data[i + 1]);
    b.push(imageData.data[i + 2]);
    a.push(imageData.data[i + 3]);
  }

  return {
    alphaPixel,
    bluePixel,
    greenPixel,
    redPixel
  };
};

const loadImage = async (source: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = source;
    img.crossOrigin = 'anonymous';
    img.onerror = reject;
    img.onload = () => {
      resolve(img);
    };
  });
};
