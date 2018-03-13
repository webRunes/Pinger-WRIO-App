module.exports = (font, fontSize, maxWidth) =>  string =>
    font.getAdvanceWidth(string, fontSize) > maxWidth;
