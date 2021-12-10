import { Area } from '../../helpers/layout/definitions';

export default (context: CanvasRenderingContext2D): ReturnType<typeof operations> => {
  const dataCanvas = document.createElement('canvas');
  const dataContext = dataCanvas.getContext('2d');

  if (!dataContext) {
    throw new Error('Data context not available for manipulation.');
  }
  const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  dataContext.putImageData(imageData, 0, 0);

  return operations(dataCanvas, dataContext);
};

const operations = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, convertedToGrey?: boolean) => ({
  crop: (cropArea: Area) => {
    const { top, right, bottom, left } = cropArea;
    const imageSize = {
      width: right - left,
      height: bottom - top
    };
    const imageData = context.getImageData(left, top, right, bottom);

    if (imageSize.width <= 0 || imageSize.height <= 0) {
      throw new Error('Image sizes must be positive numbers.');
    }

    context.putImageData(imageData, 0, 0);
    return operations(canvas, context, convertedToGrey);
  },
  blur: () => {
    const filter = [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9]
    ];
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);

    for (let i = 0; i < imageData.data.length; i = i + 4) {
      const row = i / 4 / context.canvas.width;
      const col = (i / 4) % context.canvas.width;
      if (row == 0 || col == 0 || row == context.canvas.height - 1 || col == context.canvas.width - 1) continue;

      let finalR = 0;
      let finalG = 0;
      let finalB = 0;
      let finalA = 0;

      const { alphaPixel, bluePixel, greenPixel, redPixel } = generatePixel(imageData, context.canvas.width);

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
    context.putImageData(imageData, 0, 0);
    return operations(canvas, context, convertedToGrey);
  },
  grayscale() {
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
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
    context.putImageData(imageData, 0, 0);
    return operations(canvas, context, true);
  },
  url: (format: 'jpg' | 'jpge' | 'png', quality?: number) => {
    const url = canvas.toDataURL(`image/${format}`, quality);
    document.body.removeChild(canvas);

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
