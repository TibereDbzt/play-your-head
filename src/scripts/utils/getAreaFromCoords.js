/*
  Uses Simpson's law to approximate the area of any shape defined by an array of { x, y } coordinates.
  WARNING: The shape must be closed so if the array is not even, it clones the first value at the end of it.
*/
export const getAreaFromCoords = coordsArray => {
    let area = 0;

    if (coordsArray.length % 2) {
        coordsArray.push(coordsArray[coordsArray.length - 1]);
    }

    for (let i = 0; i < coordsArray.length - 1; i++) {
        // console.log(coordsArray[i].x);
        // console.log(coordsArray[i].y);
        area += coordsArray[i].x * coordsArray[i + 1].y - coordsArray[i + 1].x * coordsArray[i].y;
    }

    return Math.abs(area / 2);
};
