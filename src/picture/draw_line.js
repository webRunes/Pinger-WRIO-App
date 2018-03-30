module.exports = (ctx, font, fontSize, x, lineHeight, fillStyle) => (y, line) => {
  const
    path = font.getPath(line, x, y, fontSize);

  path.fill = fillStyle;
  path.draw(ctx);

  return y + lineHeight;
}
